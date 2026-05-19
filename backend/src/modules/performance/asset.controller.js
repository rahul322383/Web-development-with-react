'use strict';

const svc = require('./asset.service');

// ─── Assets ──────────────────────────────────────────────────────────────────

const createAsset = async (req, res) => {
  const result = await svc.createAsset(req.user, req.body);
  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
};

const getAsset = async (req, res) => {
  const result = await svc.getAsset(req.params.id);
  return res.status(result.success ? 200 : (result.statusCode || 404)).json(result);
};

const listAssets = async (req, res) => {
  const { type, status, condition } = req.query;
  const result = await svc.listAssets({
    companyId: req.user.companyId,
    type, status, condition,
  });
  return res.status(200).json(result);
};

const updateAsset = async (req, res) => {
  const result = await svc.updateAsset(req.user, req.params.id, req.body);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
};

const deleteAsset = async (req, res) => {
  const result = await svc.deleteAsset(req.user, req.params.id);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
};

// ─── Assignments ─────────────────────────────────────────────────────────────

const assignAsset = async (req, res) => {
  const result = await svc.assignAsset(req.user, req.body);
  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
};

const returnAsset = async (req, res) => {
  const result = await svc.returnAsset(req.user, req.params.assignmentId, req.body);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
};

const getAssignment = async (req, res) => {
  const result = await svc.getAssignment(req.params.id);
  return res.status(result.success ? 200 : (result.statusCode || 404)).json(result);
};

const listAssignments = async (req, res) => {
  const { employeeId, assetId, status } = req.query;
  const result = await svc.listAssignments({
    companyId:  req.user.companyId,
    employeeId: employeeId ? Number(employeeId) : undefined,
    assetId:    assetId    ? Number(assetId)    : undefined,
    status,
  });
  return res.status(200).json(result);
};

const getMyAssets = async (req, res) => {
  const result = await svc.getMyAssets(req.user.id);
  return res.status(200).json(result);
};

// ─── Damage Reports ──────────────────────────────────────────────────────────

const fileDamageReport = async (req, res) => {
  const result = await svc.fileDamageReport(req.user, req.body);
  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
};

const getDamageReport = async (req, res) => {
  const result = await svc.getDamageReport(req.params.id);
  return res.status(result.success ? 200 : (result.statusCode || 404)).json(result);
};

const listDamageReports = async (req, res) => {
  const { assetId, assignmentId, status, reportedBy } = req.query;
  const result = await svc.listDamageReports({
    companyId:    req.user.companyId,
    assetId:      assetId      ? Number(assetId)      : undefined,
    assignmentId: assignmentId ? Number(assignmentId) : undefined,
    status,
    reportedBy:   reportedBy   ? Number(reportedBy)   : undefined,
  });
  return res.status(200).json(result);
};

const updateDamageReport = async (req, res) => {
  const result = await svc.updateDamageReport(req.user, req.params.id, req.body);
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
};

module.exports = {
  // Assets
  createAsset, getAsset, listAssets, updateAsset, deleteAsset,
  // Assignments
  assignAsset, returnAsset, getAssignment, listAssignments, getMyAssets,
  // Damage Reports
  fileDamageReport, getDamageReport, listDamageReports, updateDamageReport,
};
