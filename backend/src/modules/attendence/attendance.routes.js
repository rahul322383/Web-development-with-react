'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');

const {
  requirePermission,
} = require('../../utils/permissions');

const {
  apiLimiter,
  heavyLimiter,
  adminLimiter,
} = require('../../middleware/rateLimit.middleware');

const ctrl = require('./attendance.controller');

const {
  validateCheckIn,
  validateCheckOut,
  validateAdminRecord,
  validateMyAttendance,
  validateTeamReport,
  validateOvertimeSummary,
} = require('./attendance.validation');

router.use(authenticate);

// ─────────────────────────────────────────────
// Employee
// ─────────────────────────────────────────────

router.post(
  '/checkin',
  apiLimiter,
  requirePermission('CHECKIN_ATTENDANCE'),
  validateCheckIn,
  ctrl.checkIn,
);

router.patch(
  '/checkout',
  apiLimiter,
  requirePermission('CHECKOUT_ATTENDANCE'),
  validateCheckOut,
  ctrl.checkOut,
);

router.get(
  '/my',
  apiLimiter,
  requirePermission('VIEW_ATTENDANCE'),
  validateMyAttendance,
  ctrl.getMyAttendance,
);

// ─────────────────────────────────────────────
// Team / Management
// ─────────────────────────────────────────────

router.get(
  '/today',
  apiLimiter,
  requirePermission('VIEW_TEAM_ATTENDANCE'),
  ctrl.getTodaySummary,
);

router.get(
  '/report',
  heavyLimiter,
  requirePermission('VIEW_ATTENDANCE_REPORT'),
  validateTeamReport,
  ctrl.getTeamReport,
);

router.get(
  '/overtime-summary',
  heavyLimiter,
  requirePermission('VIEW_OVERTIME_SUMMARY'),
  validateOvertimeSummary,
  ctrl.getOvertimeSummary,
);

// ─────────────────────────────────────────────
// Admin Manual Entry
// ─────────────────────────────────────────────

router.post(
  '/admin',
  adminLimiter,
  requirePermission('MANAGE_ATTENDANCE'),
  validateAdminRecord,
  ctrl.adminRecord,
);

// ─────────────────────────────────────────────
// Must be LAST
// ─────────────────────────────────────────────

router.get(
  '/:id',
  apiLimiter,
  requirePermission('VIEW_TEAM_ATTENDANCE'),
  ctrl.getById,
);

module.exports = router;