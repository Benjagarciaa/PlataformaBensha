"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";
import { IlustracionSistema } from "@/components/hero3d/IlustracionSistema";
import { TRAMOS } from "@/components/hero3d/plano";
import { CSS_ESTATICO, CSS_SIN_JS } from "@/components/hero3d/estatico";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";
import { esperarIntro } from "@/lib/intro";

/**
 * Hero 3D: del caos al sistema.
 *
 * El hero queda fijo (sticky) durante un recorrido de ~2.5 pantallas. Detras
 * del texto, una escena WebGL: al principio un enjambre de fragmentos (chats,
 * celdas de planilla, post-its, tickets, relojes, carritos) que con el scroll
 * vuelan a sus casilleros y arman una notebook y un celular con su UI. El
 * texto cuenta lo mismo: arranca con el dolor y termina con la solucion.
 *
 * Reglas (02-DESIGN.md, seccion 3D):
 *  - El texto es HTML real, se renderiza en el servidor y es el LCP.
 *  - three y R3F viven en un chunk aparte (next/dynamic, ssr: false) que se
 *    pide recien cuando termino la intro y el navegador esta ocioso.
 *  - El loop de R3F corre solo con el hero en pantalla y la pestaña visible.
 *  - Reduced-motion, ahorro de datos, sin WebGL acelerado o sin JS: no hay
 *    canvas, se ve el sistema armado en SVG y el texto en su estado final.
 */

const Escena3D = dynamic(() => import("@/components/hero3d/Escena3D"), { ssr: false });

type Modo = "animado" | "estatico";

/**
 * WebGL con aceleracion por hardware. Si el navegador solo puede renderizar
 * por software (SwiftShader, llvmpipe: PCs sin GPU, algunos servidores), la
 * escena costaria mas de lo que aporta y se usa el SVG estatico.
 * `?webgl=forzar` en la URL saltea el chequeo de software, solo para QA con
 * navegadores headless.
 */
function hayWebGLAcelerado() {
  try {
    const forzar = new URLSearchParams(window.location.search).get("webgl") === "forzar";
    const opciones: WebGLContextAttributes = { failIfMajorPerformanceCaveat: !forzar };
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", opciones) ?? canvas.getContext("webgl", opciones);
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
    // Safari todavia no tiene requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: tope });
    } else {
      setTimeout(resolve, 200);
    }
  });
}

/** Escuadras en L: el detalle firma del sistema (02-DESIGN.md seccion 3). */
function Escuadras() {
  const base = "pointer-events-none absolute h-[10px] w-[10px] border-[color:var(--hairline)]";
  return (
    <>
      <span aria-hidden className={`${base} left-4 top-[76px] border-l border-t md:left-6`} />
      <span aria-hidden className={`${base} right-4 top-[76px] border-r border-t md:right-6`} />
      <span aria-hidden className={`${base} bottom-4 left-4 border-b border-l md:bottom-6 md:left-6`} />
      <span aria-hidden className={`${base} bottom-4 right-4 border-b border-r md:bottom-6 md:right-6`} />
    </>
  );
}

export function Hero() {
  const { identity, hero } = content;
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const [modo, setModo] = useState<Modo>("animado");
  const [cargar, setCargar] = useState(false);
  const [listo, setListo] = useState(false);
  const [enPantalla, setEnPantalla] = useState(true);
  const [pestanaVisible, setPestanaVisible] = useState(true);
  const [dispositivo, setDispositivo] = useState({ movil: false, puntero: false });

  // Progreso del tramo fijo: 0 cuando el hero toca el techo, 1 cuando se va.
  // useScroll lee el scroll nativo que Lenis mueve, asi que funciona igual.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Transformaciones en forma de funcion: motion no las pasa a ViewTimeline
  // nativo (que con este sticky media otro rango) y quedan en el mismo reloj
  // que lee la escena 3D.
  const mapa = (rango: readonly [number, number], desde: number, hasta: number) => (v: number) => {
    const t = Math.min(1, Math.max(0, (v - rango[0]) / (rango[1] - rango[0])));
    return desde + (hasta - desde) * t;
  };
  const caosOpacity = useTransform(scrollYProgress, mapa(TRAMOS.textoCaosSale, 1, 0));
  const caosY = useTransform(scrollYProgress, mapa(TRAMOS.textoCaosSale, 0, -36));
  const sistemaOpacity = useTransform(scrollYProgress, mapa(TRAMOS.textoSistemaEntra, 0, 1));
  const sistemaY = useTransform(scrollYProgress, mapa(TRAMOS.textoSistemaEntra, 36, 0));
  const indicadorOpacity = useTransform(scrollYProgress, mapa(TRAMOS.indicadorSale, 1, 0));
  const haloOpacity = useTransform(scrollYProgress, mapa([0, TRAMOS.ensamble[1]], 0.35, 1));
  const ensamble = useTransform(scrollYProgress, (v) => {
    const [a, b] = TRAMOS.ensamble;
    return `${Math.round(Math.min(1, Math.max(0, (v - a) / (b - a))) * 100)}%`;
  });

  // Los CTA viven en el estado "sistema": mientras estan invisibles no se
  // pueden enfocar ni clickear (inert), sin tocar el render.
  const umbralCta = (TRAMOS.textoSistemaEntra[0] + TRAMOS.textoSistemaEntra[1]) / 2;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (ctaRef.current && modo === "animado") ctaRef.current.inert = v < umbralCta;
  });

  // Decide el modo y programa la carga diferida de la escena.
  useEffect(() => {
    if (ctaRef.current) ctaRef.current.inert = false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const ahorro = conn?.saveData === true;
    if (reduce || ahorro || typeof window.WebGLRenderingContext === "undefined") {
      // Modo decidido en el cliente (reduced-motion ya lo resolvio el CSS).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModo("estatico");
      return;
    }

    if (ctaRef.current) ctaRef.current.inert = scrollYProgress.get() < umbralCta;
    setDispositivo({
      movil:
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768,
      puntero: window.matchMedia("(pointer: fine)").matches,
    });

    let vivo = true;
    esperarIntro()
      .then(() => cuandoEsteOcioso(1500))
      .then(() => {
        if (!vivo) return;
        if (!hayWebGLAcelerado()) {
          setModo("estatico");
          return;
        }
        setCargar(true);
      });
    return () => {
      vivo = false;
    };
  }, [scrollYProgress, umbralCta]);

  // El loop de la escena corre solo con el hero en pantalla y la pestaña visible.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || modo !== "animado") return;
    const io = new IntersectionObserver(([entrada]) => setEnPantalla(entrada.isIntersecting), {
      rootMargin: "100px 0px",
    });
    io.observe(section);
    const visibilidad = () => setPestanaVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibilidad);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", visibilidad);
    };
  }, [modo]);

  const montarEscena = modo === "animado" && cargar && (enPantalla || listo);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      data-modo={modo}
      className="hero3d relative z-10 h-[220svh] lg:h-[250svh]"
    >
      <style>{CSS_ESTATICO}</style>
      <noscript>
        <style>{CSS_SIN_JS}</style>
      </noscript>

      <div ref={pinRef} className="hero3d-pin sticky top-0 h-svh overflow-hidden">
        {/* Halo celeste: la luz del sistema, crece a medida que se arma */}
        <motion.div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] lg:inset-y-[12%] lg:left-[46%] lg:right-0 lg:h-auto"
          style={{ opacity: haloOpacity }}
        />

        {/* La escena WebGL: entra con fade cuando ya pinto su primer frame */}
        <div
          aria-hidden
          className="hero3d-solo-animado absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: listo ? 1 : 0 }}
        >
          {montarEscena ? (
            <Escena3D
              progreso={scrollYProgress}
              activo={enPantalla && pestanaVisible}
              movil={dispositivo.movil}
              puntero={dispositivo.puntero}
              zonaPuntero={pinRef}
              onListo={() => setListo(true)}
            />
          ) : null}
        </div>

        {/* Viñeta detras del texto: el caos nunca le gana a la lectura */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_62%_at_50%_16%,var(--bg)_35%,transparent_100%)] lg:bg-[radial-gradient(ellipse_52%_72%_at_24%_50%,var(--bg)_25%,transparent_100%)]"
        />

        <Escuadras />

        <div className="hero3d-contenido relative mx-auto flex h-full max-w-[1400px] flex-col px-6 pb-20 pt-24 md:px-12 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-10 lg:pb-16 lg:pl-28 lg:pr-20 lg:pt-20">
          {/* ── El texto: dolor y solucion apilados en la misma celda ── */}
          <div className="max-w-[38rem]">
            <p className="mb-8 hidden font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-faint)] md:block">
              {identity.role}
            </p>

            <div className="grid">
              <motion.div
                className="hero3d-caos [grid-area:1/1] lg:self-center"
                style={{ opacity: caosOpacity, y: caosY }}
              >
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
                  {hero.caos.kicker}
                </p>
                <h1 className="font-display text-[clamp(2.1rem,3.7vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[color:var(--text)]">
                  {hero.caos.titular}
                </h1>
                <p className="mt-5 text-[17px] leading-relaxed text-[color:var(--text-dim)] md:mt-6 md:text-[18px]">
                  {hero.caos.bajada}
                </p>
              </motion.div>

              <motion.div
                className="hero3d-sistema [grid-area:1/1] lg:self-center"
                style={{ opacity: sistemaOpacity, y: sistemaY }}
              >
                <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--accent)]">
                  <span
                    aria-hidden
                    className="inline-block h-[6px] w-[6px] bg-[color:var(--accent)] will-change-[opacity]"
                    style={{ opacity: "calc(0.4 + 0.6 * var(--trazo, 0.7))" }}
                  />
                  {hero.sistema.kicker}
                </p>
                <h2 className="font-display text-[clamp(2.1rem,3.7vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[color:var(--text)]">
                  {hero.sistema.titular.before}{" "}
                  <span className="font-semibold text-[color:var(--accent)]">
                    {hero.sistema.titular.accent}
                  </span>{" "}
                  {hero.sistema.titular.after}
                </h2>
                <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mt-6 md:text-[17px]">
                  {hero.sistema.bajada}
                </p>

                <div ref={ctaRef} className="mt-7 flex flex-wrap gap-3 md:mt-9 md:gap-4">
                  <Button asChild className="flex-1 px-3 md:flex-none md:px-5">
                    <a
                      href="#contacto"
                      onClick={(e) => {
                        e.preventDefault();
                        irASeccion("contacto");
                      }}
                    >
                      {hero.sistema.ctaPrimary}
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="flex-1 px-3 md:flex-none md:px-5">
                    <a
                      href="#proyectos"
                      onClick={(e) => {
                        e.preventDefault();
                        irASeccion("proyectos");
                      }}
                    >
                      {hero.sistema.ctaSecondary}
                    </a>
                  </Button>
                </div>

                <p className="mt-6 hidden flex-wrap gap-x-5 gap-y-1 font-mono md:flex text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                  {hero.cifras.map((cifra) => (
                    <span key={cifra.label}>
                      <span className="text-[color:var(--text)]">
                        {cifra.prefix}
                        {cifra.n}
                      </span>{" "}
                      {cifra.label}
                    </span>
                  ))}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Fallback: el sistema armado, estatico. Oculto si hay 3D. */}
          <div className="hero3d-svg relative mt-10 hidden w-full max-w-[620px] self-center lg:mt-0 lg:justify-self-end">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[10%] bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
            />
            <IlustracionSistema className="relative h-auto w-full" />
          </div>
        </div>

        {/* Indicador de scroll: se va apenas se empieza a bajar */}
        <motion.div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 lg:bottom-10 lg:left-28 lg:translate-x-0 lg:items-start"
          style={{ opacity: indicadorOpacity }}
        >
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-faint)]">
            {hero.indicador}
          </span>
          <span className="relative block h-10 w-px overflow-hidden bg-[color:var(--hairline)]">
            <span
              className="absolute inset-x-0 top-0 block h-3 bg-[color:var(--accent)] will-change-transform"
              style={{ transform: "translateY(calc(var(--trazo, 0.5) * 28px))" }}
            />
          </span>
        </motion.div>

        {/* Cajetin: la lectura del ensamblaje, como en un plano */}
        <div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute bottom-10 right-20 hidden items-center gap-3 border border-[color:var(--hairline)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)] lg:flex"
        >
          <span>{hero.cajetin.titulo}</span>
          <span className="h-3 w-px bg-[color:var(--hairline)]" />
          <span>
            {hero.cajetin.ensamble}{" "}
            <motion.span className="inline-block min-w-[4ch] text-right text-[color:var(--accent)]">
              {ensamble}
            </motion.span>
          </span>
        </div>
      </div>
    </section>
  );
}
