# TransitOps API Reference

This document summarizes the REST API paths, authorization rules, and endpoints hosted by the Express backend.

---

## Swagger UI Documentation
An interactive Swagger UI dashboard is available locally for request modeling and testing.
- **URL**: `http://localhost:5002/api-docs`
- **Auth Flow**: Authenticate via `POST /auth/login`, copy the JWT `"token"` from the response, click **Authorize** at the top of the Swagger page, and paste the token as `Bearer <token>`.

---

## Core Base URLs
- **Backend API Server**: `http://localhost:5002`
- **Frontend Client Dev**: `http://localhost:5173`

---

## API Endpoints List

### 1. Authentication (`/auth/...`)
- `POST /auth/login` (Public, rate limited) - Login and obtain token.
- `POST /auth/logout` (Auth Required) - Logout current session.
- `GET /auth/me` (Auth Required) - Get details of current user.
- `POST /auth/register-user` (Auth Required, Admin only) - Create a new portal user (e.g. Fleet Manager, Dispatcher).

### 2. Fleet & Driver Assets
- `GET /vehicles` - Query list of vehicles.
- `POST /vehicles` (Admin, Fleet Manager) - Register new vehicle.
- `GET /vehicles/:id` - Retrieve vehicle details.
- `DELETE /vehicles/:id` (Admin, Fleet Manager) - Soft-delete (retire) a vehicle.
- `GET /drivers` - Query list of drivers.
- `POST /drivers` (Admin, Fleet Manager, Safety Officer) - Register new driver.

### 3. Operational Control (`/api/v1/...`)
- `POST /api/v1/trips` - Create trip draft.
- `POST /api/v1/trips/:id/dispatch` - Dispatch trip (converts vehicle/driver to `ON_TRIP`).
- `POST /api/v1/trips/:id/complete` - Mark trip completed (releases vehicle/driver).
- `POST /api/v1/trips/:id/cancel` - Cancel active trip.
- `POST /api/v1/maintenance` - Schedule vehicle maintenance.
- `POST /api/v1/maintenance/:id/start` - Start maintenance (converts vehicle to `IN_SHOP`).
- `POST /api/v1/maintenance/:id/complete` - Restore vehicle to `AVAILABLE`.
- `POST /api/v1/fuel` - Log vehicle fuel refill (calculates total cost).
- `POST /api/v1/expenses` - Record ledger expense items (validates same-day duplicates).

### 4. Dashboards & Reports
- `GET /api/v1/dashboard` - Get combined KPI metrics and charts data.
- `GET /api/v1/reports/fleet` - Get fleet summary statistics.
- `GET /api/v1/reports/export/vehicles` - Download vehicles operational report as CSV.
- `GET /api/v1/reports/export/drivers` - Download drivers report as CSV.
- `GET /api/v1/reports/export/trips` - Download trips report as CSV.
