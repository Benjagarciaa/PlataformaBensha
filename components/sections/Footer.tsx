"use client";

import { useRef } from "react";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";
import { useLoops } from "@/lib/escena";

/**
 * Footer. Una barra de cierre: quién, dónde, qué hace y volver arriba.
 * El punto celeste respira con una animación CSS (compositor, sin JS).
 */
export function Footer() {
  const { footer, identity } = content;
  const ref = useRef<HTMLElement>(null);
  useLoops(ref);

  return (
    <footer ref={ref} className="relative z-10 border-t border-[color:var(--hairline)] bg-[color:var(--bg-deep)]">
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16 lg:pl-28 lg:pr-20">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.01em] text-[color:var(--text)]">
              {identity.name}
            </p>
            <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-[color:var(--text-dim)]">{footer.colofon}</p>
          </div>
          <button
            type="button"
            onClick={() => irASeccion("inicio")}
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-dim)] transition-colors hover:text-[color:var(--accent)]"
          >
            {footer.backToTop}
          </button>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[color:var(--hairline)] pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
          <span>
            © {footer.year} · {identity.name}
          </span>
          <span className="flex items-center gap-2">
            {identity.location}
            <span aria-hidden className="a-latido loop inline-block h-[6px] w-[6px] bg-[color:var(--accent)]" />
          </span>
        </div>
      </div>
    </footer>
  );
}
