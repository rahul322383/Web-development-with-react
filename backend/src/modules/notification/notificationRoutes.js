const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const notificationController = require('./notificationController');

const router = express.Router();

router.use(authenticate);

router.get(
   '/',
   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
   notificationController.listMyNotifications
);

router.get(
   '/unread-count',
   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
   notificationController.getUnreadCount
);

router.patch(
   '/:id/read',
   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
   notificationController.markRead
);

router.patch(
   '/read-all',
   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
   notificationController.markAllRead
);

router.delete(
   '/:id',
   authorize('Employee', 'Manager', 'HR', 'Admin'),
   notificationController.deleteNotification
);

router.delete(
   '/',
   authorize('Employee', 'Manager', 'HR', 'Admin'),
   notificationController.clearAllNotifications
);

module.exports = router;