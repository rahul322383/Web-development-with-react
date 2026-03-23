const logger = require('../config/logger');

const errorMiddleware = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  logger.error({
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    details: error.details || null
  });

  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details || null
  });
};

module.exports = errorMiddleware;