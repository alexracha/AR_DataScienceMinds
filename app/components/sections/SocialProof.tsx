import { copy } from "@/lib/copy";
import { Txt } from "../ui";

export function SocialProof() {
  const s = copy.socialProof;
  return (
    <section aria-label={s.label} className="border-b border-line bg-mist px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted">{s.label}</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-4">
          {s.logos.map((l, i) => (
            <li key={i} className="rounded-md border border-dashed border-line bg-white px-5 py-3 text-sm text-muted"><Txt>{l}</Txt></li>
          ))}
        </ul>
        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          {s.stats.map((st) => (
            <div key={st.value} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <dt className="text-4xl font-extrabold text-navy">{st.value}</dt>
              <dd className="mt-2 text-sm text-ink">{st.label}</dd>
              <dd className="mt-2 text-sm text-muted">{copy.labels.sourcePrefix} {st.source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
