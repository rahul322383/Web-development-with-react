'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const { apiLimiter, writeLimiter, strictLimiter } = require('../../middleware/rateLimit.middleware');
const ctrl = require('./leaveController');
const { applyLeaveSchema, managerDecisionSchema } = require('./leaveValidation');

const router = express.Router();

router.use(authenticate, apiLimiter);

router.post(
    '/',
    writeLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    validate(applyLeaveSchema),
    ctrl.applyLeave
);

router.get(
    '/my',
    strictLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.listMyLeaves
);

router.get(
    '/balance',
    strictLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getLeaveBalance
);

router.get(
    '/pending-manager',
    strictLimiter,
    authorize('Manager', 'Admin', 'HR'),
    ctrl.listPendingLeaves
);

router.get(
    '/team',
    strictLimiter,
    authorize('Manager', 'Admin', 'HR'),
    ctrl.listTeamLeaves
);

router.get(
    '/dashboard-summary',
    strictLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getDashboardSummary
);

router.get(
    '/stats',
    strictLimiter,
    authorize('Admin', 'HR', 'Manager'),
    ctrl.getLeaveStats
);

router.post(
    '/reset-balances',
    writeLimiter,
    authorize('Admin'),
    ctrl.resetLeaveBalances
);

router.patch(
    '/:id/review',
    writeLimiter,
    authorize('Manager', 'Admin', 'HR'),
    validate(managerDecisionSchema),
    ctrl.reviewLeave
);

router.patch(
    '/:id/cancel',
    writeLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.cancelLeave
);

router.get(
    '/:id',
    strictLimiter,
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    ctrl.getLeaveById
);

module.exports = router;