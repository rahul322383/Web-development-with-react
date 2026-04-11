// const jwt = require('jsonwebtoken');
// const env = require('../config/env');
// const { redisClient } = require('../redis/redisClient');

// const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // Check Authorization header
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Token missing"
//       });
//     }

//     const token = authHeader.split(' ')[1];

//     let payload;

//     // Verify token
//     try {
//       payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
//     } catch (error) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or expired token"
//       });
//     }

//     // Check token type
//     if (payload.type !== 'access') {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid access token"
//       });
//     }

//     // Check if token is blacklisted in Redis
//     const isBlacklisted = await redisClient.get(`bl_access_${payload.jti}`);

//     if (isBlacklisted) {
//       return res.status(401).json({
//         success: false,
//         message: "Token has been revoked"
//       });
//     }

//     // Attach user info to request
//     req.user = {
//       id: payload.sub,
//       email: payload.email,
//       role: payload.role,
//       jti: payload.jti,
//       exp: payload.exp
//     };

//     next();

//   } catch (error) {
//     console.error("Auth Middleware Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// };

// module.exports = authenticate;


const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { redisClient } = require('../redis/redisClient');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing"
      });
    }

    const token = authHeader.split(' ')[1];

    let payload;

    // ✅ Verify token
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // ✅ Validate required fields (🔥 important)
    if (!payload?.sub || !payload?.role || !payload?.jti) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    // ✅ Check token type
    if (payload.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    // ✅ Check Redis connection (safe fallback)
    let isBlacklisted = false;
    try {
      isBlacklisted = await redisClient.get(`bl_access_${payload.jti}`);
    } catch (redisError) {
      console.error("Redis Error:", redisError);
      // 👉 don't block user if Redis fails
    }

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked"
      });
    }

    // ✅ Attach user info (FIXED mapping already correct)
    req.user = {
      id: Number(payload.sub),   // 🔥 ensure number (prevents NaN bugs later)
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp
    };

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = authenticate;