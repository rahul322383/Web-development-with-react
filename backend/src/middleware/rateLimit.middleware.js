'use strict';

const rateLimit = require('express-rate-limit');
const getKey = (req) => {
  return req.user?.id ? `${req.ip}-${req.user.id}` : req.ip;
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Try again after 15 minutes.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Slow down.'
  }
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests on this endpoint.'
  }
});

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many write operations. Please slow down.'
  }
});
const heavyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  message: {
    success: false,
    message: 'Too many heavy requests. Please wait.',
  },
});
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  keyGenerator: getKey,
  message: {
    success: false,
    message: 'Admin rate limit exceeded.',
  },
});

module.exports = {
  adminLimiter,
  heavyLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,
  writeLimiter
};