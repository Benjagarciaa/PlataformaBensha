"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { content } from "@/content/data";
import { marcarIntroFin } from "@/lib/intro";
import { hayWebGLAcelerado } from "@/lib/webgl";

/**
 * Intro. La cortina que "traza el plano" al entrar y se abre revelando el sitio.
 *
 * Reglas para que sume y no moleste:
 *  - No se renderiza en el servidor (mounted flag): el HTML que ve Google y el
 *    caso sin JS traen la pagina limpia, sin cortina encima.
 *  - Aparece cada vez que se entra o se recarga la pagina.
 *  - Salteable: cualquier click, scroll, tecla o toque la cierra al instante.
 *  - Con reduced-motion no aparece. Tampoco sin WebGL acelerado: ahi el hero
 *    es el SVG estatico y no hay escena que esperar.
 *  - Bloquea el scroll mientras dura y lo suelta al terminar.
 *  - Al terminar avisa (lib/intro.ts). Mientras dura, el hero baja three y
 *    arma la escena con el loop en pausa; cuando la cortina se levanta, la
 *    escena ya esta. Por eso todo lo que anima aca es transform y opacity
 *    (WAAPI en el compositor): sigue fluido aunque el hilo principal trabaje.
 */

const DURACION = 1500;

const contenedor: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
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
    // En conexiones lentas de verdad (o Ahorro de datos), no bloquear con la
    // cortina: la pagina tiene que aparecer cuanto antes.
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const slow = !!conn && (conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType ?? ""));
    if (reduce || slow || !hayWebGLAcelerado()) {
      setVisible(false);
      marcarIntroFin();
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
    <AnimatePresence onExitComplete={marcarIntroFin}>
      {visible ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bg-deep)] px-6"
          initial={{ transform: "translateY(0%)" }}
          exit={{ transform: "translateY(-100%)" }}
          transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
        >
          <motion.div
            variants={contenedor}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center"
          >
            <motion.p
              variants={item}
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-dim)] md:text-[11px]"
            >
              {content.identity.locationShort}
            </motion.p>

            <motion.h1
              variants={item}
              className="font-display text-[clamp(2.4rem,9vw,5.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.01em] text-[color:var(--text)]"
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
              initial={{ transform: "scaleX(0)" }}
              animate={{ transform: "scaleX(1)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            />

            <motion.p
              variants={item}
              className="mt-6 font-mono text-[10px] uppercase tracking-[0.11em] text-[color:var(--text-dim)]"
            >
              {content.identity.role}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
