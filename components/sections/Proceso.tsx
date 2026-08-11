"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Proceso. La UNICA seccion numerada del sitio, porque acá el orden es
 * informacion real: no se puede diseñar antes de escribir el copy.
 *
 * La cota de progreso se DIBUJA cuando la seccion entra en pantalla: una
 * linea de acento se llena sobre la cota gris (izquierda a derecha en
 * desktop, arriba a abajo en mobile) y los puntos se encienden en secuencia.
 * La deteccion es por rAF, no IntersectionObserver: los observers fallan con
 * Lenis (mismo criterio que Resultados y el riel).
 *
 * UN SOLO DOM: una sola lista, el CSS cambia la direccion. El <Reveal> va
 * ADENTRO del <li> (un <ol><div><li> es invalido y rompe la numeracion).
 */

function useEnVista<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    let raf = 0;
    const check = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
          setVisible(true);
          return;
        }
      }
      raf = window.requestAnimationFrame(check);
    };
    raf = window.requestAnimationFrame(check);
    return () => window.cancelAnimationFrame(raf);
  }, [visible]);

  return { ref, visible };
}

export function Proceso() {
  const { proceso } = content;
  const reduce = useReducedMotion();
  const { ref, visible } = useEnVista<HTMLDivElement>();
  const on = visible || reduce;

  return (
    <Section id="proceso">
      <SectionTitle title={proceso.title} />

      <Reveal>
        <p className="mb-8 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mb-10 md:text-[17px]">
          {proceso.intro}
        </p>
      </Reveal>

      <div ref={ref} className="relative">
        {/* cota vertical gris (hasta 1279px) */}
        <span
          aria-hidden
          className="absolute bottom-8 left-[4px] top-2 w-px bg-[color:var(--hairline)] xl:hidden"
        />
        {/* acento vertical que se dibuja de arriba hacia abajo */}
        <motion.span
          aria-hidden
          className="absolute bottom-8 left-[4px] top-2 w-px origin-top bg-[color:var(--accent)] xl:hidden"
          initial={false}
          animate={{ scaleY: on ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* cota horizontal gris (desde 1280px) */}
        <span
          aria-hidden
          className="absolute left-0 right-0 top-[6px] hidden h-px bg-[color:var(--hairline)] xl:block"
        />
        {/* acento horizontal que se dibuja de izquierda a derecha */}
        <motion.span
          aria-hidden
          className="absolute left-0 right-0 top-[6px] hidden h-px origin-left bg-[color:var(--accent)] xl:block"
          initial={false}
          animate={{ scaleX: on ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <span
          aria-hidden
          className="absolute left-0 top-0 hidden h-[13px] w-px bg-[color:var(--accent)] xl:block"
        />
        <span
          aria-hidden
          className="absolute right-0 top-0 hidden h-[13px] w-px bg-[color:var(--accent)] xl:block"
        />

        <ol className="flex flex-col xl:grid xl:grid-cols-6 xl:gap-6">
          {proceso.pasos.map((paso, index) => (
            <li
              key={paso.n}
              className="group relative pb-10 pl-9 last:pb-0 xl:pb-0 xl:pl-0 xl:pt-10"
            >
              {/* punto: se enciende en secuencia a medida que la cota lo alcanza */}
              <motion.span
                aria-hidden
                className="absolute left-0 top-[4px] block h-[9px] w-[9px] border xl:top-[2px]"
                initial={false}
                animate={{
                  backgroundColor: on ? "var(--accent)" : "var(--bg)",
                  borderColor: on ? "var(--accent)" : "var(--hairline)",
                }}
                transition={{
                  duration: 0.35,
                  delay: on ? 0.25 + index * 0.14 : 0,
                }}
              />
              <Reveal delay={index * 0.09}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  {paso.n}
                </p>
                <h3 className="mt-2 font-display text-[1.3rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)] md:text-[1.5rem] xl:mt-3 xl:text-[1.3rem]">
                  {paso.titulo}
                </h3>
                <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-[color:var(--text-dim)] md:text-[16px] xl:mt-2.5 xl:text-[15px]">
                  {paso.detalle}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
