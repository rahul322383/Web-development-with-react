// const auditRepository = require('./auditRepository');
// const { sendNotification } = require('../../config/socket');
// const { Op } = require('sequelize');
// const sequelize = require('../../database/sequelize');

// const getAuditLogs = async (query) => {
//   const limit = Math.min(Number(query.limit || 20), 100);
//   const page = Math.max(Number(query.page || 1), 1);
//   const offset = (page - 1) * limit;
  
//   const { rows, count } = await auditRepository.listAuditLogs({
//     limit,
//     offset,
//     moduleName: query.moduleName,
//     actionType: query.actionType,
//     userId: query.userId,
//     startDate: query.startDate,
//     endDate: query.endDate,
//     search: query.search
//   });

//   return {
//     success: true,
//     data: rows,
//     pagination: {
//       page,
//       limit,
//       total: count,
//       totalPages: Math.ceil(count / limit)
//     }
//   };
// };

// const getAuditLogById = async (id) => {
//   const log = await auditRepository.findAuditLogById(id);
  
//   if (!log) {
//     return {
//       success: false,
//       message: 'Audit log not found',
//       statusCode: 404
//     };
//   }

//   return {
//     success: true,
//     data: log
//   };
// };

// const getAuditStats = async (query) => {
//   const stats = await auditRepository.getAuditStatistics({
//     startDate: query.startDate,
//     endDate: query.endDate
//   });

//   return {
//     success: true,
//     data: stats
//   };
// };

// const getAuditLogsByUser = async (userId, query) => {
//   const limit = Math.min(Number(query.limit || 20), 100);
//   const page = Math.max(Number(query.page || 1), 1);
//   const offset = (page - 1) * limit;

//   const { rows, count } = await auditRepository.listAuditLogs({
//     limit,
//     offset,
//     userId,
//     moduleName: query.moduleName,
//     actionType: query.actionType,
//     startDate: query.startDate,
//     endDate: query.endDate
//   });

//   return {
//     success: true,
//     data: rows,
//     pagination: {
//       page,
//       limit,
//       total: count,
//       totalPages: Math.ceil(count / limit)
//     }
//   };
// };

// const getAuditLogsByModule = async (moduleName, query) => {
//   const limit = Math.min(Number(query.limit || 20), 100);
//   const page = Math.max(Number(query.page || 1), 1);
//   const offset = (page - 1) * limit;

//   const { rows, count } = await auditRepository.listAuditLogs({
//     limit,
//     offset,
//     moduleName,
//     actionType: query.actionType,
//     startDate: query.startDate,
//     endDate: query.endDate
//   });

//   return {
//     success: true,
//     data: rows,
//     pagination: {
//       page,
//       limit,
//       total: count,
//       totalPages: Math.ceil(count / limit)
//     }
//   };
// };

// const exportAuditLogs = async (query) => {
//   const logs = await auditRepository.getAllAuditLogs({
//     moduleName: query.moduleName,
//     actionType: query.actionType,
//     userId: query.userId,
//     startDate: query.startDate,
//     endDate: query.endDate
//   });

//   return {
//     success: true,
//     data: logs,
//     total: logs.length
//   };
// };

// const deleteOldAuditLogs = async (daysToKeep, actor, ipAddress) => {
//   const cutoffDate = new Date();
//   cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

//   const deletedCount = await auditRepository.deleteLogsOlderThan(cutoffDate);

//   if (actor) {
//     sendNotification(actor.id, {
//       type: "AUDIT_LOGS_CLEANED",
//       title: "Audit Logs Cleaned",
//       message: `${deletedCount} audit logs older than ${daysToKeep} days have been deleted.`,
//       deletedCount,
//       daysToKeep,
//       cutoffDate: cutoffDate.toISOString()
//     });
//   }

//   return {
//     success: true,
//     message: `${deletedCount} audit logs deleted successfully`,
//     deletedCount,
//     daysToKeep
//   };
// };

// module.exports = {
//   getAuditLogs,
//   getAuditLogById,
//   getAuditStats,
//   getAuditLogsByUser,
//   getAuditLogsByModule,
//   exportAuditLogs,
//   deleteOldAuditLogs
// };

const auditRepository = require('./auditRepository');
const { sendNotification } = require('../../config/socket');
const { Op } = require('sequelize');
const sequelize = require('../../database/sequelize');

const getAuditLogs = async (query) => {
  const limit = Math.min(Number(query.limit || 20), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;
  
  const { rows, count } = await auditRepository.listAuditLogs({
    limit,
    offset,
    moduleName: query.moduleName,
    actionType: query.actionType,
    userId: query.userId,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search
  });

  return {
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getAuditLogById = async (id) => {
  const log = await auditRepository.findAuditLogById(id);
  
  if (!log) {
    return {
      success: false,
      message: 'Audit log not found',
      statusCode: 404
    };
  }

  return {
    success: true,
    data: log
  };
};

const getAuditStats = async (query) => {
  const stats = await auditRepository.getAuditStatistics({
    startDate: query.startDate,
    endDate: query.endDate
  });

  return {
    success: true,
    data: stats
  };
};

const getAuditLogsByUser = async (userId, query) => {
  const limit = Math.min(Number(query.limit || 20), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;

  const { rows, count } = await auditRepository.listAuditLogs({
    limit,
    offset,
    userId,
    moduleName: query.moduleName,
    actionType: query.actionType,
    startDate: query.startDate,
    endDate: query.endDate
  });

  return {
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getAuditLogsByModule = async (moduleName, query) => {
  const limit = Math.min(Number(query.limit || 20), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;

  const { rows, count } = await auditRepository.listAuditLogs({
    limit,
    offset,
    moduleName,
    actionType: query.actionType,
    startDate: query.startDate,
    endDate: query.endDate
  });

  return {
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const exportAuditLogs = async (query) => {
  const logs = await auditRepository.getAllAuditLogs({
    moduleName: query.moduleName,
    actionType: query.actionType,
    userId: query.userId,
    startDate: query.startDate,
    endDate: query.endDate
  });

  return {
    success: true,
    data: logs,
    total: logs.length
  };
};

const deleteOldAuditLogs = async (daysToKeep, actor, ipAddress) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deletedCount = await auditRepository.deleteLogsOlderThan(cutoffDate);

  if (actor && actor.id) {
    sendNotification(actor.id, {
      type: "AUDIT_LOGS_CLEANED",
      title: "Audit Logs Cleaned",
      message: `${deletedCount} audit logs older than ${daysToKeep} days have been deleted.`,
      deletedCount,
      daysToKeep,
      cutoffDate: cutoffDate.toISOString()
    });
  }

  return {
    success: true,
    message: `${deletedCount} audit logs deleted successfully`,
    deletedCount,
    daysToKeep
  };
};

const createAuditLog = async (logData) => {
  const log = await auditRepository.createAuditLog(logData);
  
  // Broadcast real-time update
  if (sendNotification) {
    sendNotification('AUDIT_LOG_CREATED', {
      type: "NEW_AUDIT_LOG",
      data: log
    });
  }
  
  return log;
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  getAuditLogsByUser,
  getAuditLogsByModule,
  exportAuditLogs,
  deleteOldAuditLogs,
  createAuditLog
};