

// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// let io;
// const userSocketMap = new Map(); // userId -> Set(socketIds)

// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL,
//       credentials: true
//     }
//   });

//   // 🔐 AUTH MIDDLEWARE
//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth?.token;

//       if (!token) {
//         return next(new Error("NO_TOKEN"));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       socket.user = decoded;
//       next();
//     } catch (err) {
//       next(new Error("INVALID_TOKEN"));
//     }
//   });

//   io.on("connection", (socket) => {
//     const userId = socket.user.id || socket.user.userId;

//     console.log("✅ Connected:", userId, socket.id);

//     if (!userSocketMap.has(userId)) {
//       userSocketMap.set(userId, new Set());
//     }

//     userSocketMap.get(userId).add(socket.id);

//     // Send welcome notification
//     socket.emit("notification", {
//       type: "CONNECTION_SUCCESS",
//       message: "Connected to notification service",
//       timestamp: new Date().toISOString()
//     });

//     socket.on("disconnect", () => {
//       const sockets = userSocketMap.get(userId);

//       if (sockets) {
//         sockets.delete(socket.id);
//         if (sockets.size === 0) {
//           userSocketMap.delete(userId);
//         }
//       }

//       console.log("❌ Disconnected:", socket.id);
//     });
//   });
// };

// // 🔔 NOTIFICATION
// const sendNotification = (userId, payload) => {
//   const sockets = userSocketMap.get(userId);
//   if (!io || !sockets) return;

//   const notificationPayload = {
//     ...payload,
//     timestamp: new Date().toISOString()
//   };

//   sockets.forEach((socketId) => {
//     io.to(socketId).emit("notification", notificationPayload);
//   });
// };

// // Send notification to multiple users
// const sendBulkNotifications = (userIds, payload) => {
//   userIds.forEach(userId => {
//     sendNotification(userId, payload);
//   });
// };

// module.exports = { initSocket, sendNotification, sendBulkNotifications };

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

    console.log("✅ Connected:", userId, socket.id);

    // 🧠 Track sockets (multi-tab support)
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // 🔥 Join rooms
    socket.join(`user_${userId}`);

    // Optional: role-based room
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    // 🎉 Welcome event
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

// Send to single user
const sendNotification = (userId, payload) => {
  if (!io) return;

  io.to(`user_${userId}`).emit("NOTIFICATION", {
    ...payload,
    timestamp: new Date().toISOString()
  });
};

// ---

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