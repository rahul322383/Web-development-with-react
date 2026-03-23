// const app = require('./app');
// const env = require('./src/config/env');
// const logger = require('./src/config/logger');
// const sequelize = require('./src/database/sequelize');
// require('./src/database/initModels');
// const registerScheduledJobs = require('./src/jobs/registerJobs');

// const bootstrap = async () => {
//   try {
//     await sequelize.authenticate();
//     logger.info('MySQL connected successfully');

//     if (env.NODE_ENV !== 'production') {
//       await sequelize.sync();
//     }

//     registerScheduledJobs();

//     app.listen(env.PORT, '0.0.0.0', () => {
//       logger.info(`Server running on port ${env.PORT}`);
//     });
//   } catch (error) {
//     logger.error({ error }, 'Failed to start server');
//     process.exit(1);
//   }
// };

// bootstrap();

const app = require('./app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const sequelize = require('./src/database/sequelize');
require('./src/database/initModels');
const registerScheduledJobs = require('./src/jobs/registerJobs');

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

    server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

  } catch (error) {
    logger.error({ error }, 'Server startup failed');
    process.exit(1);
  }
};

/* graceful shutdown */
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

/* handle crashes */
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