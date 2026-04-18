
// // const { createLogger, format, transports } = require('winston');

// // const isProduction = process.env.NODE_ENV === 'production';

// // const consoleFormat = format.printf(({ level, message, timestamp, stack }) => {
// //   return `${timestamp}  ${level}: ${stack || message}`;
// // });

// // const logger = createLogger({
// //   level: isProduction ? 'info' : 'debug',
// //   defaultMeta: { service: 'hrms-backend' },

// //   format: isProduction
// //     ? format.combine(
// //         format.timestamp(),
// //         format.errors({ stack: true }),
// //         format.json()
// //       )
// //     : format.combine(
// //         format.colorize(),
// //         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
// //         format.errors({ stack: true }),
// //         consoleFormat
// //       ),

// //   transports: [
// //     new transports.Console(),

// //     new transports.File({
// //       filename: 'logs/error.log',
// //       level: 'error'
// //     }),

// //     new transports.File({
// //       filename: 'logs/combined.log'
// //     })
// //   ]
// // });

// // module.exports = logger;





// const { createLogger, format, transports } = require('winston');

// const { combine, timestamp, errors, json, colorize, printf } = format;

// const isDev = process.env.NODE_ENV !== 'production';

// const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
//   return `${timestamp} ${level}: ${stack || message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
//     }`;
// });

// const logger = createLogger({
//   level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

//   defaultMeta: { service: 'hrms-backend' },

//   format: combine(
//     errors({ stack: true }),
//     timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     isDev ? combine(colorize(), devFormat) : json()
//   ),

//   transports: [
//     // Error logs
//     new transports.File({
//       filename: 'logs/error.log',
//       level: 'error',
//       maxsize: 10 * 1024 * 1024,
//       maxFiles: 5
//     }),

//     // All logs
//     new transports.File({
//       filename: 'logs/combined.log',
//       maxsize: 10 * 1024 * 1024,
//       maxFiles: 10
//     })
//   ],

//   exceptionHandlers: [
//     new transports.File({ filename: 'logs/exceptions.log' })
//   ],

//   rejectionHandlers: [
//     new transports.File({ filename: 'logs/rejections.log' })
//   ]
// });

// // Console only in dev
// if (isDev) {
//   logger.add(new transports.Console());
// }

// module.exports = logger;

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, errors, json, colorize, printf } = format;

const isDev = process.env.NODE_ENV !== 'production';

/**
 * 🔥 Custom Dev Format (Readable)
 */
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} ${level}: ${stack || message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
});

/**
 * 🚀 Structured Format (Production Ready)
 */
const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

/**
 * 🧠 Base Logger
 */
const logger = createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  defaultMeta: {
    service: 'hrms-backend',
    env: process.env.NODE_ENV || 'development'
  },

  format: isDev
    ? combine(
      errors({ stack: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      colorize(),
      devFormat
    )
    : prodFormat,

  transports: [
    /**
     * ❌ Error Logs
     */
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d'
    }),

    /**
     * 📄 Combined Logs
     */
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d'
    })
  ],

  /**
   * 💥 Crash Logs
   */
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD'
    })
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD'
    })
  ]
});

/**
 * 🖥️ Console Logging (Dev Only)
 */
if (isDev) {
  logger.add(new transports.Console());
}

/**
 * 🚀 Helper Methods (VERY IMPORTANT)
 */

// 🔐 Auth Logs
logger.auth = (message, meta = {}) => {
  logger.info(message, { type: 'AUTH', ...meta });
};

// ⚠️ Security Logs
logger.security = (message, meta = {}) => {
  logger.warn(message, { type: 'SECURITY', ...meta });
};

// 📊 DB Logs
logger.db = (message, meta = {}) => {
  logger.debug(message, { type: 'DATABASE', ...meta });
};

// 🌐 API Logs
logger.api = (message, meta = {}) => {
  logger.info(message, { type: 'API', ...meta });
};

// ❌ Error Logs (with full stack)
logger.errorLog = (message, error, meta = {}) => {
  logger.error(message, {
    ...meta,
    error: error?.message,
    stack: error?.stack
  });
};

module.exports = logger;