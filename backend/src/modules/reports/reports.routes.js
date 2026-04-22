'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');
const ctrl = require('./reports.controller');
const { dateRangeSchema } = require('./reports.validation');

const router = express.Router();

router.use(authenticate, apiLimiter);


// Role-based access per report
router.get('/dashboard', authorize('Admin', 'HR', 'Manager'), validate(dateRangeSchema, 'query'), ctrl.dashboard);
router.get('/employees', authorize('Admin', 'HR'), validate(dateRangeSchema, 'query'), ctrl.employees);
router.get('/payroll', authorize('Admin', 'Finance'), validate(dateRangeSchema, 'query'), ctrl.payroll);
router.get('/leave', authorize('Admin', 'HR', 'Manager'), validate(dateRangeSchema, 'query'), ctrl.leave);
router.get('/expenses', authorize('Admin', 'Finance', 'HR'), validate(dateRangeSchema, 'query'), ctrl.expenses);

// Exports
router.get('/export/csv/:module', authorize('Admin', 'HR', 'Finance'), validate(dateRangeSchema, 'query'), ctrl.exportCSV);
router.get('/export/pdf/:module', authorize('Admin', 'HR', 'Finance'), validate(dateRangeSchema, 'query'), ctrl.exportPDF);

module.exports = router;