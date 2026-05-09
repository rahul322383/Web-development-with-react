'use strict';

const express = require('express');

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const {
    analyticsLimiter,
    strictLimiter,
} = require('../../config/security');

const ctrl = require('./reports.controller');

const {
    dateRangeSchema,
} = require('./reports.validation');

const router = express.Router();

router.use(authenticate);

router.get(
    '/dashboard',
    analyticsLimiter,
    requirePermission('VIEW_DASHBOARD'),
    validate(dateRangeSchema, 'query'),
    ctrl.dashboard
);

router.get(
    '/employees',
    analyticsLimiter,
    requirePermission('LIST_USERS'),
    validate(dateRangeSchema, 'query'),
    ctrl.employees
);

router.get(
    '/payroll',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    validate(dateRangeSchema, 'query'),
    ctrl.payroll
);

router.get(
    '/leave',
    analyticsLimiter,
    requirePermission('VIEW_LEAVE'),
    validate(dateRangeSchema, 'query'),
    ctrl.leave
);

router.get(
    '/expenses',
    analyticsLimiter,
    requirePermission('LIST_MY_EXPENSES'),
    validate(dateRangeSchema, 'query'),
    ctrl.expenses
);

router.get(
    '/export/csv/:module',
    strictLimiter,
    requirePermission('EXPORT_PAYROLL'),
    validate(dateRangeSchema, 'query'),
    ctrl.exportCSV
);

router.get(
    '/export/pdf/:module',
    strictLimiter,
    requirePermission('EXPORT_PAYROLL'),
    validate(dateRangeSchema, 'query'),
    ctrl.exportPDF
);

module.exports = router;