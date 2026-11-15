"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

/**
 * Testimonios. Cita grande, con navegacion si hay mas de una.
 *
 * Con el array vacio la seccion NO se renderiza: no se inventan testimonios,
 * y un cartel de "todavia no hay" genera la pregunta contraria. Cargá el
 * primero real (con permiso) en data.ts y aparece sola.
 */
export function Testimonios() {
  const { testimonios } = content;
  const [index, setIndex] = useState(0);

  if (!testimonios.items || testimonios.items.length === 0) return null;

  const actual = testimonios.items[index];
  const hayVarios = testimonios.items.length > 1;

  return (
    <Section id="testimonios">
      <SectionTitle title={testimonios.title} />
      <figure className="max-w-[52rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <blockquote>
              <p className="font-display text-[clamp(1.6rem,3.8vw,3rem)] font-medium leading-[1.2] tracking-[-0.008em] text-[color:var(--text)]">
                {actual.quote}
              </p>
            </blockquote>
            <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--accent)]">
                {actual.autor}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]">
                {actual.rol}
              </span>
            </figcaption>
          </motion.div>
        </AnimatePresence>
      </figure>

      {hayVarios ? (
        <div className="mt-10 flex gap-2">
          {testimonios.items.map((item, i) => (
            <button
              key={item.autor}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.autor}
              aria-current={i === index ? "true" : undefined}
              className="py-2"
            >
              <span
                className="block h-[3px] w-10 transition-colors duration-300"
                style={{ backgroundColor: i === index ? "var(--accent)" : "var(--hairline-strong)" }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
