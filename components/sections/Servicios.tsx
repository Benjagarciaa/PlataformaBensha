"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Section, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";
import { suave, tramo } from "@/lib/escena";

/**
 * Servicios: formas de sacarte trabajo de encima.
 *
 * Cada tarjeta entra dada vuelta y gira en 3D con el scroll hasta quedar de
 * frente (CSS 3D, solo transform). Arriba de cada una, una mini escena en loop
 * que cuenta el servicio sin palabras: el carrito que se llena, las filas de
 * un panel que cargan, la aguja que pasa a rapido, el escudo que escanea.
 * Los loops corren solo con la seccion en pantalla.
 *
 * Tocar una tarjeta preselecciona ese servicio en el cotizador y baja al
 * formulario (evento "preseleccionar-servicio" + irASeccion).
 */

type Item = (typeof content.servicios.items)[number];

export function Servicios() {
  const { servicios } = content;

  return (
    <Section id="servicios">
      <SectionTitle eyebrow={servicios.eyebrow} title={servicios.titulo} intro={servicios.intro} />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {servicios.items.map((item, i) => (
          <Tarjeta key={item.id} item={item} i={i} />
        ))}
      </div>
    </Section>
  );
}

function Tarjeta({ item, i }: { item: Item; i: number }) {
  const { servicios } = content;
  const ref = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.98", "start 0.45"] });
  const sentido = i % 2 === 0 ? 1 : -1;
  const transform = useTransform(scrollYProgress, (v) => {
    const t = suave(tramo(v, [0, 1]));
    return `rotateY(${sentido * 180 * (1 - t)}deg) scale(${0.9 + 0.1 * t})`;
  });

  const consultar = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("preseleccionar-servicio", { detail: item.id }));
    irASeccion("contacto");
  };

  return (
    <div ref={ref} className="[perspective:1600px]">
      <motion.div
        className="relative h-full [transform-style:preserve-3d]"
        style={vivo ? { transform } : undefined}
      >
        {/* frente */}
        <article className="group relative flex h-full flex-col border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] [backface-visibility:hidden]">
          <div className="relative h-[200px] overflow-hidden border-b border-[color:var(--hairline)] bg-[radial-gradient(ellipse_70%_90%_at_50%_100%,var(--accent-glow),transparent)] md:h-[220px]">
            <MiniEscena tipo={item.escena} />
          </div>
          <div className="flex flex-1 flex-col p-7 md:p-10">
            <h3 className="font-display text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[color:var(--text)]">
              {item.nombre}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {item.claves.map((clave) => (
                <li
                  key={clave}
                  className="border border-[color:var(--accent-line)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent)]"
                >
                  {clave}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[48ch] flex-1 text-[17px] leading-[1.6] text-[color:var(--text-dim)] md:text-[18px]">
              {item.texto}
            </p>
            <a
              href="#contacto"
              onClick={consultar}
              className="mt-8 inline-flex w-fit items-center gap-3 border-b border-[color:var(--accent-line)] pb-1 text-[15px] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              {servicios.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </article>

        {/* dorso: lo que se ve mientras gira */}
        {vivo ? (
          <div
            aria-hidden
            className="absolute inset-0 grid place-items-center border border-[color:var(--accent-line)] bg-[color:var(--surface-2)] p-10 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <p className="text-center font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[color:var(--text-faint)]">
              {item.nombre}
            </p>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

// ── mini escenas en loop ────────────────────────────────────────────────

const ETIQUETA = "font-mono text-[10px] uppercase tracking-[0.12em]";

function MiniEscena({ tipo }: { tipo: string }) {
  const { escenas } = content.servicios;

  if (tipo === "carrito") {
    return (
      <div aria-hidden className="absolute inset-0">
        <div className="absolute bottom-8 left-1/2 h-[92px] w-[150px] -translate-x-1/2">
          {/* productos que caen */}
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="loop a-cae absolute top-2 h-7 w-7 border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
              style={{ left: 30 + k * 32, animationDelay: `${k * 0.6}s` }}
            />
          ))}
          <svg viewBox="0 0 150 92" className="absolute inset-0 h-full w-full">
            <path
              d="M2 6h22l14 58h92l14-44H34"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="52" cy="80" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="118" cy="80" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          </svg>
        </div>
        <span className={`absolute right-6 top-6 border border-[color:var(--accent-line)] px-2 py-1 ${ETIQUETA} text-[color:var(--accent)]`}>
          {escenas.carrito.label} · {escenas.carrito.total}
        </span>
      </div>
    );
  }

  if (tipo === "panel") {
    return (
      <div aria-hidden className="absolute inset-x-8 top-6 bottom-6 border border-[color:var(--hairline-strong)] bg-[color:var(--bg)] p-4">
        <p className={`${ETIQUETA} mb-3 text-[color:var(--text-dim)]`}>{escenas.panel.label}</p>
        <div className="flex flex-col gap-2">
          {escenas.panel.filas.map((nombre, k) => (
            <div key={nombre} className="relative h-[22px]">
              <span className="absolute inset-0 bg-[color:var(--hairline)]" />
              <span
                className="loop a-carga absolute inset-0 flex items-center gap-2 bg-[color:var(--surface-2)] px-2"
                style={{ animationDelay: `${k * 0.35}s` }}
              >
                <span className="h-2.5 w-2.5 rounded-full border border-[color:var(--accent)]" />
                <span className="text-[12px] text-[color:var(--text)]">{nombre}</span>
                <span className="ml-auto h-[6px] w-10 bg-[color:var(--accent-line)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tipo === "velocidad") {
    return (
      <div aria-hidden className="absolute inset-0">
        <div className="absolute bottom-7 left-1/2 h-[120px] w-[220px] -translate-x-1/2">
          <svg viewBox="0 0 220 120" className="absolute inset-0 h-full w-full">
            <path d="M14 112a96 96 0 0 1 192 0" fill="none" stroke="var(--hairline-strong)" strokeWidth="6" />
            <path d="M150 28a96 96 0 0 1 56 84" fill="none" stroke="var(--accent)" strokeWidth="6" />
          </svg>
          {/* la aguja gira sobre su base */}
          <span className="loop a-aguja absolute bottom-[8px] left-1/2 h-[86px] w-[2px] -translate-x-1/2 origin-bottom bg-[color:var(--text)]" />
          <span className="absolute bottom-[3px] left-1/2 h-3 w-3 -translate-x-1/2 bg-[color:var(--accent)]" />
        </div>
        <span className={`absolute bottom-3 left-[calc(50%-120px)] ${ETIQUETA} text-[color:var(--text-faint)]`}>
          {escenas.velocidad.lento}
        </span>
        <span className={`absolute bottom-3 right-[calc(50%-124px)] ${ETIQUETA} text-[color:var(--accent)]`}>
          {escenas.velocidad.rapido}
        </span>
      </div>
    );
  }

  // escudo que escanea
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[136px] w-[112px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        <svg viewBox="0 0 112 136" className="absolute inset-0 h-full w-full">
          <path
            d="M56 4l48 18v40c0 32-20 56-48 70C28 118 8 94 8 62V22z"
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <path d="M36 68l14 14 28-30" fill="none" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        <span className="loop a-escanea absolute inset-x-0 top-0 h-[2px] bg-[color:var(--text)] opacity-0 [--recorrido:132px]" />
      </div>
      <span className={`absolute bottom-5 left-1/2 -translate-x-1/2 ${ETIQUETA} flex items-center gap-2 text-[color:var(--accent)]`}>
        <span className="loop a-latido h-[6px] w-[6px] bg-[color:var(--accent)]" />
        {escenas.escudo.label}
      </span>
    </div>
  );
}
