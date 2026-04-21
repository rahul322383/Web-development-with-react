const morgan = require('morgan');
const logger = require('../config/logger');

// Morgan → Winston stream
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Custom token for requestId
morgan.token('request-id', (req) => req.requestId);

// Cleaner + more useful format
const requestLogger = morgan(
  ':method :url :status :response-time ms - :request-id',
  {
    stream,
    skip: (req) => req.url === '/health', // optional
  }
);

module.exports = requestLogger;