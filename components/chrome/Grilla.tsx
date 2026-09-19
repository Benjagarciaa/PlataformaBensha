"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Grilla de fondo. El plano milimetrado sobre el que se apoya todo.
 *
 * Reacciona al mouse: se desplaza unos pixeles en sentido contrario al cursor,
 * dando una sensacion sutil de profundidad (parallax) en toda la pagina. En
 * touch o con reduced-motion queda quieta. El div se extiende un poco mas alla
 * del viewport (-inset-6) para que el desplazamiento no muestre bordes.
 */
export function Grilla() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const x = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const y = useTransform(sy, [-0.5, 0.5], [14, -14]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const move = (event: PointerEvent) => {
      mx.set(event.clientX / window.innerWidth - 0.5);
      my.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my]);

  return (
    <motion.div
      style={{ x, y }}
      className="pointer-events-none fixed -inset-6 z-[5] bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_85%)]"
      aria-hidden="true"
    />
  );
}
