'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const { analyticsLimiter, strictLimiter } = require('../../config/security');
const ctrl = require('./reports.controller');
const { dateRangeSchema } = require('./reports.validation');

const router = express.Router();

router.use(authenticate);

router.get(
    '/dashboard',
    analyticsLimiter,
    authorize('Admin', 'HR', 'Manager'),
    validate(dateRangeSchema, 'query'),
    ctrl.dashboard
);

router.get(
    '/employees',
    analyticsLimiter,
    authorize('Admin', 'HR'),
    validate(dateRangeSchema, 'query'),
    ctrl.employees
);

router.get(
    '/payroll',
    analyticsLimiter,
    authorize('Admin', 'Finance'),
    validate(dateRangeSchema, 'query'),
    ctrl.payroll
);

router.get(
    '/leave',
    analyticsLimiter,
    authorize('Admin', 'HR', 'Manager'),
    validate(dateRangeSchema, 'query'),
    ctrl.leave
);

router.get(
    '/expenses',
    analyticsLimiter,
    authorize('Admin', 'Finance', 'HR'),
    validate(dateRangeSchema, 'query'),
    ctrl.expenses
);

router.get(
    '/export/csv/:module',
    strictLimiter,
    authorize('Admin', 'HR', 'Finance'),
    validate(dateRangeSchema, 'query'),
    ctrl.exportCSV
);

router.get(
    '/export/pdf/:module',
    strictLimiter,
    authorize('Admin', 'HR', 'Finance'),
    validate(dateRangeSchema, 'query'),
    ctrl.exportPDF
);

module.exports = router;