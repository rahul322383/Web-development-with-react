'use strict';

// src/modules/attendence/shiftRoutes.js

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const shiftCtrl = require('./shift.controller');
const validate = require('../../middleware/validate.middleware');

// 🔥 ADD LIMITERS
const { analyticsLimiter, strictLimiter } = require('../../config/security');

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
    strictLimiter, // 🔥 create shift = sensitive
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    validate(shiftSchema),
    shiftCtrl.createShift
);

router.get(
    '/',
    analyticsLimiter, // 🔥 frequent listing
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    shiftCtrl.listShifts
);

router.put(
    '/:id',
    strictLimiter, // 🔥 update shift = sensitive
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    validate(shiftSchema),
    shiftCtrl.updateShift
);

router.delete(
    '/:id',
    strictLimiter, // 🔥 destructive action
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    shiftCtrl.deleteShift
);

// ── SHIFT ASSIGNMENT ─────────────────────────────────

router.post(
    '/assign',
    strictLimiter, // 🔥 assignment changes data heavily
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    validate(assignShiftSchema),
    shiftCtrl.assignShift
);

router.get(
    '/history/:employeeId',
    analyticsLimiter, // 🔥 read-heavy endpoint
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    shiftCtrl.getEmployeeShiftHistory
);

// ── SHIFT REPORT ─────────────────────────────────────

router.get(
    '/report',
    analyticsLimiter, // 🔥 report queries are heavy
    authorize('Admin', 'HR', 'Manager', 'Finance', 'Employee'),
    validate(shiftReportQuerySchema, 'query'),
    shiftCtrl.getShiftReport
);

module.exports = router;