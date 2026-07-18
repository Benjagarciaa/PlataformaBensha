"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlanoCanvas } from "@/components/plano/PlanoCanvas";
import { content } from "@/content/data";

/**
 * A proposito no importa nada de lib/: la hora se calcula aca con Intl y el
 * scroll se resuelve local. Menos piezas, menos cosas que se puedan romper.
 */
function scrollTo(hash: string) {
  const el = document.getElementById(hash.replace(/^#/, ""));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
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

function TelemetryCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[color:var(--hairline)] bg-[color:var(--surface)]/70 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text)]">
        {/* el guion sostiene la altura de la celda antes de hidratar */}
        {value || "\u2013"}
      </p>
    </div>
  );
}

export function Hero() {
  const { identity, hero } = content;
  const { telemetry } = hero;

  // Arranca vacio a proposito: si el server renderiza una hora y el cliente otra,
  // Next tira error de hidratacion.
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Cordoba",
    });

    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="inicio"
      className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 py-24 md:px-12 lg:pl-28 lg:pr-20"
    >
      <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        {/* ── Columna izquierda: la tesis ───────────────────────────── */}
        <div className="max-w-[46rem]">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
            {identity.firstName} {identity.lastName}
            <span className="mx-2">·</span>
            {identity.locationShort}
          </p>
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
            {identity.role}
          </p>

          <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[color:var(--text)]">
            {hero.title.before}{" "}
            <span className="whitespace-nowrap font-bold text-[color:var(--accent)]">
              {hero.title.accent}
            </span>{" "}
            {hero.title.after}
          </h1>

          <p className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button onClick={() => scrollTo("#contacto")}>
              {hero.ctaPrimary}
            </Button>
            <Button
              variant="secondary"
              onClick={() => scrollTo("#proyectos")}
            >
              {hero.ctaSecondary}
            </Button>
          </div>
        </div>

        {/* ── Columna derecha: telemetria + wireframe ───────────────── */}
        <div className="relative lg:pl-4">
          <div className="relative mb-5 border border-[color:var(--hairline)] bg-[color:var(--surface)]/80 p-3 md:p-4">
            <CornerMarks />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {telemetry.stats.map((stat) => (
                <TelemetryCell
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
              <TelemetryCell label={telemetry.clockLabel} value={time} />
              <div className="col-span-1 sm:col-span-2">
                <TelemetryCell
                  label={telemetry.statusLabel}
                  value={telemetry.statusValue}
                />
              </div>
            </div>
          </div>

          <div className="relative border border-[color:var(--hairline)] bg-[color:var(--surface)]/70 p-4 md:p-6">
            <CornerMarks />
            <PlanoCanvas />
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {hero.wireframeCaption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}