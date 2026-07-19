"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/data";
import { onFrame } from "@/lib/raf";

/**
 * El riel de profundidad. Carril fijo del margen izquierdo, desktop >= lg.
 *
 * No es decoracion: mide profundidad de scroll, que es una de las metricas con
 * las que se optimiza una landing de verdad.
 *
 * RENDIMIENTO. Antes esto media las once secciones con getBoundingClientRect en
 * CADA frame. Cada una de esas llamadas fuerza al navegador a recalcular el
 * layout: once por frame, sesenta veces por segundo. Ahora:
 *  - las secciones se buscan UNA vez y quedan cacheadas
 *  - las posiciones se leen con offsetTop, que no fuerza reflow
 *  - el progreso corre a 30fps, que ya se ve fluido
 *  - la seccion activa se calcula a 8fps, que el ojo ni nota
 * En mobile no existe: degrada a una barra de 2px al borde izquierdo.
 */

const TICKS = [20, 40, 60, 80];

export function RielScroll() {
  const [pct, setPct] = useState(0);
  const [activeId, setActiveId] = useState<string>(content.waypoints[0].id);
  const [visible, setVisible] = useState(false);

  const seccionesRef = useRef<{ id: string; el: HTMLElement }[]>([]);

  useEffect(() => {
    // se resuelven una sola vez, no en cada frame
    const cachear = () => {
      seccionesRef.current = content.waypoints
        .map((w) => {
          const el = document.getElementById(w.id);
          return el ? { id: w.id, el } : null;
        })
        .filter(Boolean) as { id: string; el: HTMLElement }[];
    };
    cachear();

    // ── progreso: fluido, pero solo lee scrollY ──────────────────────
    const bajaProgreso = onFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      setPct((actual) => {
        const nuevo = Math.round(ratio * 100);
        return actual === nuevo ? actual : nuevo;
      });
      setVisible(y > 400);
    }, 30);

    // ── seccion activa: 8 veces por segundo alcanza y sobra ──────────
    let ultima = "";
    const bajaActiva = onFrame(() => {
      const linea = window.scrollY + window.innerHeight * 0.4;
      let actual = content.waypoints[0].id;

      for (const s of seccionesRef.current) {
        // offsetTop no fuerza recalculo de layout, getBoundingClientRect sí
        if (s.el.offsetTop <= linea) actual = s.id;
      }

      if (actual !== ultima) {
        ultima = actual;
        setActiveId(actual);
      }
    }, 8);

    window.addEventListener("resize", cachear);

    return () => {
      bajaProgreso();
      bajaActiva();
      window.removeEventListener("resize", cachear);
    };
  }, []);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }, []);

  return (
    <>
      {/* mobile: solo el progreso */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 h-dvh w-[2px] bg-[color:var(--hairline)] lg:hidden"
      >
        <div
          className="w-full bg-[color:var(--accent)]"
          style={{ height: `${pct}%` }}
        />
      </div>

      {/* desktop: el riel completo */}
      <nav
        aria-label={content.riel.aria}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-dvh w-[96px] transition-opacity duration-700 lg:block"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p
          className="absolute left-[18px] top-[92px] font-mono text-[9px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]"
          style={{ writingMode: "vertical-rl" }}
        >
          {content.riel.label}
          <span className="ml-3 text-[color:var(--accent)]">{pct}%</span>
        </p>

        <div className="absolute bottom-[120px] left-[48px] top-[120px] w-px bg-[color:var(--hairline)]">
          <div
            className="w-full bg-[color:var(--accent)]"
            style={{ height: `${pct}%` }}
          />
          {TICKS.map((tick) => (
            <span
              key={tick}
              aria-hidden
              className="absolute left-0 h-px w-[7px] bg-[color:var(--hairline)]"
              style={{ top: `${tick}%` }}
            />
          ))}
        </div>

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