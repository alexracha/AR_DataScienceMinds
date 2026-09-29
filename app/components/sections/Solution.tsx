import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function Solution() {
  const s = copy.solution;
  return (
    <Section id="solution" title={s.headline} intro={s.intro} tone="mist">
      <ol className="grid gap-6 md:grid-cols-3">
        {s.steps.map((st, i) => (
          <li key={st.title} className="rounded-xl bg-white p-8 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-bold text-white">{i + 1}</span>
            <h3 className="mt-4 text-2xl font-bold"><Txt>{st.title}</Txt></h3>
            <p className="mt-2 text-muted"><Txt>{st.body}</Txt></p>
          </li>
        ))}
      </ol>
      <div className="mt-10"><Cta section="solution">{s.cta}</Cta></div>
    </Section>
  );
}
