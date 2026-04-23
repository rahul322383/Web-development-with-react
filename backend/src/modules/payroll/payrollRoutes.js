'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const ctrl = require('./payrollController');

router.use(authenticate);

// ─── Employee routes ──────────────────────────────────────────────────────────

// My payroll history
router.get('/my/history', ctrl.getMyPayrollHistory);

// My YTD summary (year-to-date)
router.get('/ytd', ctrl.getYTDSummary);

// Download my payslip PDF
router.get('/:payrollId/payslip', ctrl.downloadPayslip);

// Full breakdown of one payroll record
router.get('/:payrollId/breakdown', ctrl.getSalaryBreakdown);

// ─── HR / Admin routes ────────────────────────────────────────────────────────

// Monthly team summary
router.get(
    '/monthly-summary',
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.getMonthlyPayrollSummary,
);

// Employee's full payroll history (HR viewing any employee)
router.get(
    '/employee/:employeeId',
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.getPayrollByEmployee,
);

// Process payroll for all active employees
router.post(
    '/process',
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.processPayroll,
);

// Lock a payroll record
router.patch(
    '/lock',
    authorize('Admin', 'HR', 'Finance', 'Manager'),
    ctrl.lockPayroll,
);

module.exports = router;

