"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Cursor custom inmersivo (DESIGN.md lo habilita).
 *
 * En vez del punto+anillo de todos lados, usa el lenguaje del sitio: cuatro
 * escuadras. En reposo forman una reticula chica que sigue al mouse; al pasar
 * sobre algo clickeable, las escuadras se abren y ENCUADRAN el elemento (efecto
 * magnetico). Un punto exacto en el centro mantiene la precision para clickear
 * y escribir.
 *
 * Solo en mouse y sin reduced-motion; en touch o en reposo el cursor nativo
 * queda intacto.
 */

const INTERACTIVE = "a, button, [role=button], input, textarea, select, label";
const RETICLE = 26;
const PAD = 8;

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [framing, setFraming] = useState(false);

  // Punto exacto (sin lag): precision para clickear y escribir.
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Marco: reticula en reposo, encuadre del elemento al hover. Suavizado.
  const fx = useMotionValue(-100);
  const fy = useMotionValue(-100);
  const fw = useMotionValue(RETICLE);
  const fh = useMotionValue(RETICLE);
  const sx = useSpring(fx, { stiffness: 700, damping: 40, mass: 0.35 });
  const sy = useSpring(fy, { stiffness: 700, damping: 40, mass: 0.35 });
  const sw = useSpring(fw, { stiffness: 500, damping: 42, mass: 0.5 });
  const sh = useSpring(fh, { stiffness: 500, damping: 42, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.body.style.cursor = "none";

    const move = (event: PointerEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);

      const target = (event.target as HTMLElement | null)?.closest(
        INTERACTIVE,
      ) as HTMLElement | null;

      if (target) {
        const r = target.getBoundingClientRect();
        fx.set(r.left - PAD);
        fy.set(r.top - PAD);
        fw.set(r.width + PAD * 2);
        fh.set(r.height + PAD * 2);
        setFraming(true);
      } else {
        fx.set(event.clientX - RETICLE / 2);
        fy.set(event.clientY - RETICLE / 2);
        fw.set(RETICLE);
        fh.set(RETICLE);
        setFraming(false);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.style.cursor = "";
    };
  }, [dotX, dotY, fx, fy, fw, fh]);

  if (!enabled) return null;

  const corner = "absolute h-[9px] w-[9px] border-[color:var(--accent)]";

  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] block h-[5px] w-[5px] rounded-full bg-[color:var(--accent)]"
        style={{ x: dotX, y: dotY, marginLeft: -2.5, marginTop: -2.5 }}
        animate={{ opacity: framing ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120]"
        style={{ x: sx, y: sy, width: sw, height: sh }}
        animate={{ opacity: framing ? 1 : 0.75 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`${corner} left-0 top-0 border-l border-t`} />
        <span className={`${corner} right-0 top-0 border-r border-t`} />
        <span className={`${corner} bottom-0 left-0 border-b border-l`} />
        <span className={`${corner} bottom-0 right-0 border-b border-r`} />
      </motion.div>
    </>
  );
}
