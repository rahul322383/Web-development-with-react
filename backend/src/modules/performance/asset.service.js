'use strict';

const { randomBytes } = require('crypto');
const sequelize = require('../../database/sequelize');
const repo = require('./asset.repository');
const { sendNotification, sendAuditLog } = require('../../config/socket');

const audit = (event, userId, meta = {}) =>
  sendAuditLog({ event, userId, metadata: meta, timestamp: new Date().toISOString() });

const generateAssetCode = (type) => {
  const prefixMap = {
    laptop: 'LPT', mobile: 'MOB', sim: 'SIM',
    tablet: 'TAB', monitor: 'MON', keyboard: 'KBD',
    mouse: 'MOU', headset: 'HST', other: 'AST',
  };
  const prefix = prefixMap[type] || 'AST';
  return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;
};

// ════════════════════════════════════════════════════════════════════════════
// Assets
// ════════════════════════════════════════════════════════════════════════════

const createAsset = async (actor, payload) => {
  try {
    const assetCode = payload.assetCode || generateAssetCode(payload.type);

    const existing = await repo.findAssetByCode(assetCode);
    if (existing) return { success: false, message: 'Asset code already exists', statusCode: 409 };

    const asset = await repo.createAsset({
      ...payload,
      assetCode,
      companyId: actor.companyId ?? payload.companyId,
    });

    audit('ASSET_CREATED', actor.id, { assetId: asset.id, assetCode, type: payload.type });
    return { success: true, data: { asset } };
  } catch (err) {
    return { success: false, message: err.message, statusCode: 500 };
  }
};

const getAsset = async (id) => {
  const asset = await repo.findAssetById(id);
  if (!asset) return { success: false, message: 'Asset not found', statusCode: 404 };
  return { success: true, data: { asset } };
};

const listAssets = async (filters) => {
  const assets = await repo.listAssets(filters);
  return { success: true, data: { assets } };
};

const updateAsset = async (actor, id, payload) => {
  const asset = await repo.findAssetById(id);
  if (!asset) return { success: false, message: 'Asset not found', statusCode: 404 };
  await repo.updateAsset(id, payload);
  audit('ASSET_UPDATED', actor.id, { assetId: id });
  return { success: true, data: { asset: { ...asset.toJSON(), ...payload } } };
};

const deleteAsset = async (actor, id) => {
  const asset = await repo.findAssetById(id);
  if (!asset) return { success: false, message: 'Asset not found', statusCode: 404 };
  if (asset.status === 'assigned') {
    return { success: false, message: 'Cannot delete an assigned asset', statusCode: 400 };
  }
  await repo.deleteAsset(id);
  audit('ASSET_DELETED', actor.id, { assetId: id });
  return { success: true, message: 'Asset deleted' };
};

// ════════════════════════════════════════════════════════════════════════════
// Asset Assignment (Laptop / Mobile / SIM)
// ════════════════════════════════════════════════════════════════════════════

const assignAsset = async (actor, payload) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const asset = await repo.findAssetById(payload.assetId);
      if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
      if (asset.status === 'assigned') {
        throw Object.assign(new Error('Asset is already assigned'), { statusCode: 409 });
      }
      if (['under_repair', 'retired', 'lost'].includes(asset.status)) {
        throw Object.assign(new Error(`Asset cannot be assigned (status: ${asset.status})`), { statusCode: 400 });
      }

      const assignment = await repo.createAssignment({
        ...payload,
        assignedBy: actor.id,
        companyId: actor.companyId ?? payload.companyId,
        assignedAt: new Date(),
        status: 'active',
      }, t);

      await repo.updateAsset(payload.assetId, { status: 'assigned' }, t);

      return assignment;
    });

    sendNotification(payload.employeeId, {
      event: 'ASSET_ASSIGNED',
      message: `A new asset has been assigned to you.`,
      assignmentId: result.id,
    });

    audit('ASSET_ASSIGNED', actor.id, {
      assetId: payload.assetId,
      employeeId: payload.employeeId,
      assignmentId: result.id,
    });

    return { success: true, data: { assignment: result } };
  } catch (err) {
    return { success: false, message: err.message, statusCode: err.statusCode || 500 };
  }
};

const returnAsset = async (actor, assignmentId, payload) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const assignment = await repo.findAssignmentById(assignmentId);
      if (!assignment) throw Object.assign(new Error('Assignment not found'), { statusCode: 404 });
      if (assignment.status !== 'active') {
        throw Object.assign(new Error('Asset is not currently assigned'), { statusCode: 400 });
      }

      await repo.updateAssignment(assignmentId, {
        status: 'returned',
        returnedAt: new Date(),
        returnedTo: actor.id,
        conditionAtReturn: payload.conditionAtReturn ?? 'good',
        returnNotes: payload.returnNotes ?? null,
      }, t);

      await repo.updateAsset(assignment.assetId, {
        status: 'available',
        condition: payload.conditionAtReturn ?? 'good',
      }, t);

      return assignment;
    });

    sendNotification(result.employeeId, {
      event: 'ASSET_RETURNED',
      message: 'Your asset return has been recorded.',
      assignmentId,
    });

    audit('ASSET_RETURNED', actor.id, { assignmentId, assetId: result.assetId });
    return { success: true, message: 'Asset returned successfully' };
  } catch (err) {
    return { success: false, message: err.message, statusCode: err.statusCode || 500 };
  }
};

const getAssignment = async (id) => {
  const assignment = await repo.findAssignmentById(id);
  if (!assignment) return { success: false, message: 'Assignment not found', statusCode: 404 };
  return { success: true, data: { assignment } };
};

const listAssignments = async (filters) => {
  const assignments = await repo.listAssignments(filters);
  return { success: true, data: { assignments } };
};

const getMyAssets = async (userId) => {
  const assignments = await repo.listAssignmentsByEmployee(userId);
  return { success: true, data: { assignments } };
};

// ════════════════════════════════════════════════════════════════════════════
// Damage Reports
// ════════════════════════════════════════════════════════════════════════════

const fileDamageReport = async (actor, payload) => {
  try {
    const assignment = await repo.findAssignmentById(payload.assignmentId);
    if (!assignment) return { success: false, message: 'Assignment not found', statusCode: 404 };

    const report = await repo.createDamageReport({
      ...payload,
      assetId: assignment.assetId,
      reportedBy: actor.id,
      companyId: actor.companyId ?? payload.companyId,
    });

    // Mark asset under repair for severe damage
    if (['severe', 'total_loss'].includes(payload.severity)) {
      await repo.updateAsset(assignment.assetId, { status: 'under_repair' });
    }

    audit('DAMAGE_REPORT_FILED', actor.id, { reportId: report.id, assetId: assignment.assetId, severity: payload.severity });
    return { success: true, data: { report } };
  } catch (err) {
    return { success: false, message: err.message, statusCode: 500 };
  }
};

const getDamageReport = async (id) => {
  const report = await repo.findDamageReportById(id);
  if (!report) return { success: false, message: 'Damage report not found', statusCode: 404 };
  return { success: true, data: { report } };
};

const listDamageReports = async (filters) => {
  const reports = await repo.listDamageReports(filters);
  return { success: true, data: { reports } };
};

const updateDamageReport = async (actor, id, payload) => {
  const report = await repo.findDamageReportById(id);
  if (!report) return { success: false, message: 'Damage report not found', statusCode: 404 };

  const updates = { ...payload };
  if (payload.status === 'resolved') updates.resolvedAt = new Date(), updates.reviewedBy = actor.id;

  await repo.updateDamageReport(id, updates);

  // If resolved, restore asset status
  if (payload.status === 'resolved') {
    await repo.updateAsset(report.assetId, { status: 'available' });
  }

  audit('DAMAGE_REPORT_UPDATED', actor.id, { reportId: id, status: payload.status });
  return { success: true, message: 'Damage report updated' };
};

module.exports = {
  // Assets
  createAsset, getAsset, listAssets, updateAsset, deleteAsset,
  // Assignments
  assignAsset, returnAsset, getAssignment, listAssignments, getMyAssets,
  // Damage
  fileDamageReport, getDamageReport, listDamageReports, updateDamageReport,
};
