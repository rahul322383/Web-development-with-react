const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const auditController = require('./auditController');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('Admin', 'HR'), auditController.listAuditLogs);

module.exports = router;