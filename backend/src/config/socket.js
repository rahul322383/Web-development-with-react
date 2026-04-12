const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

// userId -> Set(socketIds)  ✅ supports multiple tabs/devices
const userSocketMap = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // =========================
  // AUTH MIDDLEWARE (IMPORTANT)
  // =========================
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded; // attach user to socket
      next();
    } catch (err) {
      next(new Error("Unauthorized socket connection"));
    }
  });

  // =========================
  // CONNECTION
  // =========================
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log("User connected:", socket.id, "User:", userId);

    // store multiple sockets per user
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }

    userSocketMap.get(userId).add(socket.id);

    // =========================
    // REGISTER (optional now)
    // =========================
    socket.on("register", () => {
      console.log(`User ${userId} registered via socket`);
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const sockets = userSocketMap.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSocketMap.delete(userId);
        }
      }
    });
  });
};

// =========================
// SEND NOTIFICATION
// =========================
const sendNotification = (userId, payload) => {
  const sockets = userSocketMap.get(userId);

  if (!io || !sockets) return;

  for (const socketId of sockets) {
    io.to(socketId).emit("notification", payload);
  }
};

module.exports = {
  initSocket,
  sendNotification
};