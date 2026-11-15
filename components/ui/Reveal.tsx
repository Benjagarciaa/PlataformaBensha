"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useSeccionViva } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** desplazamiento de entrada en px */
  y?: number;
};

/**
 * Entrada estandar: sube y aparece una sola vez al entrar en pantalla.
 * Visible por defecto (servidor, sin JS, reduced-motion): el estado oculto
 * solo existe con las escenas vivas. Solo transform y opacity.
 */
export function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const enVista = useInView(ref, { once: true, amount: 0.2 });
  const oculto = vivo && !enVista;

  return (
    <motion.div
      ref={ref}
      data-anim
      initial={false}
      animate={oculto ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={oculto ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
