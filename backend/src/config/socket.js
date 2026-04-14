

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const userSocketMap = new Map(); // userId -> Set(socketIds)

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true
    }
  });

  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("NO_TOKEN"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("INVALID_TOKEN"));
    }
  });
io.on("connection", (socket) => {
  const userId = socket.user.id || socket.user.userId;

  if (!userId) {
    console.log("❌ Invalid user in socket");
    return;
  }

  console.log("✅ Connected:", userId, socket.id);

  // Track sockets
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  // Join personal room
  socket.join(`user_${userId}`);

  // ✅ FIX: normalize role
  const role = (socket.user.role || "").toUpperCase();

  if (role === "ADMIN") {
    socket.join("admins");
  }

  // Debug rooms
  console.log("📦 Rooms:", socket.rooms);

  socket.emit("CONNECTED", {
    message: "Socket connected successfully",
    timestamp: new Date().toISOString()
  });

  socket.on("disconnect", () => {
    const sockets = userSocketMap.get(userId);

    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
    }

    console.log("❌ Disconnected:", socket.id);
  });
});
};

// ---

// # 🔔 NOTIFICATION SYSTEM

const sendNotification = (userId, payload) => {
  if (!io) {
    console.log("❌ IO not initialized");
    return;
  }

  console.log("📨 Sending notification to:", userId);
  console.log("📨 Payload:", payload);

  io.to(`user_${userId}`).emit("NOTIFICATION", {
    ...payload,
    timestamp: new Date().toISOString()
  });
};
// # 🔥 REAL-TIME AUDIT EVENT

const sendAuditLog = (log) => {
  if (!io) return;

  // Send to admins only
  io.to("admins").emit("AUDIT_LOG_CREATED", {
    ...log,
    timestamp: new Date().toISOString()
  });
};

// ---

// # 📢 BROADCAST

const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};




const sendBulkNotifications = (userIds, payload) => {
  userIds.forEach((id) => sendNotification(id, payload));
};


module.exports = {
  initSocket,
  sendNotification,
  sendBulkNotifications,
  sendAuditLog,
  broadcast
};