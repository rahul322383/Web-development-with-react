const auditService = require('./auditService');

const getAuditLogs = async (req, res) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const result = await auditService.getAuditLogById(req.params.id);
    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log',
      error: error.message
    });
  }
};

const getAuditStats = async (req, res) => {
  try {
    const result = await auditService.getAuditStats(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics',
      error: error.message
    });
  }
};

const getAuditLogsByUser = async (req, res) => {
  try {
    const result = await auditService.getAuditLogsByUser(req.params.userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user audit logs',
      error: error.message
    });
  }
};

const getAuditLogsByModule = async (req, res) => {
  try {
    const result = await auditService.getAuditLogsByModule(req.params.moduleName, req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching module audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module audit logs',
      error: error.message
    });
  }
};

const exportAuditLogs = async (req, res) => {
  try {
    const result = await auditService.exportAuditLogs(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs',
      error: error.message
    });
  }
};

const deleteOldAuditLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;
    const result = await auditService.deleteOldAuditLogs(daysToKeep, req.user, req.ip);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting old audit logs',
      error: error.message
    });
  }
};

const createAuditLog = async (req, res) => {
  try {
    const log = await auditService.createAuditLog(req.body);
    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating audit log',
      error: error.message
    });
  }
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