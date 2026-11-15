"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";

/**
 * Riel de avance. Desktop: una linea fina al margen izquierdo que se llena con
 * el scroll real, con un punto por seccion (navegacion). Mobile: solo una
 * barra de 2px de progreso.
 *
 * Sin polling: el llenado es un transform atado a useScroll y la seccion
 * activa la dice un IntersectionObserver.
 */
export function Riel() {
  const { scrollYProgress, scrollY } = useScroll();
  const llenado = useTransform(scrollYProgress, (v) => `scaleY(${v})`);
  const llenadoMovil = useTransform(scrollYProgress, (v) => `scaleY(${v})`);
  const opacidad = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - 300) / 400)));
  const [activa, setActiva] = useState<string>(content.waypoints[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    // las secciones diferidas se montan despues (ver <Diferida>): al montarse
    // reemplazan su HTML, asi que se vuelven a buscar
    const observar = () => {
      io.disconnect();
      content.waypoints.forEach((w) => {
        const el = document.getElementById(w.id);
        if (el) io.observe(el);
      });
    };
    observar();
    window.addEventListener("escenas:montada", observar);
    return () => {
      io.disconnect();
      window.removeEventListener("escenas:montada", observar);
    };
  }, []);

  return (
    <>
      {/* mobile: solo el progreso */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 h-dvh w-[2px] bg-[color:var(--hairline)] lg:hidden"
      >
        <motion.div
          className="h-full w-full origin-top bg-[color:var(--accent)]"
          style={{ transform: llenadoMovil }}
        />
      </div>

      {/* desktop: la linea y un punto por seccion */}
      <motion.nav
        aria-label={content.riel.aria}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-dvh w-[88px] lg:block"
        style={{ opacity: opacidad }}
      >
        <div className="absolute bottom-[18vh] left-[44px] top-[18vh] w-px bg-[color:var(--hairline)]">
          <motion.div
            className="h-full w-full origin-top bg-[color:var(--accent)]"
            style={{ transform: llenado }}
          />
        </div>

        <ul className="pointer-events-auto absolute bottom-[18vh] left-[44px] top-[18vh] w-px">
          {content.waypoints.map((punto, i) => {
            const top = (i / (content.waypoints.length - 1)) * 100;
            const esActiva = punto.id === activa;
            return (
              <li key={punto.id} className="absolute left-0" style={{ top: `${top}%` }}>
                <button
                  type="button"
                  onClick={() => irASeccion(punto.id)}
                  aria-label={punto.label}
                  aria-current={esActiva ? "true" : undefined}
                  className="group relative block -translate-x-1/2 -translate-y-1/2 p-2"
                >
                  <span
                    className="block h-[7px] w-[7px] transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: esActiva ? "scale(1.3)" : "scale(0.7)",
                      backgroundColor: esActiva ? "var(--accent)" : "var(--text-faint)",
                    }}
                  />
                  <span className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[color:var(--bg)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {punto.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}
