const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const notificationController = require('./notificationController');

const router = express.Router();

/* =========================
   GLOBAL MIDDLEWARE
========================= */
router.use(authenticate);

/* =========================
   GET NOTIFICATIONS
========================= */
// with pagination: ?limit=20&offset=0
router.get(
  '/',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  notificationController.listMyNotifications
);

/* =========================
   UNREAD COUNT
========================= */
router.get(
  '/unread-count',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  notificationController.getUnreadCount
);

/* =========================
   MARK SINGLE AS READ
========================= */
router.patch(
  '/:id/read',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  notificationController.markRead
);

/* =========================
   MARK ALL AS READ
========================= */
router.patch(
  '/read-all',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  notificationController.markAllRead
);

/* =========================
   DELETE SINGLE NOTIFICATION
========================= */
router.delete(
  '/:id',
  authorize('Employee', 'Manager', 'HR', 'Admin'), // finance optional
  notificationController.deleteNotification
);

/* =========================
   CLEAR ALL NOTIFICATIONS
========================= */
router.delete(
  '/',
  authorize('Employee', 'Manager', 'HR', 'Admin'),
  notificationController.clearAllNotifications
);

module.exports = router;