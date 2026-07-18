"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Anatomia de una landing. La seccion firma del sitio.
 *
 * Deteccion del bloque activo: por MEDICION DIRECTA en cada frame.
 * Ni IntersectionObserver (pierde eventos con scroll rapido) ni useScroll de motion
 * (busca el contenedor scrolleable mas cercano y con Lenis o con overflow-x-clip en un
 * ancestro se equivoca, y el progreso queda clavado en cero). Aca se mide el rect de
 * cada anotacion y gana la que este mas cerca del 45% de la pantalla. No depende de
 * ninguna libreria ni de que se dispare ningun evento.
 *
 * Tampoco usa el pin de GSAP que pide DESIGN.md: position:sticky hace lo mismo sin
 * tener que sincronizar ScrollTrigger con Lenis a mano.
 */

/** Geometria del wireframe. Las alturas reflejan la proporcion real de una pagina. */
const GEOMETRY = [
  { y: 26, h: 76 },
  { y: 112, h: 54 },
  { y: 176, h: 64 },
  { y: 250, h: 46 },
  { y: 306, h: 58 },
  { y: 374, h: 82 },
  { y: 466, h: 34 },
  { y: 510, h: 52 },
  { y: 572, h: 28 },
];

const BLOCK_X = 40;
const BLOCK_W = 220;

function Wireframe({ activeIndex }: { activeIndex: number }) {
  const blocks = content.anatomia.blocks;

  return (
    <svg
      viewBox="0 0 300 630"
      className="h-auto w-full max-w-[300px]"
      role="img"
      aria-label="Wireframe de una pagina de producto con sus nueve bloques"
    >
      {/* linea de cota: mide el alto total */}
      <path d="M14 26 V600" stroke="var(--hairline)" strokeWidth="1" fill="none" />
      <path d="M9 26 H19" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M9 600 H19" stroke="var(--hairline)" strokeWidth="1" />

      {/* marco del dispositivo */}
      <rect
        x="26"
        y="10"
        width="248"
        height="610"
        fill="none"
        stroke="rgba(200,224,255,0.14)"
        strokeWidth="1"
      />

      {blocks.map((block, index) => {
        const geo = GEOMETRY[index] ?? GEOMETRY[GEOMETRY.length - 1];
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;

        return (
          <g key={block.id}>
            <rect
              x={BLOCK_X}
              y={geo.y}
              width={BLOCK_W}
              height={geo.h}
              fill="var(--accent)"
              opacity={isActive ? 0.1 : 0}
              style={{ transition: "opacity 420ms cubic-bezier(0.16,1,0.3,1)" }}
            />
            <rect
              x={BLOCK_X}
              y={geo.y}
              width={BLOCK_W}
              height={geo.h}
              fill="none"
              stroke={isActive ? "var(--accent)" : "var(--hairline)"}
              strokeWidth={isActive ? 1.8 : 1}
              opacity={isPast ? 0.55 : 1}
              style={{
                transition:
                  "stroke 420ms cubic-bezier(0.16,1,0.3,1), opacity 420ms ease",
              }}
            />
            <text
              x="290"
              y={geo.y + geo.h / 2 + 3}
              textAnchor="end"
              style={{
                fontFamily: "var(--font-mono)",
                transition: "fill 420ms ease",
              }}
              fontSize="8"
              letterSpacing="0.8"
              fill={isActive ? "var(--accent)" : "var(--text-faint)"}
            >
              {block.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Anatomia() {
  const { anatomia } = content;
  const blocks = anatomia.blocks;

  const listRef = useRef<HTMLOListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = -1;

    const measure = () => {
      const list = listRef.current;
      if (list) {
        const listRect = list.getBoundingClientRect();
        const onScreen =
          listRect.bottom > 0 && listRect.top < window.innerHeight;

        if (onScreen) {
          // la linea de lectura: 45% de la altura de la pantalla
          const readingLine = window.innerHeight * 0.45;
          let best = 0;
          let bestDistance = Infinity;

          itemsRef.current.forEach((node, index) => {
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(center - readingLine);
            if (distance < bestDistance) {
              bestDistance = distance;
              best = index;
            }
          });

          if (best !== last) {
            last = best;
            setActiveIndex(best);
          }
        }
      }
      raf = window.requestAnimationFrame(measure);
    };

    raf = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <Section id="anatomia">
      <SectionTitle eyebrow={anatomia.eyebrow} title={anatomia.title} />

      <Reveal>
        <p className="mb-16 max-w-[62ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
          {anatomia.intro}
        </p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* ── El plano, fijo mientras se recorren las anotaciones ──── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Wireframe activeIndex={activeIndex} />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
            {anatomia.planoLabel}
            <span className="ml-2 text-[color:var(--accent)]">
              {blocks[activeIndex]?.n}
            </span>
            <span className="mx-1">/</span>
            {String(blocks.length).padStart(2, "0")}
          </p>
        </div>

        {/* ── Las anotaciones ──────────────────────────────────────── */}
        <ol ref={listRef} className="flex flex-col">
          {blocks.map((block, index) => {
            const isActive = index === activeIndex;

            return (
              <li
                key={block.id}
                ref={(node) => {
                  itemsRef.current[index] = node;
                }}
                className="relative border-l py-10 pl-8 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  borderColor: isActive ? "var(--accent)" : "var(--hairline)",
                }}
              >
                <div
                  className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!opacity-100 motion-reduce:!translate-x-0"
                  style={{
                    opacity: isActive ? 1 : 0.35,
                    transform: isActive ? "translateX(6px)" : "translateX(0)",
                  }}
                >
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-500"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-faint)",
                    }}
                  >
                    BLOQUE {block.n}
                  </span>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                    {block.name}
                  </h3>
                  <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-[color:var(--text-dim)]">
                    {block.note}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Reveal>
        <p className="mt-16 max-w-[62ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
          {anatomia.outro}
        </p>
      </Reveal>
    </Section>
  );
}