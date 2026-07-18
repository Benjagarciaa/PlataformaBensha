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
    <div className={cn("mb-10 max-w-3xl", className)}>
      {eyebrow ? (
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          {eyebrow}
        </div>
      ) : null}
      <motion.h2
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[clamp(2.2rem,4.6vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em] text-[color:var(--text)]"
      >
        {title}
      </motion.h2>
    </div>
  );
}
