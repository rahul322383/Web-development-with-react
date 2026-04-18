'use strict';

const { Transform, pipeline } = require('stream');
const { promisify } = require('util');

const auditRepository = require('./auditRepository');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { assertPermission } = require('../../utils/Permissions');
const {
  auditListSchema,
  auditByUserSchema,
  auditByModuleSchema,
  auditExportSchema,
  auditStatsSchema,
  deleteLogsSchema,
  auditCreateSchema,
  validate,
} = require('./auditValidators');



const registerAuditListeners = () => {
  eventBus.on('AUDIT_LOG_CREATED', (log) => {
    try {
      if (log?.userId) {
        sendNotification(log.userId, { type: 'NEW_AUDIT_LOG', data: log });
      }
    } catch (err) {
      logger.error({ event: 'AUDIT_LOG_CREATED_NOTIFY_FAILED', error: err.message });
    }
  });

  eventBus.on('AUDIT_LOGS_DELETED', ({ deletedCount, daysToKeep, cutoffDate, actorId }) => {
    try {
      if (actorId) {
        sendNotification(actorId, {
          type: 'AUDIT_LOGS_CLEANED',
          title: 'Audit Logs Cleaned',
          message: `${deletedCount} audit logs older than ${daysToKeep} days have been deleted.`,
          deletedCount,
          daysToKeep,
          cutoffDate,
        });
      }
    } catch (err) {
      logger.error({ event: 'AUDIT_LOGS_DELETED_NOTIFY_FAILED', error: err.message });
    }
  });
};



const pipelineAsync = promisify(pipeline);

const EventEmitter = require('events');

const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);



const buildPagination = (query) => {
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
};

const buildFilters = (query) => ({
  moduleName: query.moduleName,
  actionType: query.actionType,
  userId: query.userId,
  startDate: query.startDate,
  endDate: query.endDate,
  search: query.search,
});

const buildPaginatedResponse = (rows, count, page, limit) => ({
  success: true,
  data: rows,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  },
});

const handleServiceError = (event, error, extra = {}) => {
  logger.error({ event, ...extra, error: error.message, stack: error.stack });

  if (error.name === 'AppError') throw error;

  throw new AppError(
    error.message || 'Internal Server Error',
    error.statusCode || 500,
    { cause: error },
  );
};

const getAuditLogs = async (query, actor) => {
  try {
    assertPermission(actor, 'VIEW_AUDIT_LOGS');
    const validated = validate(auditListSchema, query);
    const { limit, page, offset } = buildPagination(validated);
    const { rows, count } = await auditRepository.listAuditLogs({
      limit, offset, ...buildFilters(validated),
    });
    return buildPaginatedResponse(rows, count, page, limit);
  } catch (error) {
    handleServiceError('GET_AUDIT_LOGS_FAILED', error);
  }
};

const getAuditLogById = async (id, actor) => {
  try {
    assertPermission(actor, 'VIEW_AUDIT_LOGS');

    if (!id || !Number.isInteger(Number(id)) || Number(id) < 1) {
      throw new AppError('Invalid audit log ID', 400);
    }

    const log = await auditRepository.findAuditLogById(id);
    if (!log) throw new AppError('Audit log not found', 404);

    return { success: true, data: log };
  } catch (error) {
    handleServiceError('GET_AUDIT_LOG_BY_ID_FAILED', error, { id });
  }
};

const getAuditStats = async (query, actor) => {
  try {
    assertPermission(actor, 'VIEW_AUDIT_STATS');
    const validated = validate(auditStatsSchema, query);
    const stats = await auditRepository.getAuditStatistics(validated);
    return { success: true, data: stats };
  } catch (error) {
    handleServiceError('GET_AUDIT_STATS_FAILED', error);
  }
};

const getAuditLogsByUser = async (userId, query, actor) => {
  try {
    assertPermission(actor, 'VIEW_USER_AUDIT');

    if (!userId || !Number.isInteger(Number(userId)) || Number(userId) < 1) {
      throw new AppError('Invalid userId', 400);
    }

    const validated = validate(auditByUserSchema, query);
    const { limit, page, offset } = buildPagination(validated);

    const filters = buildFilters(validated);
    filters.userId = Number(userId);

    const { rows, count } = await auditRepository.listAuditLogs({ limit, offset, ...filters });
    return buildPaginatedResponse(rows, count, page, limit);
  } catch (error) {
    handleServiceError('GET_AUDIT_LOGS_BY_USER_FAILED', error, { userId });
  }
};

const getAuditLogsByModule = async (moduleName, query, actor) => {
  try {
    assertPermission(actor, 'VIEW_MODULE_AUDIT');

    if (!moduleName || typeof moduleName !== 'string' || !moduleName.trim()) {
      throw new AppError('Invalid moduleName', 400);
    }

    const validated = validate(auditByModuleSchema, query);
    const { limit, page, offset } = buildPagination(validated);

    const filters = buildFilters(validated);
    filters.moduleName = moduleName.trim();

    const { rows, count } = await auditRepository.listAuditLogs({ limit, offset, ...filters });
    return buildPaginatedResponse(rows, count, page, limit);
  } catch (error) {
    handleServiceError('GET_AUDIT_LOGS_BY_MODULE_FAILED', error, { moduleName });
  }
};

/**
 * Streams audit logs as newline-delimited JSON into the HTTP response.
 *
 * Controller usage:
 *   res.setHeader('Content-Type', 'application/x-ndjson');
 *   await auditService.exportAuditLogs(query, actor, res);
 */
const exportAuditLogs = async (query, actor, responseStream) => {
  try {
    assertPermission(actor, 'EXPORT_AUDIT_LOGS');
    const validated = validate(auditExportSchema, query);

    responseStream.on('error', (err) => {
      logger.error({ event: 'EXPORT_RESPONSE_STREAM_ERROR', error: err.message });
    });

    const dbStream = await auditRepository.streamAuditLogs(buildFilters(validated));

    const ndJsonTransform = new Transform({
      objectMode: true,
      transform(row, _enc, cb) {
        cb(null, JSON.stringify(row) + '\n');
      },
    });

    await pipelineAsync(dbStream, ndJsonTransform, responseStream);

    logger.info({ event: 'AUDIT_LOGS_EXPORTED', actorId: actor.id, filters: validated });

  } catch (error) {
    handleServiceError('EXPORT_AUDIT_LOGS_FAILED', error);
  }
};

const deleteOldAuditLogs = async (params, actor, ipAddress) => {
  try {
    assertPermission(actor, 'DELETE_AUDIT_LOGS');

    const { daysToKeep } = validate(deleteLogsSchema, params);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await auditRepository.deleteLogsOlderThan(cutoffDate);

    logger.info({
      event: 'AUDIT_LOGS_DELETED',
      deletedCount,
      daysToKeep,
      cutoffDate: cutoffDate.toISOString(),
      actorId: actor.id,
      ipAddress: ipAddress ?? null,
    });

    eventBus.emit('AUDIT_LOGS_DELETED', {
      deletedCount,
      daysToKeep,
      cutoffDate: cutoffDate.toISOString(),
      actorId: actor.id,
    });

    return {
      success: true,
      message: `${deletedCount} audit logs deleted successfully`,
      deletedCount,
      daysToKeep,
    };
  } catch (error) {
    handleServiceError('DELETE_AUDIT_LOGS_FAILED', error, { daysToKeep: params?.daysToKeep });
  }
};

const createAuditLog = async (logData, actor) => {
  try {
    assertPermission(actor, 'CREATE_AUDIT_LOG');
    const validated = validate(auditCreateSchema, logData);
    const log = await auditRepository.createAuditLog(validated);
    eventBus.emit('AUDIT_LOG_CREATED', log);
    return { success: true, data: log };
  } catch (error) {
    handleServiceError('CREATE_AUDIT_LOG_FAILED', error);
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
  createAuditLog,
};