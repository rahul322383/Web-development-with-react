'use strict';

const express = require('express');

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const yearEndController = require('./yearEndController');

const { yearSchema } = require('./yearEndValidation');

const { strictLimiter } = require('../../config/security');

const router = express.Router();

/* 🔒 AUTH */
router.use(authenticate);

/* 📄 View Year-End Summaries */
router.get(
    '/',
    requirePermission('VIEW_YEAR_END_REPORT'),
    yearEndController.listSummaries
);

/* ⚠️ Heavy generation operation */
router.post(
    '/generate',
    strictLimiter,
    requirePermission('GENERATE_YEAR_END_REPORT'),
    validate(yearSchema),
    yearEndController.generateSummary
);

module.exports = router;