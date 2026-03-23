const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('./auditService');

const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  res.status(200).json(result);
});

module.exports = {
  listAuditLogs
};