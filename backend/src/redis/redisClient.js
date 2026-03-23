const IORedis = require('ioredis');
const env = require('../config/env');
const logger = require('../config/logger');

const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
  maxRetriesPerRequest: null,
  enableReadyCheck: true
};

if (env.REDIS_PASSWORD) {
  redisConnectionOptions.password = env.REDIS_PASSWORD;
}

const redisClient = new IORedis(redisConnectionOptions);

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis connection error'));

module.exports = {
  redisClient,
  redisConnectionOptions
};