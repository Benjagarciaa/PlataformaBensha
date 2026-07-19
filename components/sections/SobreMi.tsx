// Sin "use client": esta sección no usa estado ni efectos, así que se
// renderiza solo en el servidor y no manda JavaScript al navegador.
// <Reveal> sí es de cliente, y está bien: un componente de servidor
// puede renderizar uno de cliente sin problema.
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Sobre mi. Split asimetrico: el texto domina, la ficha tecnica queda al costado
 * como un cuadro de rotulo de plano. Cuando haya foto, va arriba de la ficha,
 * en duotono celeste, dentro del mismo marco.
 */
export function SobreMi() {
  const { sobreMi } = content;

  return (
    <Section id="sobre-mi">
      <SectionTitle title={sobreMi.title} />

      <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          {sobreMi.paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={index * 0.06}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="relative border border-[color:var(--hairline)] bg-[color:var(--surface)] p-7 lg:sticky lg:top-28">
            <span
              aria-hidden
              className="pointer-events-none absolute left-2 top-2 h-[10px] w-[10px] border-l border-t border-[color:var(--accent)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-2 top-2 h-[10px] w-[10px] border-r border-t border-[color:var(--accent)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-2 left-2 h-[10px] w-[10px] border-b border-l border-[color:var(--accent)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-2 right-2 h-[10px] w-[10px] border-b border-r border-[color:var(--accent)]"
            />

            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {sobreMi.fichaLabel}
            </p>

            <dl className="flex flex-col">
              {sobreMi.ficha.map((row) => (
                <div
                  key={row.k}
                  className="flex items-baseline justify-between gap-4 border-t border-[color:var(--hairline)] py-3 first:border-t-0 first:pt-0"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    {row.k}
                  </dt>
                  <dd className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--text)]">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
