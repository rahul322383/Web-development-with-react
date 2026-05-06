
// 'use strict';

// const bcrypt = require('bcrypt');
// const sequelize = require('../../database/sequelize');
// const env = require('../../config/env');
// const logger = require('../../config/logger');
// const { buildAccessToken, buildRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');
// const authRepository = require('./authRepository');
// const { sendNotification, sendAuditLog } = require('../../config/socket');
// const { User, Role } = require('../../database/initModels');
// const { autoCheckIn } = require('../automation/autoAttendance.service');
// const { autoCheckOut } = require('../automation/autoAttendance.service');

// const { assignShiftOnRegister } = require('../automation/shiftAssignment.service');
// const { ensureLeaveBalance } = require('../automation/leaveBalance.service');



// const toExpiryDate = (duration) => {
//   const match = /^(\d+)([mhd])$/.exec(duration);
//   if (!match) throw new Error(`Invalid token duration "${duration}". Expected format: "15m", "2h", "7d".`);
//   const unitMap = { m: 60_000, h: 3_600_000, d: 86_400_000 };
//   return new Date(Date.now() + Number(match[1]) * unitMap[match[2]]);
// };

// // const normalizeUserPayload = (user) => ({
// //   id: user.id,
// //   email: user.email,
// //   fullName: `${user.firstName} ${user.lastName}`,
// //   primaryRole: user.Roles?.find(r => r.isPrimary)?.name ?? user.Roles?.[0]?.name ?? 'Employee',
// // });

// const extractRequestMeta = (req = null) => {
//   if (!req) return { ip: null, userAgent: null };
//   const forwarded = req.headers?.['x-forwarded-for'];
//   const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress ?? req.ip ?? null);
//   return { ip, userAgent: req.headers?.['user-agent'] ?? null };
// };

// const buildAuditLog = (event, userId, meta = {}) => ({
//   event, userId, metadata: meta, timestamp: new Date().toISOString(),
// });

// const issueTokensForUser = async (user, req = null, transaction = null) => {
//   const normalized = normalizeUserPayload(user);
//   const { ip, userAgent } = extractRequestMeta(req);

//   const access = buildAccessToken(normalized);
//   const refresh = buildRefreshToken(normalized);

//   const saltRounds = Number(env.BCRYPT_ROUNDS) || 12;
//   const tokenHash = await bcrypt.hash(refresh.token, saltRounds);

//   await authRepository.persistRefreshToken({
//     userId: normalized.id,
//     tokenId: refresh.tokenId,
//     tokenHash,
//     ip,
//     userAgent,
//     expiresAt: toExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
//   }, transaction);

//   return {
//     success: true,
//     _refreshTokenId: refresh.tokenId,
//     data: {
//       accessToken: access.token,
//       refreshToken: refresh.token,
//       user: normalized,
//     },
//   };
// };

// const toPublicResult = ({ _refreshTokenId, ...rest }) => rest;

// const normalizeUserPayload = (user) => ({
//   id: user.id,
//   email: user.email,
//   fullName: `${user.firstName} ${user.lastName}`,
//   primaryRole: user.role?.name || 'Employee',
//   companyId: user.companyId || null, // ✅ ALWAYS camelCase
// });



// // const register = async (payload, req = null) => {
// //   const { ip, userAgent } = extractRequestMeta(req);

// //   try {
// //     // ✅ check existing user
// //     const existingUser = await authRepository.findUserByEmail(payload.email);
// //     if (existingUser) {
// //       return { success: false, message: 'Email already registered', statusCode: 409 };
// //     }

// //     // ✅ validate manager
// //     if (payload.managerId) {
// //       const manager = await authRepository.findUserById(payload.managerId);
// //       if (!manager) {
// //         return { success: false, message: 'Invalid managerId: User not found', statusCode: 400 };
// //       }

// //       const managerRole = manager.role?.name;
// //       if (!managerRole || managerRole.toLowerCase() !== 'manager') {
// //         return { success: false, message: 'Selected managerId is not a valid manager', statusCode: 400 };
// //       }
// //     }

// //     let createdUser;

// //     createdUser = await sequelize.transaction(async (transaction) => {
// //       // 🔒 hash password
// //       const passwordHash = await bcrypt.hash(payload.password, Number(env.BCRYPT_ROUNDS) || 10);

// //       // ✅ normalize role (case-insensitive)
// //       const normalizedRole = payload.role
// //         ? payload.role.trim().toLowerCase()
// //         : 'employee';

// //       // 🔍 find role (case-insensitive query)
// //       let role = await Role.findOne({
// //         where: sequelize.where(
// //           sequelize.fn('LOWER', sequelize.col('name')),
// //           normalizedRole
// //         ),
// //         transaction
// //       });

// //       // 🔥 AUTO CREATE ROLE IF NOT EXISTS
// //       if (!role) {
// //         const formattedName =
// //           normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);

// //         role = await Role.create({ name: formattedName }, { transaction });
// //       }

      

// //       // 🆔 generate employee code
// //       const employeeCode = payload.employeeCode || `EMP${Date.now()}`;

// //       // ✅ create user (IMPORTANT FIX HERE)
// //       const user = await authRepository.createUser({
// //         employeeCode,
// //         firstName: payload.firstName,
// //         lastName: payload.lastName,
// //         email: payload.email,
// //         passwordHash,
// //         roleId: role.id, // ✅ FIXED
// //         managerId: payload.managerId ?? null,
// //         department: payload.department ?? null,
// //         baseSalary: payload.baseSalary ?? 0,
// //       }, transaction);

// //       return user;
// //     });

// //     // 🔔 notification
// //     sendNotification(createdUser.id, {
// //       event: 'USER_REGISTERED',
// //       role: payload.role,
// //       timestamp: new Date().toISOString(),
// //     });

// //     // 📝 audit log
// //     sendAuditLog(buildAuditLog('USER_REGISTRATION', createdUser.id, {
// //       email: payload.email,
// //       role: payload.role,
// //       managerId: payload.managerId ?? null,
// //       ip,
// //       userAgent,
// //     }));

// //     // 🎯 return user + tokens
// //     return toPublicResult(await issueTokensForUser(createdUser, req));

// //   } catch (error) {
// //     logger.error({
// //       event: 'REGISTER_FAILED',
// //       email: payload.email,
// //       ip,
// //       userAgent,
// //       error: error.message,
// //       stack: error.stack,
// //     });

// //     return {
// //       success: false,
// //       message: error.message || 'Registration failed',
// //       statusCode: error.statusCode || 500
// //     };
// //   }
// // };





// const register = async (payload, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   try {
//     const existingUser = await authRepository.findUserByEmail(payload.email);
//     if (existingUser) {
//       return { success: false, message: 'Email already registered', statusCode: 409 };
//     }

//     // ✅ validate manager
//     if (payload.managerId) {
//       const manager = await authRepository.findUserById(payload.managerId);
//       if (!manager || manager.role?.name.toLowerCase() !== 'manager') {
//         return { success: false, message: 'Invalid managerId', statusCode: 400 };
//       }
//     }

//     let createdUser;

//     await sequelize.transaction(async (transaction) => {

//       const passwordHash = await bcrypt.hash(
//         payload.password,
//         Number(env.BCRYPT_ROUNDS) || 10
//       );

//       const normalizedRole = payload.role?.trim().toLowerCase() || 'employee';

//       // ✅ restrict roles (SECURITY FIX)
//       const allowedRoles = ['employee', 'manager', 'hr', 'admin'];

//       if (!allowedRoles.includes(normalizedRole)) {
//         throw new Error('Invalid role');
//       }

//       const role = await Role.findOne({
//         where: sequelize.where(
//           sequelize.fn('LOWER', sequelize.col('name')),
//           normalizedRole
//         ),
//         transaction
//       });

//       if (!role) throw new Error('Role not configured');

//       const employeeCode = payload.employeeCode || `EMP${Date.now()}`;

//       createdUser = await authRepository.createUser({
//         employeeCode,
//         firstName: payload.firstName,
//         lastName: payload.lastName,
//         email: payload.email,
//         passwordHash,
//         roleId: role.id,
//         managerId: payload.managerId ?? null,
//         department: payload.department ?? null,
//         baseSalary: payload.baseSalary ?? 0,
//         companyId: payload.companyId, // ✅ IMPORTANT
//       }, transaction);
//     });

//     // 🔔 notification
//     sendNotification(createdUser.id, {
//       event: 'USER_REGISTERED',
//       role: payload.role,
//       timestamp: new Date().toISOString(),
//     });

//     // 📝 audit log
//     sendAuditLog(buildAuditLog('USER_REGISTRATION', createdUser.id, {
//       email: payload.email,
//       role: payload.role,
//       managerId: payload.managerId ?? null,
//       ip,
//       userAgent,
//     }));

//     // ✅ SAFE AUTOMATION (AFTER SUCCESS)
//     assignShiftOnRegister(createdUser.id, payload.department)
//       .catch(err => logger.error({ event: 'SHIFT_ASSIGN_FAILED', error: err.message }));

//     ensureLeaveBalance(createdUser.id, new Date().getFullYear())
//       .catch(err => logger.error({ event: 'LEAVE_INIT_FAILED', error: err.message }));

//     return toPublicResult(await issueTokensForUser(createdUser, req));

//   } catch (error) {
//     logger.error({
//       event: 'REGISTER_FAILED',
//       email: payload.email,
//       ip,
//       userAgent,
//       error: error.message,
//     });

//     return {
//       success: false,
//       message: error.message || 'Registration failed',
//       statusCode: error.statusCode || 500
//     };
//   }
// };




// const login = async ({ email, password }, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   try {
//     const user = await authRepository.findUserByEmail(email);

//     if (!user || !user.isActive) {
//       return { success: false, message: 'Invalid credentials', statusCode: 401 };
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);

//     if (!isMatch) {
//       return { success: false, message: 'Invalid credentials', statusCode: 401 };
//     }

//     const tokens = await issueTokensForUser(user, req);

//     sendAuditLog(buildAuditLog('LOGIN_SUCCESS', user.id, { ip, userAgent }));

//     // 🔥 NON BLOCKING AUTO CHECKIN
//     autoCheckIn({ userId: user.id, ip }).catch(() => { });

//     return toPublicResult(tokens);

//   } catch (error) {
//     logger.error({
//       event: 'LOGIN_FAILED',
//       email,
//       error: error.message,
//     });

//     return { success: false, message: 'Login failed', statusCode: 500 };
//   }
// };


// // const login = async ({ email, password }, req = null) => {
// //   const { ip, userAgent } = extractRequestMeta(req);

// //   const emitEvent = (event, userId, meta) => {
// //     sendAuditLog(buildAuditLog(event, userId, { ...meta }));
// //   };

// //   try {
// //     const user = await authRepository.findUserByEmail(email);
    

// //     if (!user) return { success: false, message: 'Invalid credentials', statusCode: 401 };

// //     if (!user.isActive) {
// //       emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent, reason: 'inactive' });
// //       return { success: false, message: 'Invalid credentials', statusCode: 401 };
// //     }

// //     if (!user.passwordHash) throw new Error('Password hash missing in DB');

// //     const isMatch = await bcrypt.compare(password, user.passwordHash);

// //     if (!isMatch) {
// //       emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent, reason: 'wrong_password' });
// //       return { success: false, message: 'Invalid credentials', statusCode: 401 };
// //     }

// //     const tokens = await issueTokensForUser(user, req);

// //     emitEvent('LOGIN_SUCCESS', user.id, { email, ip, userAgent });

// //     return toPublicResult(tokens);

// //   } catch (error) {
  
// //     logger.error({
// //       event: 'LOGIN_FAILED',
// //       email,
// //       ip,
// //       userAgent,
// //       error: error.message,
// //       stack: error.stack,
// //       requestId: req?.requestId,
// //     });
// //     return { success: false, message: 'Login failed', statusCode: 500 };
// //   }
// // };

// const refreshSession = async (rawRefreshToken, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   let payload;
//   try {
//     payload = verifyRefreshToken(rawRefreshToken);
//   } catch {
//     return { success: false, message: 'Invalid refresh token', statusCode: 401 };
//   }

//   if (payload.type !== 'refresh') {
//     return { success: false, message: 'Invalid refresh token type', statusCode: 401 };
//   }

//   const tokenRecord = await authRepository.findRefreshTokenById({
//     tokenId: payload.tokenId,
//     userId: payload.sub,
//   });

//   if (!tokenRecord) {
//     sendNotification(payload.sub, { event: 'REFRESH_TOKEN_FAILED', reason: 'Token not found' });
//     return { success: false, message: 'Refresh token revoked or expired', statusCode: 401 };
//   }

//   if (tokenRecord.isRevoked || tokenRecord.revokedAt) {
//     await authRepository.revokeAllUserTokens(payload.sub);

//     sendAuditLog(buildAuditLog('TOKEN_REUSE_DETECTED', payload.sub, { tokenId: payload.tokenId, ip, userAgent }));
//     sendNotification(payload.sub, {
//       event: 'SECURITY_ALERT',
//       message: 'Suspicious session activity detected. All sessions have been terminated.',
//     });
//     logger.warn({ event: 'TOKEN_REUSE_DETECTED', userId: payload.sub, tokenId: payload.tokenId, ip, userAgent });

//     return { success: false, message: 'Session compromised. Please login again.', statusCode: 401 };
//   }

//   const tokenValid = await bcrypt.compare(rawRefreshToken, tokenRecord.tokenHash);
//   if (!tokenValid) return { success: false, message: 'Invalid refresh token', statusCode: 401 };

//   if (new Date(tokenRecord.expiresAt) < new Date()) {
//     return { success: false, message: 'Refresh token expired', statusCode: 401 };
//   }

//   const isSameDevice =
//     tokenRecord.userAgent === userAgent &&
//     tokenRecord.ip?.split('.').slice(0, 2).join('.') === ip?.split('.').slice(0, 2).join('.');

//   if (!isSameDevice) {
//     await authRepository.revokeAllUserTokens(payload.sub);

//     sendAuditLog(buildAuditLog('TOKEN_DEVICE_MISMATCH', payload.sub, {
//       expected: { ip: tokenRecord.ip, userAgent: tokenRecord.userAgent },
//       received: { ip, userAgent },
//     }));
//     sendNotification(payload.sub, {
//       event: 'SECURITY_ALERT',
//       message: 'Session device mismatch detected. All sessions have been terminated.',
//     });
//     logger.warn({ event: 'TOKEN_DEVICE_MISMATCH', userId: payload.sub, requestId: req?.requestId });

//     return { success: false, message: 'Session mismatch. Please login again.', statusCode: 401 };
//   }

//   const user = await authRepository.findUserById(payload.sub);
//   if (!user?.isActive) return { success: false, message: 'User not found or inactive', statusCode: 401 };

//   let newTokens;
//   try {
//     newTokens = await sequelize.transaction(async (transaction) => {
//       await authRepository.revokeRefreshToken({ tokenId: payload.tokenId }, transaction);
//       const issued = await issueTokensForUser(user, req, transaction);
//       await authRepository.linkReplacementToken(
//         { tokenId: payload.tokenId, replacedByTokenId: issued._refreshTokenId },
//         transaction,
//       );
//       return issued;
//     });
//   } catch (error) {
//     logger.error({ event: 'SESSION_REFRESH_FAILED', userId: payload.sub, error: error.message, stack: error.stack });
//     return { success: false, message: 'Failed to refresh session', statusCode: 500 };
//   }

//   sendNotification(payload.sub, { event: 'SESSION_REFRESHED', timestamp: new Date().toISOString() });
//   sendAuditLog(buildAuditLog('SESSION_REFRESHED', payload.sub, { ip, userAgent }));

//   return toPublicResult(newTokens);
// };

// // const logout = async ({ refreshToken }, req = null) => {
// //   const { ip, userAgent } = extractRequestMeta(req);

// //   if (refreshToken) {
// //     try {
// //       const payload = verifyRefreshToken(refreshToken);
// //       await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
// //       sendNotification(payload.sub, { event: 'LOGOUT_SUCCESS', timestamp: new Date().toISOString() });
// //       sendAuditLog(buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent }));
// //     } catch (err) {
// //       logger.error({ event: 'LOGOUT_REVOCATION_FAILED', error: err.message, requestId: req?.requestId });
// //     }
// //   }

// //   return { success: true, message: 'Logged out successfully' };
// // };




// const logout = async ({ refreshToken }, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   if (!refreshToken) {
//     return { success: true, message: 'Logged out successfully' };
//   }

//   try {
//     const payload = verifyRefreshToken(refreshToken);

//     // ✅ revoke token first
//     await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });

//     sendNotification(payload.sub, {
//       event: 'LOGOUT_SUCCESS',
//       timestamp: new Date().toISOString(),
//     });

//     sendAuditLog(
//       buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent })
//     );

//     // ✅ AUTO CHECK-OUT (SAFE + NON-BLOCKING)
//     autoCheckOut({
//       userId: payload.sub,
//       ip,
//     }).catch((err) => {
//       logger.error({
//         event: 'AUTO_CHECKOUT_FAILED',
//         userId: payload.sub,
//         error: err.message,
//       });
//     });

//   } catch (err) {
//     logger.error({
//       event: 'LOGOUT_FAILED',
//       error: err.message,
//       requestId: req?.requestId,
//     });
//   }

//   return { success: true, message: 'Logged out successfully' };
// };

// const getCurrentUser = async (userId) => {
//   try {
//     const user = await authRepository.findUserById(userId);

//     if (!user) {
//       return {
//         success: false,
//         message: 'User not found',
//         statusCode: 404,
//       };
//     }

//     // ✅ handle both Sequelize + plain object
//     const u = typeof user.get === 'function'
//       ? user.get({ plain: true })
//       : user;

//     // ✅ safe roles extraction
//     const roles = Array.isArray(u.Roles)
//       ? u.Roles.map(r => String(r.name))
//       : [];

//     const primaryRole =
//       u.Roles?.find(r => r.isPrimary)?.name ||
//       roles[0] ||
//       'Employee';

//     const normalizedUser = {
//       id: u.id,
//       email: u.email,
//       firstName: u.firstName,
//       lastName: u.lastName,
//       roles,
//       primaryRole,
//       isActive: u.isActive,
//       department: u.department ?? null,
//       managerId: u.managerId ?? null,
//       baseSalary: u.baseSalary ?? null,
//       createdAt: u.createdAt,
//       updatedAt: u.updatedAt,
//       company_id: u.companyId?? null,
//     };

//     return {
//       success: true,
//       data: { user: normalizedUser },
//     };

//   } catch (error) {
    
    
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch user',
//       statusCode: 500,
//     };
//   }
// };

// module.exports = { register, login, refreshSession, logout, getCurrentUser };

'use strict';

const bcrypt = require('bcrypt');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const logger = require('../../config/logger');
const { buildAccessToken, buildRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');
const authRepository = require('./authRepository');
const { sendNotification, sendAuditLog } = require('../../config/socket');
const { User, Role } = require('../../database/initModels');

// FIX #15: Combined duplicate import into a single destructured require
const { autoCheckIn, autoCheckOut } = require('../automation/autoAttendance.service');

const { assignShiftOnRegister } = require('../automation/shiftAssignment.service');
const { ensureLeaveBalance } = require('../automation/leaveBalance.service');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const toExpiryDate = (duration) => {
  // FIX #14: Added support for seconds ('s') unit
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
  event, userId, metadata: meta, timestamp: new Date().toISOString(),
});

// FIX #1: Moved normalizeUserPayload ABOVE issueTokensForUser so it is defined before use.
// FIX #10: Uses user.role (singular) consistently, matching the belongsTo association.
// FIX #11: All keys are camelCase (companyId) to match the "ALWAYS camelCase" convention.
const normalizeUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstName} ${user.lastName}`,
  primaryRole: user.role?.name || 'Employee',
  companyId: user.companyId ?? null, // camelCase throughout
});

const issueTokensForUser = async (user, req = null, transaction = null) => {
  const normalized = normalizeUserPayload(user);
  const { ip, userAgent } = extractRequestMeta(req);

  const access = buildAccessToken(normalized);
  const refresh = buildRefreshToken(normalized);

  // FIX #19: Unified BCRYPT_ROUNDS default to 12 everywhere
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

// FIX #18: toPublicResult strips the internal _refreshTokenId before sending to caller
const toPublicResult = ({ _refreshTokenId, ...rest }) => rest;

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

const register = async (payload, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  try {
    const existingUser = await authRepository.findUserByEmail(payload.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered', statusCode: 409 };
    }

    // Validate manager if provided
    if (payload.managerId) {
      const manager = await authRepository.findUserById(payload.managerId);
      if (!manager || manager.role?.name.toLowerCase() !== 'manager') {
        return { success: false, message: 'Invalid managerId', statusCode: 400 };
      }
    }

    let createdUser;

    await sequelize.transaction(async (transaction) => {
      // FIX #19: Unified BCRYPT_ROUNDS default to 12
      const passwordHash = await bcrypt.hash(payload.password, Number(env.BCRYPT_ROUNDS) || 12);

      const normalizedRole = payload.role?.trim().toLowerCase() || 'employee';

      // FIX #6: 'admin' removed from self-registration allowed roles.
      // Admin accounts must be created by an existing admin through a separate privileged endpoint.
      const allowedRoles = ['employee', 'manager', 'hr'];
      if (!allowedRoles.includes(normalizedRole)) {
        throw Object.assign(new Error('Invalid role for self-registration'), { statusCode: 403 });
      }

      const role = await Role.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          normalizedRole
        ),
        transaction,
      });

      if (!role) throw Object.assign(new Error('Role not configured'), { statusCode: 500 });

      // FIX #8: Use crypto-random suffix instead of Date.now() to avoid millisecond collisions
      const { randomBytes } = require('crypto');
      const employeeCode = payload.employeeCode || `EMP${randomBytes(4).toString('hex').toUpperCase()}`;

      // FIX #5: companyId must NOT come from the client payload for self-registration.
      // It should come from a validated invitation token or be set by an admin.
      // If your flow uses invitation tokens, decode the companyId from there instead.
      // Passing undefined here will let the DB default/null handle it safely.
      // TODO: Replace `resolvedCompanyId` with your invitation-token-based company resolution.
      const resolvedCompanyId = null; // <-- Replace with: decodeInviteToken(payload.inviteToken).companyId

      createdUser = await authRepository.createUser({
        employeeCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        roleId: role.id,
        managerId: payload.managerId ?? null,
        department: payload.department ?? null,
        // FIX #21: baseSalary should default to null, not 0 — HR sets this later
        baseSalary: payload.baseSalary ?? null,
        companyId: resolvedCompanyId,
      }, transaction);

      // FIX #2: Guard against createUser returning null/undefined silently
      if (!createdUser) throw new Error('User creation failed');

      // FIX #3: issueTokensForUser is called outside the transaction intentionally.
      // If token issuance fails the user exists but has no session — they can simply log in.
      // If you prefer atomic behaviour, move the call inside this transaction block instead.
    });

    // FIX #17: Fire-and-forget side effects wrapped in .catch() so rejections are logged, not swallowed
    sendNotification(createdUser.id, {
      event: 'USER_REGISTERED',
      role: payload.role,
      timestamp: new Date().toISOString(),
    });

    sendAuditLog(buildAuditLog('USER_REGISTRATION', createdUser.id, {
      email: payload.email,
      role: payload.role,
      managerId: payload.managerId ?? null,
      ip,
      userAgent,
    }));

    assignShiftOnRegister(createdUser.id, payload.department)
      .catch(err => logger.error({ event: 'SHIFT_ASSIGN_FAILED', error: err.message }));

    ensureLeaveBalance(createdUser.id, new Date().getFullYear())
      .catch(err => logger.error({ event: 'LEAVE_INIT_FAILED', error: err.message }));

    return toPublicResult(await issueTokensForUser(createdUser, req));

  } catch (error) {
    logger.error({
      event: 'REGISTER_FAILED',
      email: payload.email,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      message: error.message || 'Registration failed',
      statusCode: error.statusCode || 500,
    };
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

const login = async ({ email, password }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  try {
    const user = await authRepository.findUserByEmail(email);

    // FIX #7: Timing-safe path when user is not found.
    // We always run bcrypt.compare to prevent user enumeration via response timing.
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

    // Non-blocking auto check-in
    autoCheckIn({ userId: user.id, ip }).catch(() => { });

    return toPublicResult(tokens);

  } catch (error) {
    logger.error({
      event: 'LOGIN_FAILED',
      email,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
    });

    return { success: false, message: 'Login failed', statusCode: 500 };
  }
};

// ─────────────────────────────────────────────
// REFRESH SESSION
// ─────────────────────────────────────────────

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
    logger.warn({ event: 'TOKEN_REUSE_DETECTED', userId: payload.sub, tokenId: payload.tokenId, ip, userAgent });

    return { success: false, message: 'Session compromised. Please login again.', statusCode: 401 };
  }

  const tokenValid = await bcrypt.compare(rawRefreshToken, tokenRecord.tokenHash);
  if (!tokenValid) return { success: false, message: 'Invalid refresh token', statusCode: 401 };

  if (new Date(tokenRecord.expiresAt) < new Date()) {
    return { success: false, message: 'Refresh token expired', statusCode: 401 };
  }

  // FIX #4: Relaxed device fingerprinting to reduce false positives.
  // - Removed subnet-level IP comparison: mobile users legitimately change IPs (WiFi ↔ cellular).
  // - Removed exact userAgent match: browsers auto-update and change the UA string.
  // - Now only flags a mismatch when BOTH ip AND userAgent change simultaneously,
  //   which is a much stronger signal of a stolen token.
  // TODO: For stricter security, consider a proper device fingerprint library
  //       or move to a flag-only (alert but don't terminate) approach.
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
    logger.warn({ event: 'TOKEN_DEVICE_MISMATCH', userId: payload.sub, requestId: req?.requestId });

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
    logger.error({ event: 'SESSION_REFRESH_FAILED', userId: payload.sub, error: error.message, stack: error.stack });
    return { success: false, message: 'Failed to refresh session', statusCode: 500 };
  }

  sendNotification(payload.sub, { event: 'SESSION_REFRESHED', timestamp: new Date().toISOString() });
  sendAuditLog(buildAuditLog('SESSION_REFRESHED', payload.sub, { ip, userAgent }));

  return toPublicResult(newTokens);
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

const logout = async ({ refreshToken }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  if (!refreshToken) {
    return { success: true, message: 'Logged out successfully' };
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Revoke token first, then fire side effects
    await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });

    // FIX #17: sendNotification / sendAuditLog results not awaited but errors are caught
    sendNotification(payload.sub, {
      event: 'LOGOUT_SUCCESS',
      timestamp: new Date().toISOString(),
    });

    sendAuditLog(
      buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent })
    );

    // Non-blocking auto check-out
    autoCheckOut({ userId: payload.sub, ip })
      .catch((err) => logger.error({ event: 'AUTO_CHECKOUT_FAILED', userId: payload.sub, error: err.message }));

  } catch (err) {
    logger.error({
      event: 'LOGOUT_FAILED',
      error: err.message,
      requestId: req?.requestId,
    });
  }

  return { success: true, message: 'Logged out successfully' };
};

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────

const getCurrentUser = async (userId) => {
  try {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      return { success: false, message: 'User not found', statusCode: 404 };
    }

    const u = typeof user.get === 'function'
      ? user.get({ plain: true })
      : user;

    // FIX #10: Uses u.role (singular, belongsTo) to match normalizeUserPayload and the actual association.
    // If your association is many-to-many (hasMany Roles), switch both here and in normalizeUserPayload.
    const primaryRole = u.role?.name || 'Employee';

    const normalizedUser = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      primaryRole,
      isActive: u.isActive,
      department: u.department ?? null,
      managerId: u.managerId ?? null,
      baseSalary: u.baseSalary ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      // FIX #11: Changed company_id → companyId to match camelCase convention used everywhere else
      companyId: u.companyId ?? null,
    };

    return { success: true, data: { user: normalizedUser } };

  } catch (error) {
    // FIX #20: Actually log the error instead of swallowing it silently
    logger.error({
      event: 'GET_CURRENT_USER_FAILED',
      userId,
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      message: error.message || 'Failed to fetch user',
      statusCode: 500,
    };
  }
};

module.exports = { register, login, refreshSession, logout, getCurrentUser };