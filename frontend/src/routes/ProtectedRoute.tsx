import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";

const Forbidden = () => (
  <div className="flex h-screen items-center justify-center bg-background p-4 text-center">
    <div>
      <h1 className="text-4xl font-bold text-destructive">403</h1>
      <p className="mt-4 text-lg text-muted-foreground">You do not have permission to access this page.</p>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleGuard = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Forbidden />;
  }

  return <Outlet />;
};
