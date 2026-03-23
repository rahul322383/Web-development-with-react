const { AuditLog } = require('../../database/initModels');

const listAuditLogs = async ({ limit, offset, moduleName, actionType }) => {
  const where = {};
  if (moduleName) where.moduleName = moduleName;
  if (actionType) where.actionType = actionType;

  return AuditLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['timestamp', 'DESC']]
  });
};

module.exports = {
  listAuditLogs
};