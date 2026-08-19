# TaskFlow — Multi-Agent System Guide

> **Created by:** `project-manager-agent` (Project Manager)

This document explains **how the multi-agent system works**: how six
specialized agents collaborate, how ownership is tracked, and how the pipeline
produced this repository.

## 1. Agent Roles

| Agent | Specialty | Owns |
|-------|-----------|------|
| `project-manager-agent` | Planning, architecture, coordination | `agents/`, `AGENTS.md`, `docs/SPEC.md`, `docs/AGENT-SYSTEM.md` |
| `devops-agent` | Tooling, containers, CI/CD | `package.json`, `tsconfig.json`, `next.config.*`, `tailwind`/`postcss`/`eslint` configs, `Dockerfile`, `docker-compose.yml`, `vercel.json`, `.github/workflows/*`, `.env.example`, `.gitignore` |
| `backend-developer-agent` | Domain model, storage, API | `src/types/*`, `src/lib/db/*`, `src/lib/validation/*`, `src/lib/api/*`, `src/app/api/*`, seed data |
| `frontend-developer-agent` | UI | `src/app/*` (pages), `src/components/*`, `src/lib/client/*`, `src/app/globals.css`, layout, favicon |
| `qa-testing-agent` | Verification | `tests/*`, `scripts/smoke.mjs`, CI quality gates |
| `documentation-agent` | Writing | `README.md`, `docs/*.md` |

## 2. How the Pipeline Ran

```
PM defines spec + protocol
        |
        ▼
DevOps scaffolds tooling ──► Backend builds data layer + API
                                      |
                                      ▼
                              Frontend builds UI (consumes API)
                                      |
                                      ▼
                        QA runs typecheck / tests / build / smoke
                                      |
                                      ▼
                        Docs written ──► PM approves release
                                      |
                                      ▼
                        Git: 6 clean commits (one per agent)
                        Upload to github.com/Raza077-coder/multi-agent-project
```

## 3. Ownership & Attribution

1. **Header comments** — every source file starts with `Created by: <agent-id>`.
2. **Manifest** — `agents/manifest.json` lists every agent, role, and color.
3. **Commits** — one commit per agent, prefixed with the agent id:
   - `project-manager-agent: define blueprint, spec, and agent protocol`
   - `devops-agent: scaffold build tooling and CI/CD`
   - `backend-developer-agent: implement data layer and REST API`
   - `frontend-developer-agent: implement dashboard and kanban UI`
   - `qa-testing-agent: add tests and verify build`
   - `documentation-agent: write project documentation`

## 4. Extending the System

To add a seventh agent (e.g. a security reviewer), edit
`agents/manifest.json`, add the header convention, and insert its phase in the
pipeline order above.
