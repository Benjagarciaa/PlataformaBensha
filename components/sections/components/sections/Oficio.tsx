"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Lo que domino. Indice tipografico: el PESO Y EL TAMAÑO de cada palabra marcan
 * el dominio real. Sin barras de progreso ni porcentajes inventados, que es la
 * forma mas comun de mentir en un portfolio.
 *
 * 700 = todos los dias · 600 = con soltura · 500 = me defiendo
 */

const ESCALA: Record<number, string> = {
  700: "text-[clamp(1.5rem,3.4vw,2.6rem)] font-bold",
  600: "text-[clamp(1.15rem,2.4vw,1.85rem)] font-medium",
  500: "text-[clamp(0.95rem,1.7vw,1.3rem)] font-normal",
};

export function Oficio() {
  const { oficio } = content;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Section id="oficio">
      <SectionTitle title={oficio.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {oficio.intro}
        </p>
      </Reveal>

      <div className="flex flex-col gap-14">
        {oficio.grupos.map((grupo, index) => (
          <Reveal key={grupo.id} delay={index * 0.06}>
            <div className="grid gap-4 md:grid-cols-[160px_1fr] md:gap-10">
              <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
                {grupo.label}
              </p>

              <div
                className="flex flex-wrap items-baseline gap-x-6 gap-y-2"
                onMouseLeave={() => setHovered(null)}
              >
                {grupo.items.map((item) => {
                  const dim = hovered !== null && hovered !== item.name;

                  return (
                    <span
                      key={item.name}
                      onMouseEnter={() => setHovered(item.name)}
                      className={`cursor-default font-display leading-none tracking-[-0.02em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!opacity-100 ${
                        ESCALA[item.w] ?? ESCALA[500]
                      }`}
                      style={{
                        color:
                          hovered === item.name
                            ? "var(--accent)"
                            : "var(--text)",
                        opacity: dim ? 0.28 : 1,
                      }}
                    >
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2 border-t border-[color:var(--hairline)] pt-6">
        {oficio.leyenda.map((entrada) => (
          <span
            key={entrada}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]"
          >
            {entrada}
          </span>
        ))}
      </div>
    </Section>
  );
}
