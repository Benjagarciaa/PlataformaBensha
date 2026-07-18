"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/data";

/**
 * Footer. Barra de estado, no un footer de links.
 * La hora arranca vacia para no romper la hidratacion.
 */
export function Footer() {
  const { footer, identity } = content;
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Cordoba",
    });

    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const backToTop = () => {
    const target = document.getElementById("inicio");
    if (target) target.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-[color:var(--hairline)] bg-[color:var(--bg-deep)]">
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-12 lg:pl-28 lg:pr-20">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
          <span>
            © {footer.year} · {identity.name}
          </span>
          <span aria-hidden>·</span>
          <span>{identity.location}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-2">
            {footer.clockLabel}
            <span className="text-[color:var(--text)]">{time || "\u2013"}</span>
            <span
              aria-hidden
              className="inline-block h-[6px] w-[6px] bg-[color:var(--accent)]"
              style={{ opacity: "calc(0.35 + 0.65 * var(--trazo, 0.6))" }}
            />
          </span>

          <button
            type="button"
            onClick={backToTop}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)] transition-colors hover:text-[color:var(--accent)]"
          >
            {footer.backToTop}
          </button>
        </div>

        <p className="mt-6 max-w-[70ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[color:var(--text-faint)]">
          {footer.colofon}
        </p>
      </div>
    </footer>
  );
}
