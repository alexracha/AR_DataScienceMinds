# AI Consulting Landing Page

Next.js (App Router) + TypeScript + Tailwind v4 + Zod + Supabase.

## Run
```
npm install
cp .env.example .env.local   # add Supabase URL + service role key
npm run dev
```
- `npm run lint` · `npm run build` · `npm run sync:copy` (regenerates `../workspace/03-copy.md` from `content/copy.json`)
- `npm run test:e2e` runs Playwright against its own dev server on port 3200. On a fresh machine run `npx playwright install chromium` once first.
- Production build **fails while `[REPLACE: …]` placeholders remain** in `content/copy.json`. Set `ALLOW_PLACEHOLDERS=1` to override.
- Promises the owner must verify (NDA, human review, 2–4 week pilot, one-business-day reply) carry `[REPLACE: confirm]`. Delete the marker once it is true for your business.

## Where things live
| What | Where |
|---|---|
| All copy, including interface labels (`labels`) | `content/copy.json` (edit text here only, then `npm run sync:copy`) |
| Colors / fonts | `app/globals.css` (`@theme` tokens) |
| 13 sections | `components/sections/*` (Nav, Hero, SocialProof, Problem, CostOfInaction, Solution, Services, Process, CaseStudies, Testimonials, About, Faq, FinalCta) |
| Form + validation | `components/LeadForm.tsx`, `lib/schema.ts`, `app/api/lead/route.ts` |
| Analytics hooks | `lib/track.ts` (`cta_click`, `form_start`, `form_submit`; call `addTracker` to plug a vendor) |
| Database | `supabase/migrations/*_leads.sql` (RLS on, server-only writes) |

## Lead storage
- Apply the migration to your Supabase project, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- In production, a missing key returns an error instead of silently dropping leads. In dev, leads are logged only.
- Rate limit is in-memory per instance and keys on `x-forwarded-for`; use a shared store keyed on your platform's trusted IP header if abuse grows.
- Request bodies over 10 KB are rejected (413). Security headers, including a CSP, are set in `next.config.ts`.
- The honeypot field is `alt_contact` (`HONEYPOT_FIELD` in `lib/schema.ts`). Filled honeypots are dropped and logged as `[honeypot] submission dropped`; a spike there means real people are being caught.

## Still to do before launch
- Replace all placeholders: logos, case studies, testimonials, about, privacy link.
- Confirm FAQ security answers and turnaround promises match how you actually work.
- Add real Privacy/Terms pages and hook up notifications for new leads.
