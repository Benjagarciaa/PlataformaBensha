import Image from "next/image";
// Sin "use client": esta sección no usa estado ni efectos, así que se
// renderiza solo en el servidor y no manda JavaScript al navegador.
// <Reveal> sí es de cliente, y está bien: un componente de servidor
// puede renderizar uno de cliente sin problema.
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Proyectos. El destacado ocupa el ancho completo; el resto va en grilla.
 *
 * Si un proyecto todavia no tiene captura (`captura: null`), en vez de romper
 * o dejar un hueco se dibuja un marco achurado con su etiqueta. Queda como una
 * decision de diseño y no como un error, y permite publicar la seccion antes
 * de tener todas las imagenes.
 *
 * Las capturas van en public/proyectos/ y se referencian como /proyectos/x.webp
 * Vercel las sirve solas: no hace falta base de datos ni servicio externo.
 */

function Mockup({
  captura,
  alt,
  etiqueta,
  grande = false,
}: {
  captura: string | null;
  alt: string;
  etiqueta: string;
  grande?: boolean;
}) {
  return (
    <div className="relative border border-[color:var(--hairline)] bg-[color:var(--surface)] p-3">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1.5 top-1.5 z-10 h-[9px] w-[9px] border-l border-t border-[color:var(--accent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 right-1.5 z-10 h-[9px] w-[9px] border-b border-r border-[color:var(--accent)]"
      />

      <div className="relative aspect-[9/16] w-full overflow-hidden bg-[color:var(--bg-deep)]">
        {captura ? (
          <Image
            src={captura}
            alt={alt}
            fill
            sizes={grande ? "(max-width: 1024px) 90vw, 420px" : "(max-width: 768px) 90vw, 320px"}
            className="object-cover object-top"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 10px, rgba(200,224,255,0.045) 10px 11px)",
            }}
          >
            <span className="px-6 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-[color:var(--text-faint)]">
              {etiqueta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Bloques({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((bloque) => (
        <li
          key={bloque}
          className="border border-[color:var(--hairline)] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]"
        >
          {bloque}
        </li>
      ))}
    </ul>
  );
}

export function Proyectos() {
  const { proyectos } = content;
  const [destacado, ...resto] = proyectos.items;

  return (
    <Section id="proyectos">
      <SectionTitle eyebrow={proyectos.eyebrow} title={proyectos.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {proyectos.intro}
        </p>
      </Reveal>

      {/* ── El destacado ─────────────────────────────────────────────── */}
      {destacado ? (
        <Reveal>
          <article className="grid gap-10 border-t border-[color:var(--accent)] pt-10 lg:grid-cols-[420px_1fr] lg:gap-16">
            <Mockup
              captura={destacado.captura}
              alt={`Página de producto de ${destacado.marca}`}
              etiqueta={proyectos.sinCaptura}
              grande
            />

            <div className="flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                {destacado.rubro}
              </p>
              <h3 className="mt-4 font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-[color:var(--text)]">
                {destacado.marca}
              </h3>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
                {destacado.producto}
              </p>
              <p className="mt-6 max-w-[54ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
                {destacado.descripcion}
              </p>

              <div className="mt-8">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                  {proyectos.bloquesLabel}
                </p>
                <Bloques items={destacado.bloques} />
              </div>

              {destacado.url ? (
                <a
                  href={destacado.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-2 border border-[color:var(--hairline)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent-soft)]"
                >
                  {proyectos.verLabel} ↗
                </a>
              ) : null}
            </div>
          </article>
        </Reveal>
      ) : null}

      {/* ── El resto ─────────────────────────────────────────────────── */}
      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {resto.map((proyecto, index) => (
          <Reveal key={proyecto.id} delay={index * 0.06}>
            <article className="flex h-full flex-col">
              <Mockup
                captura={proyecto.captura}
                alt={`Página de producto de ${proyecto.marca}`}
                etiqueta={proyectos.sinCaptura}
              />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                {proyecto.rubro}
              </p>
              <h3 className="mt-2 font-display text-[1.35rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                {proyecto.marca}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[color:var(--text-dim)]">
                {proyecto.descripcion}
              </p>
              <div className="mt-4">
                <Bloques items={proyecto.bloques} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <p className="mt-14 border-t border-[color:var(--hairline)] pt-6 font-display text-[clamp(1.1rem,2.2vw,1.5rem)] font-medium leading-snug tracking-[-0.02em] text-[color:var(--text-dim)]">
        {proyectos.pie}
      </p>
    </Section>
  );
}
