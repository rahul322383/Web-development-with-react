// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ;

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

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      socketInstance.emit('register', user.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('new-notification', (notification) => {
      console.log('📨 New notification received:', notification);
      setNewNotification(notification);
      
      // Show toast notification
      toast.success(notification.message, {
        description: notification.title || 'New Notification',
        action: {
          label: 'View',
          onClick: () => window.location.href = '/notifications'
        }
      });
    });

    socketInstance.on('notification-read', (data) => {
      console.log('📖 Notification read:', data);
    });

    socketInstance.on('notifications-cleared', (data) => {
      console.log('🗑️ Notifications cleared:', data);
    });

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('new-notification');
        socketInstance.off('notification-read');
        socketInstance.off('notifications-cleared');
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user?.id]);

  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', eventName);
    }
  };

  const value = {
    socket,
    isConnected,
    newNotification,
    setNewNotification,
    emitEvent,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};