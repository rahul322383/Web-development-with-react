
// import React, { useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "sonner";

// import Layout from "./components/layout/layout";
// import { ProtectedRoute } from "./routes/ProtectedRoute";
// import { PublicRoute } from "./routes/PublicRoute";
// import { useAuth } from "./context/AuthContext";

// // Auth Pages
// import { Login } from "./pages/Login";
// import Register from "./pages/Register";

// // Dashboard Pages
// import { Dashboard } from "./pages/Dashboard";
// import { Users } from "./pages/Users";
// import { Leave } from "./pages/Leave";
// import   Notifications from "./Notification//Notification"
// import PendingLeaves from "./leave/pending-leave";
// import ApprovedLeaves from "./leave/approved-leave";
// import Expenses from "./Expenses/Expenses";
// import DepartmentDashboard from "./department/DepartmentDashboard";
// import Payroll from "./pyaroll/Payroll";
// import YearEnd from "./YearEnd/YearEnd";
// import AuditLogs from "./Audit/AuditLogs";
// import {ProfilePage} from "./pages/ProfilePage";
// import SettingsPage from './pages/SettingsPage'
// import ReportsPage from './pages/ReportsPage';
// import { PasswordResetPages } from './pages/PasswordResetPages';
// import AttendancePage from './pages/AttendancePage'
// import EmployeePayroll from './pyaroll/EmployeePayroll';
// import AdminPayroll from './pyaroll/AdminPayroll';

// // Public Pages
// import HomePage from "./pages/home";
// import Features from "./Public/Features";
// import Pricing from "./Public/Pricing";
// import Demo from "./Public/Demo";
// import About from "./Public/about";
// import Privacy from "./Public/Privacy";
// import Terms from "./Public/Terms";
// import Security from "./Public/Security";
// import Help from "./Public/help";
// import Contact from './Public/contact'

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// });

// // ========================
// // ROUTES COMPONENT
// // ========================
// function AppRoutes() {
//   const { logout, user } = useAuth(); // ✅ FIXED
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleLogout = () => {
//       logout();
//       navigate("/login", { replace: true });
//     };

//     window.addEventListener("logout", handleLogout);
//     return () => window.removeEventListener("logout", handleLogout);
//   }, [logout, navigate]);

//   return (
//     <Routes>
//       <Route element={<Layout />}>

//         {/* PUBLIC */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/features" element={<Features />} />
//         <Route path="/pricing" element={<Pricing />} />
//         <Route path="/demo" element={<Demo />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/privacy" element={<Privacy />} />
//         <Route path="/terms" element={<Terms />} />
//         <Route path="/security" element={<Security />} />
//         <Route path="/help" element={<Help />} />
//         <Route path="/contact" element={<Contact />} />

//         <Route path="/forgot-password" element={<PasswordResetPages />} />
//         <Route path="/reset-password" element={<PasswordResetPages />} />
//         <Route path="/change-password" element={<PasswordResetPages />} />

//         {/* PROTECTED */}
//         <Route path="/dashboard" element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         } />

//         <Route path="/department-dashboard" element={
//           <ProtectedRoute>
//             <DepartmentDashboard />
//           </ProtectedRoute>
//         } />

//         {/* ✅ SINGLE PAYROLL ROUTE (ROLE BASED) */}
//         <Route path="/payroll" element={
//           <ProtectedRoute>
//             {["admin", "hr", "finance"].includes(user?.role?.toLowerCase())
//               ? <AdminPayroll />
//               : <EmployeePayroll />
//             }
//           </ProtectedRoute>
//         } />

//         <Route path="/attendance" element={
//           <ProtectedRoute>
//             <AttendancePage />
//           </ProtectedRoute>
//         } />

//         <Route path="/users" element={
//           <ProtectedRoute roles={["admin", "manager"]}>
//             <Users />
//           </ProtectedRoute>
//         } />

//         <Route path="/leave" element={
//           <ProtectedRoute>
//             <Leave />
//           </ProtectedRoute>
//         } />

//         <Route path="/pending-leave" element={
//           <ProtectedRoute roles={["manager", "admin", "hr"]}>
//             <PendingLeaves />
//           </ProtectedRoute>
//         } />

//         <Route path="/approved-leave" element={
//           <ProtectedRoute roles={["manager", "admin", "hr"]}>
//             <ApprovedLeaves />
//           </ProtectedRoute>
//         } />

//         <Route path="/expenses" element={
//           <ProtectedRoute>
//             <Expenses />
//           </ProtectedRoute>
//         } />

//         <Route path="/audit-logs" element={
//           <ProtectedRoute roles={["admin", "hr", "manager", "finance"]}>
//             <AuditLogs />
//           </ProtectedRoute>
//         } />

//         <Route path="/year-end" element={
//           <ProtectedRoute>
//             <YearEnd />
//           </ProtectedRoute>
//         } />

//         <Route path="/profile" element={
//           <ProtectedRoute>
//             <ProfilePage />
//           </ProtectedRoute>
//         } />

//         <Route path="/notifications" element={
//           <ProtectedRoute>
//             <Notifications />
//           </ProtectedRoute>
//         } />

//         <Route path="/reports" element={
//           <ProtectedRoute>
//             <ReportsPage />
//           </ProtectedRoute>
//         } />

//         <Route path="/settings" element={
//           <ProtectedRoute>
//             <SettingsPage />
//           </ProtectedRoute>
//         } />

//       </Route>

//       {/* AUTH */}
//       <Route path="/login" element={
//         <PublicRoute>
//           <Login />
//         </PublicRoute>
//       } />

//       <Route path="/register" element={
//         <PublicRoute>
//           <Register />
//         </PublicRoute>
//       } />

//       {/* FALLBACK */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

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

// ── AI Chat Widget ──────────────────────────────────────────
import AiChat from "./ai/AiChat";  // ← ADD THIS (place AiChat.jsx in src/ai/)

// Auth Pages
import { Login } from "./pages/Login";
import Register from "./pages/Register";

// Dashboard Pages
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Leave } from "./pages/Leave";
import Notifications from "./Notification//Notification";
import PendingLeaves from "./leave/pending-leave";
import ApprovedLeaves from "./leave/approved-leave";
import Expenses from "./Expenses/Expenses";
import DepartmentDashboard from "./department/DepartmentDashboard";
import Payroll from "./pyaroll/Payroll";
import YearEnd from "./YearEnd/YearEnd";
import AuditLogs from "./Audit/AuditLogs";
import { ProfilePage } from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import { PasswordResetPages } from "./pages/PasswordResetPages";
import AttendancePage from "./pages/AttendancePage";
import EmployeePayroll from "./pyaroll/EmployeePayroll";
import AdminPayroll from "./pyaroll/AdminPayroll";
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
import CompanyPage from './company/CompanyPage'
import PayrollDashboard from "./pyaroll/PayrollDashboard"





// Public Pages
import HomePage from "./pages/home";
import Features from "./Public/Features";
import Pricing from "./Public/Pricing";
import Demo from "./Public/Demo";
import About from "./Public/about";
import Privacy from "./Public/Privacy";
import Terms from "./Public/Terms";
import Security from "./Public/Security";
import Help from "./Public/help";
import Contact from "./Public/contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ─────────────────────────────────────────────────────────────
// AppRoutes — all page routing lives here
// ─────────────────────────────────────────────────────────────
function AppRoutes() {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/login", { replace: true });
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, [logout, navigate]);

  return (
    <>
      <Routes>
        <Route element={<Layout />}>

          {/* ── PUBLIC ─────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/forgot-password" element={<PasswordResetPages />} />
          <Route path="/reset-password" element={<PasswordResetPages />} />
          <Route path="/change-password" element={<PasswordResetPages />} />

          {/* ── PROTECTED ──────────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route
            path="/company"
            element={
              <ProtectedRoute roles={['Admin', 'HR']}>
                <CompanyPage />
              </ProtectedRoute>
            }
          />

          <Route path="/department-dashboard" element={
            <ProtectedRoute><DepartmentDashboard /></ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute>
              {["Admin", "HR", "Finance", 'Manager'].includes(user?.role?.toLowerCase())
                ? <AdminPayroll />
                : <EmployeePayroll />
              }
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute><AttendancePage /></ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute roles={["admin", "manager"]}><Users /></ProtectedRoute>
          } />

          <Route path="/leave" element={
            <ProtectedRoute><Leave /></ProtectedRoute>
          } />

          <Route path="/pending-leave" element={
            <ProtectedRoute roles={["manager", "admin", "hr"]}><PendingLeaves /></ProtectedRoute>
          } />

          <Route path="/approved-leave" element={
            <ProtectedRoute roles={["manager", "admin", "hr"]}><ApprovedLeaves /></ProtectedRoute>
          } />

          <Route path="/expenses" element={
            <ProtectedRoute><Expenses /></ProtectedRoute>
          } />

          <Route path="/audit-logs" element={
            <ProtectedRoute roles={["admin", "hr", "manager", "finance"]}><AuditLogs /></ProtectedRoute>
          } />

          <Route path="/year-end" element={
            <ProtectedRoute><YearEnd /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute><ReportsPage /></ProtectedRoute>
          } />
         

            <Route path="/analytics" element={
              <ProtectedRoute roles={["admin", "hr", "finance"]}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />

          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />

        </Route>

        {/* ── AUTH ───────────────────────────────────────────── */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* ── FALLBACK ───────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ── AI Chat Widget (only shown to logged-in users) ── */}
      {isAuthenticated && <AiChat />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// App — root providers
// ─────────────────────────────────────────────────────────────
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
