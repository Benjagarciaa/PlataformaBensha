"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { content } from "@/content/data";

/**
 * Aviso de prueba social (DESIGN.md 7).
 *
 * Aparece UNA sola vez por sesion, cuando el usuario pasa la seccion Anatomia,
 * y se va solo a los 6 segundos. No finge ser real: arriba dice, en mono, que
 * es un componente propio. Es un guino honesto al oficio, no un fake.
 *
 * La deteccion es por medicion directa con rAF, no IntersectionObserver: los
 * observers ya fallaron con Lenis (mismo criterio que Resultados y el riel).
 * El loop se corta apenas dispara.
 */

const KEY = "aviso-prueba-visto";

export function AvisoPrueba() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);
  const aviso = content.avisoPrueba;

  useEffect(() => {
    if (window.sessionStorage.getItem(KEY)) return;
    let raf = 0;

    const check = () => {
      const el = document.getElementById("anatomia");
      if (el && el.getBoundingClientRect().bottom < window.innerHeight * 0.5) {
        window.sessionStorage.setItem(KEY, "1");
        setVisible(true);
        timer.current = window.setTimeout(() => setVisible(false), 6000);
        return;
      }
      raf = window.requestAnimationFrame(check);
    };

    raf = window.requestAnimationFrame(check);
    return () => {
      window.cancelAnimationFrame(raf);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[45] w-[min(92vw,320px)] -translate-x-1/2 md:left-6 md:translate-x-0">
      <AnimatePresence>
        {visible ? (
          <motion.aside
            aria-live="polite"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4 pr-9"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-[10px] w-[10px] border-l border-t border-[color:var(--accent)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 h-[10px] w-[10px] border-b border-r border-[color:var(--accent)]"
            />

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--accent)]">
              {aviso.label}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-soft)] font-mono text-[13px] text-[color:var(--accent)]"
              >
                {aviso.inicial}
              </span>
              <p className="text-[14px] leading-tight text-[color:var(--text)]">
                <span className="font-medium">{aviso.nombre}</span>{" "}
                {aviso.accion}
              </p>
            </div>

            <p className="mt-3 text-[11px] leading-snug text-[color:var(--text-faint)]">
              {aviso.nota}
            </p>

            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label={aviso.cerrar}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center font-mono text-[12px] text-[color:var(--text-faint)] transition-colors hover:text-[color:var(--accent)]"
            >
              ✕
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
