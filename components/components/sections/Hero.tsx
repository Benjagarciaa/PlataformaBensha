"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlanoCanvas } from "@/components/plano/PlanoCanvas";
import { content } from "@/content/data";

/**
 * Hero.
 *
 * Desktop: UNA lamina. El dibujo arriba y el cajetin como banda al pie, dentro
 * del mismo marco. En un plano tecnico el rotulo va siempre en el angulo
 * inferior derecho de la lamina, nunca suelto arriba.
 *
 * Mobile: los numeros grandes contando desde cero. El wireframe vertical mide
 * 800px en un celular y ahi no se lee.
 */

function scrollTo(hash: string) {
  const el = document.getElementById(hash.replace(/^#/, ""));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
}

/** Cuenta de 0 al numero final una sola vez, al montar. */
function CountUp({ to, prefix = "" }: { to: number; prefix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 0 : 1500;
    const start = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const progress =
        DURATION === 0 ? 1 : Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [to]);

  return (
    <>
      {prefix}
      {value}
    </>
  );
}

/** Escuadras en L: el detalle firma del sistema (DESIGN.md seccion 3) */
function CornerMarks() {
  return (
    <>
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
    </>
  );
}

/** Punto de disponibilidad: lo unico vivo del hero. */
function PuntoEstado() {
  return (
    <span
      aria-hidden
      className="inline-block h-[6px] w-[6px] shrink-0 bg-[color:var(--accent)]"
      style={{ opacity: "calc(0.4 + 0.6 * var(--trazo, 0.7))" }}
    />
  );
}

/** Mobile: dos numeros monumentales. */
function CifrasMobile() {
  const { cifras, rotulo } = content.hero;

  return (
    <div className="lg:hidden">
      <div className="grid grid-cols-2 gap-4">
        {cifras.map((cifra) => (
          <div
            key={cifra.label}
            className="border-t border-[color:var(--accent)] pt-4"
          >
            <p className="font-display text-[clamp(2.75rem,15vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-[color:var(--text)]">
              <CountUp to={cifra.n} prefix={cifra.prefix} />
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.16em] text-[color:var(--text-faint)]">
              {cifra.label}
            </p>
          </div>
        ))}
      </div>
      <span className="mt-6 inline-flex items-center gap-2 border border-[color:var(--hairline)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)]">
        <PuntoEstado />
        {rotulo.estadoValor}
        <span className="text-[color:var(--text-faint)]">
          · {rotulo.respuestaValor}
        </span>
      </span>
    </div>
  );
}

/** Desktop: la lamina completa, dibujo + cajetin. */
function Lamina() {
  const { rotulo, wireframeCaption } = content.hero;

  return (
    <div className="relative hidden border border-[color:var(--hairline)] bg-[color:var(--surface)]/70 lg:block">
      <CornerMarks />

      <div className="px-6 pb-5 pt-8">
        <div className="mx-auto max-w-[340px]">
          <PlanoCanvas />
        </div>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
          {wireframeCaption}
        </p>
      </div>

      <div className="border-t border-[color:var(--hairline)]">
        <div className="grid grid-cols-3">
          {rotulo.cells.map((cell, index) => (
            <div
              key={cell.k}
              className={`px-4 py-3 ${
                index > 0 ? "border-l border-[color:var(--hairline)]" : ""
              }`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                {cell.k}
              </p>
              <p className="mt-1.5 font-mono text-[15px] uppercase tracking-[0.04em] text-[color:var(--text)]">
                {cell.v}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[color:var(--hairline)] px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            {rotulo.platforms}
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--accent)]">
            <PuntoEstado />
            {rotulo.estadoValor}
            <span className="text-[color:var(--text-faint)]">
              · {rotulo.respuestaValor}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--hairline)] px-4 py-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
            {rotulo.label}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
            {rotulo.rev}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { identity, hero } = content;

  return (
    <section
      id="inicio"
      className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 py-20 md:px-12 md:py-24 lg:pl-28 lg:pr-20"
    >
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16">
        <div className="max-w-[46rem]">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-faint)] md:text-[11px]">
            {identity.firstName} {identity.lastName}
            <span className="mx-2">·</span>
            {identity.locationShort}
          </p>
          <p className="mb-7 font-mono text-[10px] uppercase leading-snug tracking-[0.24em] text-[color:var(--text-faint)] md:mb-8 md:text-[11px]">
            {identity.role}
          </p>

          <h1 className="font-display text-[clamp(2.1rem,7.5vw,3.9rem)] font-medium leading-[1.03] tracking-[-0.03em] text-[color:var(--text)]">
            {hero.title.before}{" "}
            <span className="whitespace-nowrap font-bold text-[color:var(--accent)]">
              {hero.title.accent}
            </span>{" "}
            {hero.title.after}
          </h1>

          <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mt-7 md:text-[17px]">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 md:mt-10 md:gap-4">
            <Button
              className="flex-1 md:flex-none"
              onClick={() => scrollTo("#contacto")}
            >
              {hero.ctaPrimary}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 md:flex-none"
              onClick={() => scrollTo("#proyectos")}
            >
              {hero.ctaSecondary}
            </Button>
          </div>

          <div className="mt-10">
            <CifrasMobile />
          </div>
        </div>

        <Lamina />
      </div>
    </section>
  );
}
