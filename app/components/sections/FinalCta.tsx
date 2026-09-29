import { copy } from "@/lib/copy";
import { LeadForm } from "../LeadForm";
import { Txt } from "../ui";

export function FinalCta() {
  const f = copy.finalCta;
  return (
    <section id="contact" aria-labelledby="contact-h" className="bg-navy px-4 py-16 text-white sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <h2 id="contact-h" className="text-3xl font-bold tracking-tight sm:text-4xl"><Txt>{f.headline}</Txt></h2>
          <p className="mt-4 text-lg text-white/80"><Txt>{f.body}</Txt></p>
          <p className="mt-6 rounded-lg bg-white/10 p-4 text-sm">{f.riskReversal}</p>
          <h3 className="mt-8 font-semibold">{copy.labels.nextStepsHeading}</h3>
          <ol className="mt-3 space-y-2 text-white/80">
            {f.nextSteps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">{i + 1}</span><Txt>{s}</Txt>
              </li>
            ))}
          </ol>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
