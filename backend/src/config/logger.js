
const { createLogger, format, transports } = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const consoleFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp}  ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  defaultMeta: { service: 'hrms-backend' },

  format: isProduction
    ? format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      )
    : format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        consoleFormat
      ),

  transports: [
    new transports.Console(),

    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),

    new transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

module.exports = logger;






// const { createLogger, format, transports } = require('winston');

// const isProduction = process.env.NODE_ENV === 'production';

// const customFormat = format.printf((info) => {
//   const { timestamp, level, message, stack, ...meta } = info;

//   let log = `${timestamp}  ${level}:`;

//   if (stack) {
//     log += ` ${stack}`;
//   } else if (typeof message === 'object') {
//     log += ` ${JSON.stringify(message, null, 2)}`;
//   } else {
//     log += ` ${message}`;
//   }

//   if (Object.keys(meta).length) {
//     log += ` ${JSON.stringify(meta, null, 2)}`;
//   }

//   return log;
// });

// // const logger = createLogger({
// //   level: isProduction ? 'info' : 'debug',
// //   defaultMeta: { service: 'hrms-backend' },

// //   format: format.combine(
// //     format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
// //     format.errors({ stack: true }),
// //     isProduction ? format.json() : format.colorize(),
// //     customFormat
// //   ),

// //   transports: [
// //     new transports.Console(),

// //     new transports.File({
// //       filename: 'logs/error.log',
// //       level: 'error'
// //     }),

// //     new transports.File({
// //       filename: 'logs/combined.log'
// //     })
// //   ],

// //   exceptionHandlers: [
// //     new transports.File({ filename: 'logs/exceptions.log' })
// //   ],

// //   rejectionHandlers: [
// //     new transports.File({ filename: 'logs/rejections.log' })
// //   ]
// // });

// // module.exports = logger;