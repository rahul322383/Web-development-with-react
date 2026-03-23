const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const {
  buildAccessToken,
  buildRefreshToken,
  verifyRefreshToken
} = require('../../utils/tokenUtils');
const { redisClient } = require('../../redis/redisClient');
const authRepository = require('./authRepository');

const toExpiryDate = (duration) => {
  const regex = /^(\d+)([mhd])$/;
  const match = duration.match(regex);

  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const unitMap = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return new Date(Date.now() + value * unitMap[unit]);
};

const normalizeUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstName} ${user.lastName}`,
  primaryRole: user.Roles?.[0]?.name || 'Employee'
});

const register = async (payload) => {
  const existingUser = await authRepository.findUserByEmail(payload.email);

  if (existingUser) {
    return {
      success: false,
      message: "Email already registered"
    };
  }

  const user = await sequelize.transaction(async (transaction) => {

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const createdUser = await authRepository.createUser(
      {
        employeeCode: payload.employeeCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        managerId: payload.managerId || null,
        department: payload.department || null,
        baseSalary: payload.baseSalary
      },
      transaction
    );

    const [role] = await authRepository.findRoleByName(payload.role, transaction);

    await authRepository.assignRoleToUser(createdUser.id, role.id, transaction);

    return createdUser; // ✅ return full user
  });

  // 🔥 ISSUE TOKENS AFTER REGISTER
  return await issueTokensForUser(user);
};

const issueTokensForUser = async (user) => {

  const normalizedUser = normalizeUserPayload(user);

  const access = buildAccessToken(normalizedUser);
  const refresh = buildRefreshToken(normalizedUser);

  await authRepository.persistRefreshToken({
    userId: normalizedUser.id,
    tokenId: refresh.tokenId,
    expiresAt: toExpiryDate(env.JWT_REFRESH_EXPIRES_IN)
  });

  return {
    success: true,
    data: {
      accessToken: access.token,
      refreshToken: refresh.token,
      user: normalizedUser
    }
  };
};

const login = async ({ email, password }) => {

  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.isActive) {
    return {
      success: false,
      message: "Invalid credentials"
    };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return {
      success: false,
      message: "Invalid credentials"
    };
  }

  return issueTokensForUser(user);
};

const refreshSession = async (rawRefreshToken) => {

  let payload;

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    return {
      success: false,
      message: "Invalid refresh token"
    };
  }

  if (payload.type !== 'refresh') {
    return {
      success: false,
      message: "Invalid refresh token type"
    };
  }

  const tokenRecord = await authRepository.findValidRefreshToken({
    tokenId: payload.tokenId,
    userId: payload.sub
  });

  if (!tokenRecord) {
    return {
      success: false,
      message: "Refresh token revoked or expired"
    };
  }

  const user = await authRepository.findUserById(payload.sub);

  if (!user || !user.isActive) {
    return {
      success: false,
      message: "User not found"
    };
  }

  const newTokens = await issueTokensForUser(user);

  const decodedNewRefresh = jwt.decode(newTokens.data.refreshToken);

  await authRepository.revokeRefreshToken({
    tokenId: payload.tokenId,
    replacedByTokenId: decodedNewRefresh.tokenId
  });

  return newTokens;
};

const logout = async ({ refreshToken, accessJti, accessExp }) => {

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
    } catch {
      // ignore error
    }
  }

  if (accessJti && accessExp) {
    const ttlSeconds = Math.max(accessExp - Math.floor(Date.now() / 1000), 0);

    if (ttlSeconds > 0) {
      await redisClient.set(`bl_access_${accessJti}`, '1', 'EX', ttlSeconds);
    }
  }

  return {
    success: true,
    message: "Logged out successfully"
  };
};



const getCurrentUser = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  return {
    success: true,
    data: normalizeUserPayload(user) // ✅ SAFE
  };
};

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  getCurrentUser
};