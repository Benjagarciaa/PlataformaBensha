"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Palabras } from "@/components/ui/Palabras";
import { content } from "@/content/data";
import { useLoops } from "@/lib/escena";

/**
 * Sobre mi. Corto y humano: la frase se revela palabra por palabra y los
 * numeros reales cuentan una vez al entrar (son el unico lugar de la seccion
 * con cifras: el parrafo de al lado no las repite).
 *
 * La formacion es el bloque que tiene que llamar la atencion: credenciales,
 * no una lista. Las dos destacadas (Full Stack, 1° de la camada, y UX/UI
 * certificado por PedidosYa) van grandes arriba; el resto, abajo, en orden
 * de fecha (en el celular, en una fila que se desliza). Jerarquia clara: la
 * institucion es una etiqueta, el titulo es lo grande. Un solo sello por
 * carta destacada (el 1° junto al titulo, "Desempeño destacado" en UX/UI);
 * las demas distinciones son etiquetas planas. Al entrar en pantalla las
 * cartas salen de un mazo y se reparten, los sellos se estampan y por las
 * destacadas pasa un brillo de vez en cuando. Todo por tiempo, sin pista
 * fija: no suma scroll. Solo texto y formas: nunca imagenes de certificados.
 */

type Credencial = (typeof content.sobreMi.formacion)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

export function SobreMi() {
  // los loops (el brillo de las cartas) se encienden solo con la formacion a la vista
  return (
    <Section id="sobre-mi" contenedor={false} aire={false} loops={false}>
      <Contenido />
    </Section>
  );
}

function Contenido() {
  const { sobreMi } = content;
  const vivo = useSeccionViva();
  const fraseRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress: frase } = useScroll({ target: fraseRef, offset: ["start 0.9", "start 0.35"] });

  return (
    <>
      <Contenedor className="pt-20 md:pt-28">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]">
          {sobreMi.eyebrow}
        </p>
        <h2
          ref={fraseRef}
          className="max-w-5xl font-display text-[clamp(2.3rem,5.6vw,5.25rem)] font-semibold leading-[1] tracking-[-0.015em] text-balance text-[color:var(--text)]"
        >
          <Palabras texto={sobreMi.frase} progreso={frase} rango={[0, 1]} desde={0.16} />
        </h2>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="flex flex-col gap-5">
            {sobreMi.parrafos.map((parrafo, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="max-w-[56ch] text-[18px] leading-[1.65] text-pretty text-[color:var(--text-soft)] md:text-[20px]">
                  {parrafo}
                </p>
              </Reveal>
            ))}
          </div>
          {/* los numeros: misma grilla y misma linea de base en las dos columnas */}
          <dl className="grid grid-cols-2 self-start border-t border-[color:var(--hairline-strong)]">
            {sobreMi.datos.map((dato, i) => (
              <div
                key={dato.label}
                className={`flex flex-col pt-6 md:pt-8 ${i > 0 ? "border-l border-[color:var(--hairline)] pl-5 md:pl-8" : "pr-5 md:pr-8"}`}
              >
                <dt className="order-2 mt-4 text-[17px] font-medium leading-tight text-[color:var(--text)] md:text-[19px]">
                  {dato.label}
                  <span className="mt-1.5 block whitespace-nowrap font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-[color:var(--text-dim)] md:text-[11px] md:tracking-[0.13em]">
                    {dato.detalle}
                  </span>
                </dt>
                <dd className="order-1">
                  <span className="flex items-start font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.02em] tabular-nums text-[color:var(--text)]">
                    <span className="mr-1 mt-[0.08em] text-[0.55em] leading-none text-[color:var(--accent)]">
                      {dato.prefijo}
                    </span>
                    <Contador n={dato.n} vivo={vivo} />
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
            {/* en el celular, dos columnas compactas */}
            <ul className="grid grid-cols-2 gap-x-5 md:grid-cols-1">
              {sobreMi.herramientas.map((h) => (
                <li
                  key={h.nombre}
                  className="grid content-start gap-1 border-t border-[color:var(--hairline)] py-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-baseline md:gap-6 md:py-3.5"
                >
                  <span className="text-[15px] font-medium leading-snug text-[color:var(--text)] md:text-[17px]">{h.nombre}</span>
                  <span className="text-[14px] leading-[1.45] text-pretty text-[color:var(--text-dim)] md:text-[16px] md:leading-[1.55]">
                    {h.para}
                  </span>
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

/** Posicion de un elemento dentro de `raiz`, por el layout (sin transforms). */
function posicion(el: HTMLElement, raiz: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== raiz) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const padre = n.offsetParent as HTMLElement | null;
    // lo que se corrio una fila deslizable
    if (padre && padre !== raiz) {
      x -= padre.scrollLeft;
      y -= padre.scrollTop;
    }
    n = padre;
  }
  return { x, y };
}

function Formacion({ vivo }: { vivo: boolean }) {
  const { sobreMi } = content;
  const raizRef = useRef<HTMLDivElement>(null);
  const cartasRef = useRef<(HTMLLIElement | null)[]>([]);
  const enVista = useInView(raizRef, { once: true, amount: 0.2 });
  const [mazo, setMazo] = useState<Mazo | null>(null);
  useLoops(raizRef);

  const destacadas = sobreMi.formacion.filter((c) => "destacado" in c && c.destacado);
  const resto = sobreMi.formacion.filter((c) => !("destacado" in c && c.destacado));
  const orden = [...destacadas, ...resto];
  const total = orden.length;

  // Donde esta el mazo respecto de cada carta. Se mide por el layout (sin
  // transforms): solo al montar y al cambiar el tamaño.
  useLayoutEffect(() => {
    if (!vivo) return;
    const medir = () => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const cx = raiz.offsetWidth / 2;
      const cy = raiz.offsetHeight * 0.42;
      // en el celular el vuelo se acota: ninguna carta sale de mas de media pantalla
      const tope = window.innerHeight * 0.45;
      const acota = (v: number) => Math.max(-tope, Math.min(tope, v));
      setMazo(
        cartasRef.current.map((el) => {
          if (!el) return { dx: 0, dy: 0 };
          const p = posicion(el, raiz);
          return {
            dx: acota(cx - (p.x + el.offsetWidth / 2)),
            dy: acota(cy - (p.y + el.offsetHeight / 2)),
          };
        })
      );
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [vivo]);

  const repartido = !vivo || enVista;
  // los sellos se estampan cuando ya cayo la ultima carta, de a uno
  const inicioSellos = (total - 1) * CADENCIA + VUELO * 0.8;
  let sellosPrevios = 0;
  const retrasos = orden.map((c) => {
    const r = inicioSellos + sellosPrevios * 0.3;
    if (("insignia" in c && c.insignia) || ("sello" in c && c.sello)) sellosPrevios += 1;
    return r;
  });

  const carta = (c: Credencial, k: number) => (
    <Carta
      key={c.id}
      carta={c}
      k={k}
      total={total}
      vivo={vivo}
      repartido={repartido}
      mazo={mazo?.[k] ?? null}
      retrasoSellos={retrasos[k]}
      refCarta={(el) => {
        cartasRef.current[k] = el;
      }}
    />
  );

  return (
    <div className="py-14 md:py-24">
      <Contenedor>
        <div className="mb-10 grid gap-5 md:mb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-16">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.formacionEyebrow}
            </p>
            <h3 className="max-w-[18ch] font-display text-[clamp(2.2rem,4.6vw,4.25rem)] font-semibold leading-[1] tracking-[-0.015em] text-balance text-[color:var(--text)]">
              {sobreMi.formacionTitulo}
            </h3>
          </div>
          <p className="max-w-[40ch] text-[17px] leading-[1.55] text-pretty text-[color:var(--text-soft)] md:text-[18px] lg:pb-1">
            {sobreMi.formacionIntro}
          </p>
        </div>

        <div ref={raizRef} className="relative">
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:gap-5">
            {destacadas.map((c, k) => carta(c, k))}
          </ol>
          {/* el resto: en el celular, una fila que se desliza de costado */}
          <ol className="relative -mx-6 mt-3 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:mt-4 md:gap-4 lg:mt-5 lg:grid-cols-4 lg:gap-5 [&::-webkit-scrollbar]:hidden">
            {resto.map((c, j) => carta(c, destacadas.length + j))}
          </ol>
          <p className="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-faint)] sm:hidden">
            <span aria-hidden className="inline-block h-px w-6 bg-[color:var(--text-faint)]" />
            {sobreMi.formacionDeslizar}
          </p>
        </div>
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
  const chips: readonly string[] = ("chips" in carta && carta.chips) || [];
  const certifica = "certifica" in carta ? carta.certifica : undefined;
  const insignia = "insignia" in carta ? carta.insignia : undefined;
  const sello = "sello" in carta ? carta.sello : undefined;

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
          ? `border-[color:var(--accent-line)] bg-[color:var(--surface-2)] p-6 md:min-h-[320px] md:p-8 ${k === 0 ? "lg:col-span-7" : "lg:col-span-5"}`
          : "w-[78vw] max-w-[300px] shrink-0 snap-start border-[color:var(--hairline-strong)] bg-[color:var(--surface)] p-5 sm:w-auto sm:max-w-none md:min-h-[200px] md:p-6"
      }`}
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

      {/* la etiqueta: año, institucion y area. La institucion se lee, pero no compite con el titulo */}
      <p
        className={`relative flex font-mono text-[10px] uppercase leading-snug tracking-[0.13em] md:text-[11px] ${
          destacado ? "flex-wrap items-baseline justify-between gap-x-4 gap-y-1" : "flex-col items-start gap-1"
        }`}
      >
        <span>
          <span className="text-[color:var(--accent)]">{carta.anio}</span>
          <span aria-hidden className="mx-2 text-[color:var(--text-faint)]">
            ·
          </span>
          <span className="text-[color:var(--text-soft)]">{carta.institucion}</span>
        </span>
        <span className={destacado ? "text-[color:var(--text-dim)]" : "text-[color:var(--text-faint)]"}>{carta.tipo}</span>
      </p>

      <div className={`relative flex items-start justify-between gap-5 ${destacado ? "mt-6 md:mt-8" : "mt-3"}`}>
        <div className="min-w-0">
          <h4
            className={`font-display font-semibold tracking-[-0.012em] text-balance text-[color:var(--text)] ${
              destacado ? "text-[clamp(1.9rem,3.4vw,3.25rem)] leading-[0.98]" : "text-[19px] leading-[1.12] md:text-[22px]"
            }`}
          >
            {carta.titulo}
          </h4>
          {certifica ? (
            <p
              className={`mt-3 flex items-center gap-2 font-mono uppercase tracking-[0.13em] text-[color:var(--accent)] ${
                destacado ? "text-[11px]" : "text-[10px]"
              }`}
            >
              <span aria-hidden className="inline-block h-[5px] w-[5px] rotate-45 bg-[color:var(--accent)]" />
              {certifica}
            </p>
          ) : null}
        </div>
        {insignia ? (
          <Insignia
            valor={insignia.valor}
            texto={insignia.texto}
            vivo={vivo}
            estampado={repartido}
            retraso={retrasoSellos}
          />
        ) : null}
      </div>

      <p
        className={`relative text-pretty ${
          destacado
            ? "mt-4 max-w-[46ch] text-[16px] leading-[1.55] text-[color:var(--text-soft)] md:text-[17px]"
            : "mt-2.5 text-[14px] leading-[1.5] text-[color:var(--text-dim)]"
        }`}
      >
        {carta.nota}
      </p>

      {chips.length || sello ? (
        <div className={`relative mt-auto flex flex-wrap items-center gap-x-3 gap-y-3 ${destacado ? "pt-6" : "pt-4"}`}>
          {sello ? <Sello texto={sello} vivo={vivo} estampado={repartido} retraso={retrasoSellos} /> : null}
          {chips.map((texto) => (
            <span
              key={texto}
              className="border border-[color:var(--accent-line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--accent)] md:text-[11px]"
            >
              {texto}
            </span>
          ))}
        </div>
      ) : null}
    </motion.li>
  );
}

/**
 * El sello de goma de una carta destacada: doble borde, mayusculas, apenas
 * girado. Cae grande y transparente y se estampa de golpe; la tinta se abre
 * en un aro que se va.
 */
function Sello({
  texto,
  vivo,
  estampado,
  retraso,
}: {
  texto: string;
  vivo: boolean;
  estampado: boolean;
  retraso: number;
}) {
  const giro = -4;
  const quieto = { opacity: 1, scale: 1, rotate: giro };
  const arriba = { opacity: 0, scale: 1.9, rotate: giro - 12 };

  return (
    <span className="relative inline-block">
      <motion.span
        data-anim
        initial={false}
        animate={!vivo || estampado ? quieto : arriba}
        transition={!vivo || !estampado ? { duration: 0 } : { duration: 0.42, delay: retraso, ease: [0.5, 0, 0.75, 0] }}
        className="relative block border-[3px] border-double border-[color:var(--accent)] px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--accent)] md:text-[13px]"
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
 * El sello grande (el 1° de la camada), junto al titulo: un cuadrado de doble
 * borde con la cifra enorme. Se estampa con el mismo golpe que el sello.
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
    <span className="relative inline-block shrink-0">
      <motion.span
        data-anim
        initial={false}
        animate={!vivo || estampado ? quieto : arriba}
        transition={!vivo || !estampado ? { duration: 0 } : { duration: 0.46, delay: retraso, ease: [0.5, 0, 0.75, 0] }}
        className="relative grid h-[96px] w-[96px] place-content-center place-items-center gap-1 border-4 border-double border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)] md:h-[132px] md:w-[132px] md:gap-1.5 lg:h-[148px] lg:w-[148px]"
      >
        <span className="font-display text-[42px] font-semibold leading-[0.85] tracking-[-0.02em] md:text-[60px] lg:text-[68px]">
          {valor}
        </span>
        <span className="max-w-[10ch] text-center font-mono text-[8px] uppercase leading-[1.3] tracking-[0.14em] md:text-[10px] md:tracking-[0.16em]">
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
