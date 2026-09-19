"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
};

/**
 * leading-[0.95] es obligatorio: sin interlineado explicito, un titular de
 * 4rem hereda el line-height por defecto del navegador y las lineas quedan
 * separadas por medio renglon de aire.
 */
export function SectionTitle({ title, eyebrow, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-6 max-w-3xl md:mb-8", className)}>
      {eyebrow ? (
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          {eyebrow}
        </div>
      ) : null}
      <motion.h2
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.7 }}
        className="font-display text-[clamp(2.2rem,4.6vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em] text-[color:var(--text)]"
      >
        {title}
      </motion.h2>
      {/* Linea de acento que se traza sola: el detalle firma en cada seccion. */}
      <motion.span
        aria-hidden
        className="mt-4 block h-px w-14 origin-left bg-[color:var(--accent)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  );
}
