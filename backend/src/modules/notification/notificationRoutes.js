// const express = require('express');
// const authenticate = require('../../middleware/auth.middleware');
// const authorize = require('../../middleware/rbacMiddleware');
// const notificationController = require('./notificationController');

// const router = express.Router();

// router.use(authenticate);

// router.get(
//    '/',
//    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//    notificationController.listMyNotifications
// );

// router.get('/unread-count',
//    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//    notificationController.getUnreadCount
// );

// router.patch(
//    '/:id/read',
//    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//    notificationController.markRead
// );

// router.patch(
//    '/read-all',
//    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//    notificationController.markAllRead
// );

// router.delete(
//    '/:id',
//    authorize('Employee', 'Manager', 'HR', 'Admin'),
//    notificationController.deleteNotification
// );

// router.delete(
//    '/',
//    authorize('Employee', 'Manager', 'HR', 'Admin'),
//    notificationController.clearAllNotifications
// );

// module.exports = router;

'use strict';

/**
 * src/modules/notification/notificationRoutes.js
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const notificationController = require('./notificationController');

const ALL_ROLES = ['Employee', 'Manager', 'HR', 'Finance', 'Admin'];

router.use(authenticate);

// ─── Notification list & count ────────────────────────────────────────────────

/** GET /notifications?limit=&offset=&type=&isRead= */
router.get('/', authorize(...ALL_ROLES), notificationController.listMyNotifications);

/** GET /notifications/unread-count  → { unread: N, byType: { PAYROLL: 2, ... } } */
router.get('/unread-count', authorize(...ALL_ROLES), notificationController.getUnreadCount);

// ─── Preferences ──────────────────────────────────────────────────────────────

/** GET  /notifications/preferences  → full preference map */
router.get('/preferences', authorize(...ALL_ROLES), notificationController.getMyPreferences);

/**
 * PATCH /notifications/preferences
 * Body: { eventType: "PAYROLL" | "LEAVE" | "ALL", prefs: { email: true, sms: false, in_app: true } }
 */
router.patch('/preferences', authorize(...ALL_ROLES), notificationController.updateMyPreferences);

// ─── Mark read ────────────────────────────────────────────────────────────────

/** PATCH /notifications/read-all */
router.patch('/read-all', authorize(...ALL_ROLES), notificationController.markAllRead);

/** PATCH /notifications/:id/read */
router.patch('/:id/read', authorize(...ALL_ROLES), notificationController.markRead);

// ─── Delete ───────────────────────────────────────────────────────────────────

/** DELETE /notifications  (clear all) */
router.delete('/', authorize(...ALL_ROLES), notificationController.clearAllNotifications);

/** DELETE /notifications/:id */
router.delete('/:id', authorize(...ALL_ROLES), notificationController.deleteNotification);

module.exports = router;

