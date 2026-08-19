<!--
  Created by: documentation-agent
  Role:       Technical Writer
-->
# TaskFlow — Architecture

## System Overview

TaskFlow is a server-rendered Next.js application with a REST API and
pluggable persistence. The UI never touches storage directly — every mutation
flows through the API, which validates input with Zod and delegates to a
`DataStore` adapter.

```
┌──────────────────────────────────────────────┐
│              Next.js App Router               │
│                                                │
│  Dashboard (/api/projects)                    │
│  Kanban board (/projects/:id)                 │
│         │                                      │
│         ▼                                      │
│  Typed API client (src/lib/client/api.ts)     │
└─────────────────────┬──────────────────────────┘
                      │ fetch() — REST
┌─────────────────────▼──────────────────────────┐
│        Route Handlers  (/api/*)                │
│        runtime: nodejs                          │
│  Zod validation → DataStore methods             │
└─────────────────────┬──────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────┐
│           DataStore interface                   │
│  ┌──────────────────┐ ┌──────────────────┐      │
│  │  JsonFileStore    │ │ PostgresStore    │      │
│  │  (dev, default)   │ │ (production)     │      │
│  └──────────────────┘ └──────────────────┘      │
└──────────────────────────────────────────────────┘
```

## Storage Selection

`src/lib/db/index.ts` selects the adapter from the environment:

| `DATA_MODE` | Adapter | Requirements |
|-------------|---------|--------------|
| `json` (default) | `JsonFileStore` | None — writes `data/db.json` |
| `postgres` | `PostgresStore` | `DATABASE_URL` connection string |

The JSON store uses atomic writes (write temp file → rename) and an in-memory
cache to keep reads fast. The Postgres store creates its schema automatically
(`CREATE TABLE IF NOT EXISTS`) and uses parameterized queries exclusively.

## Data Model

### Project

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `prj_<timestamp><random>` |
| `name` | string | 1–120 chars |
| `description` | string | ≤ 2000 chars |
| `color` | string | hex, e.g. `#6366f1` |
| `createdAt` / `updatedAt` | ISO string | server-set |

### Task

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `tsk_<timestamp><random>` |
| `projectId` | string | FK → projects.id (cascade delete) |
| `title` | string | 1–200 chars |
| `description` | string | ≤ 4000 chars |
| `status` | enum | `backlog` · `in-progress` · `review` · `done` |
| `priority` | enum | `low` · `medium` · `high` |
| `order` | number | sort order within its status column |
| `createdAt` / `updatedAt` | ISO string | server-set |

## API Envelope

All responses use `{ "data": ... }` on success. Errors use
`{ "error": "...", "issues": [...] }` (400) or `{ "error": "..." }`
(404 / 500).

## Design Decisions

1. **Pluggable storage** — a single `DataStore` interface keeps persistence
   swappable; the app runs zero-config locally and production-ready on Vercel
   + Postgres.
2. **Server-side validation** — Zod schemas live with the API, so bad input
   never reaches storage.
3. **No ORM** — plain parameterized SQL keeps the Postgres adapter dependency-
   light and transparent.
4. **`serverExternalPackages: ["pg"]`** — keeps the native driver external in
   the serverless build.
