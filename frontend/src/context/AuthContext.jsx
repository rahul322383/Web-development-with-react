
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket } from '../api/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = still checking
  const [isLoading, setIsLoading] = useState(true);

  const isLoggingOut = useRef(false);

  // ---------------- GLOBAL LOGOUT (session expired) ----------------
  useEffect(() => {
    const handleLogout = () => {
      if (isLoggingOut.current) return;
      isLoggingOut.current = true;

      localStorage.clear();
      disconnectSocket();

      setUser(null);
      setMeta(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      toast.error('Session expired, please login again');
      window.location.href = '/login';
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  // ---------------- CHECK AUTH ON MOUNT ----------------
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setUser(null);
        setMeta(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        const data = response.data || response;

        setUser(data.user);
        setMeta(data.meta);
        setIsAuthenticated(true);

        connectSocket();
      } catch (error) {
        // Token invalid or expired — clear everything
        localStorage.clear();
        disconnectSocket();

        setUser(null);
        setMeta(null);
        setIsAuthenticated(false);
      } finally {
        // Always resolve loading, no matter what happened above
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const data = response.data || response;

      const { user, accessToken, refreshToken, meta } = data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      setMeta(meta || null);
      setIsAuthenticated(true);

      connectSocket();

      toast.success('Login successful');

      return { success: true, message: 'Login successful', data };
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      toast.error(message);

      return { success: false, message, data: null };
    }
  };

  // ---------------- REGISTER ----------------
  const register = async (payload) => {
    try {
      const response = await authApi.register(payload);
      const data = response.data || response;

      const { user, accessToken, refreshToken, meta } = data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      setMeta(meta || null);
      setIsAuthenticated(true);

      connectSocket();

      toast.success('Registration successful');

      return { success: true, message: 'Registration successful', data };
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);

      return { success: false, message, data: null };
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — we still clear locally
    } finally {
      localStorage.clear();
      disconnectSocket();

      setUser(null);
      setMeta(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully');

      window.location.href = '/';
    }

    return { success: true, message: 'Logged out', data: null };
  };

  // ---------------- REFRESH USER ----------------
  const refreshUserData = async () => {
    try {
      const response = await authApi.getMe();
      const data = response.data || response;

      setUser(data.user);
      setMeta(data.meta);

      return { success: true, message: 'User refreshed', data };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to refresh user',
        data: null,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        meta,
        isAuthenticated, // null | true | false
        isLoading,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};