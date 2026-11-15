"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/Button";
import { IlustracionSistema } from "@/components/hero3d/IlustracionSistema";
import { CSS_CAOS, IlustracionCaos } from "@/components/hero3d/IlustracionCaos";
import { TRAMOS } from "@/components/hero3d/plano";
import { CSS_ESTATICO, CSS_SIN_JS } from "@/components/hero3d/estatico";
import { montar, type Motor } from "@/components/hero3d/motor";
import { content } from "@/content/data";
import { irAPosicion, irASeccion } from "@/lib/lenis";
import { avisarEscenaLista, trasPintar } from "@/lib/arranque";
import { dprEscena, esMovil, hayWebGLAcelerado } from "@/lib/webgl";
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
 * Carga (02-DESIGN.md, seccion 10):
 *  - El texto es HTML del servidor y es el LCP: no depende del 3D.
 *  - Desde el primer pintado se ve el caos en SVG, que ya deriva (CSS): el
 *    hero nunca esta quieto ni vacio. No hay cortina de entrada.
 *  - El motor 3D es WebGL2 directo (sin three): pocos KB que viajan con el
 *    hero, sin esperar otra descarga. El chequeo de WebGL (crear un contexto)
 *    y el armado corren despues del primer pintado, nunca dentro de la
 *    hidratacion. Lista la escena, arranca su reloj en 0 (el mismo cuadro que
 *    el SVG) y funde con el en 650 ms.
 *  - El loop corre solo con la escena a la vista (hero en pantalla, pestaña
 *    visible y antes de que termine el fundido final).
 *  - Reduced-motion, ahorro de datos, sin WebGL acelerado o sin JS: no hay
 *    canvas, se ve el sistema armado en SVG y el texto en su estado final.
 */

function sinMovimiento() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return reduce || conn?.saveData === true || typeof window.WebGL2RenderingContext === "undefined";
}

type Modo = "animado" | "estatico";

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

/** El crossfade del caos en SVG con la escena, cuando la escena llega a la vista. */
const FUNDIDO_MS = 650;

export function Hero() {
  const { identity, hero } = content;
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const escenaRef = useRef<HTMLDivElement | null>(null);
  const motorRef = useRef<Motor | null>(null);

  const [modo, setModo] = useState<Modo>("animado");
  const [listo, setListo] = useState(false);
  const [caosFuera, setCaosFuera] = useState(false);
  const [enPantalla, setEnPantalla] = useState(true);
  const [pestanaVisible, setPestanaVisible] = useState(true);
  /** el fundido final ya termino: la escena es transparente y no se pinta */
  const [terminada, setTerminada] = useState(false);

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
  // al final la camara entra en la pantalla y la escena se desvanece
  const escenaOpacity = useTransform(scrollYProgress, mapa(TRAMOS.fundido, 1, 0));
  // todo lo que acompaña al texto se va cuando la camara entra en la pantalla
  const salidaOpacity = useTransform(scrollYProgress, mapa(TRAMOS.textoSistemaSale, 1, 0));
  // si se baja antes de que llegue la escena, el caos en SVG se despeja
  const caosSvgOpacity = useTransform(scrollYProgress, mapa([0.02, 0.2], 1, 0));
  // la invitacion a bajar solo recibe clicks mientras se ve
  const indicadorEventos = useTransform(indicadorOpacity, (o) => (o > 0.2 ? "auto" : "none"));

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const fin = v >= TRAMOS.fundido[1] - 0.001;
    setTerminada((previa) => (previa === fin ? previa : fin));
  });

  /**
   * Lleva el recorrido a un punto del tramo fijo (0..1). Los CTA viven en el
   * estado "sistema": si se enfocan con teclado fuera de ese tramo, el hero
   * baja hasta ahi para que se vean.
   */
  const irAlTramo = (t: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    irAPosicion(top + t * Math.max(0, section.offsetHeight - window.innerHeight));
  };
  const medioSistema = (TRAMOS.textoSistemaEntra[1] + TRAMOS.textoSistemaSale[0]) / 2;
  const alEnfocarCta = () => {
    if (modo !== "animado") return;
    const v = scrollYProgress.get();
    if (v < TRAMOS.textoSistemaEntra[1] || v > TRAMOS.textoSistemaSale[0]) irAlTramo(medioSistema);
  };

  // Decide el modo y arma la escena despues del primer pintado: crear el
  // contexto WebGL y compilar no caen dentro de la hidratacion.
  useEffect(() => {
    if (sinMovimiento()) {
      // Modo decidido en el cliente (reduced-motion ya lo resolvio el CSS).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModo("estatico");
      avisarEscenaLista();
      return;
    }

    let vivo = true;
    let motor: Motor | null = null;
    const contenedor = escenaRef.current;
    const movil = esMovil();
    trasPintar()
      .then(() => {
        if (!vivo || !contenedor) return null;
        // el contexto nace con el tamaño final del canvas
        const r = dprEscena(movil);
        const tam = { ancho: Math.floor(contenedor.clientWidth * r), alto: Math.floor(contenedor.clientHeight * r) };
        if (!hayWebGLAcelerado(tam)) {
          setModo("estatico");
          avisarEscenaLista();
          return null;
        }
        return montar({
          contenedor,
          progreso: scrollYProgress,
          movil,
          puntero: window.matchMedia("(pointer: fine)").matches,
          zonaPuntero: pinRef.current,
          alPerder: () => setModo("estatico"),
        });
      })
      .then((m) => {
        if (!m) return;
        if (!vivo) {
          m.destruir();
          return;
        }
        motor = m;
        motorRef.current = m;
        // el reloj arranca en 0: el primer cuadro es el mismo que el caos en SVG
        m.reiniciarReloj();
        setListo(true);
        performance.mark("hero:visible");
        avisarEscenaLista();
      })
      .catch(() => {
        if (vivo) setModo("estatico");
        avisarEscenaLista();
      });
    return () => {
      vivo = false;
      motor?.destruir();
      motorRef.current = null;
    };
  }, [scrollYProgress]);

  // En pantalla: el loop de la escena y los loops CSS del hero (data-activa).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(([entrada]) => {
      setEnPantalla(entrada.isIntersecting);
      section.toggleAttribute("data-activa", entrada.isIntersecting);
    });
    io.observe(section);
    const visibilidad = () => setPestanaVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibilidad);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", visibilidad);
    };
  }, []);

  useEffect(() => {
    motorRef.current?.activar(modo === "animado" && listo && enPantalla && pestanaVisible && !terminada);
  }, [modo, listo, enPantalla, pestanaVisible, terminada]);

  // Terminado el crossfade, el SVG del caos se va (y sus animaciones con el).
  useEffect(() => {
    if (!listo) return;
    const t = window.setTimeout(() => setCaosFuera(true), FUNDIDO_MS + 150);
    return () => window.clearTimeout(t);
  }, [listo]);

  const transicion = `opacity ${FUNDIDO_MS}ms var(--ease-io)`;

  return (
    <section
      ref={sectionRef}
      id="inicio"
      data-modo={modo}
      className="hero3d relative z-10 h-[150svh] lg:h-[170svh]"
    >
      <style>{CSS_ESTATICO + CSS_CAOS}</style>
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

        {/* Desde el primer pintado: el caos en SVG, ya derivando. Cuando la
            escena llega funde con el canvas (es el mismo cuadro). */}
        {caosFuera ? null : (
          <div
            aria-hidden
            data-hero="caos"
            className="hero3d-solo-animado pointer-events-none absolute inset-0"
            style={{ opacity: listo ? 0 : 1, transition: transicion }}
          >
            <motion.div className="absolute inset-0" style={{ opacity: caosSvgOpacity }}>
              <IlustracionCaos className="absolute inset-0" />
            </motion.div>
          </div>
        )}

        {/* La escena WebGL: el motor pone su canvas aca adentro. Al final se
            vuelve transparente y deja ver el fondo de la pagina: funde con lo
            que sigue sin ningun corte. */}
        <div
          aria-hidden
          data-hero="escena"
          className="hero3d-solo-animado pointer-events-none absolute inset-0"
          style={{ opacity: listo ? 1 : 0, transition: transicion }}
        >
          <motion.div ref={escenaRef} className="absolute inset-0" style={{ opacity: escenaOpacity }} />
        </div>

        {/* Zona de lectura: un velo del color del fondo detras del texto, sin
            borde de caja. El caos ademas esquiva y atenua esta zona. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--veil)_0%,var(--veil)_44%,transparent_70%)] lg:bg-[radial-gradient(ellipse_60%_85%_at_18%_50%,var(--veil)_0%,var(--veil)_42%,transparent_100%)]"
          style={{ opacity: salidaOpacity }}
        />

        <motion.div
          aria-hidden
          className="hero3d-salida pointer-events-none absolute inset-0"
          style={{ opacity: escenaOpacity }}
        >
          <Escuadras />
        </motion.div>

        <div className="hero3d-contenido relative mx-auto flex h-full max-w-[1400px] flex-col px-6 pb-20 pt-[84px] md:px-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pb-16 lg:pl-28 lg:pr-20 lg:pt-20">
          {/* ── El texto: dolor y negocio ordenado en la misma celda ── */}
          <div className="max-w-[36rem] lg:max-w-[40rem]">
            <motion.p
              className="hero3d-salida mb-8 hidden font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--text-dim)] lg:block"
              style={{ opacity: salidaOpacity }}
            >
              {identity.role}
            </motion.p>

            <div className="grid">
              {/* sin nada interactivo salvo la invitacion: nunca tapa los CTA */}
              <motion.div
                className="hero3d-caos pointer-events-none [grid-area:1/1] lg:self-center"
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
                    movimiento. Es un boton: lleva al negocio ordenado. Se va
                    apenas empieza el ensamblaje. */}
                <motion.button
                  type="button"
                  tabIndex={-1}
                  onClick={() => irAlTramo(medioSistema)}
                  className="hero3d-solo-animado mt-8 inline-flex cursor-pointer items-center gap-3 border border-[color:var(--accent-line)] bg-[color:var(--surface)] px-4 py-3 transition-colors duration-300 hover:bg-[color:var(--accent-soft)]"
                  style={{ opacity: indicadorOpacity, pointerEvents: indicadorEventos }}
                >
                  <svg aria-hidden viewBox="0 0 12 14" className="a-invita loop h-3.5 w-3 text-[color:var(--accent)]">
                    <path d="M1 2l5 5 5-5M1 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text)]">
                    {hero.indicador}
                  </span>
                </motion.button>
              </motion.div>

              {/* encima del caos siempre (z-[1]), tenga o no transform */}
              <motion.div
                className="hero3d-sistema relative z-[1] [grid-area:1/1] lg:self-center"
                style={{ opacity: sistemaOpacity, y: sistemaY }}
              >
                <p className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]">
                  <span aria-hidden className="a-latido loop inline-block h-[6px] w-[6px] bg-[color:var(--accent)]" />
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

                {/* Siempre en el orden del teclado: al enfocarlos, el hero baja
                    hasta el tramo en que se ven. */}
                <div ref={ctaRef} onFocus={alEnfocarCta} className="mt-7 flex flex-wrap gap-3 md:mt-10 md:gap-4">
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

        {/* Cajetin: el rotulo del plano, sin numeros */}
        <motion.div
          aria-hidden
          className="hero3d-solo-animado pointer-events-none absolute bottom-10 right-20 hidden items-center gap-3 border border-[color:var(--hairline)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-faint)] lg:flex"
          style={{ opacity: salidaOpacity }}
        >
          <span aria-hidden className="h-[5px] w-[5px] rotate-45 bg-[color:var(--accent)]" />
          <span>{hero.cajetin.titulo}</span>
        </motion.div>

      </div>
    </section>
  );
}
