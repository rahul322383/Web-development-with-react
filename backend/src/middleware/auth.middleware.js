const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing"
      });
    }

    const token = authHeader.split(' ')[1];

    let payload;

    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (!payload?.sub || !payload?.role || !payload?.jti) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    if (payload.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,        
      primaryRole: payload.role, 
      jti: payload.jti,
      exp: payload.exp
    };
  

    next();

  } catch (error) {
   

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = authenticate;