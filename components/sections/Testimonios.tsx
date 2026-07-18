"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

/**
 * Testimonios. Cita monumental unica, con navegacion si hay mas de una.
 *
 * Si el array esta vacio la seccion NO SE RENDERIZA. A proposito: un cartel
 * que dice "todavia no tengo testimonios" en un sitio que declara 130 marcas
 * genera la pregunta contraria a la que uno quiere. Mejor que no exista hasta
 * que haya uno de verdad. Cargá el primero en data.ts y aparece sola.
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

      <figure className="max-w-[46rem]">
        <span
          aria-hidden
          className="mb-8 block h-px w-16 bg-[color:var(--accent)]"
        />
        <blockquote>
          <p className="font-display text-[clamp(1.5rem,3.6vw,2.6rem)] font-medium leading-[1.25] tracking-[-0.02em] text-[color:var(--text)]">
            {actual.quote}
          </p>
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--accent)]">
            {actual.autor}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            {actual.rol}
          </span>
        </figcaption>
      </figure>

      {hayVarios ? (
        <div className="mt-10 flex gap-2">
          {testimonios.items.map((item, i) => (
            <button
              key={item.autor}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Testimonio de ${item.autor}`}
              aria-current={i === index ? "true" : undefined}
              className="py-2"
            >
              <span
                className="block h-[3px] w-10 transition-colors duration-300"
                style={{
                  backgroundColor:
                    i === index ? "var(--accent)" : "var(--hairline)",
                }}
              />
            </button>
          ))}
        </div>
      ) : null}
    </Section>
  );
}