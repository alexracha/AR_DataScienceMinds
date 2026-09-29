import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function Process() {
  const p = copy.process;
  return (
    <Section id="process" title={p.headline} tone="mist">
      <ol className="grid gap-6 md:grid-cols-4">
        {p.steps.map((st, i) => (
          <li key={st.title} className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-muted">{st.duration}</p>
            <h3 className="mt-1 text-lg font-bold">{i + 1}. <Txt>{st.title}</Txt></h3>
            <p className="mt-2 text-sm text-muted"><Txt>{st.body}</Txt></p>
          </li>
        ))}
      </ol>
      <div className="mt-10"><Cta section="process">{p.cta}</Cta></div>
    </Section>
  );
}
