const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const auditController = require('./auditController');
const sequelize = require('../../database/sequelize');
const router = express.Router();
router.use(authenticate);

// All routes require authentication
router.use(authenticate);

// Audit log routes
router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportAuditLogs);
router.get('/:id', auditController.getAuditLogById);
router.get('/user/:userId', auditController.getAuditLogsByUser);
router.get('/module/:moduleName', auditController.getAuditLogsByModule);
router.post('/', authorize(['Admin']), auditController.createAuditLog);
router.delete('/cleanup', authorize(['Admin']), auditController.deleteOldAuditLogs);

module.exports = router;