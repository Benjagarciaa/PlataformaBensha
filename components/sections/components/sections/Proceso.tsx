"use client";

import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Proceso. La UNICA seccion numerada del sitio, porque acá el orden es
 * informacion real: no se puede diseñar antes de escribir el copy.
 *
 * Desktop: tira horizontal con una linea de cota que atraviesa los seis pasos.
 * Mobile: la misma cota, girada en vertical al margen izquierdo.
 */
export function Proceso() {
  const { proceso } = content;

  return (
    <Section id="proceso">
      <SectionTitle title={proceso.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {proceso.intro}
        </p>
      </Reveal>

      {/* ── Desktop: cota horizontal ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* la linea de cota con sus dos topes */}
          <div className="absolute left-0 right-0 top-[7px] h-px bg-[color:var(--hairline)]" />
          <div className="absolute left-0 top-0 h-[15px] w-px bg-[color:var(--accent)]" />
          <div className="absolute right-0 top-0 h-[15px] w-px bg-[color:var(--accent)]" />

          <div className="grid grid-cols-6 gap-5">
            {proceso.pasos.map((paso, index) => (
              <Reveal key={paso.n} delay={index * 0.07}>
                <div className="group relative pt-0">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[3px] block h-[9px] w-[9px] bg-[color:var(--bg)] ring-1 ring-[color:var(--hairline)] transition-all duration-300 group-hover:bg-[color:var(--accent)] group-hover:ring-[color:var(--accent)]"
                  />
                  <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                    {paso.n}
                  </p>
                  <h3 className="mt-3 font-display text-[1.35rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                    {paso.titulo}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[color:var(--text-dim)]">
                    {paso.detalle}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile: la misma cota, en vertical ───────────────────────── */}
      <ol className="relative flex flex-col lg:hidden">
        <span
          aria-hidden
          className="absolute bottom-3 left-[4px] top-3 w-px bg-[color:var(--hairline)]"
        />
        {proceso.pasos.map((paso) => (
          <li key={paso.n} className="relative pb-9 pl-8 last:pb-0">
            <span
              aria-hidden
              className="absolute left-0 top-[5px] block h-[9px] w-[9px] bg-[color:var(--accent)]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
              {paso.n}
            </p>
            <h3 className="mt-2 font-display text-[1.3rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
              {paso.titulo}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--text-dim)]">
              {paso.detalle}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
