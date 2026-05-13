'use strict';

const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const { buildAccessToken, buildRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');
const authRepository = require('./authRepository');
const { sendNotification, sendAuditLog } = require('../../config/socket');
const { User, Role } = require('../../database/initModels');
const { autoCheckIn, autoCheckOut } = require('../automation/autoAttendance.service');
const { assignShiftOnRegister } = require('../automation/shiftAssignment.service');
const { ensureLeaveBalance } = require('../automation/leaveBalance.service');

const toExpiryDate = (duration) => {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid token duration "${duration}". Expected format: "30s", "15m", "2h", "7d".`);
  const unitMap = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + Number(match[1]) * unitMap[match[2]]);
};

const extractRequestMeta = (req = null) => {
  if (!req) return { ip: null, userAgent: null };
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress ?? req.ip ?? null);
  return { ip, userAgent: req.headers?.['user-agent'] ?? null };
};

const buildAuditLog = (event, userId, meta = {}) => ({
  event,
  userId,
  metadata: meta,
  timestamp: new Date().toISOString(),
});

const normalizeUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstName} ${user.lastName}`,
  primaryRole: user.role?.name || 'Employee',
  companyId: user.companyId ?? null,
});

const issueTokensForUser = async (user, req = null, transaction = null) => {
  const normalized = normalizeUserPayload(user);
  const { ip, userAgent } = extractRequestMeta(req);

  const access = buildAccessToken(normalized);
  const refresh = buildRefreshToken(normalized);

  const saltRounds = Number(env.BCRYPT_ROUNDS) || 12;
  const tokenHash = await bcrypt.hash(refresh.token, saltRounds);

  await authRepository.persistRefreshToken({
    userId: normalized.id,
    tokenId: refresh.tokenId,
    tokenHash,
    ip,
    userAgent,
    expiresAt: toExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
  }, transaction);

  return {
    success: true,
    _refreshTokenId: refresh.tokenId,
    data: {
      accessToken: access.token,
      refreshToken: refresh.token,
      user: normalized,
    },
  };
};

const toPublicResult = ({ _refreshTokenId, ...rest }) => rest;

const register = async (payload, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  try {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    const normalizedRole = payload.role?.trim().toLowerCase() || 'employee';

    const allowedRoles = ['employee', 'manager', 'hr'];

    if (!allowedRoles.includes(normalizedRole)) {
      return {
        success: false,
        message: 'Invalid role for self-registration',
        statusCode: 403,
      };
    }

    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
        statusCode: 409,
      };
    }

    if (payload.managerId) {
      const manager = await authRepository.findUserById(payload.managerId);

      if (!manager || manager.role?.name?.toLowerCase() !== 'manager') {
        return {
          success: false,
          message: 'Invalid managerId',
          statusCode: 400,
        };
      }
    }

    let createdUser;

    await sequelize.transaction(async (transaction) => {
      const passwordHash = await bcrypt.hash(
        payload.password,
        Number(env.BCRYPT_ROUNDS) || 12
      );

      const role = await Role.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          normalizedRole
        ),
        transaction,
      });

      if (!role) {
        throw Object.assign(new Error('Role not configured'), { statusCode: 500 });
      }

      const { randomBytes } = require('crypto');

      const employeeCode =
        payload.employeeCode ||
        `EMP${randomBytes(4).toString('hex').toUpperCase()}`;

      const resolvedCompanyId = null;

      createdUser = await authRepository.createUser(
        {
          employeeCode,
          firstName: payload.firstName?.trim(),
          lastName: payload.lastName?.trim(),
          email: normalizedEmail,
          passwordHash,
          roleId: role.id,
          managerId: payload.managerId ?? null,
          department: payload.department ?? null,
          baseSalary: payload.baseSalary ?? null,
          companyId: resolvedCompanyId,
        },
        transaction
      );

      if (!createdUser) {
        throw new Error('User creation failed');
      }
    });

    sendNotification(createdUser.id, {
      event: 'USER_REGISTERED',
      role: normalizedRole,
      timestamp: new Date().toISOString(),
    });

    sendAuditLog(
      buildAuditLog('USER_REGISTRATION', createdUser.id, {
        email: normalizedEmail,
        role: normalizedRole,
        managerId: payload.managerId ?? null,
        ip,
        userAgent,
      })
    );

    assignShiftOnRegister(createdUser.id, payload.department).catch(() => { });

    ensureLeaveBalance(createdUser.id, new Date().getFullYear()).catch(() => { });

    return toPublicResult(await issueTokensForUser(createdUser, req));

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Registration failed',
      statusCode: error.statusCode || 500,
    };
  }
};

const login = async ({ email, password }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  try {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      const dummyHash = '$2b$12$invalidhashpaddingtoensureconstanttimingXXXXXXXXXXXX';
      await bcrypt.compare(password, dummyHash);
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
    }

    if (!user.isActive) {
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
    }

    const tokens = await issueTokensForUser(user, req);

    sendAuditLog(buildAuditLog('LOGIN_SUCCESS', user.id, { ip, userAgent }));

    autoCheckIn({ userId: user.id, ip }).catch(() => { });

    return toPublicResult(tokens);

  } catch (error) {
    return { success: false, message: 'Login failed', statusCode: 500 };
  }
};

const refreshSession = async (rawRefreshToken, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    return { success: false, message: 'Invalid refresh token', statusCode: 401 };
  }

  if (payload.type !== 'refresh') {
    return { success: false, message: 'Invalid refresh token type', statusCode: 401 };
  }

  const tokenRecord = await authRepository.findRefreshTokenById({
    tokenId: payload.tokenId,
    userId: payload.sub,
  });

  if (!tokenRecord) {
    sendNotification(payload.sub, { event: 'REFRESH_TOKEN_FAILED', reason: 'Token not found' });
    return { success: false, message: 'Refresh token revoked or expired', statusCode: 401 };
  }

  if (tokenRecord.isRevoked || tokenRecord.revokedAt) {
    await authRepository.revokeAllUserTokens(payload.sub);

    sendAuditLog(buildAuditLog('TOKEN_REUSE_DETECTED', payload.sub, { tokenId: payload.tokenId, ip, userAgent }));
    sendNotification(payload.sub, {
      event: 'SECURITY_ALERT',
      message: 'Suspicious session activity detected. All sessions have been terminated.',
    });

    return { success: false, message: 'Session compromised. Please login again.', statusCode: 401 };
  }

  const tokenValid = await bcrypt.compare(rawRefreshToken, tokenRecord.tokenHash);
  if (!tokenValid) return { success: false, message: 'Invalid refresh token', statusCode: 401 };

  if (new Date(tokenRecord.expiresAt) < new Date()) {
    return { success: false, message: 'Refresh token expired', statusCode: 401 };
  }

  const ipChanged = tokenRecord.ip && ip && tokenRecord.ip !== ip;
  const userAgentChanged = tokenRecord.userAgent && userAgent && tokenRecord.userAgent !== userAgent;
  const isSuspicious = ipChanged && userAgentChanged;

  if (isSuspicious) {
    await authRepository.revokeAllUserTokens(payload.sub);

    sendAuditLog(buildAuditLog('TOKEN_DEVICE_MISMATCH', payload.sub, {
      expected: { ip: tokenRecord.ip, userAgent: tokenRecord.userAgent },
      received: { ip, userAgent },
    }));
    sendNotification(payload.sub, {
      event: 'SECURITY_ALERT',
      message: 'Session device mismatch detected. All sessions have been terminated.',
    });

    return { success: false, message: 'Session mismatch. Please login again.', statusCode: 401 };
  }

  const user = await authRepository.findUserById(payload.sub);
  if (!user?.isActive) return { success: false, message: 'User not found or inactive', statusCode: 401 };

  let newTokens;
  try {
    newTokens = await sequelize.transaction(async (transaction) => {
      await authRepository.revokeRefreshToken({ tokenId: payload.tokenId }, transaction);
      const issued = await issueTokensForUser(user, req, transaction);
      await authRepository.linkReplacementToken(
        { tokenId: payload.tokenId, replacedByTokenId: issued._refreshTokenId },
        transaction,
      );
      return issued;
    });
  } catch (error) {
    return { success: false, message: 'Failed to refresh session', statusCode: 500 };
  }

  sendNotification(payload.sub, { event: 'SESSION_REFRESHED', timestamp: new Date().toISOString() });
  sendAuditLog(buildAuditLog('SESSION_REFRESHED', payload.sub, { ip, userAgent }));

  return toPublicResult(newTokens);
};

const logout = async ({ refreshToken }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  if (!refreshToken) {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });

    await autoCheckOut({ userId: payload.sub, ip });

    sendNotification(payload.sub, {
      event: 'LOGOUT_SUCCESS',
      timestamp: new Date().toISOString(),
    });

    sendAuditLog(buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent }));

  } catch (err) {
    // silent
  }

  return {
    success: true,
    message: 'Logged out successfully',
  };
};

const getCurrentUser = async (userId) => {
  try {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }

    const u = typeof user.get === 'function' ? user.get({ plain: true }) : user;

    const primaryRole = u.role?.name || u.primaryRole || 'Employee';

    const normalizedUser = {
      id: u.id,
      employeeCode: u.employeeCode ?? null,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      primaryRole,
      roleId: u.roleId ?? null,
      isActive: u.isActive,
      department: u.department ?? null,
      designation: u.designation ?? null,
      managerId: u.managerId ?? null,
      companyId: u.companyId ?? null,
      shiftId: u.shiftId ?? null,
      baseSalary: u.baseSalary ?? null,
      phone: u.phone ?? null,
      profilePhoto: u.profilePhoto ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };

    return {
      success: true,
      data: { user: normalizedUser },
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch user',
      statusCode: 500,
    };
  }
};

module.exports = { register, login, refreshSession, logout, getCurrentUser };