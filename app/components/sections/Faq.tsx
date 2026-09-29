import { copy } from "@/lib/copy";
import { Section, Txt } from "../ui";

export function Faq() {
  const f = copy.faq;
  return (
    <Section id="faq" title={f.headline} tone="mist">
      <div className="max-w-3xl space-y-3">
        {f.items.map((it) => (
          <details key={it.q} className="group rounded-xl bg-white p-5 shadow-sm">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              <Txt>{it.q}</Txt>
              <span aria-hidden className="text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-muted"><Txt>{it.a}</Txt></p>
          </details>
        ))}
      </div>
    </Section>
  );
}
