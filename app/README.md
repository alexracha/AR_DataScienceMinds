# AI Consulting Landing Page

Next.js (App Router) + TypeScript + Tailwind v4 + Zod + Supabase.

## Run
```
npm install
cp .env.example .env.local   # add Supabase URL + service role key
npm run dev
```
- `npm run lint` · `npm run build`
- Production build **fails while `[REPLACE: …]` placeholders remain** in `content/copy.json`. Set `ALLOW_PLACEHOLDERS=1` to override.

## Where things live
| What | Where |
|---|---|
| All copy | `content/copy.json` (edit text here only) |
| Colors / fonts | `app/globals.css` (`@theme` tokens) |
| 13 sections | `components/sections/*` (Nav, Hero, SocialProof, Problem, CostOfInaction, Solution, Services, Process, CaseStudies, Testimonials, About, Faq, FinalCta) |
| Form + validation | `components/LeadForm.tsx`, `lib/schema.ts`, `app/api/lead/route.ts` |
| Analytics hooks | `lib/track.ts` (`cta_click`, `form_start`, `form_submit`; call `addTracker` to plug a vendor) |
| Database | `supabase/migrations/*_leads.sql` (RLS on, server-only writes) |

## Lead storage
- Apply the migration to your Supabase project, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- In production, a missing key returns an error instead of silently dropping leads. In dev, leads are logged only.
- Rate limit is in-memory per instance; swap for a shared store if abuse grows.

## Still to do before launch
- Replace all placeholders: logos, case studies, testimonials, about, privacy link.
- Confirm FAQ security answers and turnaround promises match how you actually work.
- Add real Privacy/Terms pages and hook up notifications for new leads.
