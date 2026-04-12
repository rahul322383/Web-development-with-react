const app = require('./app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const sequelize = require('./src/database/sequelize');
require('./src/database/initModels');
const registerScheduledJobs = require('./src/jobs/registerJobs');

const http = require('http'); // ✅ IMPORTANT
const { initSocket } = require('./src/config/socket');

let server;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');

    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database synchronized');
    }

    registerScheduledJobs();

    /* =========================
       CREATE HTTP SERVER
    ========================= */
    const httpServer = http.createServer(app);

    /* =========================
       INIT SOCKET.IO
    ========================= */
    initSocket(httpServer);

    /* =========================
       START SERVER
    ========================= */
    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server + Socket running on port ${env.PORT}`);
    });

  } catch (error) {
    logger.error({ error }, 'Server startup failed');
    process.exit(1);
  }
};

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const shutdown = async (signal) => {
  logger.info(`${signal} received. Closing server...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await sequelize.close();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });
  }
};

/* =========================
   ERROR HANDLING
========================= */
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});

startServer();