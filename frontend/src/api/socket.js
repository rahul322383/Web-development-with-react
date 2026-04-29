// import { io } from 'socket.io-client';

// let socket = null;
// let reconnectAttempts = 0;
// const MAX_RECONNECT_ATTEMPTS = 5;

// const getToken = () => localStorage.getItem('accessToken');

// export const connectSocket = () => {
//   const token = getToken();

//   if (!token) return null;

//   if (socket?.connected) return socket;

//   if (socket) {
//     socket.connect();
//     return socket;
//   }

//   const API_URL = import.meta.env.VITE_API_URL;


//   socket = io(API_URL, {
//     auth: { token },
//     transports: ['websocket', 'polling'],
//     withCredentials: true,
//     reconnection: true,
//     reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     timeout: 20000,
//     autoConnect: true
//   });

//   socket.on('connect', () => {
//     reconnectAttempts = 0;
//   });

//   socket.on('connect_error', () => {
//     reconnectAttempts++;

//     if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
//       socket.disconnect();
//       socket = null;
//     }
//   });

//   socket.on('disconnect', (reason) => {
//     if (reason === 'io server disconnect') {
//       setTimeout(() => {
//         socket?.connect();
//       }, 1000);
//     }
//   });

//   socket.on('NOTIFICATION', () => { });

//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.removeAllListeners();
//     socket.disconnect();
//     socket = null;
//     reconnectAttempts = 0;
//   }
// };

// export const getSocket = () => {
//   const token = getToken();

//   if (!token) return null;

//   if (socket && !socket.connected) {
//     socket.connect();
//   }

//   if (!socket) {
//     return connectSocket();
//   }

//   return socket;
// };

// export const isSocketConnected = () => {
//   return !!socket?.connected;
// };

// export const emitSocketEvent = (eventName, data) => {
//   const currentSocket = getSocket();

//   if (currentSocket?.connected) {
//     currentSocket.emit(eventName, data);
//     return { success: true };
//   }

//   return {
//     success: false,
//     message: 'Socket not connected'
//   };
// };

import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Registered notification handlers — { type: [callbacks] }
const notificationHandlers = new Map();

const getToken = () => localStorage.getItem('accessToken');

// ─────────────────────────────────────────────────────────────
// CONNECT
// ─────────────────────────────────────────────────────────────

export const connectSocket = () => {
  const token = getToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  if (socket) {
    socket.connect();
    return socket;
  }

  const API_URL = import.meta.env.VITE_API_URL;

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  // ── lifecycle ────────────────────────────────────────────────

  socket.on('connect', () => {
    reconnectAttempts = 0;
    
  });

  socket.on('CONNECTED', (data) => {
    
  });

  socket.on('connect_error', (err) => {
    reconnectAttempts++;
   

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      
      socket.disconnect();
      socket = null;
    }
  });

  socket.on('disconnect', (reason) => {
    

    // Server forcefully disconnected — try once after 1s
    if (reason === 'io server disconnect') {
      setTimeout(() => socket?.connect(), 1000);
    }
  });

  socket.on('ERROR', (data) => {
   
  });

  // ── ✅ FIXED: NOTIFICATION handler now actually dispatches to registered callbacks
  socket.on('NOTIFICATION', (payload) => {
    const { type } = payload;

    // fire type-specific handlers (e.g. 'LEAVE_APPLIED')
    if (type && notificationHandlers.has(type)) {
      notificationHandlers.get(type).forEach((cb) => cb(payload));
    }

    // fire catch-all handlers registered under '*'
    if (notificationHandlers.has('*')) {
      notificationHandlers.get('*').forEach((cb) => cb(payload));
    }
  });

  socket.on('AUDIT_LOG_CREATED', (log) => {
    // Admins only — forward to any registered handler
    if (notificationHandlers.has('AUDIT_LOG_CREATED')) {
      notificationHandlers.get('AUDIT_LOG_CREATED').forEach((cb) => cb(log));
    }
  });

  return socket;
};

// ─────────────────────────────────────────────────────────────
// DISCONNECT
// ─────────────────────────────────────────────────────────────

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
    notificationHandlers.clear();
  }
};

// ─────────────────────────────────────────────────────────────
// GET / STATUS
// ─────────────────────────────────────────────────────────────

export const getSocket = () => {
  const token = getToken();
  if (!token) return null;

  if (socket && !socket.connected) {
    socket.connect();
  }

  if (!socket) {
    return connectSocket();
  }

  return socket;
};

export const isSocketConnected = () => !!socket?.connected;

// ─────────────────────────────────────────────────────────────
// EMIT
// ─────────────────────────────────────────────────────────────

export const emitSocketEvent = (eventName, data) => {
  const currentSocket = getSocket();

  if (currentSocket?.connected) {
    currentSocket.emit(eventName, data);
    return { success: true };
  }

  return { success: false, message: 'Socket not connected' };
};

// ─────────────────────────────────────────────────────────────
// ✅ NOTIFICATION SUBSCRIPTION API
//
// Usage:
//   onNotification('LEAVE_APPLIED', (payload) => toast(payload.message))
//   onNotification('*', (payload) => addToNotificationBell(payload))
//   onNotification('AUDIT_LOG_CREATED', (log) => refreshAuditTable(log))
// ─────────────────────────────────────────────────────────────

export const onNotification = (type, callback) => {
  if (!notificationHandlers.has(type)) {
    notificationHandlers.set(type, []);
  }
  notificationHandlers.get(type).push(callback);

  // Return unsubscribe function
  return () => offNotification(type, callback);
};

export const offNotification = (type, callback) => {
  if (!notificationHandlers.has(type)) return;

  const filtered = notificationHandlers.get(type).filter((cb) => cb !== callback);

  if (filtered.length === 0) {
    notificationHandlers.delete(type);
  } else {
    notificationHandlers.set(type, filtered);
  }
};