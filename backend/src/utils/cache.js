// Redis removed — using no-op cache functions

const getCache = async (key) => {
  return null; // always miss cache
};

const setCache = async (key, payload, ttlSeconds = 300) => {
  return; // do nothing
};

const clearCacheKeys = async (keys = []) => {
  return; // do nothing
};

module.exports = {
  getCache,
  setCache,
  clearCacheKeys
};