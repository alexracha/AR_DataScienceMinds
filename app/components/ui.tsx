"use client";

import { track } from "@/lib/track";

const PLACEHOLDER = /(\[REPLACE:[^\]]*\])/g;

/** Renders text; any [REPLACE: …] segment is highlighted so gaps can't be missed. */
export function Txt({ children }: { children: string }) {
  return (
    <>
      {children.split(PLACEHOLDER).map((part, i) =>
        part.startsWith("[REPLACE:") ? (
          <mark key={i} className="rounded bg-yellow-200 px-1 text-yellow-900" title="Placeholder: replace before launch">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function Cta({ children, section, variant = "solid" }: { children: string; section: string; variant?: "solid" | "outline" }) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-base font-semibold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-accent text-on-accent hover:bg-accent-hover"
      : "border-2 border-navy text-navy hover:bg-navy hover:text-white";
  return (
    <a href="#contact" onClick={() => track("cta_click", { section })} className={`${base} ${styles}`}>
      <Txt>{children}</Txt>
    </a>
  );
}

export function Section({
  id,
  title,
  tone = "light",
  children,
  intro,
}: {
  id: string;
  title: string;
  tone?: "light" | "mist" | "dark";
  intro?: string;
  children: React.ReactNode;
}) {
  const bg = tone === "dark" ? "bg-navy text-white" : tone === "mist" ? "bg-mist" : "bg-paper";
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`${bg} px-4 py-16 sm:py-24`}>
      <div className="mx-auto max-w-6xl">
        <h2 id={`${id}-h`} className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          <Txt>{title}</Txt>
        </h2>
        {intro && (
          <p className={`mt-4 max-w-2xl text-lg ${tone === "dark" ? "text-white/80" : "text-muted"}`}>
            <Txt>{intro}</Txt>
          </p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
