"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { Cta } from "./ui";

/** Shows after the hero, hides while the form is on screen. Mobile only. */
export function StickyMobileCta() {
  const [past, setPast] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const form = document.getElementById("contact");
    if (!hero || !form) return;
    const a = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { threshold: 0 });
    const b = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.1 });
    a.observe(hero);
    b.observe(form);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  if (!past || atForm) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="[&_a]:w-full"><Cta section="sticky-mobile">{copy.brand.primaryCta}</Cta></div>
    </div>
  );
}
