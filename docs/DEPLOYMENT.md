<!--
  Created by: documentation-agent
  Role:       Technical Writer
  Co-authored by: devops-agent (commands verified)
-->
# TaskFlow — Vercel Deployment Guide

This guide walks you through deploying TaskFlow to Vercel two ways:
**Option A — Dashboard (no installs)** and **Option B — Vercel CLI**.

> ✅ The repo is pre-configured: `vercel.json` (framework: `nextjs`),
> `next.config.ts` (keeps `pg` external), and `serverExternalPackages`.
> No code changes are required.

---

## Prerequisites

1. A **Vercel account** → https://vercel.com/signup (login with GitHub is fastest)
2. The repository pushed to GitHub:
   `https://github.com/Raza077-coder/multi-agent-project`
3. (Optional, for production storage) a **Postgres database** — e.g.
   [Neon](https://neon.tech), [Supabase](https://supabase.com), or
   [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

## Option A — Deploy from the Dashboard (recommended)

1. Go to **https://vercel.com/new**
2. Click **Import** next to your `multi-agent-project` repository
   (authorize Vercel to access your GitHub repos if prompted).
3. Vercel auto-detects the framework: **Next.js**
   - Build Command: `npm run build` (already set by `vercel.json`)
   - Output Directory: leave default
4. Click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `DATA_MODE` | `json` (or `postgres` for production storage) |
   | `DATABASE_URL` | *(only if `DATA_MODE=postgres`)* `postgres://…` |

   > **No env vars needed for a quick demo** — the app defaults to `json` mode
   > with seed data. Use Postgres only if you want persistent production data.
5. Click **Deploy**. Vercel builds the app and gives you a URL, e.g.
   `https://multi-agent-project.vercel.app`
6. Open the URL, click through to a project board, and confirm tasks load.

### Redeploy on every push

Vercel watches the GitHub repo — every push to `main` triggers an automatic
production deploy. That's it.

---

## Option B — Vercel CLI

```bash
# 1. Install the CLI (one time)
npm i -g vercel

# 2. Log in (opens browser)
vercel login

# 3. From the project root, link the project
cd multi-agent-project
vercel link
# → select "Existing project" (or create a new one), name: multi-agent-project

# 4. Add environment variables
vercel env add DATA_MODE
#   → paste: json          (or postgres)

vercel env add DATABASE_URL
#   → paste: postgres://user:pass@host:5432/taskflow   (only for postgres mode)

# 5. Promote env vars to all environments
vercel env pull .env.local

# 6. Preview deployment
vercel

# 7. Production deployment
vercel --prod
```

The CLI prints your production URL, e.g.
`https://multi-agent-project.vercel.app` — deploy with your own custom domain
via **Project → Settings → Domains**.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATA_MODE` | no | `json` | `json` (file) or `postgres` (database) |
| `DATABASE_URL` | only for `postgres` | — | PostgreSQL connection string |
| `JSON_DB_PATH` | no | `./data/db.json` | JSON file location (dev/preview) |

> ⚠️ **Important:** with `DATA_MODE=json` on Vercel, the JSON file is written
> to the serverless filesystem, which is **ephemeral** — data resets on cold
> starts/deploys. For durable data in production, set `DATA_MODE=postgres`
> and add `DATABASE_URL` (Neon/Supabase/Vercel Postgres). The schema is
> created automatically on first request.

---

## Post-Deploy Verification

```bash
# Health check
curl https://<your-app>.vercel.app/api/health
# → {"status":"ok","service":"taskflow","storageMode":"json","timestamp":"…"}

# Full API smoke test against the live deployment
npm run smoke
node scripts/smoke.mjs https://<your-app>.vercel.app
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails on `pg` module | `next.config.ts` must contain `serverExternalPackages: ["pg"]` (it does) |
| `DATA_MODE=postgres` but API 500s | Confirm `DATABASE_URL` is set in **Production** env in Vercel; check the URL has no trailing spaces |
| Data resets after redeploys | You're on `json` mode — switch to `postgres` for persistent storage |
| Deploy stuck on "Building" | Re-run from the Vercel dashboard → **Redeploy**; check build logs |

---

## Also Available: Docker

Not on Vercel? Run it anywhere with containers:

```bash
docker compose up --build
# app → http://localhost:3000   (JSON mode)
# Postgres → localhost:5432 (taskflow/taskflow)
```

To use the containerized Postgres: set `DATA_MODE=postgres` and
`DATABASE_URL=postgres://taskflow:taskflow@postgres:5432/taskflow` on the
`app` service in `docker-compose.yml`.
