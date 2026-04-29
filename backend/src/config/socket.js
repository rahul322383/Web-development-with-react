// 'use strict';



// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const logger = require('./logger');

// let io;

// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: process.env.FRONTEND_URL,
//       credentials: true,
//     },
//   });

//   // JWT auth middleware for every socket connection
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error('Authentication token missing'));

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//       socket.user = decoded;
//       next();
//     } catch {
//       return next(new Error('Invalid or expired token'));
//     }
//   });

//   io.on('connection', (socket) => {
//     const userId = socket.user?.sub;
//     const deviceId = socket.handshake.headers['x-device-id'] || socket.id;

//     if (!userId) {
//       socket.emit('ERROR', { success: false, message: 'User not found in token' });
//       return socket.disconnect();
//     }

//     // ✅ FIX: consistent room name `user:${userId}` everywhere
//     socket.join(`user:${userId}`);
//     socket.join(`user:${userId}:${deviceId}`);

//     if ((socket.user.role || '').toUpperCase() === 'ADMIN') {
//       socket.join('admins');
//     }

//     socket.emit('CONNECTED', { success: true, userId, socketId: socket.id });

//     socket.on('disconnect', () => {
//       logger.debug({ event: 'SOCKET_DISCONNECTED', userId, socketId: socket.id });
//     });
//   });

//   logger.info('Socket.IO initialised');
// };


// const sendNotification = (userId, payload) => {
//   if (!io) return;
//   io.to(`user:${userId}`).emit('NOTIFICATION', {
//     success: true,
//     ...payload,
//     timestamp: new Date().toISOString(),
//   });
// };

// const sendAuditLog = (log) => {
//   if (!io) return;
//   io.to('admins').emit('AUDIT_LOG_CREATED', {
//     success: true,
//     ...log,
//     timestamp: new Date().toISOString(),
//   });
// };

// const broadcast = (event, payload) => {
//   if (!io) return;
//   io.emit(event, { success: true, ...payload });
// };

// const sendBulkNotifications = (userIds, payload) => {
//   userIds.forEach(id => sendNotification(id, payload));
// };

// module.exports = { initSocket, sendNotification, sendBulkNotifications, sendAuditLog, broadcast };

'use strict';

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io;

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // JWT auth middleware — runs before every connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token missing'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.sub;
    const deviceId = socket.handshake.headers['x-device-id'] || socket.id;

    if (!userId) {
      socket.emit('ERROR', { success: false, message: 'User not found in token' });
      return socket.disconnect();
    }

    // Each user has a room — sendNotification targets this
    socket.join(`user:${userId}`);
    // Per-device room — useful for targeted device-level pushes
    socket.join(`user:${userId}:${deviceId}`);

    // Admins get their own broadcast room
    if ((socket.user.role || '').toUpperCase() === 'ADMIN') {
      socket.join('admins');
    }

    socket.emit('CONNECTED', { success: true, userId, socketId: socket.id });

    logger.debug({ event: 'SOCKET_CONNECTED', userId, socketId: socket.id });

    socket.on('disconnect', () => {
      logger.debug({ event: 'SOCKET_DISCONNECTED', userId, socketId: socket.id });
    });
  });

  logger.info('Socket.IO initialised');
};

// ─────────────────────────────────────────────────────────────
// SEND HELPERS
// ─────────────────────────────────────────────────────────────

const sendNotification = (userId, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('NOTIFICATION', {
    success: true,
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

const sendAuditLog = (log) => {
  if (!io) return;
  io.to('admins').emit('AUDIT_LOG_CREATED', {
    success: true,
    ...log,
    timestamp: new Date().toISOString(),
  });
};

const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, { success: true, ...payload });
};

const sendBulkNotifications = (userIds, payload) => {
  userIds.forEach((id) => sendNotification(id, payload));
};

module.exports = {
  initSocket,
  sendNotification,
  sendBulkNotifications,
  sendAuditLog,
  broadcast,
};