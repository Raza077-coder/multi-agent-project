<!--
  Created by: documentation-agent
  Role:       Technical Writer
-->
# TaskFlow — GitHub Push & Vercel Deployment Guide

Everything in this repository was built by a **six-agent AI system** and is
committed locally with **7 clean per-agent commits** on branch `main`
(51 files). This guide contains the exact commands to publish it to GitHub
and deploy it to Vercel.

---

## 1. Create the GitHub repository (one time)

GitHub username: **Raza077-coder** · Target repo: **multi-agent-project**

### Option A — Dashboard (easiest)

1. Go to https://github.com/new
2. Repository name: `multi-agent-project`
3. Description: `TaskFlow — collaborative task management SaaS built by a 6-agent AI system`
4. Visibility: **Public** (or Private — your choice)
5. Do **NOT** tick "Add a README" / ".gitignore" / "license" (the repo already has them)
6. Click **Create repository**

### Option B — GitHub CLI

```bash
gh repo create multi-agent-project --public --source . --remote origin --push
```

### Option C — Composio GitHub MCP (in a Teamily agent run)

The GitHub connection is already authorized (profile connected to
Raza077-coder). A future agent run can call:

```
GITHUB_CREATE_REPOSITORY  name=multi-agent-project, private=false, auto_init=false
```

then push each commit with `GITHUB_COMMIT_MULTIPLE_FILES` (or use the
instructions below from any machine with git).

---

## 2. Push the local repository (one command from any terminal)

The sandbox repo at `/workspace/multi-agent-project` already has all 7
commits. From the project root:

```bash
cd multi-agent-project
git remote add origin https://github.com/Raza077-coder/multi-agent-project.git
git branch -M main
git push -u origin main
```

> If you get an authentication prompt, use a **Personal Access Token**
> (Settings → Developer settings → Personal access tokens → fine-grained,
> scopes: `repo`, `contents:write`) as the password.

The 7 commits you'll see on GitHub:

| Commit | Author agent |
|--------|--------------|
| `devops-agent: scaffold build tooling, Docker, CI and env templates` | DevOps |
| `backend-developer-agent: implement data layer, validation and REST API` | Backend |
| `frontend-developer-agent: implement dashboard and kanban board UI` | Frontend |
| `qa-testing-agent: add unit/integration tests and API smoke script` | QA |
| `project-manager-agent: define blueprint, spec and agent protocol` | PM |
| `documentation-agent: write project, architecture, API, testing and deployment docs` | Docs |
| `devops-agent: add package-lock.json for reproducible builds` | DevOps |

---

## 3. Deploy to Vercel

### Dashboard (recommended)

1. Go to **https://vercel.com/new** and sign in (GitHub login is fastest)
2. Click **Import** next to `Raza077-coder/multi-agent-project`
3. Framework auto-detected: **Next.js** (settings from `vercel.json` are applied)
4. Add environment variables (**Project → Settings → Environment Variables**):

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATA_MODE` | `json` | Production (and Preview/Development for demos) |
   | `DATABASE_URL` | `postgres://…` (only if using Postgres) | Production |

   > Zero-config demo: **no env vars needed** — it defaults to JSON mode with
   > seed data. Use Postgres for durable production data.
5. Click **Deploy** → you get `https://multi-agent-project.vercel.app`
6. Every future `git push` to `main` auto-deploys.

### CLI

```bash
npm i -g vercel
vercel login
cd multi-agent-project
vercel link
vercel env add DATA_MODE      # paste: json
vercel env add DATABASE_URL   # optional, only for postgres mode
vercel --prod
```

### Verify

```bash
curl https://<your-app>.vercel.app/api/health
node scripts/smoke.mjs https://<your-app>.vercel.app   # full CRUD smoke test
```

> ⚠️ JSON mode on Vercel writes to an ephemeral filesystem — data resets on
> redeploys. For persistent data, set `DATA_MODE=postgres` with a Neon /
> Supabase / Vercel Postgres database (schema auto-creates on first request).

---

## 4. Docker alternative (non-Vercel)

```bash
docker compose up --build   # app on :3000, Postgres on :5432
```
