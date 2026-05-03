'use strict';

// src/modules/attendence/shiftRoutes.js

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const shiftCtrl = require('./shift.controller');
const validate = require('../../middleware/validate.middleware');

// ✅ Use shared validation
const {
    shiftSchema,
    assignShiftSchema,
    shiftReportQuerySchema
} = require('./shift.validation');

router.use(authenticate);



// ── SHIFT CONFIG ROUTES ───────────────────────────────

router.post(
    '/',
    authorize('Admin', 'HR','Manager', 'Finance', 'Employee'),
    validate(shiftSchema),
    shiftCtrl.createShift
);

router.get(
    '/',
    authorize('Admin', 'HR', 'Manager', 'Employee'),
    shiftCtrl.listShifts
);

router.put(
    '/:id',
    authorize('Admin', 'HR'),
    validate(shiftSchema),
    shiftCtrl.updateShift
);

router.delete(
    '/:id',
    authorize('Admin', 'HR'),
    shiftCtrl.deleteShift
);

// ── SHIFT ASSIGNMENT ─────────────────────────────────

router.post(
    '/assign',
    authorize('Admin', 'HR', 'Manager'),
    validate(assignShiftSchema),
    shiftCtrl.assignShift
);

router.get(
    '/employee/:employeeId/history',
    authorize('Admin', 'HR', 'Manager'),
    shiftCtrl.getEmployeeShiftHistory
);

// ── SHIFT REPORT ─────────────────────────────────────

router.get(
    '/report',
    authorize('Admin', 'HR', 'Manager'),
    validate(shiftReportQuerySchema, 'query'),
    shiftCtrl.getShiftReport
);

module.exports = router;