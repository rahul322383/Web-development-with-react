const { redisClient } = require('../redis/redisClient');

const getCache = async (key) => {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
};

const setCache = async (key, payload, ttlSeconds = 300) => {
  await redisClient.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
};

const clearCacheKeys = async (keys = []) => {
  if (!keys.length) return;
  await redisClient.del(keys);
};

module.exports = {
  getCache,
  setCache,
  clearCacheKeys
};