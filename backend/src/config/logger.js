
// const { createLogger, format, transports } = require('winston');

// const isProduction = process.env.NODE_ENV === 'production';

// const consoleFormat = format.printf(({ level, message, timestamp, stack }) => {
//   return `${timestamp}  ${level}: ${stack || message}`;
// });

// const logger = createLogger({
//   level: isProduction ? 'info' : 'debug',
//   defaultMeta: { service: 'hrms-backend' },

//   format: isProduction
//     ? format.combine(
//         format.timestamp(),
//         format.errors({ stack: true }),
//         format.json()
//       )
//     : format.combine(
//         format.colorize(),
//         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//         format.errors({ stack: true }),
//         consoleFormat
//       ),

//   transports: [
//     new transports.Console(),

//     new transports.File({
//       filename: 'logs/error.log',
//       level: 'error'
//     }),

//     new transports.File({
//       filename: 'logs/combined.log'
//     })
//   ]
// });

// module.exports = logger;



const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const {
  combine,
  timestamp,
  errors,
  json,
  colorize,
  printf,
} = format;

const isDev = process.env.NODE_ENV !== 'production';

/**
 * ✅ Dev Console Format
 */
const devFormat = printf(
  ({ level, message, timestamp, stack, ...meta }) => {
    return `${timestamp} ${level}: ${stack || message} ${Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : ''
      }`;
  }
);

/**
 * ✅ Base Logger
 */
const logger = createLogger({
  level:
    process.env.LOG_LEVEL ||
    (isDev ? 'debug' : 'info'),

  defaultMeta: {
    service: 'hrms-backend',
    env: process.env.NODE_ENV || 'development',
  },

  format: combine(
    errors({ stack: true }),
    timestamp(),
    isDev
      ? combine(
        colorize(),
        printf(
          ({ level, message, timestamp, stack, ...meta }) =>
            `${timestamp} ${level}: ${stack || message
            } ${Object.keys(meta).length
              ? JSON.stringify(meta, null, 2)
              : ''
            }`
        )
      )
      : json()
  ),

  transports: [
    /**
     * ✅ Console (IMPORTANT)
     */
    new transports.Console(),

    /**
     * ❌ Error Logs
     */
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    /**
     * 📄 Combined Logs
     */
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),

    /**
     * 🔐 Audit Logs
     */
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],

  /**
   * 💥 Uncaught Exceptions
   */
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],

  /**
   * 💥 Promise Rejections
   */
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],

  exitOnError: false,
});

/**
 * ✅ Helper Methods
 */

// 🔐 Auth Logs
logger.auth = (message, meta = {}) => {
  logger.info(message, {
    type: 'AUTH',
    ...meta,
  });
};

// ⚠️ Security Logs
logger.security = (message, meta = {}) => {
  logger.warn(message, {
    type: 'SECURITY',
    ...meta,
  });
};

// 📊 Database Logs
logger.db = (message, meta = {}) => {
  logger.debug(message, {
    type: 'DATABASE',
    ...meta,
  });
};

// 🌐 API Logs
logger.api = (message, meta = {}) => {
  logger.info(message, {
    type: 'API',
    ...meta,
  });
};

// 📝 Audit Logs
logger.audit = (message, meta = {}) => {
  logger.info(message, {
    type: 'AUDIT',
    ...meta,
  });
};

// ❌ Error Logs
logger.errorLog = (
  message,
  error,
  meta = {}
) => {
  logger.error(message, {
    ...meta,
    error: error?.message,
    stack: error?.stack,
  });
};

module.exports = logger;