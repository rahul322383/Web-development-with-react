'use strict';

// leaveRoutes.js
// ─────────────────────────────────────────────────────────────
// BUG FIX: Route ordering
//
// Express matches routes in registration order. Previously:
//   GET  /:id           ← registered first
//   PATCH /cancel/:id   ← "cancel" matched as :id param, never reached
//
// Fix: all specific named paths must be registered BEFORE /:id
// ─────────────────────────────────────────────────────────────

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const ctrl = require('./leaveController');
const { applyLeaveSchema, managerDecisionSchema } = require('./leaveValidation');

const router = express.Router();

router.use(authenticate);

// ── Collection routes (no :id param) ─────────────────────────
router.post(
    '/',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    validate(applyLeaveSchema),
    ctrl.applyLeave,
);

router.get(
    '/my',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.listMyLeaves,
);

router.get(
    '/balance',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getLeaveBalance,
);

router.get(
    '/pending-manager',
    authorize('Manager', 'Admin', 'HR'),
    ctrl.listPendingLeaves,
);

router.get(
    '/team',
    authorize('Manager', 'Admin', 'HR'),
    ctrl.listTeamLeaves,
);

router.get(
    '/dashboard-summary',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getDashboardSummary,
);

router.get(
    '/stats',
    authorize('Admin', 'HR', 'Manager'),
    ctrl.getLeaveStats,
);

router.post(
    '/reset-balances',
    authorize('Admin'),
    ctrl.resetLeaveBalances,
);

// ── Item routes (:id param) ───────────────────────────────────
// IMPORTANT: these must come AFTER all named-segment routes above.

router.patch(
    '/:id/review',
    authorize('Manager', 'Admin', 'HR'),
    validate(managerDecisionSchema),
    ctrl.reviewLeave,
);

// FIX: was PATCH /cancel/:id — shadowed by GET /:id.
// Changed to PATCH /:id/cancel so the pattern is consistent
// and won't be swallowed by the /:id GET handler.
router.patch(
    '/:id/cancel',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.cancelLeave,
);

// Generic single-record getter — MUST be last among /:id routes
router.get(
    '/:id',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getLeaveById,
);

module.exports = router;