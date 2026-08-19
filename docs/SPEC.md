# TaskFlow — Product Specification

> **Created by:** `project-manager-agent` (Project Manager)

## 1. Overview

TaskFlow is a collaborative **task management SaaS**. Teams create projects,
organize work into a Kanban board, and track progress with meaningful
statistics. The application is a full-stack Next.js app with a REST API and
pluggable persistence:

- **JSON file adapter** — zero-config local development (data persists to a
  local file, committed for demo purposes).
- **PostgreSQL adapter** — production-grade persistence via `pg` (used on
  Vercel with Postgres / Neon / Supabase).

## 2. Goals & Non-Goals

**Goals**

- Working end-to-end CRUD: projects and tasks.
- Kanban board with drag-friendly status columns (backlog, in-progress, review, done).
- Dashboard with aggregate statistics.
- Clean architecture: `types → validation → storage → API → UI`.
- Fully containerizable and deployable to Vercel.

**Non-Goals**

- User authentication / multi-tenancy (single-team SaaS shell).
- WebSockets / realtime collaboration.
- Complex permission model.

## 3. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | List, create, update, delete projects | Must |
| FR-2 | List, create, update, delete, reorder tasks within a project | Must |
| FR-3 | Move a task between statuses (Kanban) | Must |
| FR-4 | Dashboard shows totals + status breakdown + recent tasks | Must |
| FR-5 | Health endpoint reports status, timestamp, storage mode | Must |
| FR-6 | Validation errors return structured `{ message, issues }` | Must |
| FR-7 | Seed data on first run (JSON adapter) | Should |

## 4. Non-Functional Requirements

- **Performance** — API responses < 200ms on typical datasets; JSON store is
  cached in memory.
- **Reliability** — atomic file writes (write-temp-then-rename); Postgres
  adapter uses parameterized queries.
- **Maintainability** — strict TypeScript, shared types, single `DataStore`
  interface.
- **Testability** — unit tests for validation + storage, integration test for
  Postgres, API smoke script.

## 5. Architecture (high level)

```
┌──────────────────────────────┐
│  Next.js App Router UI       │  frontend-developer-agent
│  Dashboard + Kanban board    │
└──────────┬───────────────────┘
           │ fetch() / REST
┌──────────▼───────────────────┐
│  Route Handlers (/api/*)     │  backend-developer-agent
│  Zod validation              │
└──────────┬───────────────────┘
┌──────────▼───────────────────┐
│  DataStore interface         │  backend-developer-agent
│  JSON adapter | Postgres     │
└──────────────────────────────┘
```

## 6. Acceptance Criteria

- `npm run typecheck` passes with zero errors.
- `npm test` passes (unit + integration).
- `npm run build` produces a production build.
- Smoke script exercises the full CRUD lifecycle against a running server.
- App deploys to Vercel with `DATABASE_URL` set; runs without it using JSON mode.

## 7. Out of Scope for v1

- AuthN/AuthZ, billing, file uploads, notifications, i18n.
