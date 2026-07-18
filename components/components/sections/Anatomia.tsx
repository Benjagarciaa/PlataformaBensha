"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Anatomia de una landing. La seccion firma del sitio.
 *
 * Desktop: el plano queda fijo y las anotaciones se recorren scrolleando. El bloque
 * activo se detecta por MEDICION DIRECTA en cada frame, no por IntersectionObserver
 * (pierde eventos con scroll rapido) ni por useScroll de motion (con Lenis o con
 * overflow-x-clip en un ancestro queda clavado en cero).
 *
 * Cada bloque del plano dibuja su contenido adentro: el hero tiene su titular y su
 * boton, bundles tiene sus tres opciones con la del medio mas alta, prueba social
 * tiene sus avatares. Un rectangulo vacio no dice nada; esto se lee como una pagina.
 *
 * Mobile: carrusel horizontal con scroll-snap. Apiladas, las nueve anotaciones son
 * 1600px de scroll; como carrusel son 320px.
 */

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
const PAD = 14;

/** El contenido dibujado adentro de cada bloque. */
function Contenido({
  id,
  y,
  h,
  color,
}: {
  id: string;
  y: number;
  h: number;
  color: string;
}) {
  const x = BLOCK_X + PAD;
  const inner = BLOCK_W - PAD * 2;
  const common = { fill: color };

  switch (id) {
    case "hero":
      return (
        <g>
          <rect {...common} x={x} y={y + 14} width={inner * 0.66} height="8" opacity="0.55" />
          <rect {...common} x={x} y={y + 30} width={inner * 0.48} height="4" opacity="0.3" />
          <rect {...common} x={x} y={y + 40} width={inner * 0.56} height="4" opacity="0.3" />
          <rect {...common} x={x} y={y + h - 24} width="52" height="14" opacity="0.5" />
        </g>
      );
    case "problema":
      return (
        <g>
          <rect {...common} x={x} y={y + 14} width={inner * 0.86} height="4" opacity="0.32" />
          <rect {...common} x={x} y={y + 26} width={inner * 0.72} height="4" opacity="0.32" />
          <rect {...common} x={x} y={y + 38} width={inner * 0.54} height="4" opacity="0.32" />
        </g>
      );
    case "mecanismo":
      return (
        <g>
          <rect {...common} x={x} y={y + 14} width="18" height="18" opacity="0.42" />
          <rect {...common} x={x + 26} y={y + 17} width={inner * 0.5} height="4" opacity="0.3" />
          <rect {...common} x={x + 26} y={y + 27} width={inner * 0.38} height="4" opacity="0.3" />
          <rect {...common} x={x} y={y + 44} width={inner * 0.74} height="4" opacity="0.3" />
        </g>
      );
    case "prueba":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              {...common}
              cx={x + 8 + i * 20}
              cy={y + 16}
              r="7"
              opacity="0.45"
            />
          ))}
          <rect {...common} x={x} y={y + 30} width={inner * 0.8} height="4" opacity="0.3" />
        </g>
      );
    case "antes-despues":
      return (
        <g>
          <rect {...common} x={x} y={y + 12} width={(inner - 10) / 2} height={h - 24} opacity="0.28" />
          <rect
            {...common}
            x={x + (inner - 10) / 2 + 10}
            y={y + 12}
            width={(inner - 10) / 2}
            height={h - 24}
            opacity="0.42"
          />
        </g>
      );
    case "bundles":
      return (
        <g>
          {[0, 1, 2].map((i) => {
            const w = (inner - 16) / 3;
            const tall = i === 1;
            const boxH = tall ? h - 26 : h - 42;
            return (
              <rect
                key={i}
                {...common}
                x={x + i * (w + 8)}
                y={y + h - 12 - boxH}
                width={w}
                height={boxH}
                opacity={tall ? 0.55 : 0.28}
              />
            );
          })}
        </g>
      );
    case "garantia":
      return (
        <g>
          <circle {...common} cx={x + 10} cy={y + h / 2} r="9" opacity="0.45" />
          <rect {...common} x={x + 26} y={y + h / 2 - 2} width={inner * 0.6} height="4" opacity="0.3" />
        </g>
      );
    case "faq":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                {...common}
                x={x}
                y={y + 12 + i * 14}
                width={inner * 0.62}
                height="3.5"
                opacity="0.3"
              />
              <rect
                {...common}
                x={x + inner - 9}
                y={y + 12 + i * 14 - 2.5}
                width="9"
                height="2"
                opacity="0.45"
              />
              <rect
                {...common}
                x={x + inner - 5.5}
                y={y + 12 + i * 14 - 6}
                width="2"
                height="9"
                opacity="0.45"
              />
            </g>
          ))}
        </g>
      );
    case "cierre":
      return (
        <rect {...common} x={x} y={y + 7} width={inner} height="14" opacity="0.6" />
      );
    default:
      return null;
  }
}

function Wireframe({ activeIndex }: { activeIndex: number }) {
  const blocks = content.anatomia.blocks;

  return (
    <svg
      viewBox="0 0 300 630"
      className="h-auto w-full max-w-[300px]"
      role="img"
      aria-label="Wireframe de una pagina de producto con sus nueve bloques"
    >
      <path d="M14 26 V600" stroke="var(--hairline)" strokeWidth="1" fill="none" />
      <path d="M9 26 H19" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M9 600 H19" stroke="var(--hairline)" strokeWidth="1" />

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
          <g
            key={block.id}
            opacity={isActive ? 1 : isPast ? 0.5 : 0.75}
            style={{ transition: "opacity 420ms ease" }}
          >
            <rect
              x={BLOCK_X}
              y={geo.y}
              width={BLOCK_W}
              height={geo.h}
              fill="var(--accent)"
              opacity={isActive ? 0.08 : 0}
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
              style={{ transition: "stroke 420ms cubic-bezier(0.16,1,0.3,1)" }}
            />
            <Contenido
              id={block.id}
              y={geo.y}
              h={geo.h}
              color={isActive ? "var(--accent)" : "var(--text-faint)"}
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

  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const listRef = useRef<HTMLOListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ── Desktop: quien esta mas cerca de la linea de lectura ──────────
  useEffect(() => {
    if (!isDesktop) return;

    let raf = 0;
    let last = -1;

    const measure = () => {
      const list = listRef.current;
      if (list) {
        const listRect = list.getBoundingClientRect();
        const onScreen =
          listRect.bottom > 0 && listRect.top < window.innerHeight;

        if (onScreen) {
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
  }, [isDesktop]);

  // ── Mobile: que tarjeta quedo centrada ────────────────────────────
  useEffect(() => {
    if (isDesktop) return;
    const track = carouselRef.current;
    if (!track) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDistance = Infinity;

        Array.from(track.children).forEach((child, index) => {
          const card = child as HTMLElement;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(cardCenter - center);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
          }
        });

        setActiveIndex((current) => (current === best ? current : best));
        ticking = false;
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  /** Tocar un segmento lleva a esa tarjeta. El snap se apaga durante el viaje. */
  const goTo = useCallback((index: number) => {
    const track = carouselRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;

    const previousSnap = track.style.scrollSnapType;
    track.style.scrollSnapType = "none";

    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior: "smooth" });

    window.setTimeout(() => {
      track.style.scrollSnapType = previousSnap || "";
    }, 520);
  }, []);

  const activeLabel = blocks[activeIndex]?.n ?? "01";

  return (
    <Section id="anatomia">
      <SectionTitle eyebrow={anatomia.eyebrow} title={anatomia.title} />

      <Reveal>
        <p className="mb-10 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mb-12 md:text-[17px]">
          {anatomia.intro}
        </p>
      </Reveal>

      {isDesktop ? (
        <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Wireframe activeIndex={activeIndex} />
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {anatomia.planoLabel}
              <span className="ml-2 text-[color:var(--accent)]">
                {activeLabel}
              </span>
              <span className="mx-1">/</span>
              {String(blocks.length).padStart(2, "0")}
            </p>
          </div>

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
                    className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!translate-x-0 motion-reduce:!opacity-100"
                    style={{
                      opacity: isActive ? 1 : 0.35,
                      transform: isActive ? "translateX(6px)" : "translateX(0)",
                    }}
                  >
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-500"
                      style={{
                        color: isActive ? "var(--accent)" : "var(--text-faint)",
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
      ) : (
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {anatomia.planoLabel}
              <span className="ml-2 text-[color:var(--accent)]">
                {activeLabel}
              </span>
              <span className="mx-1">/</span>
              {String(blocks.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {anatomia.deslizaLabel}
            </p>
          </div>

          <div className="mb-6 flex gap-1">
            {blocks.map((block, index) => (
              <button
                key={block.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir al bloque ${block.n}, ${block.name}`}
                className="flex-1 py-2"
              >
                <span
                  className="block h-[3px] w-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      index === activeIndex
                        ? "var(--accent)"
                        : index < activeIndex
                          ? "var(--accent-soft)"
                          : "var(--hairline)",
                  }}
                />
              </button>
            ))}
          </div>

          <div
            ref={carouselRef}
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {blocks.map((block, index) => {
              const isActive = index === activeIndex;

              return (
                <article
                  key={block.id}
                  className="relative w-[80vw] max-w-[340px] shrink-0 snap-center border p-6 transition-colors duration-300"
                  style={{
                    borderColor: isActive
                      ? "var(--accent)"
                      : "var(--hairline)",
                    backgroundColor: isActive
                      ? "var(--accent-soft)"
                      : "var(--surface)",
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1.5 top-1.5 h-[8px] w-[8px] border-l border-t"
                    style={{
                      borderColor: isActive
                        ? "var(--accent)"
                        : "var(--hairline)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-1.5 right-1.5 h-[8px] w-[8px] border-b border-r"
                    style={{
                      borderColor: isActive
                        ? "var(--accent)"
                        : "var(--hairline)",
                    }}
                  />

                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--text-faint)",
                    }}
                  >
                    BLOQUE {block.n}
                  </span>
                  <h3 className="mt-3 font-display text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                    {block.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--text-dim)]">
                    {block.note}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <Reveal>
        <p className="mt-12 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mt-14 md:text-[17px]">
          {anatomia.outro}
        </p>
      </Reveal>
    </Section>
  );
}
