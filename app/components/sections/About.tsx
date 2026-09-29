import { copy } from "@/lib/copy";
import { Cta, Section, Txt } from "../ui";

export function About() {
  const a = copy.about;
  return (
    <Section id="about" title={a.headline}>
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <p className="text-lg text-muted"><Txt>{a.body}</Txt></p>
        <ul className="space-y-3 rounded-xl bg-mist p-6 text-sm">
          {a.credentials.map((c, i) => (
            <li key={i} className="flex gap-2"><span aria-hidden className="text-navy">✓</span><Txt>{c}</Txt></li>
          ))}
        </ul>
      </div>
      <div className="mt-10"><Cta section="about" variant="outline">{a.cta}</Cta></div>
    </Section>
  );
}
