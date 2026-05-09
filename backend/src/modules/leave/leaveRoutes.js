'use strict';

const express = require('express');

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const {
    apiLimiter,
    writeLimiter,
    strictLimiter,
} = require('../../middleware/rateLimit.middleware');

const ctrl = require('./leaveController');

const {
    applyLeaveSchema,
    managerDecisionSchema,
} = require('./leaveValidation');

const router = express.Router();

router.use(authenticate, apiLimiter);

router.post(
    '/',
    writeLimiter,
    requirePermission('APPLY_LEAVE'),
    validate(applyLeaveSchema),
    ctrl.applyLeave
);

router.get(
    '/my',
    strictLimiter,
    requirePermission('VIEW_LEAVE'),
    ctrl.listMyLeaves
);

router.get(
    '/balance',
    strictLimiter,
    requirePermission('VIEW_LEAVE'),
    ctrl.getLeaveBalance
);

router.get(
    '/pending-manager',
    strictLimiter,
    requirePermission('REVIEW_LEAVE'),
    ctrl.listPendingLeaves
);

router.get(
    '/team',
    strictLimiter,
    requirePermission('REVIEW_LEAVE'),
    ctrl.listTeamLeaves
);

router.get(
    '/dashboard-summary',
    strictLimiter,
    requirePermission('VIEW_LEAVE'),
    ctrl.getDashboardSummary
);

router.get(
    '/stats',
    strictLimiter,
    requirePermission('REVIEW_LEAVE'),
    ctrl.getLeaveStats
);

router.post(
    '/reset-balances',
    writeLimiter,
    requirePermission('APPROVE_LEAVE'),
    ctrl.resetLeaveBalances
);

router.patch(
    '/:id/review',
    writeLimiter,
    requirePermission('REVIEW_LEAVE'),
    validate(managerDecisionSchema),
    ctrl.reviewLeave
);

router.patch(
    '/:id/cancel',
    writeLimiter,
    requirePermission('APPLY_LEAVE'),
    ctrl.cancelLeave
);

router.get(
    '/:id',
    strictLimiter,
    requirePermission('VIEW_LEAVE'),
    ctrl.getLeaveById
);

module.exports = router;