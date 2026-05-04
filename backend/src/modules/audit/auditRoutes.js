'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const auditController = require('./auditController');

const { adminLimiter, apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

// collection filters (IMPORTANT: must come BEFORE /:id)
router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportAuditLogs);
router.get('/user/:userId', auditController.getAuditLogsByUser);
router.get('/module/:moduleName', auditController.getAuditLogsByModule);

// single record (keep LAST)
router.get('/:id', auditController.getAuditLogById);

// write operations (strict limiter)
router.post('/', adminLimiter, authorize('Admin'), auditController.createAuditLog);
router.delete('/cleanup', adminLimiter, authorize('Admin'), auditController.deleteOldAuditLogs);

module.exports = router;