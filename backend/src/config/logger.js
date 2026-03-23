// const { createLogger, format, transports } = require('winston');

// const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: format.combine(
//     format.timestamp(),
//     format.errors({ stack: true }),
//     format.json()
//   ),
//   defaultMeta: { service: 'hrms-backend' },
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'logs/error.log', level: 'error' }),
//     new transports.File({ filename: 'logs/combined.log' })
//   ]
// });

// module.exports = logger;

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