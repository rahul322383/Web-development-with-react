// const AppError = require('../utils/AppError');
// const logger = require('../config/logger');

// const errorHandler = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     logger.error('Error:', {
//       message: err.message,
//       stack: err.stack,
//       statusCode: err.statusCode,
//     });
//   }

//   if (err.name === 'CastError') {
//     err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
//   }

//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     err = new AppError(`Duplicate field value: ${field}. Please use another value.`, 400);
//   }

//   if (err.name === 'ValidationError') {
//     const errors = Object.values(err.errors).map((el) => el.message);
//     err = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
//   }

//   if (err.name === 'JsonWebTokenError') {
//     err = new AppError('Invalid token. Please log in again.', 401);
//   }

//   if (err.name === 'TokenExpiredError') {
//     err = new AppError('Your token has expired. Please log in again.', 401);
//   }

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//   });
// };

// module.exports = errorHandler;


const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });
  }

  // 🔴 MongoDB Cast Error
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  // 🔴 Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }

  // 🔴 Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // 🔴 JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }

  // 🧾 FINAL RESPONSE FORMAT (IMPORTANT)
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,

    // only show stack in dev
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
};

module.exports = errorHandler;
