"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";
import { IlustracionSistema } from "@/components/hero3d/IlustracionSistema";
import { IlustracionCaos } from "@/components/hero3d/IlustracionCaos";
import { TRAMOS } from "@/components/hero3d/plano";
import { CSS_ESTATICO, CSS_SIN_JS } from "@/components/hero3d/estatico";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";
import { esperarIntro } from "@/lib/intro";
import { hayWebGLAcelerado } from "@/lib/webgl";
import { mezcla, tramo, type Rango } from "@/lib/escena";

/**
 * Hero 3D: del caos al sistema.
 *
 * Queda fijo (sticky) durante el recorrido. Detras del texto, una escena
 * WebGL: un enjambre de fragmentos (chats, celdas de planilla, post-its,
 * tickets, relojes, carritos) que con el scroll vuela a sus casilleros y arma
 * una notebook y un celular con su panel. Ya armado, el panel vive solo y al
 * final la camara entra en la pantalla, que funde con la seccion siguiente.
 *
 * Carga (02-DESIGN.md, seccion 3D):
 *  - El texto es HTML del servidor y es el LCP: no depende del 3D.
 *  - three y R3F se piden DURANTE la cortina de entrada, en un momento ocioso,
 *    y el canvas se arma con el loop en pausa. Cuando la cortina se levanta,
 *    la escena ya esta. Si todavia no llego, se ve el caos en SVG (liviano) y
 *    hace crossfade con el canvas, sin salto ni hero vacio.
 *  - El loop de R3F corre solo con el hero en pantalla y la pestaña visible.
 *  - Reduced-motion, ahorro de datos, sin WebGL acelerado o sin JS: no hay
 *    canvas, se ve el sistema armado en SVG y el texto en su estado final.
 */

const Escena3D = dynamic(() => import("@/components/hero3d/Escena3D"), { ssr: false });

type Modo = "animado" | "estatico";

function cuandoEsteOcioso(tope: number) {
  return new Promise<void>((resolve) => {
    // Safari todavia no tiene requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: tope });
    } else {
      setTimeout(resolve, 120);
    }
  });
}

/** Escuadras en L: el marco del hero (las unicas del sitio). */
function Escuadras() {
  const base = "pointer-events-none absolute h-[10px] w-[10px] border-[color:var(--hairline-strong)]";
  return (
    <>
      <span aria-hidden className={`${base} left-4 top-[76px] border-l border-t md:left-6`} />
      <span aria-hidden className={`${base} right-4 top-[76px] border-r border-t md:right-6`} />
      <span aria-hidden className={`${base} bottom-4 left-4 border-b border-l md:bottom-6 md:left-6`} />
      <span aria-hidden className={`${base} bottom-4 right-4 border-b border-r md:bottom-6 md:right-6`} />
    </>
  );
}

const mapa = (rango: Rango, desde: number, hasta: number) => (v: number) =>
  mezcla(desde, hasta, tramo(v, rango));

export function Hero() {
  const { identity, hero } = content;
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const [modo, setModo] = useState<Modo>("animado");
  const [cargar, setCargar] = useState(false);
  const [listo, setListo] = useState(false);
  const [introFin, setIntroFin] = useState(false);
  const [enPantalla, setEnPantalla] = useState(true);
  const [pestanaVisible, setPestanaVisible] = useState(true);
  const [dispositivo, setDispositivo] = useState({ movil: false, puntero: false });

  // Progreso del tramo fijo: 0 cuando el hero toca el techo, 1 cuando se va.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // En forma de funcion: quedan en el mismo reloj que lee la escena 3D.
  const caosOpacity = useTransform(scrollYProgress, mapa(TRAMOS.textoCaosSale, 1, 0));
  const caosY = useTransform(scrollYProgress, mapa(TRAMOS.textoCaosSale, 0, -36));
  const sistemaOpacity = useTransform(
    scrollYProgress,
    (v) => tramo(v, TRAMOS.textoSistemaEntra) * (1 - tramo(v, TRAMOS.textoSistemaSale))
  );
  const sistemaY = useTransform(
    scrollYProgress,
    (v) => mezcla(36, 0, tramo(v, TRAMOS.textoSistemaEntra)) - 40 * tramo(v, TRAMOS.textoSistemaSale)
  );
  const indicadorOpacity = useTransform(scrollYProgress, mapa(TRAMOS.indicadorSale, 1, 0));
  const haloOpacity = useTransform(
    scrollYProgress,
    (v) => mezcla(0.35, 1, tramo(v, [0, TRAMOS.ensamble[1]])) * (1 - tramo(v, TRAMOS.zoom))
  );
  const fundido = useTransform(scrollYProgress, mapa(TRAMOS.fundido, 0, 1));
  // todo lo que acompaña al texto se va cuando la camara entra en la pantalla
  const salidaOpacity = useTransform(scrollYProgress, mapa(TRAMOS.textoSistemaSale, 1, 0));
  const ensamble = useTransform(scrollYProgress, (v) => `${Math.round(tramo(v, TRAMOS.ensamble) * 100)}%`);

  // Los CTA viven en el estado "sistema": invisibles, no se enfocan (inert).
  const entra = (TRAMOS.textoSistemaEntra[0] + TRAMOS.textoSistemaEntra[1]) / 2;
  const sale = (TRAMOS.textoSistemaSale[0] + TRAMOS.textoSistemaSale[1]) / 2;
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (ctaRef.current && modo === "animado") ctaRef.current.inert = v < entra || v > sale;
  });

  const alListo = useCallback(() => setListo(true), []);

  // Decide el modo y arranca la carga de la escena YA, durante la cortina.
  useEffect(() => {
    if (ctaRef.current) ctaRef.current.inert = false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData === true || typeof window.WebGLRenderingContext === "undefined") {
      // Modo decidido en el cliente (reduced-motion ya lo resolvio el CSS).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModo("estatico");
      return;
    }

    const v = scrollYProgress.get();
    if (ctaRef.current) ctaRef.current.inert = v < entra || v > sale;
    setDispositivo({
      movil: window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768,
      puntero: window.matchMedia("(pointer: fine)").matches,
    });

    let vivo = true;
    esperarIntro().then(() => vivo && setIntroFin(true));
    // Ocioso y con tope corto: mientras la cortina anima en el compositor, el
    // hilo principal esta libre para bajar y evaluar three.
    cuandoEsteOcioso(400)
      .then(() => {
        if (!vivo) return;
        if (!hayWebGLAcelerado()) {
          setModo("estatico");
          return;
        }
        return import("@/components/hero3d/Escena3D").then(() => {
          if (vivo) setCargar(true);
        });
      })
      .catch(() => vivo && setModo("estatico"));
    return () => {
      vivo = false;
    };
  }, [scrollYProgress, entra, sale]);

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
  const mostrarEscena = listo && introFin;

  return (
    <section
      ref={sectionRef}
      id="inicio"
      data-modo={modo}
      className="hero3d relative z-10 h-[290svh] lg:h-[330svh]"
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

        {/* Mientras la escena carga: el caos en SVG, que funde con el canvas */}
        <IlustracionCaos
          className="hero3d-solo-animado pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: mostrarEscena ? 0 : 1 }}
        />

        {/* La escena WebGL: se arma detras de la cortina y aparece con fade */}
        <div
          aria-hidden
          className="hero3d-solo-animado absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: mostrarEscena ? 1 : 0 }}
        >
          {montarEscena ? (
            <Escena3D
              progreso={scrollYProgress}
              activo={introFin && enPantalla && pestanaVisible}
              movil={dispositivo.movil}
              puntero={dispositivo.puntero}
              zonaPuntero={pinRef}
              onListo={alListo}
            />
          ) : null}
        </div>

        {/* Zona de lectura: un velo del color del fondo detras del texto, sin
            borde de caja. El caos ademas esquiva y atenua esta zona. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--veil)_0%,var(--veil)_44%,transparent_70%)] lg:bg-[radial-gradient(ellipse_60%_85%_at_18%_50%,var(--veil)_0%,var(--veil)_42%,transparent_100%)]"
          style={{ opacity: salidaOpacity }}
        />

        <Escuadras />

        <div className="hero3d-contenido relative mx-auto flex h-full max-w-[1400px] flex-col px-6 pb-20 pt-[84px] md:px-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pb-16 lg:pl-28 lg:pr-20 lg:pt-20">
          {/* ── El texto: dolor y negocio ordenado en la misma celda ── */}
          <div className="max-w-[36rem] lg:max-w-[40rem]">
            <motion.p
              className="mb-8 hidden font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--text-dim)] lg:block"
              style={{ opacity: salidaOpacity }}
            >
              {identity.role}
            </motion.p>

            <div className="grid">
              <motion.div
                className="hero3d-caos [grid-area:1/1] lg:self-center"
                style={{ opacity: caosOpacity, y: caosY }}
              >
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--text-dim)]">
                  {hero.caos.kicker}
                </p>
                <h1 className="font-display text-[clamp(2.15rem,3.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.012em] text-[color:var(--text)]">
                  {hero.caos.titular}
                </h1>
                <p className="mt-6 text-[18px] leading-[1.55] text-[color:var(--text-soft)] md:text-[20px]">
                  {hero.caos.bajada}
                </p>

                {/* Invitacion a bajar: cerca del texto, con fondo y en
                    movimiento. Se va apenas empieza el ensamblaje. */}
                <motion.div
                  aria-hidden
                  className="hero3d-solo-animado mt-8 inline-flex items-center gap-3 border border-[color:var(--accent-line)] bg-[color:var(--surface)] px-4 py-3"
                  style={{ opacity: indicadorOpacity }}
                >
                  <svg viewBox="0 0 12 14" className="a-invita h-3.5 w-3 text-[color:var(--accent)]">
                    <path d="M1 2l5 5 5-5M1 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text)]">
                    {hero.indicador}
                  </span>
                </motion.div>
              </motion.div>

              <motion.div
                className="hero3d-sistema [grid-area:1/1] lg:self-center"
                style={{ opacity: sistemaOpacity, y: sistemaY }}
              >
                <p className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]">
                  <span aria-hidden className="a-latido loop-libre inline-block h-[6px] w-[6px] bg-[color:var(--accent)]" />
                  {hero.sistema.kicker}
                </p>
                <h2 className="font-display text-[clamp(2.15rem,3.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.012em] text-[color:var(--text)]">
                  {hero.sistema.titular.before}{" "}
                  <span className="text-[color:var(--accent)]">{hero.sistema.titular.accent}</span>{" "}
                  {hero.sistema.titular.after}
                </h2>
                <p className="mt-5 max-w-[44ch] text-[16px] leading-[1.5] text-[color:var(--text-soft)] md:mt-6 md:text-[19px] md:leading-[1.55]">
                  {hero.sistema.bajada}
                </p>

                <div ref={ctaRef} className="mt-7 flex flex-wrap gap-3 md:mt-10 md:gap-4">
                  <Button asChild className="h-12 flex-1 px-3 md:h-13 md:flex-none md:px-6">
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
                  <Button asChild variant="secondary" className="h-12 flex-1 px-3 md:h-13 md:flex-none md:px-6">
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

                <p className="mt-7 hidden flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-dim)] md:flex">
                  {hero.cifras.map((cifra) => (
                    <span key={cifra.label}>
                      <span className="text-[color:var(--text)]">{cifra.valor}</span> {cifra.label}
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

        {/* Cajetin: la lectura del ensamblaje */}
        <motion.div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute bottom-10 right-20 hidden items-center gap-3 border border-[color:var(--hairline)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-faint)] lg:flex"
          style={{ opacity: salidaOpacity }}
        >
          <span>{hero.cajetin.titulo}</span>
          <span className="h-3 w-px bg-[color:var(--hairline)]" />
          <span>
            {hero.cajetin.ensamble}{" "}
            <motion.span className="inline-block min-w-[4ch] text-right text-[color:var(--accent)]">
              {ensamble}
            </motion.span>
          </span>
        </motion.div>

        {/* Al final la camara entra en la pantalla y funde con lo que sigue */}
        <motion.div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute inset-0 bg-[color:var(--bg)]"
          style={{ opacity: fundido }}
        />
      </div>
    </section>
  );
}
