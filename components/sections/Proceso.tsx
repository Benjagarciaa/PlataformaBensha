"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Section, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";
import { tramo } from "@/lib/escena";

/**
 * Como trabajamos. La unica seccion numerada del sitio: el orden es
 * informacion.
 *
 * Una linea celeste se dibuja con el scroll (scaleY) y conecta los pasos; cada
 * nodo se enciende cuando la linea lo alcanza. Cada paso tiene su icono en
 * loop: el chat que escribe, la propuesta que se firma, los bloques que se
 * apilan, el check de entrega. Cierra con lo que baja el miedo: sin abonos.
 */

type Paso = (typeof content.proceso.pasos)[number];

export function Proceso() {
  return (
    <Section id="proceso">
      <Pasos />
    </Section>
  );
}

function Pasos() {
  const { proceso } = content;
  const vivo = useSeccionViva();
  const listaRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listaRef, offset: ["start 0.7", "end 0.55"] });
  const linea = useTransform(scrollYProgress, (v) => `scaleY(${v})`);

  return (
    <>
      <SectionTitle eyebrow={proceso.eyebrow} title={proceso.titulo} intro={proceso.intro} />

      <ol ref={listaRef} className="relative ml-1 flex max-w-5xl flex-col gap-20 md:ml-4 md:gap-28">
        {/* la linea que conecta los pasos */}
        <span aria-hidden className="absolute bottom-10 left-[31px] top-8 w-px bg-[color:var(--hairline-strong)] md:left-[39px]" />
        <motion.span
          aria-hidden
          className="absolute bottom-10 left-[31px] top-8 w-px origin-top bg-[color:var(--accent)] md:left-[39px]"
          style={vivo ? { transform: linea } : undefined}
        />
        {proceso.pasos.map((paso, i) => (
          <PasoFila key={paso.n} paso={paso} i={i} p={scrollYProgress} vivo={vivo} />
        ))}
      </ol>

      <Reveal className="mt-24 max-w-4xl border-t border-[color:var(--accent-line)] pt-10 md:mt-32 md:pt-14">
        <p className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[1] tracking-[-0.015em] text-[color:var(--accent)]">
          {proceso.cierre.titulo}
        </p>
        <p className="mt-6 max-w-[44ch] text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.5] text-[color:var(--text-soft)]">
          {proceso.cierre.texto}
        </p>
      </Reveal>
    </>
  );
}

function PasoFila({ paso, i, p, vivo }: { paso: Paso; i: number; p: MotionValue<number>; vivo: boolean }) {
  const n = content.proceso.pasos.length;
  const punto = i / (n - 1);
  const encendido = useTransform(p, (v) => tramo(v, [punto - 0.04, punto + 0.02]));
  const texto = useTransform(p, (v) => 0.3 + 0.7 * tramo(v, [punto - 0.12, punto]));

  return (
    <li className="relative grid grid-cols-[64px_minmax(0,1fr)] gap-6 md:grid-cols-[80px_minmax(0,1fr)] md:gap-12">
      <div className="relative z-10 grid h-16 w-16 place-items-center border border-[color:var(--hairline-strong)] bg-[color:var(--bg)] md:h-20 md:w-20">
        <motion.span
          aria-hidden
          className="absolute -inset-px border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
          style={{ opacity: vivo ? encendido : 1 }}
        />
        <Icono tipo={paso.icono} />
      </div>
      <motion.div data-anim className="pt-1" style={vivo ? { opacity: texto } : undefined}>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="text-[color:var(--accent)]">{paso.n}</span>
          <span className="border border-[color:var(--hairline-strong)] px-2 py-0.5 text-[color:var(--text-dim)]">
            {paso.nota}
          </span>
        </p>
        <h3 className="mt-4 font-display text-[clamp(1.7rem,3.4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.01em] text-[color:var(--text)]">
          {paso.titulo}
        </h3>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.6] text-[color:var(--text-dim)] md:text-[19px]">
          {paso.detalle}
        </p>
      </motion.div>
    </li>
  );
}

/** Iconos en loop (CSS, transform y opacity). */
function Icono({ tipo }: { tipo: string }) {
  if (tipo === "chat") {
    return (
      <span aria-hidden className="relative flex h-7 w-9 items-center justify-center gap-1 border border-[color:var(--accent)]">
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className="loop a-tipea h-1 w-1 bg-[color:var(--accent)]"
            style={{ animationDelay: `${k * 0.15}s` }}
          />
        ))}
        <span className="absolute -bottom-[5px] left-2 h-2 w-2 rotate-45 border-b border-r border-[color:var(--accent)] bg-[color:var(--bg)]" />
      </span>
    );
  }
  if (tipo === "firma") {
    return (
      <span aria-hidden className="relative block h-9 w-7 border border-[color:var(--accent)] p-1">
        <span className="mt-0.5 block h-px w-full bg-[color:var(--text-faint)]" />
        <span className="mt-1 block h-px w-3/4 bg-[color:var(--text-faint)]" />
        <span className="mt-1 block h-px w-full bg-[color:var(--text-faint)]" />
        <span className="loop a-traza absolute bottom-1.5 left-1 h-[2px] w-[18px] origin-left bg-[color:var(--accent)]" />
      </span>
    );
  }
  if (tipo === "bloques") {
    return (
      <span aria-hidden className="relative block h-9 w-9">
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className="loop a-apila absolute left-1/2 h-2.5 w-7 -translate-x-1/2 border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
            style={{ bottom: k * 11, animationDelay: `${k * 0.45}s` }}
          />
        ))}
      </span>
    );
  }
  return (
    <span aria-hidden className="relative grid h-8 w-8 place-items-center border border-[color:var(--accent)]">
      <svg viewBox="0 0 16 16" className="loop a-asoma h-4 w-4">
        <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
    </span>
  );
}
