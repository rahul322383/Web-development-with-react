
// import React, { useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "sonner";
// import Layout from "./components/layout/layout";
// import { ProtectedRoute } from "./routes/ProtectedRoute";
// import { PublicRoute } from "./routes/PublicRoute";

// // Auth Pages
// import { Login } from "./pages/Login";
// import Register from "./pages/Register";

// // Dashboard Pages
// import { Dashboard } from "./pages/Dashboard";
// import { Users } from "./pages/Users";
// import { Leave } from "./pages/Leave";
// import { Expenses } from "./pages/Expenses";
// import { Payroll } from "./pages/Payroll";
// import { Notifications } from "./pages/Notifications";
// import  PendingLeaves from "./leave/pending-leave"
// import ApprovedLeaves from "./leave/approved-leave"

// // Public Pages
// import HomePage from "./pages/home";
// import Features from "./Public/Features";
// import Pricing from "./Public/Pricing";
// import Demo from "./Public/Demo";
// import About from "./Public/About";
// import Privacy from "./Public/Privacy";
// import Terms from "./Public/Terms";
// import Security from "./Public/Security";

// // Help Page
// import Help from "./Public/help";

// // Store & API
// import useAuthStore from "./store/authStore";
// import { authApi } from "./api/authApi";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// });

// // 🔥 Separate component (IMPORTANT)
// function AppRoutes() {
//   const accessToken = useAuthStore((state) => state.accessToken);
//   const setUser = useAuthStore((state) => state.setUser);
//   const logout = useAuthStore((state) => state.logout);
//   const navigate = useNavigate();

//   // ✅ Fetch user
//   useEffect(() => {
//     if (!accessToken) return;

//     const fetchCurrentUser = async () => {
//       try {
//         const data = await authApi.getMe();
//         setUser(data.user || data);
//       } catch (error) {
//         console.error("Failed to fetch current user:", error);
//       }
//     };

//     fetchCurrentUser();
//   }, [accessToken, setUser]);

//   // ✅ Global logout listener
//   useEffect(() => {
//     const handleLogout = () => {
//       logout();
//       navigate("/login", { replace: true });
//     };

//     window.addEventListener("logout", handleLogout);
//     return () => window.removeEventListener("logout", handleLogout);
//   }, [logout, navigate]);

//   return (
// <Routes>
//   {/* Layout Wrapper */}
//   <Route element={<Layout />}>
    
//     {/* Public Routes */}
//     <Route path="/" element={<HomePage />} />
//     <Route path="/features" element={<Features />} />
//     <Route path="/pricing" element={<Pricing />} />
//     <Route path="/demo" element={<Demo />} />
//     <Route path="/about" element={<About />} />
//     <Route path="/privacy" element={<Privacy />} />
//     <Route path="/terms" element={<Terms />} />
//     <Route path="/security" element={<Security />} />
//     <Route path="/help" element={<Help />} />

//     {/* Protected Routes */}
//     <Route path="/dashboard" element={
//       <ProtectedRoute>
//         <Dashboard />
//       </ProtectedRoute>
//     } />

//     <Route path="/users" element={
//       <ProtectedRoute>
//         <Users />
//       </ProtectedRoute>
//     } />

//     <Route path="/leave" element={
//       <ProtectedRoute>
//         <Leave />
//       </ProtectedRoute>
//     } />
//       <Route path="/pending-leave" element={
//         <ProtectedRoute>
//           <PendingLeaves />
//         </ProtectedRoute>
//       } />
//       <Route path="/approved-leave" element={
//         <ProtectedRoute>
//           <ApprovedLeaves />
//         </ProtectedRoute>
//       } />


//     <Route path="/expenses" element={
//       <ProtectedRoute>
//         <Expenses />
//       </ProtectedRoute>
//     } />

//     <Route path="/payroll" element={
//       <ProtectedRoute>
//         <Payroll />
//       </ProtectedRoute>
//     } />

//     <Route path="/notifications" element={
//       <ProtectedRoute>
//         <Notifications />
//       </ProtectedRoute>
//     } />
//   </Route>

//   {/* Auth Routes (NO sidebar) */}
//   <Route path="/login" element={
//     <PublicRoute>
//       <Login />
//     </PublicRoute>
//   } />

//   <Route path="/register" element={
//     <PublicRoute>
//       <Register />
//     </PublicRoute>
//   } />

//   {/* Fallback */}
//   <Route path="*" element={<Navigate to="/" replace />} />
// </Routes>
//   );
// }

// // 🔥 MAIN APP
// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//       <Toaster position="top-right" richColors />
//     </QueryClientProvider>
//   );
// }

// export default App;

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import Layout from "./components/layout/layout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import { Login } from "./pages/Login";
import Register from "./pages/Register";

// Dashboard Pages
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Leave } from "./pages/Leave";
import { Expenses } from "./pages/Expenses";
import { Payroll } from "./pages/Payroll";
import { Notifications } from "./pages/Notifications";
import PendingLeaves from "./leave/pending-leave";
import ApprovedLeaves from "./leave/approved-leave";

// Public Pages
import HomePage from "./pages/home";
import Features from "./Public/Features";
import Pricing from "./Public/Pricing";
import Demo from "./Public/Demo";
import About from "./Public/About";
import Privacy from "./Public/Privacy";
import Terms from "./Public/Terms";
import Security from "./Public/Security";
import Help from "./Public/help";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ========================
// ROUTES COMPONENT
// ========================
function AppRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Global logout listener
  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/login", { replace: true });
    };

    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, [logout, navigate]);

  return (
    <Routes>
      {/* Layout Wrapper */}
      <Route element={<Layout />}>

        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/security" element={<Security />} />
        <Route path="/help" element={<Help />} />

        {/* Protected Pages */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute roles={["Admin", "Manager"]}>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="/leave" element={
          <ProtectedRoute>
            <Leave />
          </ProtectedRoute>
        } />

        {/* 🔥 Manager Routes */}
        <Route path="/pending-leave" element={
          <ProtectedRoute roles={["Manager", "Admin", "HR"]}>
            <PendingLeaves />
          </ProtectedRoute>
        } />

        <Route path="/approved-leave" element={
          <ProtectedRoute roles={["Manager", "Admin", "HR"]}>
            <ApprovedLeaves />
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } />

        <Route path="/payroll" element={
          <ProtectedRoute roles={["Admin"]}>
            <Payroll />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ========================
// MAIN APP
// ========================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;