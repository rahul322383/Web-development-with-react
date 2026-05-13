
'use strict';

const app = require('./app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const sequelize = require('./src/database/sequelize');
require('./src/database/initModels');
require('./src/modules/notification/notificationListener');

const http = require('http');
const { initSocket } = require('./src/config/socket');

let server;

const startServer = async () => {
  try {
    // ======================
    // 🔥 DB CONNECTION
    // ======================
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');

    // ======================
    // 🔥 DB SYNC (SAFE)
    // ======================
    if (env.NODE_ENV === 'development') {
      await sequelize.sync();
      logger.info('Database verified (no destructive changes)');
    }

    // ======================
    // 🔥 START CRON (FIXED)
    // ======================
    require('./src/modules/automation/cron'); // ✅ moved here
    logger.info('Cron jobs initialized');

    // ======================
    // 🔥 CREATE HTTP SERVER
    // ======================
    const httpServer = http.createServer(app);

    // ======================
    // 🔥 SOCKET INIT
    // ======================
    initSocket(httpServer);

    // ======================
    // 🔥 START LISTENING
    // ======================
    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server + Socket running on port ${env.PORT}`);
    });

    server.on('error', (err) => {
      logger.error('SERVER ERROR:', err);
      process.exit(1);
    });

  } catch (error) {
    logger.error('STARTUP ERROR:', error);
    process.exit(1);
  }
};

// ======================
// 🔻 GRACEFUL SHUTDOWN
// ======================
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down...`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }

    await sequelize.close();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (err) {
    logger.error('SHUTDOWN ERROR:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err.message);
  shutdown('UNCAUGHT_EXCEPTION');
});

startServer();