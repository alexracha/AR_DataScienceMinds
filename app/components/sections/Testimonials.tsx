import { copy } from "@/lib/copy";
import { Section, Txt } from "../ui";

export function Testimonials() {
  const t = copy.testimonials;
  return (
    <Section id="testimonials" title={t.headline} tone="mist">
      <ul className="grid gap-6 md:grid-cols-2">
        {t.items.map((it, i) => (
          <li key={i}>
            <figure className="h-full rounded-2xl bg-white p-8 shadow-sm">
              <blockquote className="text-lg"><Txt>{it.quote}</Txt></blockquote>
              <figcaption className="mt-4 text-sm text-muted">
                <Txt>{it.name}</Txt>, <Txt>{it.role}</Txt>, <Txt>{it.company}</Txt>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
