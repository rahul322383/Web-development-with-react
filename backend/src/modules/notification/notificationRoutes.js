const express = require('express');
const authenticate = require('../../middleware/auth.middleware');  // up 2 levels to src/middleware
const authorize = require('../../middleware/rbacMiddleware');      // same
const notificationController = require('./notificationController'); // same folder

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), notificationController.listMyNotifications);
router.patch('/:id/read', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), notificationController.markRead);

module.exports = router;