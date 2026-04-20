
// 'use strict';

// const bcrypt = require('bcrypt');

// const sequelize = require('../../database/sequelize');
// const env = require('../../config/env');
// const logger = require('../../config/logger');
// const { buildAccessToken, buildRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');
// const authRepository = require('./authRepository');
// const { sendNotification, sendAuditLog } = require('../../config/socket');

// const toExpiryDate = (duration) => {
//   const match = /^(\d+)([mhd])$/.exec(duration);
//   if (!match) {
//     throw new Error(`Invalid token duration "${duration}". Expected format: "15m", "2h", "7d".`);
//   }
//   const unitMap = { m: 60_000, h: 3_600_000, d: 86_400_000 };
//   return new Date(Date.now() + Number(match[1]) * unitMap[match[2]]);
// };

// const normalizeUserPayload = (user) => ({
//   id: user.id,
//   email: user.email,
//   fullName: `${user.firstName} ${user.lastName}`,
//   primaryRole: user.Roles?.find(r => r.isPrimary)?.name
//     ?? user.Roles?.[0]?.name
//     ?? 'Employee',
// });

// const extractRequestMeta = (req = null) => {
//   if (!req) return { ip: null, userAgent: null };
//   const forwarded = req.headers?.['x-forwarded-for'];
//   const ip = forwarded
//     ? forwarded.split(',')[0].trim()
//     : (req.socket?.remoteAddress ?? req.ip ?? null);
//   return { ip, userAgent: req.headers?.['user-agent'] ?? null };
// };

// const buildAuditLog = (event, userId, meta = {}) => ({
//   event,
//   userId,
//   metadata: meta,
//   timestamp: new Date().toISOString(),
// });

// const issueTokensForUser = async (user, req = null) => {
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
//   });

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

// const register = async (payload, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   try {
//     const existingUser = await authRepository.findUserByEmail(payload.email);
//     if (existingUser) {
//       return { success: false, message: 'Email already registered', statusCode: 409 };
//     }

//     if (payload.managerId) {
//       const manager = await authRepository.findUserById(payload.managerId);
//       if (!manager) {
//         return { success: false, message: 'Invalid managerId: User not found', statusCode: 400 };
//       }
//       const managerRole = manager.Roles?.find(r => r.isPrimary)?.name ?? manager.Roles?.[0]?.name ?? manager.role;
//       if (!managerRole || managerRole.toLowerCase() !== 'manager') {
//         return { success: false, message: 'Selected managerId is not a valid manager', statusCode: 400 };
//       }
//     }

//     let createdUser;
//     try {
//       createdUser = await sequelize.transaction(async (transaction) => {
//         const passwordHash = await bcrypt.hash(payload.password, Number(env.BCRYPT_ROUNDS) || 10);

//         const user = await authRepository.createUser(
//           {
//             employeeCode: payload.employeeCode,
//             firstName: payload.firstName,
//             lastName: payload.lastName,
//             email: payload.email,
//             passwordHash,
//             managerId: payload.managerId ?? null,
//             department: payload.department ?? null,
//             baseSalary: payload.baseSalary ?? 0,
//           },
//           transaction,
//         );

//         const roles = await authRepository.findRoleByName(payload.role, transaction);
//         if (!roles?.length) throw new Error('Invalid role provided');

//         await authRepository.assignRoleToUser(user.id, roles[0].id, transaction);
//         return user;
//       });
//     } catch (err) {
//       if (err.name === 'SequelizeUniqueConstraintError') {
//         return { success: false, message: 'Email already registered', statusCode: 409 };
//       }
//       throw err;
//     }

//     sendNotification(createdUser.id, {
//       event: 'USER_REGISTERED',
//       role: payload.role,
//       timestamp: new Date().toISOString(),
//     });

//     sendAuditLog(buildAuditLog('USER_REGISTRATION', createdUser.id, {
//       email: payload.email,
//       role: payload.role,
//       managerId: payload.managerId ?? null,
//       ip,
//       userAgent,
//     }));

//     return toPublicResult(await issueTokensForUser(createdUser, req));

//   } catch (error) {
//     logger.error({
//       event: 'REGISTER_FAILED',
//       email: payload.email,
//       ip,
//       userAgent,
//       error: error.message,
//       stack: error.stack,
//       requestId: req?.requestId,
//     });
//     return {
//       success: false,
//       message: error.message || 'Registration failed',
//       statusCode: error.statusCode || 500,
//     };
//   }
// };




// const login = async ({ email, password }, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req || {});

//   console.log("\n================ LOGIN START ================");
//   console.log("📩 Email:", email);
//   console.log("🔑 Password provided:", !!password);
//   console.log("🌐 IP:", ip);
//   console.log("🖥️ User-Agent:", userAgent);
//   console.log("📦 Request exists:", !!req);

//   try {
//     console.log("\n🔍 STEP 1: Fetching user from DB...");
//     const user = await authRepository.findUserByEmail(email);

//     console.log("📥 STEP 1 RESULT:", user ? "USER FOUND" : "USER NOT FOUND");

//     if (!user) {
//       console.log("🚨 No user found for email");
//       return { success: false, message: 'Invalid credentials', statusCode: 401 };
//     }

//     console.log("\n🔍 STEP 2: Checking user status...");
//     console.log("Active status:", user.isActive);

//     if (!user.isActive) {
//       console.log("🚨 User inactive");
//       emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent });

//       return { success: false, message: 'Invalid credentials', statusCode: 401 };
//     }

//     console.log("\n🔍 STEP 3: Checking password hash...");
//     console.log("PasswordHash exists:", !!user.passwordHash);

//     if (!user.passwordHash) {
//       console.log("💥 Missing password hash in DB");
//       throw new Error('Password hash missing in DB');
//     }

//     console.log("\n🔍 STEP 4: Comparing password...");
//     const isMatch = await bcrypt.compare(password, user.passwordHash);

//     console.log("🔐 Password match result:", isMatch);

//     if (!isMatch) {
//       console.log("🚨 Password mismatch");
//       emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent });

//       return { success: false, message: 'Invalid credentials', statusCode: 401 };
//     }

//     console.log("\n🔍 STEP 5: Generating tokens...");
//     let tokens;

//     try {
//       tokens = await issueTokensForUser(user, req);
//       console.log("🎟️ Tokens generated successfully");
//     } catch (e) {
//       console.log("❌ Token generation failed");
//       console.error(e);

//       logger.errorLog('Token generation failed', e, { userId: user.id });
//       throw e;
//     }

//     console.log("\n🔍 STEP 6: Emitting success event...");

//     const emitEvent = (event, userId, meta) => {
//       console.log(`[EVENT] ${event}`, { userId, ...meta });
//     };

//     emitEvent('LOGIN_SUCCESS', user.id, { email, ip, userAgent });

//     console.log("================ LOGIN SUCCESS ================\n");

//     return toPublicResult(tokens);

//   } catch (error) {
//     console.log("\n💥 LOGIN CRASHED");
//     console.error(error);

//     logger.error('Login error', error, {
//       email,
//       ip,
//       userAgent,
//       requestId: req?.requestId,
//     });

//     return { success: false, message: 'Login failed', statusCode: 500 };
//   }
// };



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

//   if (tokenRecord?.isRevoked) {
//     await authRepository.revokeAllUserTokens(payload.sub);

//     sendAuditLog(buildAuditLog('TOKEN_REUSE_DETECTED', payload.sub, {
//       tokenId: payload.tokenId, ip, userAgent,
//     }));

//     sendNotification(payload.sub, {
//       event: 'SECURITY_ALERT',
//       message: 'Suspicious session activity detected. All sessions have been terminated.',
//     });

//     logger.warn({
//       event: 'TOKEN_REUSE_DETECTED',
//       userId: payload.sub,
//       tokenId: payload.tokenId,
//       ip,
//       userAgent,
//       requestId: req?.requestId,
//     });

//     return { success: false, message: 'Session compromised. Please login again.', statusCode: 401 };
//   }

//   if (!tokenRecord) {
//     sendNotification(payload.sub, { event: 'REFRESH_TOKEN_FAILED', reason: 'Token not found' });
//     return { success: false, message: 'Refresh token revoked or expired', statusCode: 401 };
//   }
//   const tokenValid = await bcrypt.compare(rawRefreshToken, tokenRecord.tokenHash);
//   if (!tokenValid) {
//     return { success: false, message: 'Invalid refresh token', statusCode: 401 };
//   }

//   if (new Date(tokenRecord.expiresAt) < new Date()) {
//     return {
//       success: false,
//       message: 'Refresh token expired',
//       statusCode: 401
//     };
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

//     logger.warn({
//       event: 'TOKEN_DEVICE_MISMATCH',
//       userId: payload.sub,
//       requestId: req?.requestId,
//       expected: { ip: tokenRecord.ip, userAgent: tokenRecord.userAgent },
//       received: { ip, userAgent },
//     });

//     return { success: false, message: 'Session mismatch. Please login again.', statusCode: 401 };
//   }

//   const user = await authRepository.findUserById(payload.sub);
//   if (!user?.isActive) {
//     return { success: false, message: 'User not found or inactive', statusCode: 401 };
//   }

//   let newTokens;
//   try {
//     newTokens = await sequelize.transaction(async (transaction) => {
//       await authRepository.revokeRefreshToken(
//         { tokenId: payload.tokenId },
//         transaction,
//       );

//       const issued = await issueTokensForUser(user, req);

//       await authRepository.linkReplacementToken(
//         { tokenId: payload.tokenId, replacedByTokenId: issued._refreshTokenId },
//         transaction,
//       );

//       return issued;
//     });
//   } catch (error) {
//     logger.error({
//       event: 'SESSION_REFRESH_FAILED',
//       userId: payload.sub,
//       error: error.message,
//       stack: error.stack,
//       requestId: req?.requestId,
//     });
//     return { success: false, message: 'Failed to refresh session', statusCode: 500 };
//   }

//   sendNotification(payload.sub, { event: 'SESSION_REFRESHED', timestamp: new Date().toISOString() });
//   sendAuditLog(buildAuditLog('SESSION_REFRESHED', payload.sub, { ip, userAgent }));

//   return toPublicResult(newTokens);
// };

// const logout = async ({ refreshToken }, req = null) => {
//   const { ip, userAgent } = extractRequestMeta(req);

//   if (refreshToken) {
//     try {
//       const payload = verifyRefreshToken(refreshToken);
//       await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
      

//       sendNotification(payload.sub, { event: 'LOGOUT_SUCCESS', timestamp: new Date().toISOString() });
//       sendAuditLog(buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent }));

//     } catch (err) {
//       logger.error({
//         event: 'LOGOUT_REVOCATION_FAILED',
//         error: err.message,
//         requestId: req?.requestId,
//       });
//     }
//   }

//   return { success: true, message: 'Logged out successfully' };
// };

// const getCurrentUser = async (userId, req = null) => {
//   try {
//     const user = await authRepository.findUserById(userId);
//     if (!user) {
//       return { success: false, message: 'User not found', statusCode: 404 };
//     }

//     const u = user.get({ plain: true });
//     const normalized = normalizeUserPayload(u);

//     sendNotification(userId, { event: 'CURRENT_USER_FETCHED', timestamp: new Date().toISOString() });

//     return {
//       success: true,
//       data: {
//         user: normalized,
//         meta: {
//           role: u.Roles?.find(r => r.isPrimary)?.name ?? u.Roles?.[0]?.name ?? 'Employee',
//           isActive: u.isActive,
//           department: u.department ?? null,
//         },
//       },
//     };
//   } catch (error) {
//     logger.error({
//       event: 'GET_CURRENT_USER_FAILED',
//       userId,
//       error: error.message,
//       stack: error.stack,
//       requestId: req?.requestId,
//     });
//     return { success: false, message: 'Failed to fetch user', statusCode: 500 };
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

const toExpiryDate = (duration) => {
  const match = /^(\d+)([mhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid token duration "${duration}". Expected format: "15m", "2h", "7d".`);
  const unitMap = { m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + Number(match[1]) * unitMap[match[2]]);
};

const normalizeUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstName} ${user.lastName}`,
  primaryRole: user.Roles?.find(r => r.isPrimary)?.name ?? user.Roles?.[0]?.name ?? 'Employee',
});

const extractRequestMeta = (req = null) => {
  if (!req) return { ip: null, userAgent: null };
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress ?? req.ip ?? null);
  return { ip, userAgent: req.headers?.['user-agent'] ?? null };
};

const buildAuditLog = (event, userId, meta = {}) => ({
  event, userId, metadata: meta, timestamp: new Date().toISOString(),
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
    const existingUser = await authRepository.findUserByEmail(payload.email);
    if (existingUser) return { success: false, message: 'Email already registered', statusCode: 409 };

    if (payload.managerId) {
      const manager = await authRepository.findUserById(payload.managerId);
      if (!manager) return { success: false, message: 'Invalid managerId: User not found', statusCode: 400 };
      const managerRole = manager.Roles?.find(r => r.isPrimary)?.name ?? manager.Roles?.[0]?.name;
      if (!managerRole || managerRole.toLowerCase() !== 'manager') {
        return { success: false, message: 'Selected managerId is not a valid manager', statusCode: 400 };
      }
    }

    let createdUser;
    try {
      createdUser = await sequelize.transaction(async (transaction) => {
        const passwordHash = await bcrypt.hash(payload.password, Number(env.BCRYPT_ROUNDS) || 10);

        const user = await authRepository.createUser({
          employeeCode: payload.employeeCode,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          passwordHash,
          managerId: payload.managerId ?? null,
          department: payload.department ?? null,
          baseSalary: payload.baseSalary ?? 0,
        }, transaction);

        const roles = await authRepository.findRoleByName(payload.role, transaction);
        if (!roles?.length) throw new Error('Invalid role provided');

        await authRepository.assignRoleToUser(user.id, roles[0].id, transaction);
        return user;
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return { success: false, message: 'Email already registered', statusCode: 409 };
      }
      throw err;
    }

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

    return toPublicResult(await issueTokensForUser(createdUser, req));

  } catch (error) {
    logger.error({
      event: 'REGISTER_FAILED',
      email: payload.email,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
      requestId: req?.requestId,
    });
    return { success: false, message: error.message || 'Registration failed', statusCode: error.statusCode || 500 };
  }
};

const login = async ({ email, password }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  const emitEvent = (event, userId, meta) => {
    sendAuditLog(buildAuditLog(event, userId, { ...meta }));
  };

  try {
    const user = await authRepository.findUserByEmail(email);

    if (!user) return { success: false, message: 'Invalid credentials', statusCode: 401 };

    if (!user.isActive) {
      emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent, reason: 'inactive' });
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
    }

    if (!user.passwordHash) throw new Error('Password hash missing in DB');

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      emitEvent('LOGIN_FAILED', user.id, { email, ip, userAgent, reason: 'wrong_password' });
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
    }

    const tokens = await issueTokensForUser(user, req);

    emitEvent('LOGIN_SUCCESS', user.id, { email, ip, userAgent });

    return toPublicResult(tokens);

  } catch (error) {
    logger.error({
      event: 'LOGIN_FAILED',
      email,
      ip,
      userAgent,
      error: error.message,
      stack: error.stack,
      requestId: req?.requestId,
    });
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
    logger.warn({ event: 'TOKEN_REUSE_DETECTED', userId: payload.sub, tokenId: payload.tokenId, ip, userAgent });

    return { success: false, message: 'Session compromised. Please login again.', statusCode: 401 };
  }

  const tokenValid = await bcrypt.compare(rawRefreshToken, tokenRecord.tokenHash);
  if (!tokenValid) return { success: false, message: 'Invalid refresh token', statusCode: 401 };

  if (new Date(tokenRecord.expiresAt) < new Date()) {
    return { success: false, message: 'Refresh token expired', statusCode: 401 };
  }

  const isSameDevice =
    tokenRecord.userAgent === userAgent &&
    tokenRecord.ip?.split('.').slice(0, 2).join('.') === ip?.split('.').slice(0, 2).join('.');

  if (!isSameDevice) {
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

const logout = async ({ refreshToken }, req = null) => {
  const { ip, userAgent } = extractRequestMeta(req);

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
      sendNotification(payload.sub, { event: 'LOGOUT_SUCCESS', timestamp: new Date().toISOString() });
      sendAuditLog(buildAuditLog('USER_LOGOUT', payload.sub, { ip, userAgent }));
    } catch (err) {
      logger.error({ event: 'LOGOUT_REVOCATION_FAILED', error: err.message, requestId: req?.requestId });
    }
  }

  return { success: true, message: 'Logged out successfully' };
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

    // ✅ handle both Sequelize + plain object
    const u = typeof user.get === 'function'
      ? user.get({ plain: true })
      : user;

    // ✅ safe roles extraction
    const roles = Array.isArray(u.Roles)
      ? u.Roles.map(r => String(r.name))
      : [];

    const primaryRole =
      u.Roles?.find(r => r.isPrimary)?.name ||
      roles[0] ||
      'Employee';

    const normalizedUser = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roles,
      primaryRole,
      isActive: u.isActive,
      department: u.department ?? null,
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