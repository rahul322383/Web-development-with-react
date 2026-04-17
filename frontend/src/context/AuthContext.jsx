import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let isLoggingOut = false;

  // 🔥 HANDLE GLOBAL LOGOUT EVENT (FROM AXIOS)
  useEffect(() => {
    const handleLogout = () => {
      if (isLoggingOut) return;

      isLoggingOut = true;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      disconnectSocket();

      setUser(null);
      setMeta(null);
      setIsAuthenticated(false);

      toast.error('Session expired, please login again');

      window.location.href = '/login';
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  // 🔥 CHECK AUTH
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
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

      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        setUser(null);
        setMeta(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

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

      return { success: true, data };

    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

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

      return { success: true, data };

    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (isLoggingOut) return;

    isLoggingOut = true;

    try {
      await authApi.logout();
    } catch { }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    disconnectSocket();

    setUser(null);
    setMeta(null);
    setIsAuthenticated(false);

    toast.success('Logged out');

    window.location.href = '/login';
  };

  const refreshUserData = async () => {
    try {
      const response = await authApi.getMe();
      const data = response.data || response;

      setUser(data.user);
      setMeta(data.meta);

      return { success: true, data };

    } catch (error) {
      return { success: false, message: 'Failed to refresh user' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        meta,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};