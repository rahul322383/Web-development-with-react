// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const sequelize = require('../../database/sequelize');
// const env = require('../../config/env');
// const {
//   buildAccessToken,
//   buildRefreshToken,
//   verifyRefreshToken
// } = require('../../utils/tokenUtils');
// const authRepository = require('./authRepository');



// const toExpiryDate = (duration) => {
//   const regex = /^(\d+)([mhd])$/;
//   const match = duration.match(regex);

//   if (!match) {
//     return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   }

//   const value = Number(match[1]);
//   const unit = match[2];

//   const unitMap = {
//     m: 60 * 1000,
//     h: 60 * 60 * 1000,
//     d: 24 * 60 * 60 * 1000
//   };

//   return new Date(Date.now() + value * unitMap[unit]);
// };

// const normalizeUserPayload = (user) => ({
//   id: user.id,
//   email: user.email,
//   fullName: `${user.firstName} ${user.lastName}`,
//   primaryRole: user.Roles?.[0]?.name || 'Employee'
// });

// const register = async (payload) => {
//   try {
//     console.log("🔥 REGISTER START");
//     console.log("Payload:", payload);

//     const existingUser = await authRepository.findUserByEmail(payload.email);

//     console.log(
//       "Existing user check:",
//       existingUser ? "Found" : "Not found",
//       payload.email
//     );

//     if (existingUser) {
//       const error = new Error("Email already registered");
//       error.statusCode = 409;
//       throw error;
//     }

//     // 🧠 VALIDATE MANAGER (IMPORTANT FIX FOR YOUR CURRENT BUG)
//     if (payload.managerId) {
//   const manager = await authRepository.findUserById(payload.managerId);

//   console.log("Manager check:", manager ? "Found" : "Not found");

//   const managerRole =
//     manager?.Roles?.[0]?.name || manager?.role;

//   console.log("Manager role:", managerRole);

//   if (!manager) {
//     throw new Error("Invalid managerId: User not found");
//   }

//   if (!managerRole || managerRole.toLowerCase() !== "manager") {
//     throw new Error("Selected managerId is not a valid manager");
//   }
// }

//     const user = await sequelize.transaction(async (transaction) => {
//       console.log("🔥 Transaction started");

//       const passwordHash = await bcrypt.hash(payload.password, 12);

//       const createdUser = await authRepository.createUser(
//         {
//           employeeCode: payload.employeeCode,
//           firstName: payload.firstName,
//           lastName: payload.lastName,
//           email: payload.email,
//           passwordHash,
//           managerId: payload.managerId ?? null,
//           department: payload.department ?? null,
//           baseSalary: payload.baseSalary ?? 0
//         },
//         transaction
//       );

//       console.log("User created with ID:", createdUser.id);

//       console.log("Assigning role:", payload.role);

//       const roles = await authRepository.findRoleByName(
//         payload.role,
//         transaction
//       );

//       if (!roles || roles.length === 0) {
//         throw new Error("Invalid role provided");
//       }

//       const role = roles[0];

//       await authRepository.assignRoleToUser(
//         createdUser.id,
//         role.id,
//         transaction
//       );

//       console.log("Role assigned successfully");

//       return createdUser;
//     });

//     console.log("🔥 Transaction completed");

//     return await issueTokensForUser(user);
//   } catch (error) {
//     // 💥 REAL MYSQL ERROR LOGGING (THIS IS THE KEY FIX)
//     console.error("🔥 REGISTER FAILED");

//     console.error("Name:", error.name);
//     console.error("Message:", error.message);
//     console.error("Status:", error.statusCode);

//     // Sequelize real DB error
//     console.error("SQL:", error?.sql);
//     console.error("Original:", error?.original?.sqlMessage || error?.original);
//     console.error("Parent:", error?.parent?.sqlMessage || error?.parent);

//     throw error;
//   }
// };

// const issueTokensForUser = async (user) => {

//   const normalizedUser = normalizeUserPayload(user);

//   const access = buildAccessToken(normalizedUser);
//   const refresh = buildRefreshToken(normalizedUser);

//   await authRepository.persistRefreshToken({
//     userId: normalizedUser.id,
//     tokenId: refresh.tokenId,
//     expiresAt: toExpiryDate(env.JWT_REFRESH_EXPIRES_IN)
//   });

//   return {
//     success: true,
//     data: {
//       accessToken: access.token,
//       refreshToken: refresh.token,
//       user: normalizedUser
//     }
//   };
// };

// const login = async ({ email, password }) => {

//   const user = await authRepository.findUserByEmail(email);

//   if (!user || !user.isActive) {
//     return {
//       success: false,
//       message: "Invalid credentials"
//     };
//   }

//   const isMatch = await bcrypt.compare(password, user.passwordHash);

//   if (!isMatch) {
//     return {
//       success: false,
//       message: "Invalid credentials"
//     };
//   }

//   return issueTokensForUser(user);
// };

// const refreshSession = async (rawRefreshToken) => {

//   let payload;

//   try {
//     payload = verifyRefreshToken(rawRefreshToken);
//   } catch {
//     return {
//       success: false,
//       message: "Invalid refresh token"
//     };
//   }

//   if (payload.type !== 'refresh') {
//     return {
//       success: false,
//       message: "Invalid refresh token type"
//     };
//   }

//   const tokenRecord = await authRepository.findValidRefreshToken({
//     tokenId: payload.tokenId,
//     userId: payload.sub
//   });

//   if (!tokenRecord) {
//     return {
//       success: false,
//       message: "Refresh token revoked or expired"
//     };
//   }

//   const user = await authRepository.findUserById(payload.sub);

//   if (!user || !user.isActive) {
//     return {
//       success: false,
//       message: "User not found"
//     };
//   }

//   const newTokens = await issueTokensForUser(user);

//   const decodedNewRefresh = jwt.decode(newTokens.data.refreshToken);

//   await authRepository.revokeRefreshToken({
//     tokenId: payload.tokenId,
//     replacedByTokenId: decodedNewRefresh.tokenId
//   });

//   return newTokens;
// };

// const logout = async ({ refreshToken }) => {

//   if (refreshToken) {
//     try {
//       const payload = verifyRefreshToken(refreshToken);
//       await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
//     } catch {}
//   }

//   return {
//     success: true,
//     message: "Logged out successfully"
//   };
// };

// const getCurrentUser = async (userId) => {
//   const user = await authRepository.findUserById(userId);

//   if (!user) {
//     return {
//       success: false,
//       message: "User not found"
//     };
//   }

//   const u = user.get({ plain: true });

//   const accessToken = jwt.sign(
//     {
//       id: u.id,
//       role: u.Roles?.[0]?.name || 'Employee'
//     },
//     env.JWT_SECRET,
//     {
//       expiresIn: '1d'
//     }
//   );

//   return {
//     success: true,
//     data: {
//       user: {
//         id: u.id,
//         email: u.email,
//         fullName: `${u.firstName} ${u.lastName}`,
//         primaryRole: u.Roles?.[0]?.name || 'Employee',
//         accessToken
//       },
//       meta: {
//         role: u.Roles?.[0]?.name,
//         isActive: u.isActive,
//         department: u.department
//       }
//     }
//   };
// };

// module.exports = {
//   register,
//   login,
//   refreshSession,
//   logout,
//   getCurrentUser
// };

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const {
  buildAccessToken,
  buildRefreshToken,
  verifyRefreshToken
} = require('../../utils/tokenUtils');
const authRepository = require('./authRepository');
const { sendNotification, sendAuditLog } = require('../../config/socket');

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
  try {
    const existingUser = await authRepository.findUserByEmail(payload.email);

    if (existingUser) {
      sendNotification(existingUser.id, {
        event: 'REGISTRATION_FAILED',
        reason: 'Email already registered'
      });
      
      return {
        success: false,
        message: "Email already registered",
        statusCode: 409
      };
    }

    if (payload.managerId) {
      const manager = await authRepository.findUserById(payload.managerId);
      const managerRole = manager?.Roles?.[0]?.name || manager?.role;

      if (!manager) {
        if (payload.managerId) {
          sendNotification(payload.managerId, {
            event: 'MANAGER_VALIDATION_FAILED',
            reason: 'Manager not found'
          });
        }
        
        return {
          success: false,
          message: "Invalid managerId: User not found",
          statusCode: 400
        };
      }

      if (!managerRole || managerRole.toLowerCase() !== "manager") {
        sendNotification(payload.managerId, {
          event: 'MANAGER_VALIDATION_FAILED',
          reason: 'User is not a valid manager'
        });
        
        return {
          success: false,
          message: "Selected managerId is not a valid manager",
          statusCode: 400
        };
      }
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
          managerId: payload.managerId ?? null,
          department: payload.department ?? null,
          baseSalary: payload.baseSalary ?? 0
        },
        transaction
      );

      const roles = await authRepository.findRoleByName(payload.role, transaction);

      if (!roles || roles.length === 0) {
        throw new Error("Invalid role provided");
      }

      const role = roles[0];
      await authRepository.assignRoleToUser(createdUser.id, role.id, transaction);

      sendNotification(createdUser.id, {
        event: 'USER_REGISTERED',
        role: payload.role,
        timestamp: new Date().toISOString()
      });

      sendAuditLog({
        action: 'USER_REGISTRATION',
        userId: createdUser.id,
        email: payload.email,
        role: payload.role,
        managerId: payload.managerId
      });

      return createdUser;
    });

    return await issueTokensForUser(user);
  } catch (error) {
    console.error("REGISTER FAILED:", error.message);
    
    return {
      success: false,
      message: error.message || "Registration failed",
      statusCode: error.statusCode || 500
    };
  }
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

  sendNotification(normalizedUser.id, {
    event: 'TOKENS_ISSUED',
    timestamp: new Date().toISOString()
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
    if (user) {
      sendNotification(user.id, {
        event: 'LOGIN_FAILED',
        reason: "Invalid credentials"
      });
    }
    
    return {
      success: false,
      message: "Invalid credentials"
    };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    sendNotification(user.id, {
      event: 'LOGIN_FAILED',
      reason: "Invalid password"
    });
    
    return {
      success: false,
      message: "Invalid credentials"
    };
  }

  sendNotification(user.id, {
    event: 'LOGIN_SUCCESS',
    timestamp: new Date().toISOString()
  });

  sendAuditLog({
    action: 'USER_LOGIN',
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString()
  });

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
    sendNotification(payload.sub, {
      event: 'REFRESH_TOKEN_FAILED',
      reason: "Token revoked or expired"
    });
    
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

  sendNotification(payload.sub, {
    event: 'SESSION_REFRESHED',
    timestamp: new Date().toISOString()
  });

  return newTokens;
};

const logout = async ({ refreshToken }) => {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await authRepository.revokeRefreshToken({ tokenId: payload.tokenId });
      
      sendNotification(payload.sub, {
        event: 'LOGOUT_SUCCESS',
        timestamp: new Date().toISOString()
      });
      
      sendAuditLog({
        action: 'USER_LOGOUT',
        userId: payload.sub,
        timestamp: new Date().toISOString()
      });
    } catch {}
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

  const u = user.get({ plain: true });

  const accessToken = jwt.sign(
    {
      id: u.id,
      role: u.Roles?.[0]?.name || 'Employee'
    },
    env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  sendNotification(userId, {
    event: 'CURRENT_USER_FETCHED',
    timestamp: new Date().toISOString()
  });

  return {
    success: true,
    data: {
      user: {
        id: u.id,
        email: u.email,
        fullName: `${u.firstName} ${u.lastName}`,
        primaryRole: u.Roles?.[0]?.name || 'Employee',
        accessToken
      },
      meta: {
        role: u.Roles?.[0]?.name,
        isActive: u.isActive,
        department: u.department
      }
    }
  };
};

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  getCurrentUser
};