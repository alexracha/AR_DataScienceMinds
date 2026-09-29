import { copy } from "@/lib/copy";

export function Footer() {
  const f = copy.footer;
  return (
    <footer className="bg-navy px-4 pb-24 pt-8 text-sm text-white/70 md:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
        <p>{f.legal}</p>
        <ul className="flex gap-4">
          {f.links.map((l) => <li key={l.label}><a href={l.href} className="hover:text-white">{l.label}</a></li>)}
        </ul>
      </div>
    </footer>
  );
}
