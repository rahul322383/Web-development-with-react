// // src/context/AuthContext.jsx

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { authApi } from "../api/authApi"; 
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);


// const loadUser = async () => {
//   const token = localStorage.getItem("accessToken");

//   if (!token) {
//     setLoading(false);
//     return; // 🚫 STOP API CALL
//   }

//   try {
//     const data = await authApi.getMe();
//     setUser(data);
//   } catch (error) {
//     setUser(null);
//   } finally {
//     setLoading(false);
//   }
// };

//   // ========================
//   // LOGIN
//   // ========================
//   const login = async (credentials) => {
//     try {
//       const data = await authApi.login(credentials);

//       // store tokens
//       localStorage.setItem("accessToken", data.accessToken);
//       localStorage.setItem("refreshToken", data.refreshToken);

//       await loadUser();

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

//       await loadUser();

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
//     } catch (e) {
//       // ignore API error
//     }

//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     setUser(null);
//   };

//   // ========================
//   // HANDLE AUTO LOGOUT EVENT
//   // ========================
//   useEffect(() => {
//     const handleLogout = () => {
//       setUser(null);
//     };

//     window.addEventListener("logout", handleLogout);
//     return () => window.removeEventListener("logout", handleLogout);
//   }, []);

//   // ========================
//   // INITIAL LOAD
//   // ========================
//   useEffect(() => {
//     loadUser();
//   }, []);

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
// // CUSTOM HOOK
// // ========================
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================
  // LOAD USER (ONLY ONCE)
  // ========================
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        return;
      }

      const data = await authApi.getMe();
      setUser(data);
    } catch (error) {
      console.error("Load user failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // LOGIN
  // ========================
  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // IMPORTANT: set user immediately
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // ========================
  // REGISTER
  // ========================
  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // ========================
  // LOGOUT
  // ========================
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);
  };

  // ========================
  // AUTO LOGOUT LISTENER
  // ========================
  useEffect(() => {
    const handleLogout = () => setUser(null);

    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  // ========================
  // INITIAL LOAD
  // ========================
  useEffect(() => {
    loadUser();
  }, []);

  // ========================
  // PREVENT RENDER BEFORE AUTH CHECK
  // ========================
  if (loading) {
    return <div>Loading...</div>; // 🔥 prevents route flicker & loop
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========================
// CUSTOM HOOK
// ========================
export const useAuth = () => {
  return useContext(AuthContext);
};