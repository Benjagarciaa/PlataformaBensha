"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/data";
import { onFrame } from "@/lib/raf";

/**
 * Nav. Barra fija que se esconde al bajar y vuelve al subir.
 *
 * Los links son <a href="#seccion"> de verdad, no <button>. Se ven igual, pero
 * un ancla real deja abrir en pestaña nueva, se puede copiar el link, y los
 * buscadores entienden la estructura de la página. El preventDefault está solo
 * para que el scroll sea suave.
 *
 * Corre a 20fps sobre el loop compartido: esto solo compara dos números.
 */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    return onFrame(() => {
      const y = window.scrollY;
      setSolid(y > 40);
      // margen de 8px para que un temblor del trackpad no la haga parpadear
      if (Math.abs(y - lastY.current) > 8) {
        setHidden(y > lastY.current && y > 240);
        lastY.current = y;
      }
    }, 20);
  }, []);

  const irA = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const el = document.getElementById(href.replace(/^#/, ""));
      if (!el) return;
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        backgroundColor: solid ? "var(--bg)" : "transparent",
        borderBottom: solid
          ? "1px solid var(--hairline)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-4 md:px-12 lg:pl-28 lg:pr-20">
        <a
          href="#inicio"
          onClick={(e) => irA(e, "#inicio")}
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text)] transition-colors hover:text-[color:var(--accent)]"
        >
          {content.identity.firstName}
          <span className="text-[color:var(--text-faint)]">
            {" "}
            {content.identity.lastName}
          </span>
        </a>

        <span
          aria-hidden
          className="hidden h-px flex-1 bg-[color:var(--hairline)] md:block"
        />

        <nav className="ml-auto hidden items-center gap-8 md:flex">
          {content.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => irA(e, link.href)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] transition-colors hover:text-[color:var(--accent)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          onClick={(e) => irA(e, "#contacto")}
          className="ml-auto flex items-center gap-2 border border-[color:var(--hairline)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent-soft)] md:ml-0"
        >
          <span
            aria-hidden
            className="inline-block h-[5px] w-[5px] bg-[color:var(--accent)]"
            style={{ opacity: "calc(0.4 + 0.6 * var(--trazo, 0.7))" }}
          />
          {content.nav.status}
        </a>
      </div>
    </header>
  );
}
