# TransitOps - Database Schema & Configurations

This directory contains the database definition files, schema migrations, and helper seed scripts used for the Smart Transport Operations Platform.

## Directory Structure
- `sql/`: Chronological raw SQL DDL/DML scripts (extensions, enums, tables, indexes, triggers, seed values, and views).
- `schema/`: Location for ER diagrams, documentation, and metadata files.
- `seed/`: Local data dumps.

## Seeding & Migrating
The API server manages schema definitions and database seeding via **Prisma Client**.
- The main Prisma schema is located in `backend/prisma/schema.prisma`.
- Seed logic is configured in `backend/prisma/seed.js`.
