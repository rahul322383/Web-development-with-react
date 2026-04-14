const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn('Redis not available, continuing without cache');
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.warn('Redis connection error (app will continue without cache):', err.message);
});

module.exports = redis;