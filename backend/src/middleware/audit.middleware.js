const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const createAuditLog = async (userId, moduleName, actionType, entityId, oldData = null, newData = null, req = null) => {
  try {
    const auditData = {
      userId,
      moduleName,
      actionType,
      entityId,
      oldData,
      newData,
    };

    if (req) {
      auditData.ipAddress = req.ip || req.connection.remoteAddress;
      auditData.userAgent = req.get('user-agent');
    }

    await AuditLog.create(auditData);
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

module.exports = { createAuditLog };
