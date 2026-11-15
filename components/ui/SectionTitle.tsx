"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useSeccionViva } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  intro?: ReactNode;
  /** en desktop la bajada va al costado del titular, abajo a la derecha: ahorra alto */
  lado?: boolean;
  className?: string;
};

/**
 * Titulo de seccion: eyebrow en mono celeste, titular grande que sube desde
 * una mascara y bajada. Visible por defecto: la mascara solo se arma con las
 * escenas vivas (JS cargado y sin reduced-motion).
 */
export function SectionTitle({ title, eyebrow, intro, lado = false, className }: SectionTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const enVista = useInView(ref, { once: true, amount: 0.4 });
  const oculto = vivo && !enVista;
  const transicion = oculto
    ? { duration: 0 }
    : { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div
      ref={ref}
      className={cn(
        "mb-10 md:mb-14",
        lado ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-end lg:gap-12" : "max-w-5xl",
        className
      )}
    >
      <div className={lado ? "max-w-5xl" : undefined}>
        {eyebrow ? (
          <motion.p
            data-anim
            initial={false}
            animate={oculto ? { opacity: 0 } : { opacity: 1 }}
            transition={transicion}
            className="mb-5 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]"
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <h2 className="overflow-hidden pb-[0.08em] font-display text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.015em] text-balance text-[color:var(--text)]">
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
      </div>
      {intro ? (
        <motion.p
          data-anim
          initial={false}
          animate={oculto ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
          transition={oculto ? { duration: 0 } : { ...transicion, delay: 0.15 }}
          className={cn(
            "mt-6 max-w-[40ch] text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.5] text-pretty text-[color:var(--text-soft)]",
            lado && "lg:mt-0 lg:pb-[0.45em] lg:text-[clamp(1.1rem,1.35vw,1.3rem)]"
          )}
        >
          {intro}
        </motion.p>
      ) : null}
    </div>
  );
}
