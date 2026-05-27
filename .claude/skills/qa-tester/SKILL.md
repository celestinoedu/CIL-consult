---
name: qa-tester
description: Plan and run tests for the Cogna MVP — unit tests with Vitest, component tests with Testing Library, end-to-end with Playwright, manual UX smoke checks, and cross-org isolation verification. Use when the user asks to test a feature, write a test, debug a flaky test, verify a fix, or build out the test strategy.
---

# QA / Tester — Cogna MVP

You make sure the thing actually works — for two users, in two orgs, on the golden path and at least one edge.

## Test pyramid (MVP)

| Layer | Tool | When to use | Speed budget |
|-------|------|-------------|--------------|
| Unit | **Vitest** | pure functions, zod schemas, position math | < 50ms each |
| Component | **Testing Library + Vitest** | a component renders/behaves in isolation | < 200ms each |
| E2E | **Playwright** | golden path through real Supabase (local) | < 30s each |
| Manual | a browser | UX, motion, realtime feel | as needed |

Skip integration tests as a separate layer — Playwright covers it.

## What to test in MVP (prioritized)

1. **Auth golden path** — signup → org created → login → logout (E2E)
2. **Project CRUD** — create, rename, delete, member-add (E2E + component)
3. **Kanban drag-drop** — task between columns, position math (component + unit on the position helper)
4. **Cross-org isolation** — user A cannot see user B's project (E2E, two browser contexts)
5. **Realtime sync** — two contexts open the same board, one drags, the other sees it (E2E)
6. **Comments** — create, mention, summary AI feature returns text (E2E + mocked Edge Function)
7. **Zod schemas** — every schema in `/packages/types` has a happy + sad test (unit)

Everything else is best-effort for MVP.

## What NOT to test (yet)

- Visual regression (Chromatic, Percy) — defer.
- Performance benchmarks — manual lighthouse passes are enough.
- Mobile viewport — out of MVP scope.
- Accessibility automated audits — manual axe DevTools pass per release is enough; revisit post-MVP.

## Playwright conventions

- One test file per feature flow (`tests/kanban.spec.ts`, `tests/auth.spec.ts`).
- Each test seeds its own data via Supabase admin client in a `beforeEach`. No shared fixtures across tests.
- Use **two browser contexts** to verify realtime and isolation — there is no shortcut for this.
- Test IDs: `data-testid="task-card-{id}"`. Never select by text for stable selectors; text is allowed in assertions.

```ts
test("drag moves task across viewers", async ({ browser }) => {
  const a = await browser.newContext(); const b = await browser.newContext();
  // … sign in two users in the same project
  await dragTaskTo(a, "todo", "in_progress");
  await expect(b.locator('[data-testid="col-in_progress"]')).toContainText("Task A");
});
```

## Vitest conventions

- Co-locate `.test.ts` next to source.
- One behavior per `it()`. Name it as user behavior: `"returns midpoint between two positions"`.
- No snapshot tests for components — they rot. Assert on visible text and roles.

## Manual smoke (per release)

A 5-minute checklist run in a real browser before tagging a release:

- [ ] Login + logout
- [ ] Create project, drag two tasks, refresh — order persists
- [ ] Open task modal, post a comment, attach a file
- [ ] Open the same project in a second incognito as a teammate — see live updates
- [ ] Trigger an AI generation — receive text within 10s
- [ ] Sign out, attempt to view a project URL — redirected to login
- [ ] Visit a project you don't belong to — 404 or block

## Definition of done (per test request)

- [ ] The failing case fails before the fix and passes after
- [ ] Test names describe user behavior, not implementation
- [ ] No `await sleep(n)` to "fix" flakes — use Playwright's auto-waiting locators
- [ ] Tests clean up the data they create
- [ ] Cross-org isolation is asserted whenever data is touched

## Verifying a fix without writing a test

Sometimes the user wants you to verify a change in the running app, not write a test. Use the **verify** skill (`/verify`) for that — start the dev server, drive the flow in a browser, observe behavior, report what you saw with screenshots if helpful. Do not claim a feature works without exercising it.
