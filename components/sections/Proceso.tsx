"use client";

import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Proceso. La UNICA seccion numerada del sitio, porque acá el orden es
 * informacion real: no se puede diseñar antes de escribir el copy.
 *
 * OJO con el marcador: la celda lleva `pt-10` y el numero NO lleva margen.
 * Si el padding va en cero y el margen en el hijo, ese margen se escapa hacia
 * afuera (margin collapsing), empuja la celda entera hacia abajo y se lleva
 * puesto el marcador absoluto, que termina despegado de la linea de cota.
 *
 * Desktop (>= xl): tira horizontal de seis pasos sobre una linea de cota.
 * Abajo de 1280px seis columnas quedan de 140px: ahi va la version vertical.
 */
export function Proceso() {
  const { proceso } = content;

  return (
    <Section id="proceso">
      <SectionTitle title={proceso.title} />

      <Reveal>
        <p className="mb-16 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {proceso.intro}
        </p>
      </Reveal>

      {/* ── Desktop ancho: cota horizontal ──────────────────────────── */}
      <div className="relative hidden xl:block">
        {/* la linea de cota con sus dos topes */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[6px] h-px bg-[color:var(--hairline)]"
        />
        <div
          aria-hidden
          className="absolute left-0 top-0 h-[13px] w-px bg-[color:var(--accent)]"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 h-[13px] w-px bg-[color:var(--accent)]"
        />

        <ol className="grid grid-cols-6 gap-6">
          {proceso.pasos.map((paso, index) => (
            <Reveal key={paso.n} delay={index * 0.07}>
              <li className="group relative pt-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-[2px] block h-[9px] w-[9px] border border-[color:var(--hairline)] bg-[color:var(--bg)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[color:var(--accent)] group-hover:bg-[color:var(--accent)]"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  {paso.n}
                </p>
                <h3 className="mt-3 font-display text-[1.3rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                  {paso.titulo}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[color:var(--text-dim)]">
                  {paso.detalle}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* ── Hasta 1279px: la misma cota, en vertical ────────────────── */}
      <ol className="relative flex flex-col xl:hidden">
        <span
          aria-hidden
          className="absolute bottom-4 left-[4px] top-2 w-px bg-[color:var(--hairline)]"
        />
        {proceso.pasos.map((paso) => (
          <li key={paso.n} className="group relative pb-10 pl-9 last:pb-0">
            <span
              aria-hidden
              className="absolute left-0 top-[4px] block h-[9px] w-[9px] border border-[color:var(--accent)] bg-[color:var(--accent)]"
            />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
              {paso.n}
            </p>
            <h3 className="mt-2 font-display text-[1.3rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)] md:text-[1.5rem]">
              {paso.titulo}
            </h3>
            <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-[color:var(--text-dim)] md:text-[16px]">
              {paso.detalle}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}