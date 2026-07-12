import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute, RoleGuard } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

// Pages
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
import NotFoundPage from "../pages/NotFoundPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route pointing to root to redirect to dash or login depending on auth state */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Example Role Guards */}
            <Route element={<RoleGuard allowedRoles={["Fleet Manager", "Safety Officer", "Admin"]} />}>
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/trips" element={<TripsPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["Fleet Manager", "Admin"]} />}>
              <Route path="/maintenance" element={<MaintenancePage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["Financial Analyst", "Admin"]} />}>
              <Route path="/fuel" element={<FuelPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
