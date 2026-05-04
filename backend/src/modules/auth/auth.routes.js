'use strict';

const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authController = require('./auth.controller');

const {
    registerSchema,
    loginSchema,
    refreshSchema
} = require('./auth.validation');

const {
    authLimiter,
    apiLimiter
} = require('../../middleware/rateLimit.middleware');

router.post('/register', authLimiter, validate(registerSchema), authController.register);

router.post('/login', authLimiter, validate(loginSchema), authController.login);

router.post('/refresh-token', apiLimiter, validate(refreshSchema), authController.refresh);

router.post('/logout', authenticate, apiLimiter, authController.logout);

router.get('/me', authenticate, apiLimiter, authController.me);

module.exports = router;