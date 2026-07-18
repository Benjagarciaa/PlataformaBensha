"use client";

import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { Placa } from "@/components/ui/Placa";
import { content } from "@/content/data";

/**
 * Servicios. Grid asimetrico de 3 columnas: la pagina de producto domina (2 col),
 * blindaje queda angosto al lado, y abajo se invierte la proporcion.
 * Nada de 2x2 gemelo: la asimetria dice cual es el servicio principal sin decirlo.
 */

// span por indice: 0 y 3 anchos, 1 y 2 angostos
const SPANS = [
  "h-full md:col-span-2",
  "h-full md:col-span-1",
  "h-full md:col-span-1",
  "h-full md:col-span-2",
];

export function Servicios() {
  const { servicios } = content;

  return (
    <Section id="servicios">
      <SectionTitle title={servicios.title} />

      <div className="grid gap-4 md:grid-cols-3">
        {servicios.items.map((item, index) => (
          <Reveal
            key={item.id}
            delay={index * 0.07}
            className={SPANS[index] ?? "h-full md:col-span-1"}
          >
            <Placa className="flex h-full flex-col p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {item.tag}
              </p>
              <h3 className="mt-4 font-display text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                {item.name}
              </h3>
              <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-[color:var(--text-dim)]">
                {item.description}
              </p>
              <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {servicios.hoverTick}
              </span>
            </Placa>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
