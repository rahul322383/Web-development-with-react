const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./env');

// ✅ Trust proxy (VERY IMPORTANT for production)
const trustProxy = (app) => {
  app.set('trust proxy', 1);
};

// ✅ CORS
const corsMiddleware = cors({
  origin: env.CORS_ORIGIN.split(',').map(i => i.trim()),
  credentials: true,
});

// 🔑 Key generator (user-based if logged in)
const keyGenerator = (req) => {
  return req.user?.id || req.ip;
};

// 🔧 Base limiter factory (DRY)
const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: { success: false, message },
  });

// 🌍 Global limiter (general traffic)
const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300, // 🔥 reduced (1200 was too high)
  message: 'Too many requests. Slow down.',
});

// 🔐 Login limiter (strict)
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try again later.',
});

// 🧾 Register limiter (very strict)
const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registrations. Try later.',
});

// 🎯 Attendance limiter (IMPORTANT for your case)
const attendanceLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many attendance actions. Chill.',
});

module.exports = {
  helmetMiddleware: helmet(),
  corsMiddleware,
  trustProxy, // 👈 don't forget to call this in app.js
  globalLimiter,
  loginLimiter,
  registerLimiter,
  attendanceLimiter,
};