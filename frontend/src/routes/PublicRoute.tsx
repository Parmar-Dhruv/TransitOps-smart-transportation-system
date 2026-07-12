import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Skeleton or blank during rehydration

  // Unauthenticated users hit this. Authenticated get bounced to Dashboard.
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
