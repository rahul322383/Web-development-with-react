'use strict';

const { AuditLog, User } = require('../../database/initModels');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const userInclude = {
  model: User,
  as: 'user',
  attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode'],
};

const buildDateWhere = ({ startDate, endDate }) => {
  if (startDate && endDate) return { [Op.between]: [new Date(startDate), new Date(endDate)] };
  if (startDate) return { [Op.gte]: new Date(startDate) };
  if (endDate) return { [Op.lte]: new Date(endDate) };
  return null;
};

const buildWhere = ({ moduleName, actionType, userId, startDate, endDate, search }) => {
  const where = {};
  if (moduleName) where.moduleName = moduleName;
  if (actionType) where.actionType = actionType;
  if (userId) where.userId = userId;

  const dateRange = buildDateWhere({ startDate, endDate });
  if (dateRange) where.timestamp = dateRange;

  if (search) {
    where[Op.or] = [
      { moduleName: { [Op.like]: `%${search}%` } },
      { actionType: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
};

const listAuditLogs = ({ limit, offset, ...filters }) =>
  AuditLog.findAndCountAll({
    where: buildWhere(filters),
    limit,
    offset,
    include: [userInclude],
    order: [['timestamp', 'DESC']],
    distinct: true,
  });

const findAuditLogById = (id) =>
  AuditLog.findByPk(id, { include: [userInclude] });

const getAuditStatistics = async ({ startDate, endDate }) => {
  const where = {};
  const dateRange = buildDateWhere({ startDate, endDate });
  if (dateRange) where.timestamp = dateRange;

  const [totalLogs, moduleStats, actionStats, dailyStats] = await Promise.all([
    AuditLog.count({ where }),
    AuditLog.findAll({
      attributes: ['moduleName', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where, group: ['moduleName'], raw: true,
    }),
    AuditLog.findAll({
      attributes: ['actionType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where, group: ['actionType'], raw: true,
    }),
    AuditLog.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'DESC']],
      limit: 30,
      raw: true,
    }),
  ]);

  return { totalLogs, moduleStats, actionStats, dailyStats };
};

const getAllAuditLogs = (filters) =>
  AuditLog.findAll({
    where: buildWhere(filters),
    include: [userInclude],
    order: [['timestamp', 'DESC']],
  });

// FIX: streamAuditLogs was called in the service but missing from the repository
const streamAuditLogs = (filters) => {
  const where = buildWhere(filters);
  return AuditLog.findAll({
    where,
    include: [userInclude],
    order: [['timestamp', 'DESC']],
    raw: true,
    nest: true,
    stream: true,
  });
};

const deleteLogsOlderThan = (cutoffDate) =>
  AuditLog.destroy({ where: { timestamp: { [Op.lt]: cutoffDate } } });

const createAuditLog = (logData) =>
  AuditLog.create(logData);

module.exports = {
  listAuditLogs,
  findAuditLogById,
  getAuditStatistics,
  getAllAuditLogs,
  streamAuditLogs,
  deleteLogsOlderThan,
  createAuditLog,
};