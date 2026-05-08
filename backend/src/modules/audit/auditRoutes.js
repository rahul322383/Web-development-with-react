'use strict';

const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');

const {
    requirePermission,
} = require('../../utils/permissions');

const auditController = require('./auditController');

const {
    adminLimiter,
    apiLimiter,
} = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.get(
    '/',
    requirePermission('VIEW_AUDIT_LOGS'),
    auditController.getAuditLogs
);

router.get(
    '/stats',
    requirePermission('VIEW_AUDIT_STATS'),
    auditController.getAuditStats
);

router.get(
    '/export',
    requirePermission('EXPORT_AUDIT_LOGS'),
    auditController.exportAuditLogs
);

router.get(
    '/user/:userId',
    requirePermission('VIEW_USER_AUDIT'),
    auditController.getAuditLogsByUser
);

router.get(
    '/module/:moduleName',
    requirePermission('VIEW_MODULE_AUDIT'),
    auditController.getAuditLogsByModule
);

router.get(
    '/:id',
    requirePermission('VIEW_AUDIT_LOGS'),
    auditController.getAuditLogById
);

router.post(
    '/',
    adminLimiter,
    requirePermission('CREATE_AUDIT_LOG'),
    auditController.createAuditLog
);

router.delete(
    '/cleanup',
    adminLimiter,
    requirePermission('DELETE_AUDIT_LOGS'),
    auditController.deleteOldAuditLogs
);

module.exports = router;