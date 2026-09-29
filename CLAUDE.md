# CLAUDE.md

Read `SYSTEM.md` first. It defines the mission, pipeline, 13 sections, and honesty rules.

## Project
- AI consulting landing page (13 sections), goal = form submissions.
- Built by a four-agent pipeline defined in `Agent/`.

## Running the pipeline
- Run stages in order; each agent definition is in `Agent/<name>.md`.
- Invoke a stage by launching a subagent with that file's contents as its instructions, e.g. "Follow `Agent/researcher.md`".
- Re-run a single stage by deleting its output file and re-invoking only that agent (later stages must then be re-run).
- Researcher needs WebSearch/WebFetch.

## Conventions
- Branch: develop on `claude/ai-consulting-landing-page-j8kmgv`; never push elsewhere.
- Commits: small, descriptive; one per pipeline stage.
- Do not open PRs or deploy unless asked.
- Copy changes go in `app/content/copy.json` (and mirrored in `workspace/03-copy.md`), never hard-coded in components.
- Placeholders use `[REPLACE: …]`. Never invent proof.

## App commands (from `app/`)
- `npm install` · `npm run dev` · `npm run lint` · `npm run build`
- Env: copy `.env.example` → `.env.local` (Supabase URL + service key, optional notify email).

## Definition of done
- All 13 sections render with copy from `copy.json`.
- Every CTA leads to the form; valid submission stored, invalid rejected with clear messages.
- Lint and build pass; 375px and 1280px screenshots checked.
- Handoff notes list remaining `[REPLACE]` items for the owner.
