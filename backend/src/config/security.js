const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./env');

const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(',').map((item) => item.trim()),
  credentials: true
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' }
});

module.exports = {
  helmetMiddleware: helmet(),
  corsMiddleware,
  globalLimiter,
  loginLimiter
};