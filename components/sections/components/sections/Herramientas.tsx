"use client";

import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

/**
 * Herramientas. Cada modulo lleva el beneficio en criollo grande y el nombre de
 * la herramienta chico en mono: el cliente compra "que no te copien", no compra
 * "ofuscacion".
 *
 * Desktop: grilla de 5 por 2, las diez a la vista. Obligar a scrollear una banda
 * horizontal en una pantalla ancha es friccion sin motivo.
 * Mobile: ahi si scroll horizontal con snap, que ocupa una fila en vez de diez.
 *
 * Los LED respiran con el reloj global en offsets alternados, para que no lata
 * todo al unisono. Nada tiene su propio timer.
 */

function Modulo({
  benefit,
  tool,
  index,
}: {
  benefit: string;
  tool: string;
  index: number;
}) {
  return (
    <div className="group flex flex-col justify-between gap-6 bg-[color:var(--bg-deep)] px-5 py-7 transition-colors duration-300 hover:bg-[color:var(--surface)]">
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
        <p className="font-display text-[1.1rem] font-medium leading-snug tracking-[-0.02em] text-[color:var(--text)]">
          {benefit}
        </p>
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] transition-colors duration-300 group-hover:text-[color:var(--accent)]">
          {tool}
        </p>
      </div>
    </div>
  );
}

export function Herramientas() {
  const { herramientas } = content;

  return (
    <Section id="herramientas">
      <SectionTitle title={herramientas.title} />

      <p className="mb-10 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
        {herramientas.intro}
      </p>

      {/* ── Desktop: las diez a la vista ─────────────────────────────── */}
      <div className="hidden border border-[color:var(--hairline)] bg-[color:var(--hairline)] md:grid md:grid-cols-3 md:gap-px lg:grid-cols-5">
        {herramientas.modulos.map((modulo, index) => (
          <Modulo
            key={modulo.tool}
            benefit={modulo.benefit}
            tool={modulo.tool}
            index={index}
          />
        ))}
      </div>

      {/* ── Mobile: una fila con scroll y snap ───────────────────────── */}
      <div className="md:hidden">
        <div className="-mx-6 flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-[color:var(--hairline)] bg-[color:var(--hairline)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {herramientas.modulos.map((modulo, index) => (
            <div
              key={modulo.tool}
              className="w-[62vw] max-w-[240px] shrink-0 snap-start"
            >
              <Modulo
                benefit={modulo.benefit}
                tool={modulo.tool}
                index={index}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
          {herramientas.nota}
        </p>
      </div>
    </Section>
  );
}
