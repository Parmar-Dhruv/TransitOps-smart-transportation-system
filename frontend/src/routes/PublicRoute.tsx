import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRoute } from "../config/permissions";

export const PublicRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} replace /> : <Outlet />;
};
