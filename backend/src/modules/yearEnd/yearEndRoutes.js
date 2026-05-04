'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const yearEndController = require('./yearEndController');
const { yearSchema } = require('./yearEndValidation');

// 🔥 ADD LIMITER
const { strictLimiter } = require('../../config/security');

const router = express.Router();

/* 🔒 AUTH FIRST */
router.use(authenticate);

/* 📄 SAFE READ (no strict limit needed, but protected by globalLimiter) */
router.get(
    '/',
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    yearEndController.listSummaries
);

/* ⚠️ HEAVY OPERATION → STRICT LIMIT */
router.post(
    '/generate',
    strictLimiter, // 🔥 protects from spam / accidental multiple triggers
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    validate(yearSchema),
    yearEndController.generateSummary
);

module.exports = router;