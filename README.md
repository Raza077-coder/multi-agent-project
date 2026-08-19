<!--
  Created by: documentation-agent
  Role:       Technical Writer
-->
# TaskFlow — Collaborative Task Management SaaS

> Built by a **six-agent AI system**: Project Manager, DevOps Engineer, Backend
> Developer, Frontend Developer, QA/Testing Engineer, and Technical Writer
> collaborated to design, build, test, and document this application.

**TaskFlow** is a full-stack task management SaaS. Teams create projects,
organize work on a Kanban board, and track progress with live statistics.

- 🗂️ **Projects** — create, edit, delete, and track progress with completion rates
- 📋 **Kanban boards** — four columns: Backlog → In Progress → In Review → Done
- 🎯 **Priorities** — low / medium / high on every task
- 📊 **Dashboard** — aggregate stats and per-project progress
- 🔌 **Pluggable storage** — JSON file (zero-config) or PostgreSQL (production)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js Route Handlers (REST API under `/api`) |
| Validation | Zod |
| Storage | JSON file adapter (dev) / PostgreSQL via `pg` (production) |
| Tests | Vitest (unit + integration), Node smoke script |
| CI/CD | GitHub Actions, Docker, Vercel |

## Agent Roster

| Agent | Role | Owns |
|-------|------|------|
| `project-manager-agent` | Project Manager | Spec, blueprint, coordination, release approval |
| `devops-agent` | DevOps Engineer | Tooling, Docker, CI, Vercel config, env templates |
| `backend-developer-agent` | Backend Developer | Domain model, storage adapters, REST API |
| `frontend-developer-agent` | Frontend Developer | App shell, Dashboard, Kanban board UI |
| `qa-testing-agent` | QA / Testing Engineer | Unit/integration tests, smoke script, verification |
| `documentation-agent` | Technical Writer | README, architecture, API, deployment guides |

Every source file carries a header comment attributing it to the agent that
created it. See [`AGENTS.md`](./AGENTS.md) and [`agents/manifest.json`](./agents/manifest.json).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (JSON storage, zero config — seed data included)
npm run dev
# → http://localhost:3000
```

The app starts with three seeded projects and nine tasks so you can explore
immediately.

### Use PostgreSQL instead

```bash
cp .env.example .env.local
# Set DATA_MODE=postgres and DATABASE_URL=postgres://user:pass@host:5432/taskflow
npm run dev
```

The schema is created automatically on first use.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite (Vitest) |
| `npm run smoke` | API smoke test against a running server |

## Project Structure

```
.
├── agents/                 # Agent manifest (machine-readable roster)
├── docs/                   # Spec, agent-system, architecture, API, deployment
├── src/
│   ├── app/                # Next.js App Router (pages + API routes)
│   │   ├── api/            # REST API: health, projects, tasks, move
│   │   └── projects/[id]/  # Kanban board page
│   ├── components/         # UI components (modals, badges)
│   ├── lib/
│   │   ├── api/            # Response helpers
│   │   ├── client/         # Typed API client + formatters
│   │   ├── db/             # DataStore interface, JSON + Postgres adapters
│   │   └── validation/     # Zod schemas
│   └── types/              # Domain types
├── tests/                  # Vitest unit + integration tests
├── scripts/smoke.mjs       # API smoke test
├── Dockerfile              # Multi-stage production image
├── docker-compose.yml      # App + Postgres
└── vercel.json             # Vercel configuration
```

## Deployment

- **Vercel (recommended)** → see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Docker** → `docker compose up --build` (app on :3000, Postgres on :5432)
- **GitHub Actions** → CI runs typecheck, lint, tests, and build on every push

## License

MIT
