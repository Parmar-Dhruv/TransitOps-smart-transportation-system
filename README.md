# 🚚 TransitOps — Smart Transportation & Fleet Management System

TransitOps is a modern, full-stack, enterprise-grade fleet management application designed to organize, dispatch, and analyze logistics operations. Powered by a responsive React/TypeScript frontend and an Express/PostgreSQL backend, TransitOps handles real-time assets, drivers, routing lifecycles, maintenance logs, fuel expenses, and role-based access security.

---

## ⚡ Core Features

- **📊 Dynamic Dashboard Overview:** Live KPI tracking (Total Revenue, Operational Cost, Net Profit, Fleet ROI, and Fleet Utilization rates) sourced directly from backend calculations with dynamic monthly cost trend charts.
- **🚛 Vehicles Asset Management:** Full CRUD suite (register, view details, modify parameters, soft-retire) with automatic data grid synchronization, pagination, and status filters (`Available`, `On Trip`, `In Shop`, `Retired`).
- **👥 Operator (Driver) Management:** Tracking names, contact info, licensing expiry countdowns, safety score ratings (0–100), and custom search matching.
- **🗺️ Interactive Trips Dispatcher:** End-to-end trip status lifecycle manager (`Draft` ➔ `In Transit` ➔ `Completed` or `Cancelled`) checking driver/vehicle availability, starting/ending odometers, cargo payloads, and cancellation logging.
- **🔧 Maintenance Scheduler:** Log vehicle defects, schedule repair costs, track start/completion timelines, and soft-delete logs.
- **⛽ Fuel Log Auditor:** Audit fuel consumption (liters, cost per liter, dynamic total cost estimation, odometer consistency).
- **💸 Operational Expense Ledger:** Categorize and track miscellaneous out-of-pocket costs (`Tolls`, `Parking`, `Allowances`, `Fines`, `Repairs`) linking them to specific vehicles or drivers.
- **📈 Analytics & CSV Export Reports:** Download real-time, database-generated CSV spreadsheets for vehicles, drivers, and trips alongside Recharts-driven cost vs. revenue breakdown graphs.
- **🔐 Secure RBAC (Role-Based Access Control):** Custom route guards restricting system views based on user privileges (e.g. only administrators can delete core logs).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React SPA, Vite, TypeScript, Tailwind CSS, TanStack React Table, Recharts, Lucide Icons, Axios, Sonner (Toast system) |
| **Backend** | Node.js (ESM), Express.js, Prisma ORM, Helmet (Security Headers), CORS, Express Rate Limit, Winston Logger, Zod (Schema Validator) |
| **Database** | PostgreSQL |
| **Testing** | Node.js Native Test Runner (Integration test suites) |

---

## 📁 Repository Structure

```text
TransitOps/
├── backend/                  # Express.js Application
│   ├── prisma/               # Database schemas, migrations, and seeds
│   ├── src/                  # Express server entry point, controllers, validations, routes
│   └── tests/                # Automated backend integration test suites
│
├── frontend/                 # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── api/              # Module-specific API services (Axios client)
│   │   ├── components/       # Custom shared UI (Modals, Tables, Status Badges)
│   │   ├── pages/            # Core feature views (Vehicles, Trips, Drivers, Reports)
│   │   ├── routes/           # RBAC Protected route middleware
│   │   └── types/            # App-wide TypeScript definitions
│   └── vite.config.ts        # Vite dev server proxies
│
├── database/sql/             # Sequential SQL migration files
└── docs/                     # API references, Setup instructions, Architecture diagrams
```

---

## 🔑 Seeded Test Credentials

To facilitate development and testing of the role-based interface views, the PostgreSQL database is pre-seeded with the following accounts:

| Operator Name | Email Address | Role | Password |
|---|---|---|---|
| **System Administrator** | `admin@transitops.com` | `ADMIN` | `admin123` |
| **Meera Shah** | `fleet@transitops.com` | `FLEET_MANAGER` | `transitops123` |
| **Rahul Patel** | `dispatcher@transitops.com` | `DISPATCHER` | `transitops123` |
| **Nisha Rao** | `safety@transitops.com` | `SAFETY_OFFICER` | `transitops123` |
| **Amit Desai** | `finance@transitops.com` | `FINANCIAL_ANALYST` | `transitops123` |

---

## 🚀 Installation & Quickstart

Follow these steps to run TransitOps locally:

### 1. Prerequisites
- **Node.js** (v18.x or above)
- **PostgreSQL** running locally (or in Docker)

### 2. Install Dependencies
Run the install command from the **root directory** of the project to bootstrap all workspaces:
```bash
npm run install:all
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory using the provided sample:
```bash
cp backend/.env.example backend/.env
```
Update the `DATABASE_URL` string in your newly created `backend/.env` file to match your PostgreSQL instance connection credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/transitops?schema=public"
JWT_SECRET="transitops-super-secure-local-jwt-secret-key"
PORT=5002
```

### 4. Push Schema & Seed Database
Ensure your PostgreSQL database server is active, then run:
```bash
# Push Prisma schema definitions
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed users and assets
npm run prisma:seed --prefix backend
```

### 5. Launch the Platform
Start the frontend dev server (defaulting to port `5174`/`5173`) and Express backend (port `5002`) simultaneously using the workspace script:
```bash
npm run dev:all
```

Navigate your browser to: **`http://localhost:5173`** (or `http://localhost:5174`).

---

## 🧪 Verification & Builds

- **Run Integration Tests:**
  ```bash
  npm run test --prefix backend
  ```
- **Build Frontend Assets:**
  ```bash
  npm run build --prefix frontend
  ```
