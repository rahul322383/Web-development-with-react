'use strict';

const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const ctrl = require('./payrollController');

const {
    analyticsLimiter,
    strictLimiter,
} = require('../../config/security');

router.use(authenticate);

router.get(
    '/my/history',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.getMyPayrollHistory
);

router.get(
    '/ytd',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.getYTDSummary
);

router.get(
    '/:payrollId/payslip',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.downloadPayslip
);

router.get(
    '/:payrollId/breakdown',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.getSalaryBreakdown
);

router.get(
    '/monthly-summary',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.getMonthlyPayrollSummary
);

router.get(
    '/employee/:employeeId',
    analyticsLimiter,
    requirePermission('VIEW_PAYROLL'),
    ctrl.getPayrollByEmployee
);

router.post(
    '/process',
    strictLimiter,
    requirePermission('GENERATE_PAYROLL'),
    ctrl.processPayroll
);

router.patch(
    '/lock',
    strictLimiter,
    requirePermission('APPROVE_PAYROLL'),
    ctrl.lockPayroll
);

module.exports = router;