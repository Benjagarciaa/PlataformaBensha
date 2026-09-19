"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Cursor custom (DESIGN.md lo habilita). Un punto exacto y un anillo que lo
 * sigue con un poco de lag y crece sobre lo clickeable. Es la firma "viva" que
 * acompana todo el sitio.
 *
 * Solo se activa en pointer fino (mouse) y sin reduced-motion: en celular o con
 * el sistema en reposo no aparece y el cursor nativo queda intacto. El punto va
 * a la posicion exacta, asi clickear y escribir sigue siendo preciso; el lag
 * vive solo en el anillo.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.body.style.cursor = "none";

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      setHovering(
        !!target?.closest(
          "a, button, [role=button], input, textarea, select, label",
        ),
      );
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.style.cursor = "";
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] block h-[6px] w-[6px] rounded-full bg-[color:var(--accent)]"
        style={{ x, y, marginLeft: -3, marginTop: -3 }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] block h-[30px] w-[30px] rounded-full border border-[color:var(--accent)]"
        style={{ x: ringX, y: ringY, marginLeft: -15, marginTop: -15 }}
        animate={{ scale: hovering ? 1.7 : 1, opacity: hovering ? 0.9 : 0.5 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}
