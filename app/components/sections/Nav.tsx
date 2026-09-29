import { copy } from "@/lib/copy";
import { Cta } from "../ui";

export function Nav() {
  const { nav, brand } = copy;
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="inline-flex min-h-11 items-center text-lg font-bold text-white">{brand.name}</a>
        <nav aria-label={copy.labels.navAria} className="hidden gap-6 md:flex">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-sm text-white/80 hover:text-white">{l.label}</a>
          ))}
        </nav>
        <div className="[&_a]:min-h-11 [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm">
          <Cta section="nav">{nav.cta}</Cta>
        </div>
      </div>
    </header>
  );
}
