"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { content } from "@/content/data";

/**
 * Intro. La cortina que "traza el plano" al entrar y se abre revelando el sitio.
 *
 * Reglas para que sume y no moleste:
 *  - No se renderiza en el servidor (mounted flag): el HTML que ve Google y el
 *    caso sin JS traen la pagina limpia, sin cortina encima.
 *  - Aparece cada vez que se entra o se recarga la pagina.
 *  - Salteable: cualquier click, scroll, tecla o toque la cierra al instante.
 *  - Con reduced-motion no aparece.
 *  - Bloquea el scroll mientras dura y lo suelta al terminar.
 */

const DURACION = 2200;

const contenedor: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Intro() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Patron "mounted": la cortina no se renderiza en el server (SEO y sin-JS
    // ven la pagina limpia). Setear el flag al montar es el uso correcto aca.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(false);
      return;
    }

    // Bloquear el scroll mientras dura la cortina.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrar = () => setVisible(false);
    const timer = window.setTimeout(cerrar, DURACION);

    window.addEventListener("pointerdown", cerrar, { once: true });
    window.addEventListener("wheel", cerrar, { once: true, passive: true });
    window.addEventListener("touchstart", cerrar, { once: true, passive: true });
    window.addEventListener("keydown", cerrar, { once: true });

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("pointerdown", cerrar);
      window.removeEventListener("wheel", cerrar);
      window.removeEventListener("touchstart", cerrar);
      window.removeEventListener("keydown", cerrar);
    };
  }, []);

  // Al desmontarse la cortina, asegurar que el scroll quede libre.
  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bg-deep)] px-6"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.83, 0, 0.17, 1] }}
        >
          {/* Escuadras en L: el marco del plano. */}
          <span aria-hidden className="pointer-events-none absolute left-6 top-6 h-4 w-4 border-l border-t border-[color:var(--accent)] md:left-10 md:top-10" />
          <span aria-hidden className="pointer-events-none absolute right-6 top-6 h-4 w-4 border-r border-t border-[color:var(--accent)] md:right-10 md:top-10" />
          <span aria-hidden className="pointer-events-none absolute bottom-6 left-6 h-4 w-4 border-b border-l border-[color:var(--accent)] md:bottom-10 md:left-10" />
          <span aria-hidden className="pointer-events-none absolute bottom-6 right-6 h-4 w-4 border-b border-r border-[color:var(--accent)] md:bottom-10 md:right-10" />

          <motion.div
            variants={contenedor}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center"
          >
            <motion.p
              variants={item}
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-faint)] md:text-[11px]"
            >
              {content.identity.locationShort}
            </motion.p>

            <motion.h1
              variants={item}
              className="font-display text-[clamp(2.4rem,9vw,5.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-[color:var(--text)]"
            >
              {content.identity.firstName}{" "}
              <span className="text-[color:var(--accent)]">
                {content.identity.lastName}
              </span>
            </motion.h1>

            {/* La linea que "traza" el plano de izquierda a derecha. */}
            <motion.span
              aria-hidden
              className="mt-7 block h-px w-[min(320px,70vw)] origin-left bg-[color:var(--accent)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />

            <motion.p
              variants={item}
              className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]"
            >
              {content.identity.role}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
