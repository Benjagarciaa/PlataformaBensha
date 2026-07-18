"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Resultados. Dossier documental: cabecera en mono, tres columnas de datos
 * duros y una cita del flujo real al pie.
 *
 * Los numeros cuentan desde cero UNA sola vez, cuando la seccion entra en
 * pantalla. La deteccion es por medicion directa con rAF, igual que en
 * Anatomia y el riel: los observers y useScroll ya nos fallaron con Lenis.
 */

function useEnVista<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    let raf = 0;

    const check = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        // entro al 85% de la altura de la pantalla
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
          setVisible(true);
          return;
        }
      }
      raf = window.requestAnimationFrame(check);
    };

    raf = window.requestAnimationFrame(check);
    return () => window.cancelAnimationFrame(raf);
  }, [visible]);

  return { ref, visible };
}

function Cifra({
  value,
  prefix,
  suffix,
  start,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  start: boolean;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 0 : 1600;
    const t0 = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const p = DURATION === 0 ? 1 : Math.min(1, (now - t0) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [start, value]);

  return (
    <span>
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export function Resultados() {
  const { resultados } = content;
  const { ref, visible } = useEnVista<HTMLDivElement>();

  return (
    <Section id="resultados">
      <SectionTitle eyebrow={resultados.eyebrow} title={resultados.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {resultados.intro}
        </p>
      </Reveal>

      <div
        ref={ref}
        className="grid border-t border-[color:var(--hairline)] md:grid-cols-3"
      >
        {resultados.cifras.map((cifra, index) => (
          <div
            key={cifra.label}
            className={`border-b border-[color:var(--hairline)] py-9 md:border-b-0 md:py-10 ${
              index > 0
                ? "md:border-l md:border-[color:var(--hairline)] md:pl-9"
                : ""
            } ${index < 2 ? "md:pr-9" : ""}`}
          >
            <p className="font-display text-[clamp(3rem,7vw,5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-[color:var(--text)]">
              <Cifra
                value={cifra.n}
                prefix={cifra.prefix}
                suffix={cifra.suffix}
                start={visible}
              />
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
              {cifra.label}
            </p>
            <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-[color:var(--text-dim)]">
              {cifra.nota}
            </p>
          </div>
        ))}
      </div>

      <Reveal>
        <blockquote className="mt-14 border-l border-[color:var(--accent)] pl-7">
          <p className="max-w-[52ch] font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-medium leading-snug tracking-[-0.02em] text-[color:var(--text)]">
            {resultados.cita}
          </p>
          <footer className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
            {resultados.citaPie}
          </footer>
        </blockquote>
      </Reveal>
    </Section>
  );
}