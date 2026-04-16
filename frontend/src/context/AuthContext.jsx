
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authApi } from '../api/authApi';
// import { toast } from 'sonner';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [meta, setMeta] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Check authentication status on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         try {
//           const response = await authApi.getMe();
//           const userData = response.data || response;
//           setUser(userData.user);
//           setMeta(userData.meta);
//           setIsAuthenticated(true);
//         } catch (error) {
//           console.error('Auth check failed:', error);
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           setUser(null);
//           setMeta(null);
//           setIsAuthenticated(false);
//         }
//       }
//       setIsLoading(false);
//     };

//     checkAuth();
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await authApi.login(credentials);
//       const data = response.data || response;
//       const { user, accessToken, refreshToken, meta } = data;

//       localStorage.setItem('accessToken', accessToken);
//       if (refreshToken) {
//         localStorage.setItem('refreshToken', refreshToken);
//       }
      
//       setUser(user);
//       setMeta(meta || null);
//       setIsAuthenticated(true);
      
//       toast.success('Login successful!');
//       return { success: true, data };
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed');
//       return { success: false, error };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await authApi.register(userData);
      
//       // Handle the response structure correctly
//       const data = response.data || response;
//       const { user, accessToken, refreshToken, meta } = data;

//       localStorage.setItem('accessToken', accessToken);
//       if (refreshToken) {
//         localStorage.setItem('refreshToken', refreshToken);
//       }
      
//       setUser(user);
//       setMeta(meta || null);
//       setIsAuthenticated(true);
      
//       toast.success('Registration successful!');
//       return { success: true, data };
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Registration failed');
//       return { success: false, error };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authApi.logout();
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       setUser(null);
//       setMeta(null);
//       setIsAuthenticated(false);
//       toast.success('Logged out successfully');
//     }
//   };

//   const refreshUserData = async () => {
//     try {
//       const response = await authApi.getMe();
//       const userData = response.data || response;
//       setUser(userData.user);
//       setMeta(userData.meta);
//       return { success: true, data: userData };
//     } catch (error) {
//       console.error('Failed to refresh user data:', error);
//       return { success: false, error };
//     }
//   };

//   const value = {
//     user,
//     meta,
//     isAuthenticated,
//     isLoading,
//     login,
//     register,
//     logout,
//     refreshUserData
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket } from '../api/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          const response = await authApi.getMe();
          const userData = response.data || response;

          setUser(userData.user);
          setMeta(userData.meta);
          setIsAuthenticated(true);

          // ✅ Connect socket on page refresh if user is authenticated
          connectSocket();

        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setMeta(null);
          setIsAuthenticated(false);
        }
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

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update state
      setUser(user);
      setMeta(meta || null);
      setIsAuthenticated(true);

      // ✅ Connect socket after successful login
      connectSocket();

      toast.success('Login successful!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);

      // Handle the response structure correctly
      const data = response.data || response;
      const { user, accessToken, refreshToken, meta } = data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setUser(user);
      setMeta(meta || null);
      setIsAuthenticated(true);

      // ✅ Connect socket after successful registration
      connectSocket();

      toast.success('Registration successful!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // ✅ Disconnect socket on logout
      disconnectSocket();

      setUser(null);
      setMeta(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authApi.getMe();
      const userData = response.data || response;
      setUser(userData.user);
      setMeta(userData.meta);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    meta,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};