import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export const PublicRoute = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return accessToken ? <Navigate to="/dashboard" replace /> : children;
};