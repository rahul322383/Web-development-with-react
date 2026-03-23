const AppError = require('../utils/AppError');

const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }
  return next();
};

module.exports = authorize;