"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";
import { meseta, mezcla, suave, tramo } from "@/lib/escena";

/**
 * Que miro cuando armo o reviso una tienda. La seccion de criterio de producto.
 *
 * Escena fija con CSS 3D (perspective + preserve-3d, sin canvas): una pagina
 * de producto arranca DE FRENTE, a pantalla completa, y con el scroll se aleja
 * estilo Apple mientras gira y se desarma en siete capas. Despues se recorren
 * de a una: la capa activa se levanta y se enciende, las demas bajan la voz, y
 * al costado aparece por que vende. En desktop se ve ademas el indice de las
 * siete capas (la activa encendida, las ya vistas a media voz): la estructura
 * entera se lee de un vistazo y el recorrido puede ser corto. Un medidor
 * ("camino a la compra") se llena a medida que se suman capas. Ya desarmada,
 * la pila se mece sola en loop.
 *
 * Solo transform y opacity. Sin escenas vivas (servidor, sin JS,
 * reduced-motion): la pila queda desarmada y quieta, con todas las notas en
 * lista al lado.
 */

const W = 340;
const H = 720;
const CAPAS = content.criterio.capas;
const N = CAPAS.length;

// tramos del recorrido (la pista es corta: se aleja y se desarma rapido)
const ALEJA: [number, number] = [0, 0.1];
const GIRA: [number, number] = [0.02, 0.12];
const DESARMA: [number, number] = [0.04, 0.14];
const RECORRE: [number, number] = [0.15, 0.92];
const CIERRE: [number, number] = [0.93, 0.98];
const PASO = (RECORRE[1] - RECORRE[0]) / N;
const SEPARACION = 68;

/** Que tan activa esta la capa k (0..1). */
function activa(v: number, k: number) {
  const s = RECORRE[0] + k * PASO;
  return meseta(v, s, s + 0.02, s + PASO - 0.015, s + PASO + 0.005);
}

/** 1 cuando la capa k ya se recorrio (queda a media voz en el indice). */
function vista(v: number, k: number) {
  const s = RECORRE[0] + (k + 1) * PASO;
  return tramo(v, [s - 0.015, s + 0.005]);
}

/** Cuanto bajan la voz las capas no activas (solo durante el recorrido). */
function atenuacion(v: number) {
  return tramo(v, [RECORRE[0] - 0.02, RECORRE[0] + 0.01]) * (1 - tramo(v, [CIERRE[0] - 0.01, CIERRE[0] + 0.02]));
}

type Geo = { vw: number; vh: number; cx: number; cy: number; s0: number; s1: number };

export function Criterio() {
  return (
    <Section id="criterio" contenedor={false} aire={false}>
      <Escena />
    </Section>
  );
}

function Escena() {
  const { criterio } = content;
  const vivo = useSeccionViva();
  const pistaRef = useRef<HTMLDivElement>(null);
  const marcoRef = useRef<HTMLDivElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const geo = useRef<Geo>({ vw: 1440, vh: 900, cx: 400, cy: 450, s0: 2, s1: 0.9 });
  const version = useMotionValue(0);
  const [mece, setMece] = useState(false);

  const { scrollYProgress: p } = useScroll({ target: pistaRef, offset: ["start start", "end end"] });

  // Medidas del escenario relativas al cuadro fijo: solo al montar y al
  // cambiar el tamaño, nunca por frame.
  useEffect(() => {
    if (!vivo) return;
    const medir = () => {
      const marco = marcoRef.current;
      const esc = escenarioRef.current;
      if (!marco || !esc) return;
      const m = marco.getBoundingClientRect();
      const e = esc.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      geo.current = {
        vw,
        vh,
        cx: e.left - m.left + e.width / 2,
        cy: e.top - m.top + e.height / 2,
        // de frente: llena la pantalla (con tope, para no rasterizar de mas)
        s0: Math.min(2.4, Math.max(vw / W, vh / H) * 1.02),
        // desarmada: entra entera en el escenario
        s1: Math.min(e.width / 680, e.height / 900, 1.05),
      };
      version.set(version.get() + 1);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [vivo, version]);

  useMotionValueEvent(p, "change", (v) => {
    const quiere = v > DESARMA[1] && v < 0.99;
    if (quiere !== mece) setMece(quiere);
  });

  const pila = useTransform([p, version], ([v]: number[]) => {
    const g = geo.current;
    const a = suave(tramo(v, ALEJA));
    const r = suave(tramo(v, GIRA));
    const s = mezcla(g.s0, g.s1, a);
    const tx = (g.vw / 2 - g.cx) * (1 - a);
    // desarmada, las capas suben (translateZ con rotateX): se baja la pila la
    // mitad de esa altura para que quede centrada en el escenario
    const centrado = ((SEPARACION * (N - 1) + 46) / 2) * Math.sin((56 * Math.PI) / 180) * g.s1 * r;
    const ty = (Math.max((H * g.s0) / 2, g.vh / 2) - g.cy) * (1 - a) + centrado;
    return `translate3d(${tx}px, ${ty}px, 0) scale(${s}) rotateX(${56 * r}deg) rotateZ(${-34 * r}deg)`;
  });

  const medidor = useTransform(p, (v) => {
    let n = 0;
    for (let k = 0; k < N; k++) n += tramo(v, [RECORRE[0] + k * PASO, RECORRE[0] + k * PASO + 0.03]);
    return `scaleX(${n / N})`;
  });
  const cierre = useTransform(p, (v) => tramo(v, CIERRE));
  const cierreY = useTransform(p, (v) => `translateY(${(1 - tramo(v, CIERRE)) * 20}px)`);
  const panel = useTransform(p, (v) => tramo(v, [RECORRE[0] - 0.03, RECORRE[0] + 0.01]));

  return (
    <>
      <Contenedor className="pt-20 md:pt-28">
        <SectionTitle
          eyebrow={criterio.eyebrow}
          title={criterio.titulo}
          lado
          className="mb-0 md:mb-0"
          intro={
            <>
              {criterio.intro}
              <span className="mt-4 block font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-[color:var(--text-dim)]">
                {criterio.respaldo}
              </span>
            </>
          }
        />
      </Contenedor>

      <div ref={pistaRef} className="relative pt-12 vivo:h-[330svh] vivo:pt-0 md:pt-16 lg:vivo:h-[360svh]">
        <div ref={marcoRef} className="vivo:sticky vivo:top-0 vivo:h-svh vivo:overflow-hidden">
          <Contenedor className="vivo:h-full">
            <div className="grid gap-10 pb-28 vivo:h-full vivo:grid-rows-[minmax(0,1fr)_auto] vivo:gap-0 vivo:pb-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14 lg:vivo:grid-rows-1 lg:vivo:items-center">
              {/* el escenario 3D */}
              <div
                ref={escenarioRef}
                className="relative h-[460px] [perspective:1800px] vivo:h-full lg:sticky lg:top-20 lg:h-[760px] lg:vivo:static lg:vivo:h-[86svh]"
                role="img"
                aria-label={criterio.aria}
              >
                <div
                  className={`absolute left-1/2 top-1/2 [transform-style:preserve-3d] ${mece ? "loop a-mecer" : ""}`}
                  style={{ width: 0, height: 0 }}
                >
                  <motion.div
                    className="absolute left-0 top-0 origin-center [transform-style:preserve-3d] [transform:translateY(90px)_scale(0.52)_rotateX(56deg)_rotateZ(-34deg)] lg:[transform:translateY(110px)_scale(0.82)_rotateX(56deg)_rotateZ(-34deg)]"
                    style={{
                      width: W,
                      height: H,
                      marginLeft: -W / 2,
                      marginTop: -H / 2,
                      ...(vivo ? { transform: pila } : {}),
                    }}
                  >
                    {/* de la base (velocidad) hacia arriba: con la pila plana,
                        lo que va despues en el DOM queda encima */}
                    {CAPAS.map((capa, k) => ({ capa, k }))
                      .reverse()
                      .map(({ capa, k }) => (
                        <Capa key={capa.id} p={p} k={k} vivo={vivo} />
                      ))}
                  </motion.div>
                </div>
              </div>

              {/* las notas: una por capa (vivas) o la lista completa (estatico) */}
              {vivo ? (
                <motion.div
                  className="relative pb-16 lg:pb-0"
                  style={{ opacity: panel }}
                >
                  <p className="mb-4 hidden font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)] lg:block">
                    {criterio.capaLabel}
                  </p>
                  {/* el indice: las siete capas a la vista, la activa encendida */}
                  <ol className="mb-8 hidden border-b border-[color:var(--hairline)] lg:block">
                    {CAPAS.map((capa, k) => (
                      <Indice key={capa.id} p={p} k={k} />
                    ))}
                  </ol>
                  <div className="grid min-h-[9.5rem] lg:min-h-[7.5rem]">
                    {CAPAS.map((capa, k) => (
                      <Nota key={capa.id} p={p} k={k} />
                    ))}
                    <motion.p
                      className="self-end font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-balance text-[color:var(--text)] [grid-area:1/1] lg:self-start"
                      style={{ opacity: cierre, transform: cierreY }}
                    >
                      {criterio.cierre}
                    </motion.p>
                  </div>
                  <div className="mt-6 lg:mt-8">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-dim)]">
                      {criterio.medidorLabel}
                    </p>
                    <div className="relative h-[6px] bg-[color:var(--hairline-strong)]">
                      <motion.div
                        className="h-full w-full origin-left bg-[color:var(--accent)]"
                        style={{ transform: medidor }}
                      />
                      <div aria-hidden className="absolute inset-0 grid grid-cols-7">
                        {CAPAS.map((c) => (
                          <span key={c.id} className="border-r border-[color:var(--bg)] last:border-r-0" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                  {CAPAS.map((capa) => (
                    <li key={capa.id} className="border-t border-[color:var(--hairline-strong)] pt-5">
                      <h3 className="font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.005em] text-[color:var(--text)]">
                        {capa.nombre}
                      </h3>
                      <p className="mt-2 text-[17px] leading-[1.55] text-[color:var(--text-dim)]">{capa.nota}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Contenedor>
        </div>
      </div>
    </>
  );
}

/** Una capa en el indice de desktop: numero y nombre, encendida si es la activa. */
function Indice({ p, k }: { p: MotionValue<number>; k: number }) {
  const capa = CAPAS[k];
  const luz = useTransform(p, (v) => {
    const a = activa(v, k);
    return Math.max(a, 0.55 * vista(v, k) * (1 - a), tramo(v, CIERRE));
  });
  const marca = useTransform(p, (v) => `scaleY(${activa(v, k)})`);
  const corre = useTransform(p, (v) => `translateX(${activa(v, k) * 10}px)`);
  const numero = useTransform(p, (v) => activa(v, k));

  return (
    <li className="relative border-t border-[color:var(--hairline)] py-[0.55rem]">
      <motion.span
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-[2px] origin-center bg-[color:var(--accent)]"
        style={{ transform: marca }}
      />
      <motion.span className="flex items-baseline gap-4" style={{ transform: corre }}>
        <span className="relative w-6 shrink-0 font-mono text-[11px] tracking-[0.08em] tabular-nums">
          <span className="text-[color:var(--text-faint)]">{String(k + 1).padStart(2, "0")}</span>
          <motion.span className="absolute inset-0 text-[color:var(--accent)]" style={{ opacity: numero }}>
            {String(k + 1).padStart(2, "0")}
          </motion.span>
        </span>
        <span className="relative font-display text-[clamp(1.1rem,1.45vw,1.4rem)] font-semibold leading-[1.15] tracking-[-0.005em]">
          <span className="text-[color:var(--text-faint)] opacity-75">{capa.nombre}</span>
          <motion.span className="absolute inset-0 text-[color:var(--text)]" style={{ opacity: luz }}>
            {capa.nombre}
          </motion.span>
        </span>
      </motion.span>
    </li>
  );
}

function Nota({ p, k }: { p: MotionValue<number>; k: number }) {
  const capa = CAPAS[k];
  const opacity = useTransform(p, (v) => activa(v, k));
  const transform = useTransform(p, (v) => `translateY(${(1 - activa(v, k)) * 18}px)`);
  return (
    <motion.div className="self-end [grid-area:1/1] lg:self-start" style={{ opacity, transform }}>
      {/* en mobile no hay indice: el nombre va arriba de la nota */}
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)] lg:hidden">
        {String(k + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {content.criterio.capaLabel}
      </p>
      <h3 className="mb-3 font-display text-[clamp(1.6rem,6vw,2.2rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-balance text-[color:var(--text)] lg:hidden">
        {capa.nombre}
      </h3>
      <p className="max-w-[42ch] text-[16px] leading-[1.55] text-pretty text-[color:var(--text-soft)] md:text-[18px]">
        {capa.nota}
      </p>
    </motion.div>
  );
}

function Capa({ p, k, vivo }: { p: MotionValue<number>; k: number; vivo: boolean }) {
  const base = (N - 1 - k) * SEPARACION;
  const transform = useTransform(p, (v) => {
    const g = suave(tramo(v, DESARMA));
    // + un pelo por capa: con la pila plana no quedan coplanares
    return `translateZ(${base * g + (N - 1 - k) * 0.5 + 46 * activa(v, k)}px)`;
  });
  const opacity = useTransform(p, (v) => 1 - atenuacion(v) * 0.55 * (1 - activa(v, k)));
  const encendida = useTransform(p, (v) => activa(v, k) + tramo(v, CIERRE) * 0.6);

  return (
    <motion.div
      className="absolute inset-0 [transform-style:preserve-3d]"
      style={vivo ? { transform, opacity } : { transform: `translateZ(${base * 0.8}px)` }}
    >
      <Dibujo id={CAPAS[k].id} encendida={vivo ? encendida : undefined} />
    </motion.div>
  );
}

// ── los dibujos de cada capa (la pagina de producto, pieza por pieza) ───

const REGION = "absolute left-[14px] right-[14px] border border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)]";
const BARRA = "block bg-[color:var(--text-soft)]";

function Borde({ encendida }: { encendida?: MotionValue<number> }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-px border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
      style={{ opacity: encendida ?? 0 }}
    />
  );
}

function Dibujo({ id, encendida }: { id: string; encendida?: MotionValue<number> }) {
  const { maqueta } = content.criterio;
  switch (id) {
    case "velocidad":
      // la base de la pagina: el marco entero y la barra de carga
      return (
        <div className="absolute inset-0 border border-[color:var(--hairline-strong)] bg-[color:var(--surface)]">
          <Borde encendida={encendida} />
          <span className="absolute inset-x-0 top-0 h-[3px] bg-[color:var(--hairline)]">
            <span className="loop a-llena block h-full w-full origin-left bg-[color:var(--accent)]" />
          </span>
        </div>
      );
    case "promesa":
      return (
        <div className={`${REGION} top-[14px] h-[136px] p-3`}>
          <Borde encendida={encendida} />
          <div className="flex items-center justify-between border-b border-[color:var(--hairline)] pb-2">
            <span className="font-mono text-[10px] tracking-[0.14em] text-[color:var(--text)]">{maqueta.marca}</span>
            <span className="h-3 w-4 border border-[color:var(--accent)]" />
          </div>
          <span className={`${BARRA} mt-4 h-[11px] w-[88%]`} />
          <span className={`${BARRA} mt-2 h-[11px] w-[64%]`} />
          <span className="mt-3 block h-[5px] w-[76%] bg-[color:var(--text-faint)]" />
          <span className="mt-1.5 block h-[5px] w-[52%] bg-[color:var(--text-faint)]" />
        </div>
      );
    case "fotos":
      return (
        <div className={`${REGION} top-[158px] h-[204px] p-3`}>
          <Borde encendida={encendida} />
          <div className="relative h-[140px] border border-[color:var(--hairline)] bg-[radial-gradient(circle_at_50%_45%,var(--accent-soft),transparent_70%)]">
            <span className="absolute left-1/2 top-1/2 h-[92px] w-[58px] -translate-x-1/2 -translate-y-1/2 border border-[color:var(--accent-line)] bg-[color:var(--surface)]" />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-[34px] border ${i === 0 ? "border-[color:var(--accent)]" : "border-[color:var(--hairline)]"}`}
              />
            ))}
          </div>
        </div>
      );
    case "oferta":
      return (
        <div className={`${REGION} top-[370px] h-[100px] p-3`}>
          <Borde encendida={encendida} />
          <div className="flex items-baseline gap-2">
            <span className="h-[14px] w-[86px] bg-[color:var(--text)]" />
            <span className="h-[6px] w-[50px] bg-[color:var(--text-faint)]" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {maqueta.combos.map((c, i) => (
              <span
                key={c}
                className={`grid h-[44px] place-items-center border font-mono text-[11px] ${
                  i === 1
                    ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                    : "border-[color:var(--hairline-strong)] text-[color:var(--text-dim)]"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      );
    case "carrito":
      return (
        <div className={`${REGION} top-[478px] h-[74px] p-3`}>
          <Borde encendida={encendida} />
          <span className="grid h-[28px] place-items-center bg-[color:var(--accent)] text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--bg)]">
            {maqueta.cta}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-3 w-3 border border-[color:var(--accent)]" />
            <span className="text-[10px] text-[color:var(--text-dim)]">{maqueta.upsell}</span>
          </div>
        </div>
      );
    case "confianza":
      return (
        <div className={`${REGION} top-[560px] grid h-[52px] grid-cols-3 gap-2 p-2`}>
          <Borde encendida={encendida} />
          {maqueta.confianza.map((c) => (
            <span
              key={c}
              className="grid place-items-center border border-[color:var(--hairline)] text-[10px] text-[color:var(--text-soft)]"
            >
              {c}
            </span>
          ))}
        </div>
      );
    case "prueba":
      return (
        <div className={`${REGION} top-[620px] h-[86px] p-3`}>
          <Borde encendida={encendida} />
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-[9px] w-[9px] rotate-45 bg-[color:var(--accent)]" />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-start gap-2 border border-[color:var(--hairline)] p-2">
                <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-[color:var(--text-faint)]" />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="h-[4px] w-full bg-[color:var(--text-faint)]" />
                  <span className="h-[4px] w-[70%] bg-[color:var(--text-faint)]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}
