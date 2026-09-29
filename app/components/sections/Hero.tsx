import { copy } from "@/lib/copy";
import { Cta, Txt } from "../ui";

export function Hero() {
  const h = copy.hero;
  return (
    <section id="top" aria-labelledby="hero-h" className="bg-gradient-to-b from-navy to-navy-2 px-4 pb-20 pt-16 text-white sm:pb-28 sm:pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 id="hero-h" className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          <Txt>{h.headline}</Txt>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl"><Txt>{h.subhead}</Txt></p>
        <div className="mt-9 flex flex-col items-center gap-3">
          <Cta section="hero">{h.cta}</Cta>
          <p className="text-sm text-white/70">{h.microcopy}</p>
        </div>
        <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/80">
          {h.proofPoints.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden className="text-accent">✓</span><Txt>{p}</Txt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
