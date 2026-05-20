'use strict';

const { Op } = require('sequelize');
const {
  Asset,
  AssetAssignment,
  AssetDamageReport,
  User,
} = require('../../database/initModels');

const userAttrs = ['id', 'firstName', 'lastName', 'email', 'department', 'designation'];

// ─── Asset ───────────────────────────────────────────────────────────────────

const createAsset = (payload, transaction = null) =>
  Asset.create(payload, { transaction });

const findAssetById = (id) =>
  Asset.findByPk(id, {
    include: [
      {
        model: AssetAssignment,
        as: 'assignments',
        where: { status: 'active' },
        required: false,
        include: [{ model: User, as: 'employee', attributes: userAttrs }],
      },
    ],
  });

const findAssetByCode = (assetCode) =>
  Asset.findOne({ where: { assetCode } });

const listAssets = ({ companyId, type, status, condition } = {}) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (type)      where.type      = type;
  if (status)    where.status    = status;
  if (condition) where.condition = condition;
  return Asset.findAll({
    where,
    include: [
      {
        model: AssetAssignment,
        as: 'assignments',
        where: { status: 'active' },
        required: false,
        include: [{ model: User, as: 'employee', attributes: userAttrs }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updateAsset = (id, payload, transaction = null) =>
  Asset.update(payload, { where: { id }, transaction });

const deleteAsset = (id, transaction = null) =>
  Asset.destroy({ where: { id }, transaction });

// ─── Asset Assignment ────────────────────────────────────────────────────────

const createAssignment = (payload, transaction = null) =>
  AssetAssignment.create(payload, { transaction });

const findAssignmentById = (id) =>
  AssetAssignment.findByPk(id, {
    include: [
      { model: Asset, as: 'asset' },
      { model: User,  as: 'employee',   attributes: userAttrs },
      { model: User,  as: 'assignor',   attributes: userAttrs },
      { model: User,  as: 'returnedTo', attributes: userAttrs },
    ],
  });

const findActiveAssignmentByAsset = (assetId) =>
  AssetAssignment.findOne({ where: { assetId, status: 'active' } });

const listAssignmentsByEmployee = (employeeId) =>
  AssetAssignment.findAll({
    where: { employeeId },
    include: [{ model: Asset, as: 'asset' }],
    order: [['assignedAt', 'DESC']],
  });

const listAssignments = ({ companyId, employeeId, assetId, status } = {}) => {
  const where = {};
  if (companyId)  where.companyId  = companyId;
  if (employeeId) where.employeeId = employeeId;
  if (assetId)    where.assetId    = assetId;
  if (status)     where.status     = status;
  return AssetAssignment.findAll({
    where,
    include: [
      { model: Asset, as: 'asset' },
      { model: User,  as: 'employee', attributes: userAttrs },
      { model: User,  as: 'assignor', attributes: userAttrs },
    ],
    order: [['assignedAt', 'DESC']],
  });
};

const updateAssignment = (id, payload, transaction = null) =>
  AssetAssignment.update(payload, { where: { id }, transaction });

// ─── Damage Report ───────────────────────────────────────────────────────────

const createDamageReport = (payload, transaction = null) =>
  AssetDamageReport.create(payload, { transaction });

const findDamageReportById = (id) =>
  AssetDamageReport.findByPk(id, {
    include: [
      { model: Asset,           as: 'asset'       },
      { model: AssetAssignment, as: 'assignment'  },
      { model: User,            as: 'reporter',   attributes: userAttrs },
      { model: User,            as: 'reviewer',   attributes: userAttrs },
    ],
  });

const listDamageReports = ({ companyId, assetId, assignmentId, status, reportedBy } = {}) => {
  const where = {};
  if (companyId)    where.companyId    = companyId;
  if (assetId)      where.assetId      = assetId;
  if (assignmentId) where.assignmentId = assignmentId;
  if (status)       where.status       = status;
  if (reportedBy)   where.reportedBy   = reportedBy;
  return AssetDamageReport.findAll({
    where,
    include: [
      { model: Asset, as: 'asset' },
      { model: User,  as: 'reporter', attributes: userAttrs },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const updateDamageReport = (id, payload, transaction = null) =>
  AssetDamageReport.update(payload, { where: { id }, transaction });

module.exports = {
  // Asset
  createAsset, findAssetById, findAssetByCode, listAssets, updateAsset, deleteAsset,
  // Assignment
  createAssignment, findAssignmentById, findActiveAssignmentByAsset,
  listAssignmentsByEmployee, listAssignments, updateAssignment,
  // Damage Report
  createDamageReport, findDamageReportById, listDamageReports, updateDamageReport,
};
