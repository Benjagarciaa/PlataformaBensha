"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trabajos } from "@/content/data";
import { esperarIntro } from "@/lib/intro";
import { CSS_ESTATICO, CSS_FICHA, CSS_SIN_JS } from "./estatico";
import { crearPuente, type Puente, type Rect } from "./plano";
import { Ficha } from "./Ficha";

/**
 * Trabajos: carrusel 3D de los proyectos.
 *
 * Las miniaturas son planos levemente curvos en un anillo que gira solo,
 * se arrastra con inercia y avanza con el scroll de la seccion (un tramo
 * fijo con sticky). Al hacer click la tarjeta vuela hacia la camara y, en el
 * mismo movimiento, la ficha HTML toma su lugar y se expande (FLIP).
 *
 * Reglas (02-DESIGN.md, seccion 3D):
 *  - three y R3F viven en Escena.tsx y anillo.ts, un chunk aparte que se pide
 *    recien cuando la seccion esta cerca de la pantalla.
 *  - El loop corre solo con la seccion en pantalla, la pestaña visible y la
 *    ficha cerrada.
 *  - Las tarjetas son botones reales: la escena los ubica cada cuadro sobre
 *    su plano proyectado, asi el click, el foco y el lector de pantalla
 *    funcionan con el DOM de siempre.
 *  - Reduced-motion, ahorro de datos, sin WebGL acelerado o sin JS: grilla
 *    HTML de tarjetas (sin JS, sin ficha).
 */

const Escena = dynamic(() => import("./Escena"), { ssr: false });

const ITEMS = trabajos.items;
const N = ITEMS.length;
const TEXTURAS = ITEMS.map((t) => t.media.textura);
const DESTACADOS = ITEMS.map((t) => Boolean(t.destacado));
const pad = (v: number) => String(v).padStart(2, "0");

type Modo = "animado" | "estatico";

/**
 * WebGL con aceleracion por hardware, el mismo criterio que el hero. Por
 * software (SwiftShader, llvmpipe) la escena cuesta mas de lo que aporta y se
 * usa la grilla. `?webgl=forzar` saltea el chequeo, solo para QA headless.
 */
function hayWebGLAcelerado() {
  try {
    const forzar = new URLSearchParams(window.location.search).get("webgl") === "forzar";
    const opciones: WebGLContextAttributes = { failIfMajorPerformanceCaveat: !forzar };
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", opciones);
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return forzar || !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

function cuandoEsteOcioso(tope: number) {
  return new Promise<void>((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: tope });
    } else {
      setTimeout(resolve, 120);
    }
  });
}

const aRect = (b: DOMRect): Rect => ({ x: b.left, y: b.top, w: b.width, h: b.height });

/** Escuadras en L: el detalle firma del sistema. */
function Escuadras({ acento = false, className = "" }: { acento?: boolean; className?: string }) {
  const color = acento ? "border-[color:var(--accent)]" : "border-[color:var(--hairline)]";
  const base = `pointer-events-none absolute h-[10px] w-[10px] ${color} ${className}`;
  return (
    <>
      <span aria-hidden className={`${base} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${base} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export function Trabajos() {
  const { carrusel, tipos } = trabajos;

  const seccionRef = useRef<HTMLElement>(null);
  const pistaRef = useRef<HTMLDivElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const puenteRef = useRef<Puente>(crearPuente(N));
  const grillaBtns = useRef<(HTMLButtonElement | null)[]>([]);
  const grillaImgs = useRef<(HTMLElement | null)[]>([]);
  const ocupado = useRef(false);
  const arrastre = useRef({ id: -1, x0: 0, x: 0, t: 0, activo: false, vel: 0, suprimir: false });

  const [modo, setModo] = useState<Modo>("animado");
  const [cargar, setCargar] = useState(false);
  const [listo, setListo] = useState(false);
  const [enPantalla, setEnPantalla] = useState(false);
  const [pestanaVisible, setPestanaVisible] = useState(true);
  const [movil, setMovil] = useState(false);
  const [reducido, setReducido] = useState(false);
  const [frente, setFrente] = useState(0);
  const [hover, setHover] = useState(-1);
  const [foco, setFoco] = useState(-1);
  const [ficha, setFicha] = useState<{ indice: number; origen: Rect | null } | null>(null);
  const [cubre, setCubre] = useState(false);

  // Progreso del tramo fijo: 0 cuando el escenario toca el techo, 1 cuando se va.
  const { scrollYProgress } = useScroll({ target: pistaRef, offset: ["start start", "end end"] });

  // Decide el modo y pide la escena recien cuando la seccion esta cerca.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData === true || typeof window.WebGL2RenderingContext === "undefined") {
      // Modo decidido en el cliente (reduced-motion ya lo resolvio el CSS).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReducido(reduce);
      setModo("estatico");
      return;
    }
    setMovil(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

    const seccion = seccionRef.current;
    if (!seccion) return;
    let vivo = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        esperarIntro()
          .then(() => cuandoEsteOcioso(1200))
          .then(() => {
            if (!vivo) return;
            if (hayWebGLAcelerado()) setCargar(true);
            else setModo("estatico");
          });
      },
      { rootMargin: "150% 0px" }
    );
    io.observe(seccion);
    return () => {
      vivo = false;
      io.disconnect();
    };
  }, []);

  // El loop corre solo con la seccion en pantalla y la pestaña visible.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista || modo !== "animado") return;
    const io = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting), {
      rootMargin: "80px 0px",
    });
    io.observe(pista);
    const visibilidad = () => setPestanaVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibilidad);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", visibilidad);
    };
  }, [modo]);

  // La escena avisa cual queda de frente (cambia cada tanto, no cada cuadro).
  useEffect(() => {
    const p = puenteRef.current;
    p.alCambiarFrente = setFrente;
    return () => {
      p.alCambiarFrente = null;
    };
  }, []);

  const tresD = modo === "animado" && listo;

  const abrir = useCallback(
    async (i: number) => {
      if (ocupado.current) return;
      ocupado.current = true;
      const p = puenteRef.current;
      p.hover = -1;
      setHover(-1);
      let origen: Rect | null = null;
      const control = p.control;
      if (tresD && control) {
        const r = await control.volar(i);
        const c = escenarioRef.current?.getBoundingClientRect();
        if (c) origen = { x: r.x + c.left, y: r.y + c.top, w: r.w, h: r.h };
      } else {
        const el = grillaImgs.current[i];
        if (el && modo === "estatico") origen = aRect(el.getBoundingClientRect());
      }
      setFicha({ indice: i, origen });
    },
    [tresD, modo]
  );

  const destino = useCallback(
    (i: number): Rect | null => {
      const control = puenteRef.current.control;
      if (tresD && control) {
        const r = control.rectVuelo();
        const c = escenarioRef.current?.getBoundingClientRect();
        return c ? { x: r.x + c.left, y: r.y + c.top, w: r.w, h: r.h } : null;
      }
      const el = grillaImgs.current[i];
      if (!el || modo !== "estatico") return null;
      const b = el.getBoundingClientRect();
      return b.bottom < 0 || b.top > window.innerHeight ? null : aRect(b);
    },
    [tresD, modo]
  );

  const alCerrar = useCallback(
    (i: number) => {
      setFicha(null);
      const control = puenteRef.current.control;
      const boton = modo === "animado" ? puenteRef.current.botones[i] : grillaBtns.current[i];
      const fin = () => {
        ocupado.current = false;
        boton?.focus({ preventScroll: true });
      };
      if (tresD && control) control.volver(i).then(fin);
      else fin();
    },
    [tresD, modo]
  );

  const alCambiar = useCallback((j: number) => {
    setFicha((f) => (f ? { indice: j, origen: null } : f));
    puenteRef.current.control?.saltar(j);
  }, []);

  // ── arrastre del anillo (pointer events, con inercia al soltar) ──
  const alBajar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const a = arrastre.current;
    a.id = e.pointerId;
    a.x0 = a.x = e.clientX;
    a.t = e.timeStamp;
    a.activo = false;
    a.vel = 0;
  };
  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (a.id !== e.pointerId) return;
    const p = puenteRef.current;
    const dx = e.clientX - a.x;
    const dt = Math.max(1, e.timeStamp - a.t);
    if (!a.activo) {
      if (Math.abs(e.clientX - a.x0) < 8) return;
      a.activo = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      p.arrastre.activo = true;
      p.hover = -1;
      setHover(-1);
    }
    p.arrastre.dx += dx;
    a.vel = a.vel * 0.6 + ((dx / dt) * 1000) * 0.4;
    p.arrastre.vel = a.vel;
    a.x = e.clientX;
    a.t = e.timeStamp;
  };
  const alSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (a.id !== e.pointerId) return;
    a.id = -1;
    if (!a.activo) return;
    const p = puenteRef.current;
    // si el dedo se quedo quieto antes de soltar, no hay envion
    if (e.timeStamp - a.t > 90 || e.type === "pointercancel") p.arrastre.vel = 0;
    p.arrastre.activo = false;
    a.activo = false;
    a.suprimir = true;
    window.setTimeout(() => {
      a.suprimir = false;
    }, 0);
  };

  const girar = (delta: number) => {
    const p = puenteRef.current;
    const base = p.irA ?? p.frente;
    p.irA = (base + delta + N) % N;
  };

  const activa = hover >= 0 ? hover : foco >= 0 ? foco : frente;
  const tActiva = ITEMS[activa];
  const montarEscena = modo === "animado" && cargar && (enPantalla || listo);
  const contenedor = "mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:pl-28 lg:pr-20";

  return (
    <section
      ref={seccionRef}
      id="proyectos"
      data-modo={modo}
      aria-labelledby="trabajos-titulo"
      className="trabajos relative z-10"
    >
      <style>{CSS_ESTATICO + CSS_FICHA}</style>
      <noscript>
        <style>{CSS_SIN_JS}</style>
      </noscript>

      <header className={`${contenedor} pb-10 pt-24 md:pb-14 md:pt-36`}>
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
          {trabajos.eyebrow}
        </p>
        <h2
          id="trabajos-titulo"
          className="max-w-[16ch] font-display text-[clamp(2.6rem,6.2vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[color:var(--text)]"
        >
          {trabajos.titulo}
        </h2>
        <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-[color:var(--text-dim)] md:mt-8 md:text-[19px]">
          {trabajos.intro}
        </p>
      </header>

      <div ref={pistaRef} className="trabajos-pista relative h-[230svh] md:h-[280svh]">
        {/* ── el escenario 3D, fijo mientras dura el tramo ── */}
        <div
          className="trabajos-3d sticky top-0 h-svh overflow-hidden"
          role="region"
          aria-roledescription={carrusel.roledescription}
          aria-label={carrusel.region}
        >
          {/* luz celeste difusa detras del anillo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_46%_at_50%_56%,var(--accent-soft),transparent_72%)]"
          />

          <div
            ref={escenarioRef}
            className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            onClickCapture={(e) => {
              if (arrastre.current.suprimir) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ opacity: listo ? 1 : 0 }}
            >
              {montarEscena ? (
                <Escena
                  puenteRef={puenteRef}
                  progreso={scrollYProgress}
                  activo={enPantalla && pestanaVisible && !cubre}
                  movil={movil}
                  texturas={TEXTURAS}
                  destacados={DESTACADOS}
                  onListo={() => setListo(true)}
                />
              ) : null}
            </div>

            {/* Botones reales, uno por tarjeta: la escena los ubica sobre cada plano */}
            <ul className="absolute inset-0">
              {ITEMS.map((t, i) => (
                <li key={t.slug}>
                  <button
                    ref={(el) => {
                      puenteRef.current.botones[i] = el;
                    }}
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => abrir(i)}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse" || arrastre.current.activo) return;
                      puenteRef.current.hover = i;
                      setHover(i);
                    }}
                    onPointerLeave={() => {
                      if (puenteRef.current.hover !== i) return;
                      puenteRef.current.hover = -1;
                      setHover(-1);
                    }}
                    onFocus={(e) => {
                      // con la ficha abierta o cerrandose, el foco que devuelve el dialogo no gira el anillo
                      if (ocupado.current || !e.currentTarget.matches(":focus-visible")) return;
                      const p = puenteRef.current;
                      p.foco = i;
                      p.irA = i;
                      setFoco(i);
                    }}
                    onBlur={() => {
                      if (puenteRef.current.foco !== i) return;
                      puenteRef.current.foco = -1;
                      setFoco(-1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                      e.preventDefault();
                      const j = (i + (e.key === "ArrowRight" ? 1 : -1) + N) % N;
                      puenteRef.current.botones[j]?.focus({ preventScroll: true });
                    }}
                    className="absolute left-0 top-0 h-px w-px origin-top-left cursor-pointer bg-transparent data-[atras=1]:pointer-events-none"
                  >
                    <span className="sr-only">
                      {`${carrusel.abrir} ${t.marca}${t.subtitulo ? `, ${t.subtitulo}` : ""}. ${t.rubro}.`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Escuadras className="m-4 md:m-6" />

          {/* lectura de arriba: posicion en el anillo */}
          <p
            aria-hidden
            className="pointer-events-none absolute left-6 top-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)] md:left-12 md:top-10 lg:left-28"
          >
            <span className="text-[color:var(--text)]">
              {pad(activa + 1)} / {pad(N)}
            </span>
            <span className="h-3 w-px bg-[color:var(--hairline)]" />
            <span>{tipos[tActiva.tipo]}</span>
          </p>

          {/* abajo: marca y rubro de la activa, flechas y ayuda */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-[linear-gradient(to_top,var(--bg)_35%,transparent)] px-6 pb-7 pt-16 md:pb-9">
            <div className="flex w-full max-w-[44rem] items-center justify-between gap-4 lg:max-w-[60rem]">
              <BotonGiro etiqueta={carrusel.anterior} onClick={() => girar(-1)}>
                <ChevronLeft aria-hidden className="h-4 w-4" />
              </BotonGiro>

              <div aria-hidden key={tActiva.slug} className="trabajos-entra min-w-0 flex-1 text-center">
                <p className="font-mono text-[10px] uppercase leading-snug tracking-[0.2em] text-[color:var(--accent)] md:text-[11px]">
                  {tActiva.rubro}
                </p>
                <p className="mt-2 text-balance font-display text-[clamp(1.6rem,3.4vw,3rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-[color:var(--text)]">
                  {tActiva.marca}
                </p>
                <p className="mt-2 text-balance text-[14px] leading-snug text-[color:var(--text-dim)] md:text-[15px]">
                  {tActiva.destacado ? (
                    <>
                      <span className="text-[color:var(--accent)]">{tActiva.destacado.valor}</span>{" "}
                      {tActiva.destacado.detalle}
                    </>
                  ) : (
                    (tActiva.subtitulo ?? tActiva.etiquetas.join(" · "))
                  )}
                </p>
              </div>

              <BotonGiro etiqueta={carrusel.siguiente} onClick={() => girar(1)}>
                <ChevronRight aria-hidden className="h-4 w-4" />
              </BotonGiro>
            </div>
            <p aria-hidden className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              <span className="hidden md:inline">{carrusel.ayuda}</span>
              <span className="md:hidden">{carrusel.ayudaMovil}</span>
            </p>
          </div>
        </div>

        {/* ── la grilla: reduced-motion, sin WebGL acelerado, ahorro de datos o sin JS ── */}
        <div className={`trabajos-grilla hidden ${contenedor} pb-6`}>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((t, i) => (
              <li key={t.slug}>
                <button
                  ref={(el) => {
                    grillaBtns.current[i] = el;
                  }}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => abrir(i)}
                  className="group block w-full cursor-pointer text-left"
                >
                  <span
                    ref={(el) => {
                      grillaImgs.current[i] = el;
                    }}
                    className="relative block aspect-[16/10] overflow-hidden bg-[color:var(--surface)]"
                  >
                    <Image
                      src={t.media.miniatura}
                      alt=""
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 420px"
                      className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                    <Escuadras acento={Boolean(t.destacado)} className="m-2 transition-colors duration-300 group-hover:border-[color:var(--accent)]" />
                  </span>
                  <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                    {tipos[t.tipo]} · {t.rubro}
                  </span>
                  <span className="mt-2 block font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-[color:var(--text)]">
                    {t.marca}
                  </span>
                  {t.subtitulo ? (
                    <span className="mt-1 block text-[15px] text-[color:var(--text-dim)]">{t.subtitulo}</span>
                  ) : null}
                  {t.destacado ? (
                    <span className="mt-3 block text-[15px] text-[color:var(--text-dim)]">
                      <span className="font-semibold text-[color:var(--accent)]">{t.destacado.valor}</span>{" "}
                      {t.destacado.detalle}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={`${contenedor} pb-24 pt-10 font-display text-[clamp(1.15rem,2.2vw,1.6rem)] font-medium leading-snug tracking-[-0.02em] text-[color:var(--text-dim)] md:pb-36`}>
        {trabajos.pie}
      </p>

      {ficha ? (
        <Ficha
          items={ITEMS}
          indice={ficha.indice}
          origen={ficha.origen}
          textos={trabajos}
          reducido={reducido}
          destino={destino}
          onAbierta={() => setCubre(true)}
          onCerrando={() => setCubre(false)}
          onCerrada={alCerrar}
          onCambiar={alCambiar}
        />
      ) : null}
    </section>
  );
}

function BotonGiro({
  etiqueta,
  onClick,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="pointer-events-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border border-[color:var(--hairline)] text-[color:var(--text)] transition-colors duration-300 hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)] active:translate-y-px"
    >
      {children}
    </button>
  );
}
