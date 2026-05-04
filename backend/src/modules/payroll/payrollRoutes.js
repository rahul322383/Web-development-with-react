'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const ctrl = require('./payrollController');
const validate = require('../../middleware/validate.middleware');
const { analyticsLimiter, strictLimiter } = require('../../config/security');

router.use(authenticate);

router.get(
    '/my/history',
    analyticsLimiter,
    ctrl.getMyPayrollHistory
);

router.get(
    '/ytd',
    analyticsLimiter,
    ctrl.getYTDSummary
);

router.get(
    '/:payrollId/payslip',
    analyticsLimiter,
    ctrl.downloadPayslip
);

router.get(
    '/:payrollId/breakdown',
    analyticsLimiter,
    ctrl.getSalaryBreakdown
);

router.get(
    '/monthly-summary',
    analyticsLimiter,
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.getMonthlyPayrollSummary
);

router.get(
    '/employee/:employeeId',
    analyticsLimiter,
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.getPayrollByEmployee
);

router.post(
    '/process',
    strictLimiter,
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.processPayroll
);

router.patch(
    '/lock',
    strictLimiter,
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.lockPayroll
);

module.exports = router;