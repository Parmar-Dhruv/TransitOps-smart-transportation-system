import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const mapBackendToFrontendRole = (role: string): string => {
  const map: Record<string, string> = {
    "ADMIN": "Admin",
    "FLEET_MANAGER": "Fleet Manager",
    "DISPATCHER": "Dispatcher",
    "SAFETY_OFFICER": "Safety Officer",
    "FINANCIAL_ANALYST": "Financial Analyst"
  };
  return map[role] || role;
};

export const RoleGuard = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRoleNormalized = mapBackendToFrontendRole(user.role);
  const normalizedAllowedRoles = allowedRoles.map(mapBackendToFrontendRole);

  if (!normalizedAllowedRoles.includes(userRoleNormalized) && userRoleNormalized !== "Admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4 text-center">
        <div>
          <h1 className="text-4xl font-bold text-destructive">403</h1>
          <p className="mt-4 text-lg text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
