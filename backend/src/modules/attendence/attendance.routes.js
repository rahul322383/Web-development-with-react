'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');

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

// auth required for all routes
router.use(authenticate);

// ─── Employee (light + frequent usage) ─────────────────────────
router.post('/checkin', apiLimiter, validateCheckIn, ctrl.checkIn);

router.patch('/checkout', apiLimiter, validateCheckOut, ctrl.checkOut);

router.get('/my', apiLimiter, validateMyAttendance, ctrl.getMyAttendance);

// ─── Manager / HR / Admin (medium traffic) ────────────────────
router.get(
  '/today',
  apiLimiter,
  authorize('admin', 'hr', 'manager'),
  ctrl.getTodaySummary,
);

// heavy reporting → stricter limiter
router.get(
  '/report',
  heavyLimiter,
  authorize('admin', 'hr', 'manager'),
  validateTeamReport,
  ctrl.getTeamReport,
);

// overtime = heavy query
router.get(
  '/overtime-summary',
  heavyLimiter,
  authorize('admin', 'hr'),
  validateOvertimeSummary,
  ctrl.getOvertimeSummary,
);

// admin manual entry (sensitive)
router.post(
  '/admin',
  adminLimiter,
  authorize('admin', 'hr'),
  validateAdminRecord,
  ctrl.adminRecord,
);

// ─── Must be LAST (param route trap fix) ───────────────────────
router.get(
  '/:id',
  apiLimiter,
  authorize('admin', 'hr', 'manager'),
  ctrl.getById,
);

module.exports = router;