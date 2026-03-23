const express = require('express');
const sequelize = require('../src/database/sequelize');
const { redisClient } = require('../src/redis/redisClient');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'hrms-backend' });
});

router.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'live' });
});

router.get('/health/ready', async (_req, res) => {
  try {
    await sequelize.authenticate();
    await redisClient.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', reason: error.message });
  }
});

module.exports = router;