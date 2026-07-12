# Setup Guide for TransitOps Workspace

This guide details how to configure, bootstrap, and run the divided project workspace.

---

## Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose (for the PostgreSQL container)

---

## 1. Database Initialization
Ensure your PostgreSQL Docker container is started and listening on port `5433`:
```bash
docker start transitops-postgres-5433
```

---

## 2. Workspace Installation
Execute the workspace setup command from the repository root to bootstrap both modules:
```bash
npm run install:all
```
This script automatically navigates into the `backend/` and `frontend/` subdirectories and triggers `npm install` inside each of them.

---

## 3. Run Development Servers
You can boot both servers concurrently in a single terminal process:
```bash
npm run dev:all
```

Alternatively, you can run each module separately:
- **Backend Express API** (nodemon on port 5002): `npm run dev:backend`
- **Frontend React Client** (Vite on port 5173): `npm run dev:frontend`

---

## Workspace Script Index

Orchestrate the entire platform directly from the root repository using these root scripts:

| Command | Action | CWD Context |
|---------|--------|-------------|
| `npm run install:all` | Bootstrap backend and frontend dependencies | Root |
| `npm run dev:all` | Run backend and frontend concurrently | Root |
| `npm run dev:backend` | Launch nodemon Express development API | Root -> `backend/` |
| `npm run dev:frontend` | Launch Vite React dev server | Root -> `frontend/` |
| `npm run test:backend` | Execute integration test suites | Root -> `backend/` |
| `npm run build:frontend` | Compile TypeScript and bundle frontend assets | Root -> `frontend/` |
| `npm run prisma:push` | Synchronize Prisma schema variables to PostgreSQL | Root -> `backend/` |
| `npm run prisma:seed` | Seed default admin credentials to database | Root -> `backend/` |
