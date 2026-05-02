'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const notificationController = require('./notificationController');

const ALL_ROLES = ['Employee', 'Manager', 'HR', 'Finance', 'Admin'];

router.use(authenticate);

router.get('/', authorize(...ALL_ROLES), notificationController.listMyNotifications);

router.get('/unread-count', authorize(...ALL_ROLES), notificationController.getUnreadCount);

router.get('/preferences', authorize(...ALL_ROLES), notificationController.getMyPreferences);

router.patch('/preferences', authorize(...ALL_ROLES), notificationController.updateMyPreferences);

router.patch('/read-all', authorize(...ALL_ROLES), notificationController.markAllRead);

router.patch('/:id/read', authorize(...ALL_ROLES), notificationController.markRead);

router.delete('/', authorize(...ALL_ROLES), notificationController.clearAllNotifications);

router.delete('/:id', authorize(...ALL_ROLES), notificationController.deleteNotification);

module.exports = router;