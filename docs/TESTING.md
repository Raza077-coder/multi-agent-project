<!--
  Created by: documentation-agent
  Role:       Technical Writer
-->
# TaskFlow — Testing Guide

## Test Layers

| Layer | Tool | Files |
|-------|------|-------|
| Unit — validation | Vitest | `tests/validation.test.ts` |
| Unit — JSON store | Vitest | `tests/json-store.test.ts` |
| Integration — Postgres | Vitest (skipped without `DATABASE_URL`) | `tests/postgres.integration.test.ts` |
| API smoke (E2E) | Node script | `scripts/smoke.mjs` |

## Running the Suite

```bash
# Unit tests (fast, no external services)
npm test

# Typecheck
npm run typecheck

# Lint
npm run lint

# Full CI (what GitHub Actions runs)
# typecheck → lint → unit tests → production build
npm run build
```

## API Smoke Test

The smoke script exercises the full lifecycle against a **running server**:
health → list → create project → validation rejection → create task → move →
patch → detail → delete task → delete project.

```bash
# Terminal 1 — start the server
npm run dev

# Terminal 2 — run the smoke test (default http://localhost:3000)
npm run smoke
# or against another base URL:
node scripts/smoke.mjs https://your-deployment.vercel.app
```

Exit code is `0` when every check passes, `1` otherwise.

## Postgres Integration Test

Runs the full CRUD lifecycle against a real database. It **skips automatically**
when `DATABASE_URL` is not set.

```bash
# Start Postgres via docker compose
docker compose up -d postgres

# Run with the database
DATABASE_URL=postgres://taskflow:taskflow@localhost:5432/taskflow npm test
```

> Note: the test creates and deletes its own records (project prefix
> `prj_`, tasks `tsk_`); it never touches seed data.

## CI Pipeline

`.github/workflows/ci.yml` runs on every push/PR to `main`:
checkout → setup-node (20, npm cache) → install → typecheck → lint → tests →
production build.
