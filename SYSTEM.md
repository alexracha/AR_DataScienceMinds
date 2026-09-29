# SYSTEM.md — AI Consulting Landing Page Project

## Mission
- Build a high-converting, sellable 13-section landing page for an AI consulting service.
- Single conversion goal: **visitor clicks a CTA → fills the contact form → we reach out.**
- Everything on the page either builds desire or removes friction toward that goal.

## Audience (default, refined by the Consolidator)
- Owners and operators of small/mid-sized businesses (10–500 staff) who feel pressure to "do something with AI" but lack in-house expertise.
- Buyers: founder/CEO, COO, head of ops, head of data/IT.

## Offer (default)
- Brand: **AR DataScienceMinds**
- Primary CTA: **"Get your free AI opportunity audit"**
- Services: AI strategy & roadmap · Implementation (automation, agents, data/ML) · Team training & enablement.

## Pipeline (strict order, file handoffs)
| # | Agent | Reads | Writes |
|---|---|---|---|
| 1 | `Agent/researcher.md` | this file | `workspace/01-research.md` |
| 2 | `Agent/consolidator.md` | `01-research.md` | `workspace/02-brief.md` |
| 3 | `Agent/copywriter.md` | `02-brief.md` | `workspace/03-copy.md`, `app/content/copy.json` |
| 4 | `Agent/builder.md` | `03-copy.md`, `copy.json` | `app/` |

- An agent may only read its declared input. This keeps context clean and stages re-runnable.
- Each stage ends with a short "Handoff" block: what was done, open questions, assumptions.

## The 13 sections (fixed order)
1. Sticky nav + CTA · 2. Hero · 3. Social proof bar · 4. Problem · 5. Cost of inaction · 6. Solution / unique mechanism · 7. Services · 8. Process · 9. Case studies · 10. Testimonials · 11. About / authority · 12. FAQ / objections · 13. Final CTA + form

## Conversion principles (non-negotiable)
- **One goal, one CTA.** Same action everywhere; no competing links or exits.
- **5-second clarity.** Hero states who it's for, the outcome, and the next step.
- **Outcome over feature.** Lead with business results, not tech jargon.
- **Buyer's words.** Use language surfaced by research, not agency buzzwords.
- **Proof early and often.** Numbers, named clients, specifics.
- **Remove risk.** Free audit, no-obligation, data-security stance, clear next steps.
- **Low-friction form.** 4 required fields max; optional extras clearly marked.
- **Mobile-first, fast, accessible.** Lighthouse ≥ 90, WCAG AA.

## Honesty rules
- Never fabricate clients, testimonials, metrics, logos, or credentials.
- Unknown proof is a labeled placeholder: `[REPLACE: …]`. The Builder renders placeholders visibly in dev and blocks production build if any remain unless `ALLOW_PLACEHOLDERS=1`.
- Research claims must cite a source URL; unverified claims are marked `(unverified)`.

## Quality gates
- Copy: every section has headline, body, CTA; reading level ≤ grade 8; no unsupported claims.
- App: `npm run lint`, `npm run build`, and form submission (valid + invalid) verified; checked at 375px and 1280px.
- Security: server-side validation, honeypot, rate limit, no secrets in the repo.

## Tech stack
- Next.js (App Router) + TypeScript, Tailwind CSS, Zod, Supabase (`leads` table) via server route, Vercel hosting.
- All copy lives in `app/content/copy.json`; theme tokens in one file, so the page can be re-skinned and resold.
