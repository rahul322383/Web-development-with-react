// // // import React, { createContext, useContext, useEffect, useState } from "react";
// // // import { authApi } from "../api/authApi";

// // // const AuthContext = createContext();

// // // export const AuthProvider = ({ children }) => {
// // //   const [user, setUser] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   // ========================
// // //   // LOAD USER (ONLY ONCE)
// // //   // ========================
// // //   const loadUser = async () => {
// // //     try {
// // //       const token = localStorage.getItem("accessToken");

// // //       if (!token) {
// // //         setUser(null);
// // //         return;
// // //       }

// // //       const data = await authApi.getMe();
// // //       setUser(data);
// // //     } catch (error) {
// // //       console.error("Load user failed:", error);
// // //       setUser(null);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // ========================
// // //   // LOGIN
// // //   // ========================
// // //   const login = async (credentials) => {
// // //     try {
// // //       const data = await authApi.login(credentials);

// // //       localStorage.setItem("accessToken", data.accessToken);
// // //       localStorage.setItem("refreshToken", data.refreshToken);

// // //       // IMPORTANT: set user immediately
// // //       setUser(data.user);

// // //       return { success: true };
// // //     } catch (error) {
// // //       return { success: false, error };
// // //     }
// // //   };

// // //   // ========================
// // //   // REGISTER
// // //   // ========================
// // //   const register = async (userData) => {
// // //     try {
// // //       const data = await authApi.register(userData);

// // //       localStorage.setItem("accessToken", data.accessToken);
// // //       localStorage.setItem("refreshToken", data.refreshToken);

// // //       setUser(data.user);

// // //       return { success: true };
// // //     } catch (error) {
// // //       return { success: false, error };
// // //     }
// // //   };

// // //   // ========================
// // //   // LOGOUT
// // //   // ========================
// // //   const logout = async () => {
// // //     try {
// // //       await authApi.logout();
// // //     } catch (e) {
// // //       // ignore
// // //     }

// // //     localStorage.removeItem("accessToken");
// // //     localStorage.removeItem("refreshToken");

// // //     setUser(null);
// // //   };

// // //   // ========================
// // //   // AUTO LOGOUT LISTENER
// // //   // ========================
// // //   useEffect(() => {
// // //     const handleLogout = () => setUser(null);

// // //     window.addEventListener("logout", handleLogout);
// // //     return () => window.removeEventListener("logout", handleLogout);
// // //   }, []);

// // //   // ========================
// // //   // INITIAL LOAD
// // //   // ========================
// // //   useEffect(() => {
// // //     loadUser();
// // //   }, []);

// // //   // ========================
// // //   // PREVENT RENDER BEFORE AUTH CHECK
// // //   // ========================
// // //   if (loading) {
// // //     return <div>Loading...</div>; // 🔥 prevents route flicker & loop
// // //   }

// // //   return (
// // //     <AuthContext.Provider
// // //       value={{
// // //         user,
// // //         loading,
// // //         isAuthenticated: !!user,
// // //         login,
// // //         register,
// // //         logout,
// // //       }}
// // //     >
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // };

// // // // ========================
// // // // CUSTOM HOOK
// // // // ========================
// // // export const useAuth = () => {
// // //   return useContext(AuthContext);
// // // };

// // import React, { createContext, useContext, useEffect, useState } from "react";
// // import { authApi } from "../api/authApi";

// // const AuthContext = createContext();

// // // ========================
// // // HELPER: Normalize User
// // // ========================
// // const normalizeUser = (user) => ({
// //   ...user,
// //   primaryRole: user.primaryRole || user.role || "Employee",
// // });

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // ========================
// //   // LOAD USER
// //   // ========================
// //   const loadUser = async () => {
// //     try {
// //       const token = localStorage.getItem("accessToken");

// //       if (!token) {
// //         setUser(null);
// //         return;
// //       }

// //       const res = await authApi.getMe();

// //       // ✅ IMPORTANT
// //       setUser(normalizeUser(res.data));
// //     } catch (error) {
// //       console.error("Load user failed:", error);

// //       // 🔥 token invalid → logout
// //       localStorage.removeItem("accessToken");
// //       localStorage.removeItem("refreshToken");

// //       setUser(null);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ========================
// //   // LOGIN
// //   // ========================
// //   const login = async (credentials) => {
// //     try {
// //       const res = await authApi.login(credentials);

// //       const { accessToken, refreshToken, user } = res.data;

// //       localStorage.setItem("accessToken", accessToken);
// //       localStorage.setItem("refreshToken", refreshToken);

// //       // ✅ instant UI update
// //       setUser(normalizeUser(user));

// //       return { success: true };
// //     } catch (error) {
// //       return { success: false, error };
// //     }
// //   };

// //   // ========================
// //   // REGISTER
// //   // ========================
// //   const register = async (userData) => {
// //     try {
// //       const res = await authApi.register(userData);

// //       const { accessToken, refreshToken, user } = res.data;

// //       localStorage.setItem("accessToken", accessToken);
// //       localStorage.setItem("refreshToken", refreshToken);

// //       setUser(normalizeUser(user));

// //       return { success: true };
// //     } catch (error) {
// //       return { success: false, error };
// //     }
// //   };

// //   // ========================
// //   // LOGOUT
// //   // ========================
// //   const logout = async () => {
// //     try {
// //       await authApi.logout();
// //     } catch (e) {
// //       // ignore API error
// //     }

// //     localStorage.removeItem("accessToken");
// //     localStorage.removeItem("refreshToken");

// //     setUser(null);

// //     // 🔥 notify other tabs
// //     window.dispatchEvent(new Event("logout"));
// //   };

// //   // ========================
// //   // AUTO LOGOUT LISTENER
// //   // ========================
// //   useEffect(() => {
// //     const handleLogout = () => setUser(null);

// //     window.addEventListener("logout", handleLogout);
// //     return () => window.removeEventListener("logout", handleLogout);
// //   }, []);

// //   // ========================
// //   // MULTI-TAB SYNC
// //   // ========================
// //   useEffect(() => {
// //     const syncLogout = (event) => {
// //       if (event.key === "accessToken" && !event.newValue) {
// //         setUser(null);
// //       }
// //     };

// //     window.addEventListener("storage", syncLogout);
// //     return () => window.removeEventListener("storage", syncLogout);
// //   }, []);

// //   // ========================
// //   // INITIAL LOAD
// //   // ========================
// //   useEffect(() => {
// //     loadUser();
// //   }, []);

// //   // ========================
// //   // LOADING UI
// //   // ========================
// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen text-lg font-medium">
// //         Checking authentication...
// //       </div>
// //     );
// //   }

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         loading,
// //         isAuthenticated: !!user,
// //         login,
// //         register,
// //         logout,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // // ========================
// // // CUSTOM HOOK
// // // ========================
// // export const useAuth = () => {
// //   return useContext(AuthContext);
// // };

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { authApi } from "../api/authApi";

// const AuthContext = createContext();

// // ========================
// // NORMALIZE USER
// // ========================
// const normalizeUser = (user) => ({
//   ...user,
//   primaryRole: user.primaryRole || user.role || "Employee",
// });

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ========================
//   // LOAD USER
//   // ========================
//   const loadUser = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");

//       if (!token) {
//         setUser(null);
//         return;
//       }

//       const userData = await authApi.getMe(); // ✅ already unwrapped

//       setUser(normalizeUser(userData));
//     } catch (error) {
//       console.error("Load user failed:", error);

//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");

//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ========================
//   // LOGIN
//   // ========================
//   const login = async (credentials) => {
//     try {
//       const data = await authApi.login(credentials);
//       // data = { accessToken, refreshToken, user }

//       localStorage.setItem("accessToken", data.accessToken);
//       localStorage.setItem("refreshToken", data.refreshToken);

//       setUser(normalizeUser(data.user));

//       return { success: true };
//     } catch (error) {
//       return { success: false, error };
//     }
//   };

//   // ========================
//   // REGISTER
//   // ========================
//   const register = async (userData) => {
//     try {
//       const data = await authApi.register(userData);

//       localStorage.setItem("accessToken", data.accessToken);
//       localStorage.setItem("refreshToken", data.refreshToken);

//       setUser(normalizeUser(data.user));

//       return { success: true };
//     } catch (error) {
//       return { success: false, error };
//     }
//   };

//   // ========================
//   // LOGOUT
//   // ========================
//   const logout = async () => {
//     try {
//       await authApi.logout();
//     } catch (e) {}

//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     setUser(null);

//     window.dispatchEvent(new Event("logout"));
//   };

//   // ========================
//   // MULTI TAB LOGOUT
//   // ========================
//   useEffect(() => {
//     const syncLogout = (event) => {
//       if (event.key === "accessToken" && !event.newValue) {
//         setUser(null);
//       }
//     };

//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, []);

//   // ========================
//   // INITIAL LOAD
//   // ========================
//   useEffect(() => {
//     loadUser();
//   }, []);

//   // ========================
//   // LOADING UI
//   // ========================
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-lg font-medium">
//         Checking authentication...
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         isAuthenticated: !!user,
//         login,
//         register,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ========================
// export const useAuth = () => useContext(AuthContext);

// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';

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
          const userData = await authApi.getMe();
          setUser(userData.user);
          setMeta(userData.meta);
          setIsAuthenticated(true);
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
      const { user, meta } = response;
      
      // Store tokens
      localStorage.setItem('accessToken', user.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      setUser(user);
      setMeta(meta);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true, data: response };
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
      setUser(null);
      setMeta(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await authApi.getMe();
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