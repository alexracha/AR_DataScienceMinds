import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function Services() {
  const s = copy.services;
  return (
    <Section id="services" title={s.headline} intro={s.intro}>
      <ul className="grid gap-6 lg:grid-cols-3">
        {s.items.map((it) => (
          <li key={it.name} className="flex flex-col rounded-2xl border border-line p-8">
            <h3 className="text-xl font-bold"><Txt>{it.name}</Txt></h3>
            <p className="mt-1 text-sm text-muted">{copy.labels.serviceFor} {it.forWho}</p>
            <p className="mt-4 font-medium"><Txt>{it.outcome}</Txt></p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {it.includes.map((x) => (
                <li key={x} className="flex gap-2"><span aria-hidden className="text-navy">✓</span><Txt>{x}</Txt></li>
              ))}
            </ul>
            <div className="mt-auto pt-6"><Cta section={`service:${it.name}`} variant="outline">{it.cta}</Cta></div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
