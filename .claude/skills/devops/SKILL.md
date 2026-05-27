---
name: devops
description: Configure the Cogna MVP infrastructure — Turborepo, Vercel deploy, Supabase project, environment variables, CI on GitHub Actions, preview deploys, monorepo build pipeline, and local dev setup. Use when the user asks to deploy, set up CI, configure env vars, debug a build, add a workspace package, or wire up Vercel + Supabase.
---

# DevOps — Cogna MVP

You keep the build green, the deploys boring, and the developer setup under five minutes.

## Hard constraint — 100% free tier

The pilot runs entirely on **free tiers** (see `/Claude.md` → "Hard Constraint — 100% Free Tier"). This shapes every choice:

- **Vercel Hobby** for hosting — no paid add-ons, no team seats.
- **Supabase Free** for DB / Auth / Storage / Realtime / Edge Functions.
- **GitHub Actions free minutes** — keep CI under 5 min per run.
- **No paid SaaS** in the toolchain (no Sentry, Chromatic, Resend, Datadog, etc).
- **Domain stays on `*.vercel.app`** until the pilot graduates.

Surface the cost implications of any new tool before adding it. If a feature can't ship on free tier, it doesn't ship in MVP.

### Supabase Free — operational gotchas

- Project **auto-pauses after 7 days of inactivity**. Add a tiny scheduled job (GitHub Action cron or `pg_cron`) that hits the DB once a week during the pilot.
- Cap **DB size at 500 MB**, **storage at 1 GB**, **egress at 2 GB/month**. Add a dashboard widget that surfaces current usage to the team.
- Edge Functions cap at **500 k invocations/month** — rate-limit on the function side, not just the client.

## Stack (locked)

| Concern | Tool |
|---------|------|
| Monorepo | **Turborepo** + **pnpm workspaces** |
| Hosting (web) | **Vercel** |
| Hosting (DB + Auth + Storage + Realtime) | **Supabase** |
| CI | **GitHub Actions** |
| Node | **20 LTS** |
| Package manager | **pnpm** (locked via `packageManager` field) |

## Repo layout (matches `Claude.md`)

```
/
├── apps/
│   └── web/                 # Next.js app
├── packages/
│   ├── ui/                  # shared shadcn components
│   ├── database/            # supabase migrations + generated types
│   └── types/               # zod schemas + shared TS types
├── brand/                   # logo + brand README
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## `turbo.json` baseline

Pipelines: `build`, `dev`, `lint`, `typecheck`, `test`. `build` and `typecheck` depend on `^build` (upstream packages first). Dev is `persistent` and `cache: false`.

## Environments

Three Supabase projects: **local** (CLI), **preview** (per-PR branch), **production**.

Three Vercel environments mirror that: development, preview, production.

### Required environment variables

| Var | Where | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | **never** ship to client; used by Edge Functions and admin scripts |
| `ANTHROPIC_API_KEY` | Edge Functions only | for the light AI features |

Document these in `.env.example` at the repo root and at `apps/web/.env.example`. Never commit a real `.env`.

## Vercel config

- Root directory: repository root.
- Build command: `pnpm turbo run build --filter=web...`
- Output directory: `apps/web/.next`
- Install command: `pnpm install --frozen-lockfile`
- Ignored build step: skip when no files in `apps/web` or its deps changed (`pnpm dlx turbo-ignore web`).
- Preview deploys: on by default, scoped Supabase env per branch.

## GitHub Actions (MVP CI)

One workflow, `ci.yml`, runs on PR and push to `main`:

```yaml
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node@v4 (node 20, cache pnpm)
      - setup-pnpm@v3
      - pnpm install --frozen-lockfile
      - pnpm turbo run lint typecheck test
```

Do not gate merges on E2E in MVP — keep the loop fast. E2E lives in the `qa-tester` skill and runs on a nightly cron.

## Local dev — five-minute setup

1. `pnpm install`
2. `cp .env.example .env.local` and fill in (Supabase local CLI gives you values)
3. `pnpm supabase start` (starts local Postgres + Auth + Storage)
4. `pnpm db:migrate` (applies migrations)
5. `pnpm dev` (Turborepo runs `apps/web`)

Document any deviation in the project README.

## Deploy checklist

- [ ] Migrations applied to target Supabase project
- [ ] Types regenerated and committed
- [ ] Env vars set in Vercel for that environment
- [ ] Edge Functions deployed via `pnpm supabase functions deploy`
- [ ] Storage bucket exists with the policies from `backend-developer`
- [ ] Realtime publication includes the right tables

## Anti-patterns (reject)

- Service-role key in `NEXT_PUBLIC_*` — instant security incident.
- Custom Docker setup for Postgres — use Supabase CLI.
- Per-app `tsconfig` with no shared base — extend from a root `tsconfig.base.json`.
- Adding a new package without adding it to `pnpm-workspace.yaml`.
- Skipping `pnpm-lock.yaml` commits — lockfile drift breaks preview deploys.

## Deliverables (per request)

- Config diff (concrete file paths, concrete content)
- Env var list with where each goes (client / server / Edge Function)
- Verification step the user can run to confirm it works
