import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRoles = [
      ...(user?.roles || []),
      ...(user?.role ? [user.role] : []),
      ...(user?.primaryRole ? [user.primaryRole] : []),
    ];

    const normalizedUserRoles = userRoles.map(r =>
      String(r).toLowerCase()
    );

    const normalizedAllowedRoles = roles.map(r =>
      String(r).toLowerCase()
    );

    const hasRole = normalizedUserRoles.some(role =>
      normalizedAllowedRoles.includes(role)
    );

    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};