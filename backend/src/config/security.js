'use strict';

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./env');

/* -------------------- CORS -------------------- */
const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(',').map(i => i.trim()),
  credentials: true,
});

/* -------------------- KEY GENERATOR -------------------- */
// ✅ Per-user + per-IP
const keyGenerator = (req) => {
  const userId = req.user?.id || 'guest';
  const ip = req.ip;

  return `${userId}-${ip}`;
};

/* -------------------- GLOBAL LIMITER -------------------- */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  message: {
    success: false,
    message: 'Too many requests. Try again later.',
  },
});

/* -------------------- AUTH LIMITERS -------------------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip, // 🔥 only IP
  message: {
    success: false,
    message: 'Too many login attempts. Try later.',
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many registrations. Try later.',
  },
});

/* -------------------- ANALYTICS LIMITER -------------------- */
const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  keyGenerator,
  message: {
    success: false,
    message: 'Too many analytics requests.',
  },
});

/* -------------------- STRICT LIMITER -------------------- */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator,
  message: {
    success: false,
    message: 'Too many sensitive requests.',
  },
});

module.exports = {
  helmetMiddleware: helmet(),
  corsMiddleware,
  globalLimiter,
  loginLimiter,
  registerLimiter,
  analyticsLimiter,
  strictLimiter,
};