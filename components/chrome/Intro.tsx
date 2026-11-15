"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { content } from "@/content/data";
import { alEscenaLista, marcarIntroFin, marcarIntroSube, marcarIntroTapa } from "@/lib/intro";
import { hayWebGLAcelerado } from "@/lib/webgl";

/**
 * Intro. La cortina que "traza el plano" al entrar y se abre revelando el sitio.
 *
 * Reglas para que sume y no moleste:
 *  - No se renderiza en el servidor (mounted flag): el HTML que ve Google y el
 *    caso sin JS traen la pagina limpia, sin cortina encima.
 *  - Dura lo justo: se levanta apenas la escena del hero pinto su primer
 *    cuadro, con un minimo para que se lea el nombre (MINIMO) y un tope
 *    (MAXIMO). Cuando sube, el caos ya se esta moviendo detras.
 *  - Si al hidratar el hero ya estaba a la vista hace rato (celular lento),
 *    no aparece: taparlo para despues destaparlo seria un parpadeo. Ahi el
 *    caos en SVG ya se mueve y funde con la escena cuando llega.
 *  - Salteable: cualquier click, scroll, tecla o toque la cierra al instante.
 *  - Con reduced-motion no aparece. Tampoco sin WebGL acelerado: ahi el hero
 *    es el SVG estatico y no hay escena que esperar.
 *  - Bloquea el scroll mientras dura y lo suelta al terminar.
 *  - Todo lo que anima aca es transform y opacity (WAAPI en el compositor):
 *    sigue fluido aunque el hilo principal arme la escena.
 */

const MINIMO = 900;
const MAXIMO = 1500;
/** si el hero ya se ve hace mas que esto al hidratar, no hay cortina */
const TARDE = 700;

const contenedor: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
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
    // El hero ya se veia: la cortina llegaria tarde.
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
    const tarde = fcp !== undefined && performance.now() - fcp > TARDE;
    if (reduce || slow || tarde || !hayWebGLAcelerado()) {
      setVisible(false);
      marcarIntroFin();
      return;
    }

    marcarIntroTapa();
    // Bloquear el scroll mientras dura la cortina.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const inicio = performance.now();
    let lista = false;
    const cerrar = () => setVisible(false);
    const intentar = () => {
      if (lista && performance.now() - inicio >= MINIMO) cerrar();
    };
    const bajaLista = alEscenaLista(() => {
      lista = true;
      intentar();
    });
    const timerMinimo = window.setTimeout(intentar, MINIMO);
    const timerMaximo = window.setTimeout(cerrar, MAXIMO);

    window.addEventListener("pointerdown", cerrar, { once: true });
    window.addEventListener("wheel", cerrar, { once: true, passive: true });
    window.addEventListener("touchstart", cerrar, { once: true, passive: true });
    window.addEventListener("keydown", cerrar, { once: true });

    return () => {
      bajaLista();
      window.clearTimeout(timerMinimo);
      window.clearTimeout(timerMaximo);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("pointerdown", cerrar);
      window.removeEventListener("wheel", cerrar);
      window.removeEventListener("touchstart", cerrar);
      window.removeEventListener("keydown", cerrar);
    };
  }, []);

  // Al empezar a subir: el hero ya se ve y el scroll queda libre.
  useEffect(() => {
    if (visible) return;
    marcarIntroSube();
    document.body.style.overflow = "";
  }, [visible]);

  if (!mounted) return null;

  return (
    <AnimatePresence onExitComplete={marcarIntroFin}>
      {visible ? (
        <motion.div
          key="intro"
          data-cortina
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bg-deep)] px-6"
          initial={{ transform: "translateY(0%)" }}
          exit={{ transform: "translateY(-100%)" }}
          transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
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
              <span className="text-[color:var(--accent)]">{content.identity.lastName}</span>
            </motion.h1>

            {/* La linea que "traza" el plano de izquierda a derecha. */}
            <motion.span
              aria-hidden
              className="mt-7 block h-px w-[min(320px,70vw)] origin-left bg-[color:var(--accent)]"
              initial={{ transform: "scaleX(0)" }}
              animate={{ transform: "scaleX(1)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
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
