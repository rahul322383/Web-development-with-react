// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import notificationApi from '../api/notificationApi'; // import your API

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
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Function to fetch the initial unread count from the API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await notificationApi.getUnreadCount();
      const count = data?.count ?? data?.unread ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
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
      // Refresh count when connection is established
      refreshUnreadCount();
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('new-notification', (notification) => {
      setNewNotification(notification);
      // Increment unread count automatically
      setUnreadCount(prev => prev + 1);
      toast.success(notification.message, {
        description: notification.title || 'New Notification',
        action: {
          label: 'View',
          onClick: () => window.location.href = '/notifications'
        }
      });
    });

    // If the server emits the ID of the read notification (recommended)
    socketInstance.on('notification-read', (data) => {
      // data could be { id } or { count } – adjust accordingly
      if (typeof data?.count === 'number') {
        setUnreadCount(data.count); // server sends the new total
      } else {
        // fallback: decrement by 1 if an ID was received
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    socketInstance.on('notifications-cleared', () => {
      setUnreadCount(0);
      setNewNotification(null);
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('new-notification');
      socketInstance.off('notification-read');
      socketInstance.off('notifications-cleared');
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.id, refreshUnreadCount]);

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
        unreadCount,
        setUnreadCount,     // allow components to manually update after API calls
        refreshUnreadCount, // manual refresh
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};