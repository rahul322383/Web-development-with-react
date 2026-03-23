const { AuditLog } = require('../database/initModels');

const logAuditEvent = async ({ userId, moduleName, actionType, oldData, newData, ipAddress }) => {
  await AuditLog.create({
    userId,
    moduleName,
    actionType,
    oldData,
    newData,
    ipAddress,
    timestamp: new Date()
  });
};

module.exports = {
  logAuditEvent
};