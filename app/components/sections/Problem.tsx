import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function Problem() {
  const p = copy.problem;
  return (
    <Section id="problem" title={p.headline} intro={p.intro}>
      <ul className="grid gap-6 sm:grid-cols-2">
        {p.points.map((pt) => (
          <li key={pt.title} className="rounded-xl border border-line p-6">
            <h3 className="text-lg font-semibold"><Txt>{pt.title}</Txt></h3>
            <p className="mt-2 text-muted"><Txt>{pt.body}</Txt></p>
          </li>
        ))}
      </ul>
      <div className="mt-10"><Cta section="problem">{p.cta}</Cta></div>
    </Section>
  );
}
