# Cogna MVP — Project Skills

This directory holds **project-level Claude Code skills** that encode the roles needed to build the Cogna MVP prototype. Each subfolder has a `SKILL.md` file with YAML frontmatter — Claude Code surfaces them automatically in this repo.

## Skills overview

| Skill | When to invoke |
|-------|----------------|
| [`ux-designer`](./ux-designer/SKILL.md) | UI layout, components, Tailwind, shadcn, dark-first theming, interaction design |
| [`project-manager`](./project-manager/SKILL.md) | Scope, sprint planning, task breakdown, acceptance criteria, MVP guardrails |
| [`frontend-developer`](./frontend-developer/SKILL.md) | Next.js / React / TypeScript UI, dnd-kit, Zustand, RHF + Zod |
| [`backend-developer`](./backend-developer/SKILL.md) | Supabase schema, RLS, Edge Functions, realtime, storage |
| [`fullstack-developer`](./fullstack-developer/SKILL.md) | Vertical slices that cross DB → server → client |
| [`database-architect`](./database-architect/SKILL.md) | Postgres schema, indexes, migrations, position math |
| [`devops`](./devops/SKILL.md) | Turborepo, Vercel, Supabase config, CI, env vars |
| [`qa-tester`](./qa-tester/SKILL.md) | Vitest, Testing Library, Playwright, manual smoke checks |
| [`ai-integrator`](./ai-integrator/SKILL.md) | The three sanctioned AI features via Claude API + Edge Functions |

## Shared north star

All skills defer to **`/Claude.md`** for product scope, brand tokens, table list, and the sprint plan. If a skill and `Claude.md` disagree, `Claude.md` wins — open a PR to update the skill.

The repeated meta-rule across every skill: **do not overengineer**. The MVP is a sharp, minimal Kanban — not a platform.

## Adding a skill

1. Create `.claude/skills/<kebab-name>/SKILL.md`.
2. Frontmatter: `name`, `description` (one sentence — when to use it).
3. Body: operating rules, deliverables, definition of done. Concrete > abstract.
4. Cross-link from this README.
