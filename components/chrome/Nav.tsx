"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";

/**
 * Nav. Barra fija, simple: nombre, cuatro secciones y el estado.
 * Se esconde al bajar y vuelve al subir. Lee el scroll con useScroll de motion
 * (sin listeners propios) y solo re-renderiza cuando cambia de estado.
 *
 * Los links son <a href="#seccion"> reales: se pueden abrir en otra pestaña y
 * los buscadores entienden la estructura. El preventDefault es solo para que
 * el salto sea suave.
 */
export function Nav() {
  const { scrollY } = useScroll();
  const [oculto, setOculto] = useState(false);
  const [solido, setSolido] = useState(false);
  const ultimo = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolido(y > 40);
    // margen de 8px para que un temblor del trackpad no la haga parpadear
    const delta = y - ultimo.current;
    if (Math.abs(delta) > 8) {
      setOculto(delta > 0 && y > 320);
      ultimo.current = y;
    }
  });

  const ir = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    irASeccion(href);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: oculto ? "translateY(-100%)" : "translateY(0)",
        backgroundColor: solido ? "var(--veil)" : "transparent",
        borderColor: solido ? "var(--hairline)" : "transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-4 md:px-12 lg:pl-28 lg:pr-20">
        <a
          href="#inicio"
          onClick={(e) => ir(e, "#inicio")}
          className="font-display text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--text)] transition-colors hover:text-[color:var(--accent)]"
        >
          {content.identity.name}
        </a>

        <nav aria-label={content.nav.aria} className="ml-auto hidden items-center gap-9 md:flex">
          {content.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => ir(e, link.href)}
              className="text-[14px] text-[color:var(--text-dim)] transition-colors hover:text-[color:var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          onClick={(e) => ir(e, "#contacto")}
          className="ml-auto flex items-center gap-2.5 border border-[color:var(--accent-line)] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent-soft)] md:ml-0"
        >
          <span aria-hidden className="a-latido loop-libre inline-block h-[6px] w-[6px] bg-[color:var(--accent)]" />
          {content.nav.status}
        </a>
      </div>
    </header>
  );
}
