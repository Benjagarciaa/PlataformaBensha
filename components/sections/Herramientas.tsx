"use client";

// Cliente por la animacion: la banda entra en cascada (stagger) y cada modulo
// reacciona al hover. El copy sigue viniendo de content.
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

/**
 * Herramientas. Cada modulo lleva el beneficio en criollo grande y el nombre
 * de la herramienta chico en mono: el cliente compra "que no te copien", no
 * compra "ofuscacion".
 *
 * UN SOLO DOM: el contenedor pasa de flex con scroll horizontal en mobile a
 * grilla en desktop, con las mismas diez tarjetas.
 *
 * Motion (DESIGN.md): entrada en cascada una sola vez, hover que levanta y una
 * linea de acento que crece. Solo transform y opacity; con reduced-motion todo
 * queda estatico y nitido (el <noscript> del layout ya fuerza visibilidad).
 * Los LED siguen respirando con el reloj global en offsets alternados.
 */

const banda: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Herramientas() {
  const { herramientas } = content;
  const reduce = useReducedMotion();

  return (
    <Section id="herramientas">
      <SectionTitle title={herramientas.title} />

      <p className="mb-10 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
        {herramientas.intro}
      </p>

      <motion.div
        variants={banda}
        initial={reduce ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="-mx-6 flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-[color:var(--hairline)] bg-[color:var(--hairline)] [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:border lg:grid-cols-5 [&::-webkit-scrollbar]:hidden"
      >
        {herramientas.modulos.map((modulo, index) => (
          <motion.div
            key={modulo.tool}
            variants={item}
            whileHover={reduce ? undefined : { y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex w-[62vw] max-w-[240px] shrink-0 snap-start flex-col justify-between gap-6 bg-[color:var(--bg-deep)] px-5 py-7 transition-colors duration-300 hover:bg-[color:var(--surface)] md:w-auto md:max-w-none md:shrink"
          >
            {/* Linea de acento que crece de izquierda a derecha al hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[color:var(--accent)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            />
            <span
              aria-hidden
              className="block h-[6px] w-[6px] bg-[color:var(--accent)]"
              style={{
                opacity:
                  index % 2 === 0
                    ? "calc(0.28 + 0.72 * var(--trazo, 0.6))"
                    : "calc(0.28 + 0.72 * var(--trazo-b, 0.6))",
              }}
            />
            <div>
              <p className="min-h-[3rem] font-display text-[1.1rem] font-medium leading-snug tracking-[-0.02em] text-[color:var(--text)]">
                {modulo.benefit}
              </p>
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] transition-colors duration-300 group-hover:text-[color:var(--accent)]">
                {modulo.tool}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] md:hidden">
        {herramientas.nota}
      </p>
    </Section>
  );
}
