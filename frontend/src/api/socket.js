
// import { io } from "socket.io-client";

// let socket = null;
// let reconnectAttempts = 0;

// const MAX_RECONNECT = 5;

// // 🔄 Broadcast channel for multi-tab sync
// const channel = new BroadcastChannel("auth_channel");

// // 🔑 Get token
// const getToken = () => localStorage.getItem("accessToken");

// // 🔄 Refresh token API (you implement backend)
// const refreshToken = async () => {
//   try {
//     const res = await fetch("/api/v1/auth/refresh", {
//       method: "POST",
//       credentials: "include"
//     });

//     const data = await res.json();

//     if (data.token) {
//       localStorage.setItem("token", data.token);

//       // 🔄 sync across tabs
//       channel.postMessage({ type: "TOKEN_UPDATED", token: data.token });

//       return data.token;
//     }
//   } catch (err) {
//     console.error("Refresh failed");
//   }
// };

// // 🚀 INIT SOCKET
// export const connectSocket = () => {
//   if (socket?.connected) return socket;

//   socket = io("http://localhost:8001", {
//     auth: { token: getToken() },
//     transports: ["websocket"],
//     reconnection: true,
//     reconnectionAttempts: MAX_RECONNECT,
//     reconnectionDelay: 2000
//   });

//   // ✅ Connected
//   socket.on("connect", () => {
//     console.log("🔥 Socket connected:", socket.id);
//     reconnectAttempts = 0;
//   });

//   // ❌ Handle errors
//   socket.on("connect_error", async (err) => {
//     console.log("Socket error:", err.message);

//     if (err.message === "INVALID_TOKEN") {
//       const newToken = await refreshToken();

//       if (newToken) {
//         socket.auth.token = newToken;
//         socket.connect();
//       }
//     }

//     if (reconnectAttempts >= MAX_RECONNECT) {
//       console.log("Max reconnect reached");
//       socket.disconnect();
//     }

//     reconnectAttempts++;
//   });

//   // 🔔 Notifications
//   socket.on("notification", (data) => {
//     console.log("🔔 Notification:", data);
//   });

//   return socket;
// };

// // ❌ Disconnect
// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };


// socket.js

import { io } from "socket.io-client";

let socket = null;

const getToken = () => localStorage.getItem("token"); // ✅ FIXED

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:8001", {
    auth: {
      token: getToken()
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 20000
  });

  socket.on("connect", () => {
    console.log("🔥 Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });

  // ✅ FIXED EVENT NAME
  socket.on("NOTIFICATION", (data) => {
    console.log("🔔 Notification:", data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};