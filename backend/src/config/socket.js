let io;

const userSocketMap = new Map(); // userId -> socketId

const initSocket = (server) => {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 🔑 register user
    socket.on('register', (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} registered`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // remove user from map
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
};

/* =========================
   SEND NOTIFICATION
========================= */
const sendNotification = (userId, payload) => {
  const socketId = userSocketMap.get(userId);

  if (socketId && io) {
    io.to(socketId).emit('notification', payload);
  }
};

module.exports = {
  initSocket,
  sendNotification
};