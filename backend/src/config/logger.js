'use strict';

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, errors, json, colorize, printf } = format;

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');
const SERVICE_NAME = process.env.SERVICE_NAME || 'hrms-backend';

// ─────────────────────────────────────────────────────────────────────────────
// FORMATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Readable dev format:
 *   2025-05-15 14:32:01  info: User logged in { "userId": 42 }
 *
 * FIX — was defined but never used (duplicate anonymous printf was used instead)
 */
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length
    ? '\n' + JSON.stringify(meta, null, 2)
    : '';
  return `${timestamp}  ${level}: ${stack || message}${metaStr}`;
});

/**
 * Dev transport format — colorized + human timestamp + devFormat.
 * FIX — was a ternary inside combine() which is unreliable across Winston versions.
 * Now defined as a standalone constant and referenced by the transport directly.
 */
const devConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  devFormat
);

/**
 * Production / file format — structured JSON with full timestamp.
 * errors({ stack: true }) here ensures stack traces appear in JSON output.
 * FIX — removed duplicate stack field: logger.errorLog was adding meta.stack
 * manually while errors({ stack: true }) already injects it.
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DAILY-ROTATE OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const rotateDefaults = {
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  zippedArchive: true,    // compress rotated files
  auditFile: 'logs/.audit-meta.json',
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Console transport.
 * FIX — format is now split by environment so the ternary
 * no longer lives inside combine().
 */
const consoleTransport = new transports.Console({
  format: isDev ? devConsoleFormat : prodFormat,
});

/** Error-only rotating file — extended to 30d (was 14d, too short for audits) */
const errorFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/error-%DATE%.log',
  level: 'error',
  maxFiles: '30d',
});

/** All levels combined */
const combinedFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/combined-%DATE%.log',
  maxFiles: '30d',
});

/**
 * Audit-only transport.
 * FIX — uses a custom format filter so ONLY entries with meta.type === 'AUDIT'
 * land here, instead of every info-level message polluting the audit log.
 */
const auditOnlyFilter = format((info) =>
  info.type === 'AUDIT' ? info : false
)();

const auditFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/audit-%DATE%.log',
  level: 'info',
  maxFiles: '365d',   // extended: audit logs often have compliance requirements
  format: combine(auditOnlyFilter, timestamp(), json()),
});

/**
 * Auth-only transport — isolates login/logout/token events.
 */
const authOnlyFilter = format((info) =>
  info.type === 'AUTH' ? info : false
)();

const authFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/auth-%DATE%.log',
  level: 'info',
  maxFiles: '90d',
  format: combine(authOnlyFilter, timestamp(), json()),
});

/**
 * Security-only transport — isolates suspicious/blocked events.
 */
const securityOnlyFilter = format((info) =>
  info.type === 'SECURITY' ? info : false
)();

const securityFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/security-%DATE%.log',
  level: 'warn',
  maxFiles: '180d',
  format: combine(securityOnlyFilter, timestamp(), json()),
});

/**
 * Exception/rejection handlers.
 * FIX — added Console transport so crashes are visible in dev.
 * Previously only file was listed, making uncaught errors completely
 * invisible during local development.
 */
const exceptionFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/exceptions-%DATE%.log',
  maxFiles: '30d',
});

const rejectionFileTransport = new DailyRotateFile({
  ...rotateDefaults,
  filename: 'logs/rejections-%DATE%.log',
  maxFiles: '30d',
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────────────────────────────────────

const logger = createLogger({
  level: LOG_LEVEL,

  defaultMeta: {
    service: SERVICE_NAME,
    env: process.env.NODE_ENV || 'development',
    pid: process.pid,
  },

  /**
   * Base format applied to every transport.
   * FIX — no longer contains the isDev ternary; each transport
   * now owns its own format so there is zero ambiguity.
   */
  format: combine(
    errors({ stack: true }),
    timestamp()
  ),

  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport,
    auditFileTransport,
    authFileTransport,
    securityFileTransport,
  ],

  // FIX — Console added so crashes surface in terminal during dev
  exceptionHandlers: [
    new transports.Console({ format: devConsoleFormat }),
    exceptionFileTransport,
  ],

  rejectionHandlers: [
    new transports.Console({ format: devConsoleFormat }),
    rejectionFileTransport,
  ],

  // Keep false — let process managers (PM2, Docker) decide on exit behaviour
  exitOnError: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPED HELPER METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AUTH — login, logout, token refresh, password change events.
 * Routed to auth-%DATE%.log via the authOnlyFilter transport.
 *
 * @param {string} message
 * @param {object} meta  — e.g. { userId, ip, method }
 */
logger.auth = (message, meta = {}) =>
  logger.info(message, { type: 'AUTH', ...meta });

/**
 * SECURITY — rate-limit hits, blocked IPs, permission violations,
 * suspicious payloads.
 * Routed to security-%DATE%.log via the securityOnlyFilter transport.
 *
 * @param {string} message
 * @param {object} meta  — e.g. { ip, userId, endpoint, reason }
 */
logger.security = (message, meta = {}) =>
  logger.warn(message, { type: 'SECURITY', ...meta });

/**
 * DATABASE — query timing, connection pool events.
 * Debug level — only emitted when LOG_LEVEL=debug.
 *
 * @param {string} message
 * @param {object} meta  — e.g. { query, duration, rows }
 */
logger.db = (message, meta = {}) =>
  logger.debug(message, { type: 'DATABASE', ...meta });

/**
 * API — inbound HTTP request summary.
 * Use in an Express middleware rather than per-handler.
 *
 * @param {string} message
 * @param {object} meta  — e.g. { method, url, statusCode, ms, userId }
 */
logger.api = (message, meta = {}) =>
  logger.info(message, { type: 'API', ...meta });

/**
 * AUDIT — immutable business-event record (leave applied, payroll run, etc.).
 * Routed exclusively to audit-%DATE%.log via the auditOnlyFilter transport.
 *
 * @param {string} message
 * @param {object} meta  — e.g. { userId, action, entityId, before, after }
 */
logger.audit = (message, meta = {}) =>
  logger.info(message, { type: 'AUDIT', ...meta });

/**
 * ERROR — structured error logging.
 * FIX — no longer manually copies error.stack into meta (causes duplicate
 * stack field in JSON). errors({ stack: true }) in the format chain
 * already handles stack extraction correctly.
 *
 * @param {string}    message
 * @param {Error|null} error
 * @param {object}    meta   — e.g. { userId, requestId, endpoint }
 */
logger.errorLog = (message, error, meta = {}) => {
  if (error instanceof Error) {
    // Pass the Error object directly — Winston's errors() format extracts
    // message + stack automatically without manual copying
    logger.error(error, { userMessage: message, ...meta });
  } else {
    logger.error(message, { ...meta, rawError: error });
  }
};

/**
 * HTTP — Express/Morgan-compatible request logger helper.
 * Wire up as middleware:
 *   app.use((req, res, next) => { res.on('finish', () => logger.http(req, res)); next(); });
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
logger.http = (req, res) => {
  const ms = res.locals.startTime
    ? Date.now() - res.locals.startTime
    : undefined;

  const level = res.statusCode >= 500 ? 'error'
    : res.statusCode >= 400 ? 'warn'
      : 'info';

  logger[level](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
    type: 'HTTP',
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    ms,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.headers['user-agent'],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

module.exports = logger;