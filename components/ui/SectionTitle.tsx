"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useSeccionViva } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  intro?: ReactNode;
  className?: string;
};

/**
 * Titulo de seccion: eyebrow en mono celeste, titular grande que sube desde
 * una mascara y bajada. Visible por defecto: la mascara solo se arma con las
 * escenas vivas (JS cargado y sin reduced-motion).
 */
export function SectionTitle({ title, eyebrow, intro, className }: SectionTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const enVista = useInView(ref, { once: true, amount: 0.4 });
  const oculto = vivo && !enVista;
  const transicion = oculto
    ? { duration: 0 }
    : { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div ref={ref} className={cn("mb-14 max-w-5xl md:mb-20", className)}>
      {eyebrow ? (
        <motion.p
          data-anim
          initial={false}
          animate={oculto ? { opacity: 0 } : { opacity: 1 }}
          transition={transicion}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]"
        >
          {eyebrow}
        </motion.p>
      ) : null}
      <h2 className="overflow-hidden pb-[0.08em] font-display text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.015em] text-[color:var(--text)]">
        <motion.span
          data-anim
          className="block"
          initial={false}
          animate={oculto ? { y: "105%" } : { y: "0%" }}
          transition={transicion}
        >
          {title}
        </motion.span>
      </h2>
      {intro ? (
        <motion.p
          data-anim
          initial={false}
          animate={oculto ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
          transition={oculto ? { duration: 0 } : { ...transicion, delay: 0.15 }}
          className="mt-8 max-w-[40ch] text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.5] text-[color:var(--text-soft)]"
        >
          {intro}
        </motion.p>
      ) : null}
    </div>
  );
}
