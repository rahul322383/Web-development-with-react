const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // VERY strict for auth routes
  message: {
    success: false,
    message: "Too many attempts. Try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 120,
  message: {
    success: false,
    message: "Rate limit exceeded. Slow down."
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};