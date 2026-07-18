"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { content } from "@/content/data";

/**
 * Wireframe de una landing dibujandose bloque por bloque.
 * La geometria vive aca (no es copy); las etiquetas salen de content.hero.wireframe.
 * Jerarquia a proposito: HERO y BUNDLES son los bloques mas altos, porque son los
 * que mas superficie ocupan en una pagina de producto real.
 */

const GEOMETRY = [
  { y: 34, h: 86 },
  { y: 132, h: 44 },
  { y: 188, h: 56 },
  { y: 256, h: 38 },
  { y: 306, h: 92 },
  { y: 410, h: 32 },
  { y: 454, h: 52 },
];

const BLOCK_X = 54;
const BLOCK_W = 168;
const LABEL_X = 248;
const CYCLE_MS = 1600;

export function PlanoCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const blocks = useMemo(
    () =>
      content.hero.wireframe.map((block, index) => ({
        ...block,
        ...(GEOMETRY[index] ?? GEOMETRY[GEOMETRY.length - 1]),
      })),
    [],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shapes = Array.from(svg.querySelectorAll<SVGElement>("[data-draw]"));
    const timers: number[] = [];

    for (const shape of shapes) {
      const length = Number(shape.dataset.length ?? 0);
      const delay = Number(shape.dataset.delay ?? 0);
      if (!length) continue;

      shape.style.strokeDasharray = `${length}`;

      if (reduced) {
        shape.style.strokeDashoffset = "0";
        continue;
      }

      shape.style.strokeDashoffset = `${length}`;
      shape.style.transition =
        "stroke-dashoffset 760ms cubic-bezier(0.16, 1, 0.3, 1)";
      timers.push(
        window.setTimeout(() => {
          shape.style.strokeDashoffset = "0";
        }, delay),
      );
    }

    if (reduced) return () => timers.forEach(window.clearTimeout);

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % blocks.length);
    }, CYCLE_MS);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(interval);
    };
  }, [blocks.length]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 360 580"
      className="h-auto w-full"
      role="img"
      aria-label="Wireframe de una pagina de producto, con sus bloques etiquetados"
    >
      {/* linea de cota: mide el alto total de la pagina */}
      <path
        d="M26 34 V546"
        stroke="var(--hairline)"
        strokeWidth="1"
        fill="none"
      />
      <path d="M20 34 H32" stroke="var(--hairline)" strokeWidth="1" />
      <path d="M20 546 H32" stroke="var(--hairline)" strokeWidth="1" />

      {/* marco del dispositivo */}
      <rect
        x="40"
        y="14"
        width="196"
        height="548"
        fill="none"
        stroke="rgba(200,224,255,0.14)"
        strokeWidth="1"
      />
      <path d="M54 24 H140" stroke="rgba(200,224,255,0.14)" strokeWidth="1" />

      {blocks.map((block, index) => {
        const isActive = index === activeIndex;
        const perimeter = 2 * (BLOCK_W + block.h);
        const centerY = block.y + block.h / 2;

        return (
          <g key={block.id}>
            {isActive && (
              <rect
                x={BLOCK_X}
                y={block.y}
                width={BLOCK_W}
                height={block.h}
                fill="var(--accent)"
                opacity="0.07"
              />
            )}
            <rect
              data-draw
              data-length={perimeter}
              data-delay={index * 190}
              x={BLOCK_X}
              y={block.y}
              width={BLOCK_W}
              height={block.h}
              fill="none"
              stroke={isActive ? "var(--accent)" : "var(--hairline)"}
              strokeWidth={isActive ? 1.8 : 1}
            />
            <path
              d={`M${BLOCK_X + BLOCK_W + 4} ${centerY} H${LABEL_X - 6}`}
              stroke={isActive ? "var(--accent)" : "var(--hairline)"}
              strokeWidth="1"
              opacity={isActive ? 0.9 : 0.45}
            />
            <text
              x={LABEL_X}
              y={centerY + 3.5}
              style={{ fontFamily: "var(--font-mono)" }}
              fontSize="9"
              letterSpacing="1.1"
              fill={isActive ? "var(--accent)" : "var(--text-faint)"}
            >
              {block.label}
            </text>
          </g>
        );
      })}

      {/* barra fija de CTA: siempre encendida, es lo unico que no se pierde de vista */}
      <rect
        data-draw
        data-length={2 * (BLOCK_W + 24)}
        data-delay={blocks.length * 190}
        x={BLOCK_X}
        y="522"
        width={BLOCK_W}
        height="24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.4"
      />
      <path
        d={`M${BLOCK_X + BLOCK_W + 4} 534 H${LABEL_X - 6}`}
        stroke="var(--accent)"
        strokeWidth="1"
        opacity="0.9"
      />
      <text
        x={LABEL_X}
        y="537.5"
        style={{ fontFamily: "var(--font-mono)" }}
        fontSize="9"
        letterSpacing="1.1"
        fill="var(--accent)"
      >
        CTA FIJO
      </text>
    </svg>
  );
}