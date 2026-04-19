'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('./auditService');

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query, req.user);
  return res.status(200).json(result);
});

const getAuditLogById = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogById(req.params.id, req.user);
  return res.status(200).json(result);
});

const getAuditStats = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditStats(req.query, req.user);
  return res.status(200).json(result);
});

const getAuditLogsByUser = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogsByUser(
    req.params.userId,
    req.query,
    req.user
  );
  return res.status(200).json(result);
});

const getAuditLogsByModule = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogsByModule(
    req.params.moduleName,
    req.query,
    req.user
  );
  return res.status(200).json(result);
});

const exportAuditLogs = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  await auditService.exportAuditLogs(req.query, req.user, res);
});

const deleteOldAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.deleteOldAuditLogs(
    { daysToKeep: req.body.daysToKeep ?? 90 },
    req.user,
    req.ip
  );
  return res.status(200).json(result);
});

const createAuditLog = asyncHandler(async (req, res) => {
  const result = await auditService.createAuditLog(req.body, req.user);
  return res.status(201).json(result);
});

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  getAuditLogsByUser,
  getAuditLogsByModule,
  exportAuditLogs,
  deleteOldAuditLogs,
  createAuditLog,
};