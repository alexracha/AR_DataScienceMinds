# Agent folder

Four single-purpose agents, run in order. Each reads one file and writes one file.

```
SYSTEM.md ─▶ researcher ─▶ 01-research.md ─▶ consolidator ─▶ 02-brief.md
          ─▶ copywriter ─▶ 03-copy.md + copy.json ─▶ builder ─▶ app/
```

| Agent | File | Reads | Writes |
|---|---|---|---|
| Researcher | `researcher.md` | `SYSTEM.md` | `workspace/01-research.md` |
| Consolidator | `consolidator.md` | `01-research.md` | `workspace/02-brief.md` |
| Copywriter | `copywriter.md` | `02-brief.md` | `workspace/03-copy.md`, `app/content/copy.json` |
| Builder | `builder.md` | `03-copy.md`, `copy.json` | `app/` |
| QA (Codex) | `qa.md` | whole repo | `workspace/04-qa-report.md` |

## Handoff contract
- Each output ends with a `## Handoff` block: done, assumptions, open questions.
- Downstream agents must not read upstream files beyond their declared input.

## Re-running a stage
- Delete the stage's output, re-invoke that agent, then re-run every later stage.

## QA with Codex
- Root `AGENTS.md` makes Codex a read-only reviewer.
- Run `npm run qa:codex` from `app/` (needs Codex installed and signed in).
- Claude Code applies the fixes; Codex re-checks.
