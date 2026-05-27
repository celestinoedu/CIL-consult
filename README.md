# Cogna — v0.1

A minimal, AI-ready operational **Kanban workspace**.

This is the first iteration of the pilot. It focuses on **task management** with the basic project-management concepts: projects, Kanban boards with drag-and-drop, tasks with priority / due date / assignee / labels, subtasks with progress, threaded comments, an activity log, and a lightweight dashboard.

Read the product brief at [`/Claude.md`](./Claude.md). Role-based playbooks live in [`/.claude/skills`](./.claude/skills).

---

## Getting started

```bash
pnpm install
pnpm dev
```

App runs at <http://localhost:3000>. The first visit redirects to `/dashboard`.

Other scripts:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # next lint
pnpm build       # production build
```

Node 20+ and pnpm 9+ are recommended.

---

## What's in v0.1

| Surface | What you can do |
|---------|-----------------|
| **Dashboard** | See total / completed / in-progress / overdue counts, the next six deadlines, and a per-project progress snapshot. |
| **Projects** | List, search, archive, favorite, create, delete. Each new project ships with the five default columns. |
| **Kanban board** | Drag-and-drop tasks between columns (dnd-kit), add new columns, rename/delete columns, quick-add tasks per column. |
| **Task modal** | Title, rich description, priority, status (column), assignee, due date, labels, subtasks (with progress bar), threaded comments, activity log, delete. |
| **Sidebar** | Workspace card, dashboard / projects nav, favorites section, scrollable project list, current user. |
| **Settings** | Read-only workspace info, account, and a "reset to seed data" control while we're on localStorage. |

Default columns: **Backlog · Todo · In Progress · Review · Done.**

Task priorities: **Low · Medium · High · Critical.**

---

## Data layer (v0.1)

The pilot runs **100% on free tier**, so v0.1 does **not** call any backend. It uses a Zustand store persisted to `localStorage`, seeded on first run with one organization, three users, two projects, and ~8 tasks with subtasks and comments.

Architecturally, all data access goes through `lib/store/index.ts` — a single store with selectors. Swapping in Supabase later means replacing the store internals with Supabase queries/mutations; the components do not need to change.

To wipe local data and re-seed: **Settings → Reset to seed data.**

---

## Architecture

```
app/
  (app)/
    dashboard/page.tsx
    projects/page.tsx
    projects/[id]/page.tsx       Kanban board view
    settings/page.tsx
    layout.tsx                   AppShell (sidebar + main)
  layout.tsx                     html / globals.css
  globals.css
  page.tsx                       redirect → /dashboard

components/
  ui/                            shadcn-style primitives (Button, Dialog, …)
  layout/                        AppShell, Sidebar, PageHeader
  shared/                        Logo, UserAvatar, PriorityBadge, DueDate
  kanban/                        Board, Column, TaskCard, NewColumnDialog
  task/                          TaskModal, TaskSubtasks, TaskComments, TaskActivity
  projects/                      ProjectCard, NewProjectDialog
  dashboard/                     MetricCard

lib/
  db/types.ts                    Zod schemas + TS types (Project, Task, Subtask, …)
  db/seed.ts                     First-run seed data
  store/index.ts                 Zustand store with persistence + selectors
  constants.ts                   Priorities, default columns
  utils.ts                       cn, uid, initials, clamp

brand/                           Logos and brand README
.claude/skills/                  Role-based skills (ux, frontend, backend, …)
```

---

## Visual identity

Dark-first interface. Brand tokens applied through `app/globals.css` CSS variables:

| Token | Value | Use |
|-------|-------|-----|
| Primary | Deep Teal `#0F766E` | actions, focus |
| Secondary | Graphite `#111827` | dark surface |
| Accent | Soft Neon Green `#34D399` | highlights, gradients |
| Type stack | Inter (via `next/font`) | UI typography |

Logo assets in [`/brand`](./brand).

---

## What's intentionally NOT in v0.1

These are out of scope for the **first** version — most are planned in later sprints (see `Claude.md`):

- Authentication (Supabase Auth) — Sprint 1 finishes when we wire it up.
- Real-time collaboration — Sprint 4.
- File attachments — Sprint 3+.
- AI features (description / subtasks / summary) — Sprint 5, runs on Claude Haiku for free-tier discipline.
- Mobile layout.
- Notifications and the right panel.

---

## Free-tier constraint

This project is committed to running entirely on free tier during the pilot. See **`Claude.md` → Hard Constraint — 100% Free Tier** and **`.claude/skills/devops/SKILL.md`** for the operational rules and limits per provider.
