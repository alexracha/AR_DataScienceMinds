import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function CostOfInaction() {
  const c = copy.costOfInaction;
  return (
    <Section id="cost" title={c.headline} intro={c.body} tone="dark">
      <ul className="grid gap-6 sm:grid-cols-3">
        {c.items.map((it, i) => (
          <li key={it.title} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
            <span className="text-sm font-semibold text-accent">0{i + 1}</span>
            <h3 className="mt-2 text-lg font-semibold"><Txt>{it.title}</Txt></h3>
            <p className="mt-2 text-white/75"><Txt>{it.body}</Txt></p>
          </li>
        ))}
      </ul>
      <div className="mt-10"><Cta section="cost">{c.cta}</Cta></div>
    </Section>
  );
}
