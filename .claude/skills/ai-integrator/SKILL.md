---
name: ai-integrator
description: Implement the three light AI features in the Cogna MVP — generate task description from a title, generate subtasks from a task, summarize a long comment thread — using the Claude API from Supabase Edge Functions. Use when the user asks to build, debug, or refine any AI-powered feature, prompt, or model integration. Stay within the three sanctioned features.
---

# AI Integrator — Cogna MVP

You wire up the **three** AI features the MVP allows. The product brief is explicit: AI exists, but minimally. Resist the temptation to expand.

## Sanctioned features (the only ones)

1. **Generate task description** — input: task title (+ optional project context). Output: a structured markdown description.
2. **Generate subtasks** — input: task title + description. Output: an ordered list of 3–7 actionable subtasks.
3. **Summarize comments** — input: full comment thread (chronological). Output: 2–3 line summary highlighting decisions and open questions.

Anything else (chat assistants, auto-tagging, smart due dates, agents) is **post-MVP**. Defer with a one-liner.

## Architecture

```
Browser  ──► Next.js Route Handler  ──►  Supabase Edge Function  ──►  Claude API
                                                                       (Anthropic)
                                       ──►  returns JSON to client
Browser  ──► writes result to Supabase (normal mutation, after user confirms)
```

Key points:

- **API key lives only in the Edge Function env.** Never in the browser, never in `NEXT_PUBLIC_*`.
- The Edge Function is **stateless** — it does not write to the database. The client receives the AI output, the user accepts/edits it, then a normal mutation persists it. This keeps RLS in charge and makes the feature easy to reason about.
- The Next.js route handler is a thin pass-through that forwards the user's JWT so the Edge Function can verify them.

## Model & SDK

- Model: **`claude-sonnet-4-6`** for all three features. Sonnet is the right cost/quality point; reserve Opus for post-MVP if quality demands it.
- SDK: **`@anthropic-ai/sdk`** inside the Edge Function (Deno-compatible build).
- Enable **prompt caching** on the system prompt — it changes rarely and is hit on every call.
- Set `max_tokens` conservatively per feature (description: 600, subtasks: 400, summary: 300).
- Stream the response back to the client (`text/event-stream`) so the user sees text appear immediately.

When working in any file that imports `anthropic` or `@anthropic-ai/sdk`, also load the **claude-api** skill — it owns the deep guidance on the SDK, caching, and tool use.

## Prompt structure (all three features)

```
system:  <role + constraints + output format>      ← cached
user:    <feature-specific input>
```

The system prompt is the same shape per feature; only the user message varies per request. This maximizes cache hits.

### "Generate description" system prompt (sketch)

```
You write concise task descriptions for an operational Kanban tool called Cogna.
Output markdown with three sections: Context, Acceptance, Notes. Each section
1–3 short bullet points. No fluff, no preamble, no closing remarks. Plain text,
no emoji. If the title is ambiguous, write what is most likely meant and note
the assumption in Notes.
```

### "Generate subtasks" system prompt (sketch)

```
You decompose a task into 3–7 ordered subtasks for an operational Kanban tool.
Output JSON: { "subtasks": [{"title": "..."}] }. Each title is imperative,
under 80 characters, atomic enough to complete in one sitting. No nesting.
```

### "Summarize comments" system prompt (sketch)

```
You summarize a Kanban task discussion in 2–3 lines. Line 1: the current
decision or status. Line 2: open questions, if any. Line 3: blockers, if any.
Plain text, no preamble, no markdown.
```

## Edge Function template

```ts
// supabase/functions/ai-generate-subtasks/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

serve(async (req) => {
  // 1. Verify Supabase JWT (forwarded by Next.js)
  // 2. Validate input with Zod (title, optional description)
  // 3. Call Claude with cached system prompt
  // 4. Stream JSON chunks back
});
```

Validate every input with Zod. Reject early on bad shape.

## UX rules for AI surfaces

- **Always a manual trigger.** Sparkle button on the form, not automatic on blur.
- **Show the output as a draft.** User edits or accepts before persisting.
- **Streaming visible.** Text appears progressively; no opaque spinner for 8 seconds.
- **Failure is silent and recoverable.** AI down? Surface a small inline message ("AI unavailable, try again"), do not block the form.
- **No AI panels in the MVP layout.** The right panel is reserved but unused. Don't ship it.

## Cost & rate-limit hygiene

- Cap each feature at **5 requests per user per minute** at the Edge Function level. Return 429 on excess.
- Log token usage per request (system + input + output) to a `ai_usage` table for visibility.
- Do not retry on the client. One call per user action.

## What this skill does NOT cover

- Agentic loops, tool use, multi-step planning → out of MVP scope.
- Embedding-based search → out of MVP scope.
- Image generation → out of MVP scope.

## Definition of done (per AI feature)

- [ ] Edge Function deployed and tested with the local Supabase CLI
- [ ] System prompt cached (verify cache hits in API response metadata)
- [ ] Client streams output into a draft field, not the persisted field
- [ ] User can edit before saving
- [ ] Failure mode tested (kill the function, confirm UI is graceful)
- [ ] Rate limit enforced and tested
