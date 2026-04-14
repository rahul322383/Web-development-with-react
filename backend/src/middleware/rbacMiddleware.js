const AppError = require('../utils/AppError');

const authorize = (...allowedRoles) => (req, _res, next) => {
  console.log('User role:', req.user ? req.user.role : 'No user');
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }
  return next();
};

module.exports = authorize;