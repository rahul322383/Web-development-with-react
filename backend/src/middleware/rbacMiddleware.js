const AppError = require('../utils/AppError');

const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource',
        data: null
      });
    }
    return next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authorization middleware error',
      data: null
    });
  }
};

module.exports = authorize;


