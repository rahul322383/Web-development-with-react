

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 1. Wait for auth to resolve — render nothing (or a spinner)
  if (isLoading) return null;

  // 2. Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role check (only if `roles` prop is provided)
  if (roles && roles.length > 0) {
    const userRoles = user?.roles ?? (user?.role ? [user.role] : []);
    const hasRole = userRoles.some(r => roles.includes(r));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};