// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8001';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken')
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('register', user.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('new-notification', (notification) => {
      setNewNotification(notification);

      toast.success(notification.message, {
        description: notification.title || 'New Notification',
        action: {
          label: 'View',
          onClick: () => window.location.href = '/notifications'
        }
      });
    });

    socketInstance.on('notification-read', () => { });

    socketInstance.on('notifications-cleared', () => { });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('new-notification');
      socketInstance.off('notification-read');
      socketInstance.off('notifications-cleared');
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        newNotification,
        setNewNotification,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};