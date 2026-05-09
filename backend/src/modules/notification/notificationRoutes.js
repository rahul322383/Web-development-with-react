'use strict';

const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const {
    apiLimiter,
    strictLimiter,
} = require('../../middleware/rateLimit.middleware');

const notificationController = require('./notificationController');

router.use(authenticate, apiLimiter);

router.get(
    '/',
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.listMyNotifications
);

router.get(
    '/unread-count',
    strictLimiter,
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.getUnreadCount
);

router.get(
    '/preferences',
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.getMyPreferences
);

router.patch(
    '/preferences',
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.updateMyPreferences
);

router.patch(
    '/read-all',
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.markAllRead
);

router.patch(
    '/:id/read',
    requirePermission('VIEW_NOTIFICATIONS'),
    notificationController.markRead
);

router.delete(
    '/',
    requirePermission('DELETE_NOTIFICATION'),
    notificationController.clearAllNotifications
);

router.delete(
    '/:id',
    requirePermission('DELETE_NOTIFICATION'),
    notificationController.deleteNotification
);

module.exports = router;