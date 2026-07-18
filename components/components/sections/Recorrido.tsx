"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Recorrido. Tabla editorial tipo legajo, sin cards: año en mono al margen,
 * título, institución, y acordeón que abre el detalle.
 *
 * El acordeón anima con grid-template-rows 0fr a 1fr en vez de max-height.
 * max-height obliga a inventar un valor mayor al contenido real, y ahí la
 * transición se ve desganada al abrir y apurada al cerrar.
 */

function Fila({
  item,
  open,
  onToggle,
}: {
  item: {
    id: string;
    anio: string;
    titulo: string;
    institucion: string;
    detalle: string;
    destacado?: boolean;
    sello?: string;
  };
  open: boolean;
  onToggle: () => void;
}) {
  const accent = item.destacado ? "var(--accent)" : "var(--hairline)";

  return (
    <li
      className="relative border-t transition-colors duration-300"
      style={{ borderColor: open || item.destacado ? "var(--accent)" : "var(--hairline)" }}
    >
      {item.destacado ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[9px] w-[9px] border-l border-t"
            style={{ borderColor: accent }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-[9px] w-[9px] border-r border-t"
            style={{ borderColor: accent }}
          />
        </>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-baseline gap-4 py-6 text-left md:gap-8"
      >
        <span
          className="w-[52px] shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300"
          style={{
            color: open || item.destacado
              ? "var(--accent)"
              : "var(--text-faint)",
          }}
        >
          {item.anio}
        </span>

        <span className="flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-display text-[clamp(1.15rem,2vw,1.6rem)] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
              {item.titulo}
            </span>
            {item.sello ? (
              <span className="border border-[color:var(--accent)] px-2 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--accent)]">
                {item.sello}
              </span>
            ) : null}
          </span>
          <span className="mt-1.5 block text-[15px] leading-relaxed text-[color:var(--text-dim)]">
            {item.institucion}
          </span>
        </span>

        <span
          aria-hidden
          className="relative mt-2 h-[9px] w-[9px] shrink-0"
          style={{
            color: open ? "var(--accent)" : "var(--text-faint)",
          }}
        >
          <span className="absolute left-0 top-[4px] block h-px w-[9px] bg-current transition-colors duration-300" />
          <span
            className="absolute left-[4px] top-0 block h-[9px] w-px bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: open ? "scaleY(0)" : "scaleY(1)" }}
          />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="max-w-[62ch] pb-7 pl-[68px] text-[15px] leading-relaxed text-[color:var(--text-dim)] md:pl-[84px]">
            {item.detalle}
          </p>
        </div>
      </div>
    </li>
  );
}

export function Recorrido() {
  const { recorrido } = content;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Section id="recorrido">
      <SectionTitle title={recorrido.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {recorrido.intro}
        </p>
      </Reveal>

      <div className="flex flex-col gap-16">
        {recorrido.grupos.map((grupo) => (
          <div key={grupo.id}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
              {grupo.label}
            </p>
            <ul className="flex flex-col">
              {grupo.items.map((item) => (
                <Fila
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() =>
                    setOpenId((current) => (current === item.id ? null : item.id))
                  }
                />
              ))}
            </ul>
            <div className="border-t border-[color:var(--hairline)]" />
          </div>
        ))}
      </div>
    </Section>
  );
}
