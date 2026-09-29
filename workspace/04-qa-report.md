# QA Report

Reviewer: Claude (self-review of its own build; **not** an independent Codex pass). Codex is installed in the cloud container but blocked from OpenAI by the network policy, so bias toward the author's blind spots is possible. Re-run with Codex when available.

Reviewed commit: `1335509` on `claude/ai-consulting-landing-page-j8kmgv`.

## Summary

| Command / check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run build` (no override) | Fails as designed: 29 `[REPLACE]` placeholders remain |
| `ALLOW_PLACEHOLDERS=1 npm run build` | Pass |
| `npm run test:e2e` (34 tests, 2 viewports) | 34 / 34 pass |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Secrets in git (`git ls-files`, grep) | None. Only `app/.env.example` with empty values. |

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 2 |
| Minor | 8 |
| Note | 3 |

## Findings

| # | Severity | Area | File:line | Issue | Repro | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | Major | Honesty | `app/content/copy.json:45-47,129,159,264,280,290,294,360` | Business promises are stated as fact but come from no research and are not gated: "NDA before we touch your data", "Human-in-the-loop by default", "Pilot live in 2–4 weeks", "We sign an NDA before seeing anything", "reply within one business day". The production gate only counts `[REPLACE`, so these ship without the owner confirming them. | `grep -nE "NDA\|business day\|2–4 weeks" app/content/copy.json` | Add a confirmation marker such as `[REPLACE: confirm we do this]` next to each promise (it highlights and blocks production), or move them into a `claimsToConfirm` checklist the build gate also checks. |
| 2 | Major | Honesty | `app/content/copy.json:51,207,233` | Section headlines assert proof exists: "Trusted by teams like yours", "Results from real engagements", "What clients say". If the owner fills only some placeholders or none, the page still makes the claim. | Remove the logos/case studies/testimonials content; headlines remain. | Render these three sections only when they hold non-placeholder items, or reword the headlines to be neutral until real proof exists. |
| 3 | Minor | Copy sync | `workspace/03-copy.md` | Missing 12 strings that exist in `copy.json`: form select options (team size, budget) and the footer (Privacy, Terms, legal line). The doc was generated before options were added. | Compare strings in `copy.json` with `03-copy.md` (script in this session). | Regenerate `03-copy.md` from `copy.json` and include footer and options. |
| 4 | Minor | Accessibility | `app/components/LeadForm.tsx` (input class `placeholder:text-muted/70`) | Placeholder text contrast is 3.20:1, below 4.5:1. | Computed from `#55617a` at 70% on white. | Use full `text-muted` (6.22:1) or a darker placeholder colour. |
| 5 | Minor | Accessibility | `app/components/sections/Nav.tsx:15`, `Faq.tsx:11` | Nav CTA and FAQ summary are 40px tall (`min-h-10`), under the 44px target in `Agent/qa.md`. | Inspect element heights at 375px. | Use `min-h-11`. |
| 6 | Minor | Accessibility | `SocialProof.tsx:20`, `LeadForm.tsx:122` | Source line and consent text are 12px (`text-xs`); the consent text carries the privacy link. | Visual check. | Use `text-sm` for the consent text at least. |
| 7 | Minor | Security | `app/next.config.ts` | No security headers (CSP, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`). | `grep headers app/next.config.ts` finds nothing. | Add an async `headers()` entry with a conservative set. |
| 8 | Minor | Security | `app/app/api/lead/route.ts`, `app/lib/ratelimit.ts` | (a) No request body size guard before `req.json()`. (b) Rate limit keys on `x-forwarded-for`, which a client can spoof when not behind a trusted proxy, and is per instance. | Send a very large JSON body; send varying `x-forwarded-for` values (the tests rely on this). | Check `content-length` and reject large bodies; use a shared limiter keyed on the platform's trusted IP header. |
| 9 | Minor | Lead loss | `route.ts` honeypot branch, `LeadForm.tsx` honeypot input (`name="website"`) | A browser or password-manager autofill of a field named `website` would silently drop a real lead (fake success, nothing stored). | Autofill a URL into the field, then submit. | Use a less guessable field name and log dropped honeypot hits so loss is visible. |
| 10 | Minor | Copy hard-coded | `Services.tsx:12`, `FinalCta.tsx:14`, `SocialProof.tsx:20`, `CaseStudies.tsx:13-14`, `LeadForm.tsx:55,99,120` | UI text in components: "For:", "What happens next", "Source:", "Challenge:", "What we did:", "You're in.", "Select…", "Sending…". Breaks the "no hard-coded copy" rule. | `grep -rnE` on those strings. | Move them to `copy.json` (e.g. a `labels` block) and mirror in `03-copy.md`. |
| 11 | Minor | Test quality | `app/tests/landing.spec.ts` (CTA test), `app/playwright.config.ts`, `app/README.md` | (a) CTA test finds buttons by a text regex, so a CTA worded differently is silently skipped, and `>= 10` is a weak bound. (b) `reuseExistingServer: true` can test a stale server. (c) README doesn't document `test:e2e` or the `npx playwright install` step for a fresh machine. | Rename a CTA label; run tests against an old server on port 3200. | Give CTAs a `data-cta` attribute and assert all of them; set `reuseExistingServer: !process.env.CI`; document the test command. |
| 12 | Note | Security | `app/app/page.tsx:29` | `dangerouslySetInnerHTML` with `JSON.stringify` of static data. Safe today; `JSON.stringify` does not escape `</script>` if content ever becomes user-supplied. | n/a | Escape `<` if the data source ever changes. |
| 13 | Note | SEO | `app/app/layout.tsx`, `page.tsx` | No canonical URL, OG image, or robots rules; JSON-LD has no `url` or contact. | n/a | Add once the production domain is known. |
| 14 | Note | UX | `LeadForm.tsx` | After clicking a CTA, focus does not move to the form; on success, focus stays on a removed button. `role="status"` covers announcement. | Keyboard: tab to a CTA, press Enter. | Focus the first field on arrival; focus the success message after submit. |

## Checked and clean
- 13 sections present in `SYSTEM.md` order (nav plus 12 in `<main>`); one `h1`; heading levels do not skip.
- Every CTA anchor goes to `#contact`; one accent colour for CTAs only.
- Form: labels tied to inputs, errors use `role="alert"` and `aria-describedby`, errors clear on edit, 4 required fields, consent line present, success and error states exist.
- API: same Zod schema on client and server; malformed JSON rejected; rate limit works (6th request → 429); production returns an error rather than losing a lead when Supabase env vars are missing.
- Migration enables RLS with no policies; service key is read only in `route.ts` (server).
- Stats in copy match the approved list (33%, 78%, 70%) and are cited on the page.
- No horizontal scroll at 375px and 1280px; no console errors.
- Contrast checked and passing: body muted text 6.22:1 (white) / 5.75:1 (mist); white/70 on navy 8.84:1; navy on accent 8.35:1; error red 6.47:1.

## Not verified
- Lighthouse ≥ 90 target in `SYSTEM.md` (Lighthouse not run).
- Reading grade ≤ 8 (not measured).
- Real Supabase insert (no project exists yet; only the missing-key paths were exercised).
- Screen-reader behaviour, real-device mobile, and contrast of every colour pair (sampled only).
- Whether the 3 secondary-source stats still match their primary sources.

## Handoff
- Done: full checklist from `Agent/qa.md`, automated and manual.
- Read-only: no code or copy was changed for this report.
- Next: fix findings 1 and 2 first (they affect honesty), then 3–11, then re-run `npm run lint`, `npm run test:e2e`.
- Open questions for the owner: which promises in finding 1 are true for your business? Should sections 9 and 10 be hidden until real proof exists (finding 2)?
