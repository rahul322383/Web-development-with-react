// // const express = require('express');
// // const validate = require('../../middleware/validate.middleware');
// // const authenticate = require('../../middleware/auth.middleware');
// // const { loginLimiter } = require('../../config/security');
// // const authController = require('./auth.controller');
// // const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');
// // const {apiLimiter , authLimiter} = require('../../middleware/rateLimit.middleware');

// // const router = express.Router();

// // router.post('/register', validate(registerSchema), authController.register);
// // router.post('/login', loginLimiter, validate(loginSchema), authController.login);
// // router.post('/refresh-token', validate(refreshSchema), authController.refresh);
// // router.post('/logout', authenticate, authController.logout);
// // router.get('/me', authenticate, authController.me);

// // module.exports = router;


// const express = require('express');

// const validate = require('../../middleware/validate.middleware');
// const authenticate = require('../../middleware/auth.middleware');

// const authController = require('./auth.controller');
// const {
//   registerSchema,
//   loginSchema,
//   refreshSchema
// } = require('./auth.validation');

// const {
//   authLimiter,
//   apiLimiter
// } = require('../../middleware/rateLimit.middleware');

// const router = express.Router();


// // 🔐 REGISTER (strict limiter - prevent bot spam)
// router.post(
//   '/register',
//   authLimiter,
//   validate(registerSchema),
//   authController.register
// );


// // 🔐 LOGIN (strict limiter - brute force protection)
// router.post(
//   '/login',
//   authLimiter,
//   validate(loginSchema),
//   authController.login
// );


// // 🔄 REFRESH TOKEN (light protection)
// router.post(
//   '/refresh-token',
//   apiLimiter,
//   validate(refreshSchema),
//   authController.refresh
// );


// // 🚪 LOGOUT (must be authenticated)
// router.post(
//   '/logout',
//   authenticate,
//   apiLimiter,
//   authLimiter,
//   authController.logout
// );


// // 👤 GET CURRENT USER
// router.get(
//   '/me',
//   authenticate,
//   apiLimiter,
//   authController.me
// );

// module.exports = router;




// // const { loginLimiter, registerLimiter, refreshLimiter } = require('./authRateLimiter');
// // router.post('/login', loginLimiter, authController.login);
// // router.post('/register', registerLimiter, authController.register);
// // router.post('/refresh', refreshLimiter, authController.refresh);

'use strict';

const express = require('express');
const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authController = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');
const { authLimiter, apiLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', apiLimiter, validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, apiLimiter, authController.logout);
router.get('/me', authenticate, apiLimiter, authController.me);

module.exports = router;