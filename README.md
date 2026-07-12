# TransitOps - Smart Transport Operations Platform

TransitOps is a production-quality, modular fleet operations and transport management platform designed for hackathons and scalable enterprise deployments.

---

## Workspace Directory Structure

The repository is structured as a modular workspace:

- **`backend/`**: Express.js REST API with Prisma ORM, JWT authentication, RBAC, strict Zod validations, audit logs, and sequential integration tests.
- **`frontend/`**: Vite + React 19 + TypeScript Single Page Application (SPA) with styled layout screens, live queries, and theme contexts.
- **`database/`**: DDL schemas, indexes, views, enums, triggers, and mock seed files.
- **`docs/`**: API specifications, setup guides, architectural outlines, and quality verification logs.

---

## Getting Started

### 1. Boot the Database
Start the PostgreSQL container listening on port `5433`:
```bash
docker start transitops-postgres-5433
```

### 2. Install Workspace Packages
Bootstrap all required dependencies:
```bash
npm run install:all
```

### 3. Run Dev Clients
Launch both servers concurrently:
```bash
npm run dev:all
```
- **Backend API**: `http://localhost:5002`
- **Frontend Client**: `http://localhost:5173`
- **Interactive Swagger Docs**: `http://localhost:5002/api-docs`

---

## Commands Reference

Run workspace commands from the root repository:
- `npm run dev:backend`: Launch Express API server (nodemon).
- `npm run dev:frontend`: Launch Vite React dev client.
- `npm run test:backend`: Run Express integration tests.
- `npm run build:frontend`: Compile TypeScript assets for production.
- `npm run prisma:push`: Synchronize database schema.
- `npm run prisma:seed`: Repopulate admin credentials.
