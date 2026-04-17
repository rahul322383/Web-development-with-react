// // // const app = require('./app');
// // // const env = require('./src/config/env');
// // // const logger = require('./src/config/logger');
// // // const sequelize = require('./src/database/sequelize');
// // // require('./src/database/initModels');
// // // const registerScheduledJobs = require('./src/jobs/registerJobs');

// // // const http = require('http'); 
// // // const { initSocket } = require('./src/config/socket');

// // // let server;

// // // const startServer = async () => {
// // //   try {
// // //     await sequelize.authenticate();
// // //     logger.info('MySQL connected successfully');

// // //     if (env.NODE_ENV === 'development') {
// // //       await sequelize.sync({ alter: false });
// // //       logger.info('Database synchronized');
// // //     }

// // //     registerScheduledJobs();

// // //     /* =========================
// // //        CREATE HTTP SERVER
// // //     ========================= */
// // //     const httpServer = http.createServer(app);

// // //     /* =========================
// // //        INIT SOCKET.IO
// // //     ========================= */
// // //     initSocket(httpServer);

// // //     /* =========================
// // //        START SERVER
// // //     ========================= */
// // //     server = httpServer.listen(env.PORT, '0.0.0.0', () => {
// // //       logger.info(`🚀 Server + Socket running on port ${env.PORT}`);
// // //     });

// // //   } catch (error) {
// // //     logger.error({ error }, 'Server startup failed');
// // //     process.exit(1);
// // //   }
// // // };

// // // /* =========================
// // //    GRACEFUL SHUTDOWN
// // // ========================= */
// // // const shutdown = async (signal) => {
// // //   logger.info(`${signal} received. Closing server...`);

// // //   if (server) {
// // //     server.close(async () => {
// // //       logger.info('HTTP server closed');

// // //       try {
// // //         await sequelize.close();
// // //         logger.info('Database connection closed');
// // //         process.exit(0);
// // //       } catch (err) {
// // //         logger.error({ err }, 'Error during shutdown');
// // //         process.exit(1);
// // //       }
// // //     });
// // //   }
// // // };

// // // /* =========================
// // //    ERROR HANDLING
// // // ========================= */
// // // process.on('SIGINT', shutdown);
// // // process.on('SIGTERM', shutdown);

// // // process.on('unhandledRejection', (reason) => {
// // //   logger.error({ reason }, 'Unhandled Promise Rejection');
// // // });

// // // process.on('uncaughtException', (err) => {
// // //   logger.error({ err }, 'Uncaught Exception');
// // //   process.exit(1);
// // // });

// // // startServer();


// // const app = require('./app');
// // const env = require('./src/config/env');
// // const logger = require('./src/config/logger');
// // const sequelize = require('./src/database/sequelize');
// // require('./src/database/initModels');

// // const http = require('http');
// // const { initSocket } = require('./src/config/socket');

// // let server;

// // const startServer = async () => {
// //   try {
// //     await sequelize.authenticate();
// //     logger.info('MySQL connected successfully');

// //     if (env.NODE_ENV === 'development') {
// //       await sequelize.sync({ alter: false });
// //       logger.info('Database synchronized');
// //     }

// //     const httpServer = http.createServer(app);

// //     initSocket(httpServer);

// //     server = httpServer.listen(env.PORT, '0.0.0.0', () => {
// //       logger.info(`Server + Socket running on port ${env.PORT}`);
// //     });

// //   } catch (error) {
// //     logger.error(error.stack || error.message);
// //     process.exit(1);
// //   }
// // };

// // const shutdown = async (signal) => {
// //   logger.info(`${signal} received. Closing server...`);

// //   if (server) {
// //     server.close(async () => {
// //       logger.info('HTTP server closed');

// //       try {
// //         await sequelize.close();
// //         logger.info('Database connection closed');
// //         process.exit(0);
// //       } catch (err) {
// //         logger.error(err.stack || err.message);
// //         process.exit(1);
// //       }
// //     });
// //   }
// // };

// // process.on('SIGINT', shutdown);
// // process.on('SIGTERM', shutdown);

// // process.on('unhandledRejection', (reason) => {
// //   console.error('UNHANDLED REJECTION 👉', reason);
// // });

// // process.on('uncaughtException', (err) => {
// //   console.error('UNCAUGHT EXCEPTION 👉', err);
// //   process.exit(1);
// // });

// // startServer();

// const app = require('./app');
// const env = require('./src/config/env');
// const logger = require('./src/config/logger');
// const sequelize = require('./src/database/sequelize');
// require('./src/database/initModels');

// const http = require('http');
// const { initSocket } = require('./src/config/socket');

// let server;

// const startServer = async () => {
//   try {
//     // 🔥 CONNECT DB
//     await sequelize.authenticate();
//     logger.info('MySQL connected successfully');

//     // 🔥 SYNC DB (SAFE)
//     try {
//       if (env.NODE_ENV === 'development') {
//         await sequelize.sync({ alter: true }); 
//         logger.info('Database synchronized');
//       }
//     } catch (syncError) {
//       logger.error('DB SYNC ERROR:', syncError);
//       process.exit(1);
//     }

//     // 🔥 CREATE SERVER
//     const httpServer = http.createServer(app);

//     // 🔥 SOCKET INIT
//     initSocket(httpServer);

//     // 🔥 START SERVER
//     server = httpServer.listen(env.PORT, '0.0.0.0', () => {
//       logger.info(`Server + Socket running on port ${env.PORT}`);
//     });

//   } catch (error) {
//     logger.error('STARTUP ERROR:', error.stack || error.message);
//     process.exit(1);
//   }
// };



// // ======================
// // 🔻 GRACEFUL SHUTDOWN
// // ======================
// const shutdown = async (signal) => {
//   logger.info(`${signal} received. Closing server...`);

//   try {
//     if (server) {
//       await new Promise((resolve) => server.close(resolve));
//       logger.info('HTTP server closed');
//     }

//     await sequelize.close();
//     logger.info('Database connection closed');

//     process.exit(0);

//   } catch (err) {
//     logger.error('SHUTDOWN ERROR:', err.stack || err.message);
//     process.exit(1);
//   }
// };

// process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);



// // ======================
// // 🔻 GLOBAL ERROR HANDLING
// // ======================
// process.on('unhandledRejection', (reason) => {
//   logger.error('UNHANDLED REJECTION:', reason);
// });

// process.on('uncaughtException', (err) => {
//   logger.error('UNCAUGHT EXCEPTION:', err);
//   process.exit(1);
// });



// // 🔥 START APP
// startServer();


const app = require('./app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const sequelize = require('./src/database/sequelize');
require('./src/database/initModels');

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
    // 🔥 DB SYNC (DEV ONLY)
    // ======================
    if (env.NODE_ENV === 'development') {
      try {
        await sequelize.sync({ alter: true });
        logger.info('Database synchronized');
      } catch (err) {
        logger.error('DB SYNC ERROR:', err);
        process.exit(1);
      }
    }

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

    // 🔥 HANDLE SERVER ERRORS
    server.on('error', (err) => {
      logger.error('SERVER ERROR:', err.message);
      process.exit(1);
    });

  } catch (error) {
    logger.error('STARTUP ERROR:', error.message);
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



// ======================
// 🔻 GLOBAL ERROR HANDLING
// ======================
process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});



// ======================
// 🔥 START SERVER
// ======================
startServer();