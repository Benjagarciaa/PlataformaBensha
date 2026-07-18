"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/data";

/**
 * El riel de profundidad. Carril fijo del margen izquierdo, desktop >= lg.
 *
 * No es decoracion: mide profundidad de scroll, que es una de las metricas con
 * las que se optimiza una landing de verdad. La estructura dice algo cierto.
 *
 * Medicion por rAF y no por evento de scroll: con Lenis los listeners se pierden
 * o llegan tarde, y ya nos comimos ese bug una vez en Anatomia.
 * En mobile no existe: degrada a una barra de 2px al borde izquierdo.
 */

const TICKS = [20, 40, 60, 80];

export function RielScroll() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>(content.waypoints[0].id);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    let lastActive = "";

    const measure = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY || doc.scrollTop;

      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      setProgress(ratio);
      setVisible(y > 400);

      // waypoint activo: la seccion que cruza el 40% de la pantalla
      const line = window.innerHeight * 0.4;
      let current = content.waypoints[0].id;

      for (const point of content.waypoints) {
        const el = document.getElementById(point.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = point.id;
      }

      if (current !== lastActive) {
        lastActive = current;
        setActiveId(current);
      }

      rafRef.current = window.requestAnimationFrame(measure);
    };

    rafRef.current = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, []);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <>
      {/* mobile: solo el progreso, sin waypoints ni lectura */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 h-dvh w-[2px] bg-[color:var(--hairline)] lg:hidden"
      >
        <div
          className="w-full origin-top bg-[color:var(--accent)]"
          style={{ height: `${pct}%` }}
        />
      </div>

      {/* desktop: el riel completo */}
      <nav
        aria-label={content.riel.aria}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-dvh w-[96px] transition-opacity duration-700 lg:block"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* lectura en vertical */}
        <p
          className="absolute left-[18px] top-[92px] font-mono text-[9px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]"
          style={{ writingMode: "vertical-rl" }}
        >
          {content.riel.label}
          <span className="ml-3 text-[color:var(--accent)]">{pct}%</span>
        </p>

        {/* la linea base y la que crece con el scroll */}
        <div className="absolute bottom-[120px] left-[48px] top-[120px] w-px bg-[color:var(--hairline)]">
          <div
            className="w-full origin-top bg-[color:var(--accent)]"
            style={{ height: `${pct}%` }}
          />

          {/* cotas cada 20% */}
          {TICKS.map((tick) => (
            <span
              key={tick}
              aria-hidden
              className="absolute left-0 h-px w-[7px] bg-[color:var(--hairline)]"
              style={{ top: `${tick}%` }}
            />
          ))}
        </div>

        {/* waypoints: indicador y navegacion a la vez */}
        <ul className="pointer-events-auto absolute bottom-[120px] left-[48px] top-[120px] w-px">
          {content.waypoints.map((point, index) => {
            const top = (index / (content.waypoints.length - 1)) * 100;
            const isActive = point.id === activeId;

            return (
              <li
                key={point.id}
                className="absolute left-0"
                style={{ top: `${top}%` }}
              >
                <button
                  type="button"
                  onClick={() => goTo(point.id)}
                  aria-label={point.label}
                  aria-current={isActive ? "true" : undefined}
                  className="group relative -translate-x-1/2 -translate-y-1/2 p-2"
                >
                  <span
                    className="block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      width: isActive ? 9 : 5,
                      height: isActive ? 9 : 5,
                      backgroundColor: isActive
                        ? "var(--accent)"
                        : "var(--text-faint)",
                    }}
                  />
                  <span className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[color:var(--bg)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {point.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
