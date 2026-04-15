const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const userSocketMap = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
        console.log("🔍 Socket auth token:", token);

      if (!token) return next(new Error("NO_TOKEN"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      console.log("🔐 Socket auth success:", decoded);

      next();
    } catch (err) {
      console.log("❌ Socket auth failed");
      next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id; // ✅ FIXED (was sub)

    if (!userId) {
      console.log("❌ No userId in token");
      return socket.disconnect();
    }

    console.log("🔥 User connected:", userId, socket.id);

    // room join
    socket.join(`user_${userId}`);

    // admin room
    const role = (socket.user.role || "").toUpperCase();
    if (role === "ADMIN") {
      socket.join("admins");
    }

    socket.emit("CONNECTED", {
      message: "Socket connected successfully",
      userId,
      socketId: socket.id
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", userId, socket.id);
    });
  });
};

// 🔔 SINGLE USER NOTIFICATION
const sendNotification = (userId, payload) => {
  if (!io) return;

  console.log("📨 Sending notification to:", userId);

  io.to(`user_${userId}`).emit("NOTIFICATION", {
    ...payload,
    timestamp: new Date().toISOString()
  });
};

// 📢 ADMIN LOGS
const sendAuditLog = (log) => {
  if (!io) return;

  io.to("admins").emit("AUDIT_LOG_CREATED", {
    ...log,
    timestamp: new Date().toISOString()
  });
};

// 🌍 GLOBAL BROADCAST
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