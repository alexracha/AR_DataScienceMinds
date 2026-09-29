import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function CaseStudies() {
  const c = copy.caseStudies;
  return (
    <Section id="case-studies" title={c.headline}>
      <ul className="grid gap-6 md:grid-cols-2">
        {c.items.map((it, i) => (
          <li key={i} className="rounded-2xl border border-line p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted"><Txt>{it.industry}</Txt></p>
            <h3 className="mt-1 text-xl font-bold"><Txt>{it.client}</Txt></h3>
            <p className="mt-4 text-sm"><strong>{copy.labels.caseChallenge}</strong> <Txt>{it.challenge}</Txt></p>
            <p className="mt-2 text-sm"><strong>{copy.labels.caseSolution}</strong> <Txt>{it.solution}</Txt></p>
            <ul className="mt-4 space-y-1 border-t border-line pt-4 font-semibold text-navy">
              {it.results.map((r, j) => <li key={j}><Txt>{r}</Txt></li>)}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-10"><Cta section="case-studies">{c.cta}</Cta></div>
    </Section>
  );
}
