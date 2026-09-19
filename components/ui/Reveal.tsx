"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Reveal. La entrada estandar de toda la pagina: el contenido "popea" al entrar
 * en pantalla (sube, escala y rebota apenas, con un spring) una sola vez.
 *
 * Solo transform y opacity (DESIGN.md). Con reduced-motion no anima: queda en
 * su estado final, nitido. Sin JS, el <noscript> del layout fuerza visibilidad.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 240, damping: 20, mass: 0.7, delay }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
