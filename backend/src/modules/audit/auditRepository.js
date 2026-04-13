const { AuditLog, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const sequelize = require('../../database/sequelize');

const listAuditLogs = async ({ limit, offset, moduleName, actionType, userId, startDate, endDate, search }) => {
  const where = {};
  
  if (moduleName) where.moduleName = moduleName;
  if (actionType) where.actionType = actionType;
  if (userId) where.userId = userId;
  
  if (startDate && endDate) {
    where.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    where.timestamp = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    where.timestamp = {
      [Op.lte]: new Date(endDate)
    };
  }

  if (search) {
    where[Op.or] = [
      { moduleName: { [Op.like]: `%${search}%` } },
      { actionType: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  return AuditLog.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode']
      }
    ],
    order: [['timestamp', 'DESC']],
    distinct: true
  });
};

const findAuditLogById = async (id) => {
  return AuditLog.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode']
      }
    ]
  });
};

const getAuditStatistics = async ({ startDate, endDate }) => {
  const where = {};
  
  if (startDate && endDate) {
    where.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    where.timestamp = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    where.timestamp = {
      [Op.lte]: new Date(endDate)
    };
  }

  const totalLogs = await AuditLog.count({ where });
  
  const moduleStats = await AuditLog.findAll({
    attributes: [
      'moduleName',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where,
    group: ['moduleName'],
    raw: true
  });

  const actionStats = await AuditLog.findAll({
    attributes: [
      'actionType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where,
    group: ['actionType'],
    raw: true
  });

  const dailyStats = await AuditLog.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where,
    group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
    order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'DESC']],
    limit: 30,
    raw: true
  });

  return {
    totalLogs,
    moduleStats,
    actionStats,
    dailyStats
  };
};

const getAllAuditLogs = async ({ moduleName, actionType, userId, startDate, endDate }) => {
  const where = {};
  
  if (moduleName) where.moduleName = moduleName;
  if (actionType) where.actionType = actionType;
  if (userId) where.userId = userId;
  
  if (startDate && endDate) {
    where.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    where.timestamp = {
      [Op.gte]: new Date(startDate)
    };
  } else if (endDate) {
    where.timestamp = {
      [Op.lte]: new Date(endDate)
    };
  }

  return AuditLog.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeCode']
      }
    ],
    order: [['timestamp', 'DESC']]
  });
};

const deleteLogsOlderThan = async (cutoffDate) => {
  return AuditLog.destroy({
    where: {
      timestamp: {
        [Op.lt]: cutoffDate
      }
    }
  });
};

const createAuditLog = async (logData) => {
  return AuditLog.create(logData);
};

module.exports = {
  listAuditLogs,
  findAuditLogById,
  getAuditStatistics,
  getAllAuditLogs,
  deleteLogsOlderThan,
  createAuditLog
};