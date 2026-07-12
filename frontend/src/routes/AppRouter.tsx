import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute, RoleGuard } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { getDefaultRoute, APP_MODULES } from "../config/permissions";
import { useAuth } from "../hooks/useAuth";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DashboardPage from "../pages/DashboardPage";
import VehiclesPage from "../pages/VehiclesPage";
import DriversPage from "../pages/DriversPage";
import TripsPage from "../pages/TripsPage";
import MaintenancePage from "../pages/MaintenancePage";
import FuelPage from "../pages/FuelPage";
import ExpensesPage from "../pages/ExpensesPage";
import ReportsPage from "../pages/ReportsPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

const modulePages = {
  dashboard: <DashboardPage />,
  vehicles: <VehiclesPage />,
  drivers: <DriversPage />,
  trips: <TripsPage />,
  maintenance: <MaintenancePage />,
  fuel: <FuelPage />,
  expenses: <ExpensesPage />,
  reports: <ReportsPage />
};

const HomeRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? getDefaultRoute(user?.role) : "/login"} replace />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            {APP_MODULES.map((module) => (
              <Route key={module.id} element={<RoleGuard allowedRoles={module.allowedRoles} />}>
                <Route path={module.path} element={modulePages[module.id]} />
              </Route>
            ))}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
