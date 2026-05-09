'use strict';

const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const shiftCtrl = require('./shift.controller');

const {
    analyticsLimiter,
    strictLimiter,
} = require('../../config/security');

const {
    shiftSchema,
    assignShiftSchema,
    shiftReportQuerySchema,
} = require('./shift.validation');

router.use(authenticate);

router.post(
    '/',
    strictLimiter,
    requirePermission('MANAGE_SHIFTS'),
    validate(shiftSchema),
    shiftCtrl.createShift
);

router.get(
    '/',
    analyticsLimiter,
    requirePermission('VIEW_SHIFTS'),
    shiftCtrl.listShifts
);

router.put(
    '/:id',
    strictLimiter,
    requirePermission('MANAGE_SHIFTS'),
    validate(shiftSchema),
    shiftCtrl.updateShift
);

router.delete(
    '/:id',
    strictLimiter,
    requirePermission('MANAGE_SHIFTS'),
    shiftCtrl.deleteShift
);

router.post(
    '/assign',
    strictLimiter,
    requirePermission('ASSIGN_SHIFT'),
    validate(assignShiftSchema),
    shiftCtrl.assignShift
);

router.get(
    '/history/:employeeId',
    analyticsLimiter,
    requirePermission('VIEW_SHIFTS'),
    shiftCtrl.getEmployeeShiftHistory
);

router.get(
    '/report',
    analyticsLimiter,
    requirePermission('VIEW_SHIFT_REPORT'),
    validate(shiftReportQuerySchema, 'query'),
    shiftCtrl.getShiftReport
);

module.exports = router;