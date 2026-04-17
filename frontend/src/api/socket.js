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
//     transports: ['websocket'],
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
//   if (socket && !socket.connected) {
//     socket.connect();
//   }

//   if (!socket) {
//     const token = getToken();
//     if (token) return connectSocket();
//   }

//   return socket;
// };

// export const isSocketConnected = () => {
//   return socket?.connected || false;
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

const getToken = () => localStorage.getItem('accessToken');

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
    autoConnect: true
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
  });

  socket.on('connect_error', () => {
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      socket.disconnect();
      socket = null;
    }
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      setTimeout(() => {
        socket?.connect();
      }, 1000);
    }
  });

  socket.on('NOTIFICATION', () => { });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

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

export const isSocketConnected = () => {
  return !!socket?.connected;
};

export const emitSocketEvent = (eventName, data) => {
  const currentSocket = getSocket();

  if (currentSocket?.connected) {
    currentSocket.emit(eventName, data);
    return { success: true };
  }

  return {
    success: false,
    message: 'Socket not connected'
  };
};