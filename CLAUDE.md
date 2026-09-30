# CLAUDE.md

Read `SYSTEM.md` first. It defines the mission, pipeline, 13 sections, and honesty rules. `AGENTS.md` has the project map and QA hard rules.

## Project
- AI consulting landing page (13 sections), goal = form submissions.
- Built by a four-agent pipeline defined in `Agent/` (researcher, consolidator, copywriter, builder), then reviewed by a fifth stage, QA (Codex).

## Running the pipeline
- Run stages in order; each agent definition is in `Agent/<name>.md`.
- Invoke a stage by launching a subagent with that file's contents as its instructions, e.g. "Follow `Agent/researcher.md`".
- Each agent reads only its declared input (see the table in `SYSTEM.md`) and ends its output with a `## Handoff` block (done, assumptions, open questions).
- Re-run a single stage by deleting its output file and re-invoking only that agent (later stages must then be re-run).
- Researcher needs WebSearch/WebFetch.

## QA
- `Agent/qa.md` is run by Codex (see root `AGENTS.md`), read-only: `npm run qa:codex` from `app/`. It writes `workspace/04-qa-report.md`, which is regenerated on each run and may be absent.
- Fix reported findings, then re-run `npm run test:e2e`. Never edit or delete a test to get green.

## Conventions
- Branch: develop on the branch the task assigns (default `claude/ai-consulting-landing-page-j8kmgv`); never push elsewhere.
- Commits: small, descriptive; one per pipeline stage. QA fixes get their own commit.
- Do not open PRs or deploy unless asked.
- Copy changes: edit `app/content/copy.json` only, then run `npm run sync:copy` to regenerate `workspace/03-copy.md`. Never hard-code copy in components. A test fails if the two drift.
- Placeholders use `[REPLACE: …]`. Never invent proof.

## App commands (from `app/`)
- `npm install` · `npm run dev` · `npm run lint` · `npm run build` · `npm run test:e2e` · `npm run sync:copy`
- `npm run build` fails while any `[REPLACE` placeholder remains; use `ALLOW_PLACEHOLDERS=1 npm run build` until they are filled.
- Env: copy `.env.example` → `.env.local` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server only, never commit).
- Next.js here has breaking changes: read `app/node_modules/next/dist/docs/` before writing framework code (see `app/AGENTS.md`).

## Definition of done
- All 13 sections render with copy from `copy.json`.
- Every CTA leads to the form; valid submission stored, invalid rejected with clear messages.
- Lint and build pass; 375px and 1280px screenshots checked.
- Handoff notes list remaining `[REPLACE]` items for the owner.
