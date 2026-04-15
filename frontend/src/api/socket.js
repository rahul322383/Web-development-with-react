import { io } from "socket.io-client";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

const channel = new BroadcastChannel("auth_channel");

const getToken = () => localStorage.getItem("accessToken");
console.log("Current token:", getToken());

// Listen for token updates from other tabs
channel.addEventListener("message", (event) => {
  if (event.data.type === "TOKEN_UPDATED") {
    console.log("Token updated in another tab");
  }
});


const setToken = (token) => {
  localStorage.setItem("accessToken", token);
  channel.postMessage({ type: "TOKEN_UPDATED", token });
};

// 🔄 refresh token
const refreshToken = async () => {
  try {
    const res = await fetch("/api/v1/auth/refresh-token", {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();

    if (data?.data?.accessToken) {
      setToken(data.data.accessToken);
      return data.data.accessToken;
    }

    return null;
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
};

// 🚀 CONNECT SOCKET
export const connectSocket = () => {
  const token = getToken();

  if (!token) {
    console.log("No token found");
    return null;
  }

  if (socket?.connected) return socket;

  socket = io("http://localhost:8001", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT,
    reconnectionDelay: 2000
  });

  // 🔥 CONNECTED
  socket.on("connect", () => {
    console.log("🔥 Socket connected:", socket.id);
    reconnectAttempts = 0;
  });

  // 🔔 NOTIFICATION
  socket.on("NOTIFICATION", (data) => {
    console.log("🔔 Notification received:", data);

    // OPTIONAL: browser notification
    if (Notification.permission === "granted") {
      new Notification("New Notification", {
        body: data.event || "You got an update"
      });
    }
  });

  // ❌ ERROR HANDLING
  socket.on("connect_error", async (err) => {
    console.log("Socket error:", err.message);

    if (err.message === "INVALID_TOKEN") {
      const newToken = await refreshToken();

      if (newToken) {
        socket.auth = { token: newToken };

        socket.disconnect();
        socket.connect();
      }
    }

    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT) {
      console.log("Max reconnect reached");
      socket.disconnect();
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

// ❌ DISCONNECT
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};