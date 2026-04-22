'use strict';

const express    = require('express');
const router     = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');

const ctrl = require('./attendance.controller');
const {
  validateCheckIn,
  validateCheckOut,
  validateAdminRecord,
  validateMyAttendance,
  validateTeamReport,
  validateOvertimeSummary,
} = require('./attendance.validation');

// All attendance routes require a valid JWT
router.use(authenticate);

// ─── Employee routes ──────────────────────────────────────────────────────────
// Any authenticated user can check in/out and view their own records

router.post(
  '/checkin',
  validateCheckIn,
  ctrl.checkIn,
);

router.patch(
  '/checkout',
  validateCheckOut,
  ctrl.checkOut,
);

router.get(
  '/my',
  validateMyAttendance,
  ctrl.getMyAttendance,
);

// ─── HR / Admin / Manager routes ─────────────────────────────────────────────

router.get(
  '/today',
  authorize('admin', 'hr', 'manager'),
  ctrl.getTodaySummary,
);

router.get(
  '/report',
  authorize('admin', 'hr', 'manager'),
  validateTeamReport,
  ctrl.getTeamReport,
);

router.get(
  '/overtime-summary',
  authorize('admin', 'hr'),
  validateOvertimeSummary,
  ctrl.getOvertimeSummary,
);

router.post(
  '/admin',
  authorize('admin', 'hr'),
  validateAdminRecord,
  ctrl.adminRecord,
);

// Parameterised last to avoid swallowing named routes above
router.get(
  '/:id',
  authorize('admin', 'hr', 'manager'),
  ctrl.getById,
);

module.exports = router;

// ─── Register in your main app.js / server.js ────────────────────────────────

