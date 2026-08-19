# TaskFlow — Agent Roster & Collaboration Protocol

> **Built by:** `project-manager-agent` (Project Manager)
> **Project:** TaskFlow — Collaborative Task Management SaaS

This repository is the output of a **multi-agent system**: six specialized agents
collaborated to design, build, test, and document an industry-level application.
Every source file carries a header comment attributing it to the agent that
created it.

## The Six Agents

| # | Agent ID | Role | Core Deliverables |
|---|----------|------|-------------------|
| 1 | `project-manager-agent` | Project Manager | Product spec, agent protocol, file-ownership convention, coordination, release approval |
| 2 | `devops-agent` | DevOps Engineer | Build tooling, Docker, CI/CD (GitHub Actions), `vercel.json`, environment templates |
| 3 | `backend-developer-agent` | Backend Developer | Domain model, JSON/PostgreSQL persistence, Zod validation, REST API |
| 4 | `frontend-developer-agent` | Frontend Developer | Next.js app shell, API client, Dashboard, Kanban board UI |
| 5 | `qa-testing-agent` | QA / Testing Engineer | Unit tests, integration test, API smoke tests, typecheck + build verification |
| 6 | `documentation-agent` | Technical Writer | README, architecture, API reference, testing guide, Vercel deployment guide |

## Collaboration Protocol

1. **Trigger** — `project-manager-agent` defines the spec, architecture, and
   ownership convention, then initiates each phase in order.
2. **Pipeline** — `devops-agent` scaffolds tooling → `backend-developer-agent`
   implements the data layer and API → `frontend-developer-agent` consumes the
   API and builds the UI → `qa-testing-agent` verifies everything.
3. **Handoff** — each agent completes its deliverables, then the baton moves to
   the next agent. No agent starts before its dependency is finished.
4. **Review** — `qa-testing-agent` runs typecheck, unit tests, production build,
   and live API smoke tests. Defects are fixed by the owning agent.
5. **Release** — `documentation-agent` writes the docs, then
   `project-manager-agent` approves the release for upload and deployment.

## File Ownership / Attribution Convention

- Every source file begins with a header comment:

  ```ts
  /**
   * Created by: backend-developer-agent
   * Role:       Backend Developer
   */
  ```

- `agents/manifest.json` is the machine-readable roster of all agents and their
  responsibilities.
- Commit messages are prefixed with the owning agent, e.g.
  `backend-developer-agent: implement JSON store adapter`.
