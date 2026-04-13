const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('./auditService');

const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  
  if (!result.success) {
    return res.status(result.statusCode || 400).json(result);
  }
  
  res.status(200).json(result);
});

const getAuditLogById = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogById(Number(req.params.id));
  
  if (!result.success) {
    return res.status(result.statusCode || 404).json(result);
  }
  
  res.status(200).json(result);
});

const getAuditStats = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditStats(req.query);
  res.status(200).json(result);
});

const getAuditLogsByUser = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogsByUser(Number(req.params.userId), req.query);
  res.status(200).json(result);
});

const getAuditLogsByModule = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogsByModule(req.params.moduleName, req.query);
  res.status(200).json(result);
});

const exportAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.exportAuditLogs(req.query);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`);
  res.status(200).json(result);
});

const deleteOldAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.deleteOldAuditLogs(
    Number(req.body.daysToKeep),
    req.user,
    req.ip
  );
  
  res.status(200).json(result);
});

module.exports = {
  listAuditLogs,
  getAuditLogById,
  getAuditStats,
  getAuditLogsByUser,
  getAuditLogsByModule,
  exportAuditLogs,
  deleteOldAuditLogs
};