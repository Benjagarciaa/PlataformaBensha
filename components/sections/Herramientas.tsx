// Sin "use client": esta sección no usa estado ni efectos, así que se
// renderiza solo en el servidor y no manda JavaScript al navegador.
// <Reveal> sí es de cliente, y está bien: un componente de servidor
// puede renderizar uno de cliente sin problema.
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

/**
 * Herramientas. Cada modulo lleva el beneficio en criollo grande y el nombre
 * de la herramienta chico en mono: el cliente compra "que no te copien", no
 * compra "ofuscacion".
 *
 * UN SOLO DOM, igual que en Proceso. El contenedor pasa de flex con scroll
 * horizontal en mobile a grilla en desktop, con las mismas diez tarjetas.
 *
 * Los LED respiran con el reloj global en offsets alternados, para que no
 * lata todo al unisono. Nada tiene su propio timer.
 */
export function Herramientas() {
  const { herramientas } = content;

  return (
    <Section id="herramientas">
      <SectionTitle title={herramientas.title} />

      <p className="mb-10 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
        {herramientas.intro}
      </p>

      <div className="-mx-6 flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-[color:var(--hairline)] bg-[color:var(--hairline)] [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:border lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {herramientas.modulos.map((modulo, index) => (
          <div
            key={modulo.tool}
            className="group flex w-[62vw] max-w-[240px] shrink-0 snap-start flex-col justify-between gap-6 bg-[color:var(--bg-deep)] px-5 py-7 transition-colors duration-300 hover:bg-[color:var(--surface)] md:w-auto md:max-w-none md:shrink"
          >
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
                {modulo.benefit}
              </p>
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] transition-colors duration-300 group-hover:text-[color:var(--accent)]">
                {modulo.tool}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] md:hidden">
        {herramientas.nota}
      </p>
    </Section>
  );
}
