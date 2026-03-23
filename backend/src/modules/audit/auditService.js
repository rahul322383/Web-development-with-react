const auditRepository = require('./auditRepository');

const getAuditLogs = async (query) => {
  const limit = Math.min(Number(query.limit || 20), 100);
  const page = Math.max(Number(query.page || 1), 1);
  const offset = (page - 1) * limit;
  const { rows, count } = await auditRepository.listAuditLogs({
    limit,
    offset,
    moduleName: query.moduleName,
    actionType: query.actionType
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

module.exports = {
  getAuditLogs
};