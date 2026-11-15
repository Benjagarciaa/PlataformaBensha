"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Palabras } from "@/components/ui/Palabras";
import { content } from "@/content/data";

/**
 * Sobre mi. Corto y humano: la frase se revela palabra por palabra y los
 * numeros reales cuentan una vez al entrar.
 *
 * La formacion es el bloque que tiene que llamar la atencion: credenciales,
 * no una lista. Las dos destacadas (Full Stack, con sus distinciones, y
 * UX/UI certificado por PedidosYa) van grandes arriba; el resto, abajo. Al
 * entrar en pantalla las cartas salen de un mazo y se reparten a su lugar,
 * despues los sellos se estampan uno por uno y por las destacadas pasa un
 * brillo de vez en cuando. Todo por tiempo, sin pista fija: no suma scroll.
 * Solo texto y formas: nunca imagenes de certificados ni datos personales.
 */

type Credencial = (typeof content.sobreMi.formacion)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

export function SobreMi() {
  return (
    <Section id="sobre-mi" contenedor={false} aire={false} ariaLabel={content.sobreMi.eyebrow}>
      <Contenido />
    </Section>
  );
}

function Contenido() {
  const { sobreMi } = content;
  const vivo = useSeccionViva();
  const fraseRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress: frase } = useScroll({ target: fraseRef, offset: ["start 0.9", "start 0.35"] });

  return (
    <>
      <Contenedor className="pt-20 md:pt-28">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]">
          {sobreMi.eyebrow}
        </p>
        <p
          ref={fraseRef}
          className="max-w-5xl font-display text-[clamp(2.3rem,5.6vw,5.25rem)] font-semibold leading-[1] tracking-[-0.015em] text-balance text-[color:var(--text)]"
        >
          <Palabras texto={sobreMi.frase} progreso={frase} rango={[0, 1]} desde={0.16} />
        </p>

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="flex flex-col gap-5">
            {sobreMi.parrafos.map((parrafo, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="max-w-[56ch] text-[18px] leading-[1.65] text-pretty text-[color:var(--text-soft)] md:text-[20px]">
                  {parrafo}
                </p>
              </Reveal>
            ))}
          </div>
          <dl className="grid grid-cols-2 self-start border-t border-[color:var(--hairline-strong)]">
            {sobreMi.datos.map((dato, i) => (
              <div
                key={dato.label}
                className={`pt-6 md:pt-8 ${i > 0 ? "border-l border-[color:var(--hairline)] pl-5 md:pl-8" : "pr-5 md:pr-8"}`}
              >
                <dt className="sr-only">{dato.label}</dt>
                <dd>
                  <span className="flex items-start font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.02em] tabular-nums text-[color:var(--text)]">
                    <span className="mr-1 mt-[0.08em] text-[0.55em] leading-none text-[color:var(--accent)]">
                      {dato.prefijo}
                    </span>
                    <Contador n={dato.n} vivo={vivo} />
                  </span>
                  <span aria-hidden className="mt-4 block text-[17px] font-medium leading-tight text-[color:var(--text)] md:text-[19px]">
                    {dato.label}
                  </span>
                  <span aria-hidden className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.13em] text-[color:var(--text-dim)] md:text-[11px]">
                    {dato.detalle}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Contenedor>

      <Formacion vivo={vivo} />

      <Contenedor className="pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-20">
          <Reveal>
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.herramientasTitulo}
            </h3>
            <ul>
              {sobreMi.herramientas.map((h) => (
                <li
                  key={h.nombre}
                  className="grid gap-1 border-t border-[color:var(--hairline)] py-3.5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-baseline md:gap-6"
                >
                  <span className="text-[17px] font-medium text-[color:var(--text)]">{h.nombre}</span>
                  <span className="text-[16px] leading-[1.55] text-pretty text-[color:var(--text-dim)]">{h.para}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.recorridoTitulo}
            </h3>
            <ul>
              {sobreMi.recorrido.map((r) => (
                <li key={r.titulo} className="border-t border-[color:var(--hairline)] py-3.5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                    {r.anio}
                  </span>
                  <span className="mt-1 block text-[17px] font-medium text-[color:var(--text)]">{r.titulo}</span>
                  <span className="block text-[15px] text-[color:var(--text-dim)]">{r.lugar}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Contenedor>
    </>
  );
}

/** Numero real que cuenta desde 0 una sola vez al entrar. Arranca mostrando el valor final. */
function Contador({ n, vivo }: { n: number; vivo: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enVista = useInView(ref, { once: true, amount: 0.6 });
  const valor = useMotionValue(n);
  const texto = useTransform(valor, (v) => String(Math.round(v)));

  useEffect(() => {
    if (!vivo || !enVista) return;
    valor.set(0);
    const control = animate(valor, n, { duration: 1.6, ease: EASE });
    return () => control.stop();
  }, [vivo, enVista, n, valor]);

  return <motion.span ref={ref}>{texto}</motion.span>;
}

// ── la formacion: credenciales que se reparten y sellos que se estampan ──

/** Giro de cada carta en el mazo, antes de repartirse. */
const GIROS = [-6, 5, -9, 7, -3, 10];
/** Cuanto tarda en caer cada carta y cada cuanto sale la siguiente (s). */
const VUELO = 0.85;
const CADENCIA = 0.09;

type Mazo = { dx: number; dy: number }[];

function Formacion({ vivo }: { vivo: boolean }) {
  const { sobreMi } = content;
  const gridRef = useRef<HTMLOListElement>(null);
  const cartasRef = useRef<(HTMLLIElement | null)[]>([]);
  const enVista = useInView(gridRef, { once: true, amount: 0.2 });
  const [mazo, setMazo] = useState<Mazo | null>(null);
  const total = sobreMi.formacion.length;

  // Donde esta el mazo respecto de cada carta. Se mide con offsetLeft/Top
  // (el layout, sin transforms): solo al montar y al cambiar el tamaño.
  useLayoutEffect(() => {
    if (!vivo) return;
    const medir = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const cx = grid.offsetWidth / 2;
      const cy = grid.offsetHeight * 0.42;
      // en mobile la grilla es una columna larga: el vuelo se acota para que
      // ninguna carta salga de mas de media pantalla de distancia
      const tope = window.innerHeight * 0.45;
      const acota = (v: number) => Math.max(-tope, Math.min(tope, v));
      setMazo(
        cartasRef.current.map((el) =>
          el
            ? {
                dx: cx - (el.offsetLeft + el.offsetWidth / 2),
                dy: acota(cy - (el.offsetTop + el.offsetHeight / 2)),
              }
            : { dx: 0, dy: 0 }
        )
      );
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [vivo]);

  const repartido = !vivo || enVista;
  // los sellos se estampan cuando ya cayo la ultima carta
  const inicioSellos = (total - 1) * CADENCIA + VUELO * 0.8;
  // cuantos sellos se estamparon antes de cada carta: van de a uno, en orden
  const previos = sobreMi.formacion.map((_, k) =>
    sobreMi.formacion.slice(0, k).reduce((n, c) => n + (("sellos" in c && c.sellos) || []).length + ("insignia" in c && c.insignia ? 1 : 0), 0)
  );

  return (
    <div className="py-16 md:py-24">
      <Contenedor>
        <div className="mb-10 grid gap-5 md:mb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-16">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.formacionEyebrow}
            </p>
            <h3 className="max-w-[16ch] font-display text-[clamp(2.2rem,4.6vw,4.25rem)] font-semibold leading-[1] tracking-[-0.015em] text-balance text-[color:var(--text)]">
              {sobreMi.formacionTitulo}
            </h3>
          </div>
          <p className="max-w-[40ch] text-[17px] leading-[1.55] text-pretty text-[color:var(--text-soft)] md:text-[18px] lg:pb-1">
            {sobreMi.formacionIntro}
          </p>
        </div>

        <ol ref={gridRef} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:gap-5">
          {sobreMi.formacion.map((carta, k) => (
            <Carta
              key={carta.id}
              carta={carta}
              k={k}
              total={total}
              vivo={vivo}
              repartido={repartido}
              mazo={mazo?.[k] ?? null}
              retrasoSellos={inicioSellos + previos[k] * 0.22}
              refCarta={(el) => {
                cartasRef.current[k] = el;
              }}
            />
          ))}
        </ol>
      </Contenedor>
    </div>
  );
}

function Carta({
  carta,
  k,
  total,
  vivo,
  repartido,
  mazo,
  retrasoSellos,
  refCarta,
}: {
  carta: Credencial;
  k: number;
  total: number;
  vivo: boolean;
  repartido: boolean;
  mazo: { dx: number; dy: number } | null;
  retrasoSellos: number;
  refCarta: (el: HTMLLIElement | null) => void;
}) {
  const destacado = Boolean("destacado" in carta && carta.destacado);
  const sellos: readonly string[] = ("sellos" in carta && carta.sellos) || [];
  const certifica = "certifica" in carta ? carta.certifica : undefined;
  const insignia = "insignia" in carta ? carta.insignia : undefined;
  // con insignia, los sellos chicos caen despues de ella
  const retrasoChicos = retrasoSellos + (insignia ? 0.3 : 0);

  // en el mazo: apiladas en el centro, cada una girada; repartidas: en su lugar
  const enMazo = vivo && !repartido;
  const pose = enMazo
    ? mazo
      ? { x: mazo.dx, y: mazo.dy, rotate: GIROS[k % GIROS.length], scale: 0.82, opacity: 1 }
      : { opacity: 0 }
    : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };

  return (
    <motion.li
      ref={refCarta}
      data-anim
      initial={false}
      animate={pose}
      transition={enMazo ? { duration: 0 } : { duration: VUELO, delay: k * CADENCIA, ease: EASE }}
      style={{ zIndex: total - k }}
      className={`relative flex flex-col overflow-hidden border ${
        destacado
          ? "col-span-1 border-[color:var(--accent-line)] bg-[color:var(--surface-2)] p-6 sm:col-span-2 md:col-span-1 md:min-h-[340px] md:p-8 lg:min-h-[360px]"
          : "col-span-1 border-[color:var(--hairline-strong)] bg-[color:var(--surface)] p-5 md:min-h-[210px] md:p-6 lg:col-span-3"
      } ${destacado && k === 0 ? "lg:col-span-7" : ""} ${destacado && k > 0 ? "lg:col-span-5" : ""}`}
    >
      {/* el brillo que recorre las destacadas de vez en cuando (luz radial celeste) */}
      {destacado ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="loop a-brillo absolute -left-1/2 top-[-30%] h-[160%] w-1/2 bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
            style={{ animationDelay: `${k * 2.4}s` }}
          />
        </span>
      ) : null}

      <p className="relative flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-faint)] md:text-[11px]">
        <span className="text-[color:var(--text-dim)]">{carta.anio}</span>
        <span aria-hidden>·</span>
        <span>{carta.tipo}</span>
      </p>

      <p
        className={`relative font-display font-semibold leading-[1.15] tracking-[-0.005em] text-[color:var(--text-soft)] ${
          destacado ? "mt-6 text-[clamp(1.1rem,1.5vw,1.35rem)] md:mt-8" : "mt-4 text-[14px] md:text-[16px]"
        }`}
      >
        {carta.institucion}
      </p>
      <h4
        className={`relative mt-1 font-display font-semibold tracking-[-0.012em] text-balance text-[color:var(--text)] ${
          destacado ? "text-[clamp(2rem,3.4vw,3.25rem)] leading-[0.98]" : "text-[18px] leading-[1.12] md:text-[22px]"
        }`}
      >
        {carta.titulo}
      </h4>
      {certifica ? (
        <p
          className={`relative mt-3 flex items-center gap-2 font-mono uppercase tracking-[0.13em] text-[color:var(--accent)] ${
            destacado ? "text-[11px]" : "text-[9px] md:text-[10px]"
          }`}
        >
          <span aria-hidden className="inline-block h-[5px] w-[5px] rotate-45 bg-[color:var(--accent)]" />
          {certifica}
        </p>
      ) : null}
      <p
        className={`relative text-pretty text-[color:var(--text-soft)] ${
          destacado
            ? "mt-4 max-w-[46ch] text-[16px] leading-[1.55] md:text-[17px]"
            : "mt-3 text-[14px] leading-[1.5] text-[color:var(--text-dim)]"
        }`}
      >
        {carta.nota}
      </p>

      {insignia ? (
        <div className="relative mt-7 lg:absolute lg:bottom-8 lg:right-8 lg:mt-0">
          <Insignia
            valor={insignia.valor}
            texto={insignia.texto}
            vivo={vivo}
            estampado={repartido}
            retraso={retrasoSellos}
          />
        </div>
      ) : null}

      {sellos.length ? (
        <div className={`relative mt-auto flex flex-wrap items-center gap-x-3 gap-y-3 ${destacado ? "pt-7" : "pt-4"}`}>
          {sellos.map((texto, j) => (
            <Sello
              key={texto}
              texto={texto}
              grande={destacado && j === 0}
              giro={[-5, 3, -2][j % 3]}
              vivo={vivo}
              estampado={repartido}
              retraso={retrasoChicos + j * 0.22}
            />
          ))}
        </div>
      ) : null}
    </motion.li>
  );
}

/**
 * Un sello de goma: doble borde, mayusculas, apenas girado. Cae grande y
 * transparente y se estampa de golpe; la tinta se abre en un aro que se va.
 */
function Sello({
  texto,
  grande,
  giro,
  vivo,
  estampado,
  retraso,
}: {
  texto: string;
  grande: boolean;
  giro: number;
  vivo: boolean;
  estampado: boolean;
  retraso: number;
}) {
  const quieto = { opacity: 1, scale: 1, rotate: giro };
  const arriba = { opacity: 0, scale: 1.9, rotate: giro - 12 };

  return (
    <span className="relative inline-block">
      <motion.span
        data-anim
        initial={false}
        animate={!vivo || estampado ? quieto : arriba}
        transition={!vivo || !estampado ? { duration: 0 } : { duration: 0.42, delay: retraso, ease: [0.5, 0, 0.75, 0] }}
        className={`relative block border-[3px] border-double border-[color:var(--accent)] font-mono uppercase text-[color:var(--accent)] ${
          grande ? "px-3.5 py-2 text-[12px] tracking-[0.16em] md:text-[13px]" : "px-2.5 py-1.5 text-[9px] tracking-[0.14em] md:text-[10px]"
        }`}
      >
        {texto}
      </motion.span>
      {vivo ? (
        // la tinta que se abre al golpe
        <motion.span
          aria-hidden
          initial={false}
          animate={estampado ? { opacity: [0, 0.7, 0], scale: [1, 1, 1.45] } : { opacity: 0, scale: 1 }}
          transition={estampado ? { duration: 0.7, delay: retraso + 0.4, times: [0, 0.05, 1], ease: EASE } : { duration: 0 }}
          className="pointer-events-none absolute inset-0 border border-[color:var(--accent)]"
          style={{ rotate: giro }}
        />
      ) : null}
    </span>
  );
}

/**
 * El sello grande de una carta (el 1° de la camada): un cuadrado de doble
 * borde con la cifra enorme. Se estampa primero, con el mismo golpe que los
 * sellos chicos.
 */
function Insignia({
  valor,
  texto,
  vivo,
  estampado,
  retraso,
}: {
  valor: string;
  texto: string;
  vivo: boolean;
  estampado: boolean;
  retraso: number;
}) {
  const giro = -7;
  const quieto = { opacity: 1, scale: 1, rotate: giro };
  const arriba = { opacity: 0, scale: 1.7, rotate: giro - 14 };

  return (
    <span className="relative inline-block">
      <motion.span
        data-anim
        initial={false}
        animate={!vivo || estampado ? quieto : arriba}
        transition={!vivo || !estampado ? { duration: 0 } : { duration: 0.46, delay: retraso, ease: [0.5, 0, 0.75, 0] }}
        className="relative grid h-[118px] w-[118px] place-content-center place-items-center gap-1.5 border-4 border-double border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)] md:h-[148px] md:w-[148px]"
      >
        <span className="font-display text-[52px] font-semibold leading-[0.85] tracking-[-0.02em] md:text-[68px]">
          {valor}
        </span>
        <span className="max-w-[10ch] text-center font-mono text-[9px] uppercase leading-[1.3] tracking-[0.16em] md:text-[10px]">
          {texto}
        </span>
      </motion.span>
      {vivo ? (
        <motion.span
          aria-hidden
          initial={false}
          animate={estampado ? { opacity: [0, 0.8, 0], scale: [1, 1, 1.35] } : { opacity: 0, scale: 1 }}
          transition={estampado ? { duration: 0.8, delay: retraso + 0.44, times: [0, 0.05, 1], ease: EASE } : { duration: 0 }}
          className="pointer-events-none absolute inset-0 border border-[color:var(--accent)]"
          style={{ rotate: giro }}
        />
      ) : null}
    </span>
  );
}
