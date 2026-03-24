import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};