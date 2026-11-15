"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Palabras } from "@/components/ui/Palabras";
import { content } from "@/content/data";
import { mezcla, suave, tramo, useActiva, type Rango } from "@/lib/escena";

/**
 * Lo que te resuelvo. Una escena fija (sticky) por dolor, una idea por
 * pantalla. Con el scroll, siempre en el mismo orden: primero el dolor se
 * revela palabra por palabra, recien despues entra la ilustracion (nunca
 * antes que su titular), pasa del desorden al orden y aparece como se
 * resuelve.
 *
 *  - Cargás todo a mano: chats amontonados que colapsan en un panel de pedidos.
 *  - Dependés de otro: celdas de planilla sueltas que se acomodan en tu panel.
 *  - Linda pero no vende: la tienda vacia se ordena y el carrito se llena.
 *  - A ciegas: una revision que va tildando y llena el medidor.
 *
 * Cada ilustracion tiene ademas su loop ambiental (chats que siguen llegando,
 * contadores que suben) que corre solo con la seccion en pantalla.
 *
 * Sin escenas vivas (servidor, sin JS, reduced-motion) es una lista: cada
 * dolor con su solucion y la ilustracion en su estado ordenado.
 */

const N = content.resuelvo.items.length;

/**
 * Coreografia de cada escena, sobre su progreso local (0..1). Siempre el
 * texto primero y la ilustracion despues:
 *   titular  0.00-0.14  el dolor se revela palabra por palabra
 *   detalle  0.08-0.16  el detalle del dolor, que queda quieto
 *   entra    0.16-0.26  la ilustracion (en desorden), con el texto ya leido
 *   orden    0.30-0.50  la ilustracion pasa del desorden al orden
 *   solucion 0.50-0.60  como se resuelve, debajo del detalle (que baja la voz:
 *                       el dolor y la respuesta quedan juntos en pantalla)
 *   sale     0.92-1.00  deja lugar a la siguiente
 *
 * La primera escena no espera a quedar fija: su titular se revela mientras la
 * pista entra en pantalla (asi no hay un tramo fijo con el titular apagado).
 */
const TITULAR = 0.14;
const DETALLE: Rango = [0.08, 0.16];
const ENTRA: Rango = [0.16, 0.26];
const ORDEN: Rango = [0.3, 0.5];
const SOLUCION: Rango = [0.5, 0.6];

/** Progreso local de la escena i dentro del recorrido total. */
const local = (v: number, i: number) => tramo(v, [i / N, (i + 1) / N]);
/** Factor de orden de la ilustracion (0 caos, 1 ordenado). */
const orden = (v: number, i: number) => suave(tramo(local(v, i), ORDEN));
/** Cuanto entro la ilustracion (0 todavia no, 1 entera). */
const entra = (v: number, i: number) => suave(tramo(local(v, i), ENTRA));

type EscenaProps = { p: MotionValue<number>; i: number; vivo: boolean };
type EscenaConEntrada = EscenaProps & { entrada: MotionValue<number>; pistaActiva: boolean };

export function Resuelvo() {
  // los loops se encienden escena por escena (las cuatro comparten el cuadro fijo)
  return (
    <Section id="resuelvo" contenedor={false} aire={false} loops={false}>
      <Escenas />
    </Section>
  );
}

function Escenas() {
  const { resuelvo } = content;
  const pistaRef = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const { scrollYProgress: p } = useScroll({ target: pistaRef, offset: ["start start", "end end"] });
  // mientras la pista entra en pantalla, antes de fijarse (titular de la primera escena)
  const { scrollYProgress: entrada } = useScroll({ target: pistaRef, offset: ["start 0.85", "start 0.15"] });
  const pistaActiva = useActiva(pistaRef);

  return (
    <>
      <Contenedor className="pt-20 md:pt-28">
        <SectionTitle eyebrow={resuelvo.eyebrow} title={resuelvo.titulo} intro={resuelvo.intro} lado className="mb-0 md:mb-0" />
      </Contenedor>

      <div ref={pistaRef} className="relative vivo:h-[330svh] lg:vivo:h-[360svh]">
        <div className="vivo:sticky vivo:top-0 vivo:h-svh vivo:overflow-hidden">
          <Contenedor className="vivo:h-full">
            <div className="flex flex-col gap-20 pb-20 pt-14 vivo:grid vivo:h-full vivo:gap-0 vivo:py-0 md:gap-24 md:pb-28 md:pt-20">
              {resuelvo.items.map((item, i) => (
                <Escena key={item.id} p={p} i={i} vivo={vivo} entrada={entrada} pistaActiva={pistaActiva} />
              ))}
            </div>
          </Contenedor>
          {vivo ? <Avance p={p} /> : null}
        </div>
      </div>
    </>
  );
}

/** Cuatro marcas abajo: cuanto falta de la escena. */
function Avance({ p }: { p: MotionValue<number> }) {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-6 flex justify-center gap-2 lg:bottom-10">
      {Array.from({ length: N }, (_, i) => (
        <Marca key={i} p={p} i={i} />
      ))}
    </div>
  );
}

function Marca({ p, i }: { p: MotionValue<number>; i: number }) {
  const transform = useTransform(p, (v) => `scaleX(${local(v, i)})`);
  return (
    <span className="h-[2px] w-10 bg-[color:var(--hairline-strong)]">
      <motion.span className="block h-full w-full origin-left bg-[color:var(--accent)]" style={{ transform }} />
    </span>
  );
}

function Escena({ p, i, vivo, entrada, pistaActiva }: EscenaConEntrada) {
  const item = content.resuelvo.items[i];
  const ultima = i === N - 1;

  const opacity = useTransform(p, (v) => {
    const t = local(v, i);
    const llega = i === 0 ? 1 : tramo(t, [0, 0.06]);
    const sale = ultima ? 0 : tramo(t, [0.92, 1]);
    // fuera de su tramo, la escena no existe
    if (v < i / N - 0.001 && i > 0) return 0;
    if (!ultima && v > (i + 1) / N) return 0;
    return llega * (1 - sale);
  });
  const transform = useTransform(p, (v) => {
    const t = local(v, i);
    const y = (i === 0 ? 0 : 1 - suave(tramo(t, [0, 0.08]))) * 40 - (ultima ? 0 : suave(tramo(t, [0.92, 1]))) * 48;
    return `translateY(${y}px)`;
  });
  // solo la escena que se ve corre sus loops CSS
  const [aLaVista, setALaVista] = useState(() => opacity.get() > 0.01);
  useMotionValueEvent(opacity, "change", (o) => {
    const si = o > 0.01;
    setALaVista((previa) => (previa === si ? previa : si));
  });
  const dolorOpacity = useTransform(p, (v) => 1 - 0.5 * orden(v, i));
  // el detalle entra antes que la ilustracion y se queda; con la solucion baja la voz
  const detalleOpacity = useTransform(p, (v) => {
    const t = local(v, i);
    return tramo(t, DETALLE) * (1 - 0.55 * tramo(t, SOLUCION));
  });
  const solOpacity = useTransform(p, (v) => tramo(local(v, i), SOLUCION));
  const solTransform = useTransform(
    p,
    (v) => `translateY(${mezcla(18, 0, suave(tramo(local(v, i), [SOLUCION[0], SOLUCION[1] + 0.02])))}px)`
  );
  // la ilustracion entra recien con el titular ya revelado
  const visualOpacity = useTransform(p, (v) => entra(v, i));
  const visualTransform = useTransform(p, (v) => {
    const e = entra(v, i);
    return `translateY(${(1 - e) * 22}px) scale(${0.96 + 0.04 * e})`;
  });

  // el titular ocupa el principio del tramo de la escena
  const rango = i === 0 ? ([0, 1] as const) : ([(i + 0.04) / N, (i + TITULAR) / N] as const);

  return (
    <motion.article
      data-activa={pistaActiva && (!vivo || aLaVista) ? "" : undefined}
      className="grid gap-8 vivo:[grid-area:1/1] vivo:h-full vivo:content-center vivo:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:vivo:gap-16"
      style={vivo ? { opacity, transform } : undefined}
    >
      {/* el texto primero, tambien en el celular: la escena llega debajo */}
      <div className="order-1">
        <motion.h3
          className="max-w-[15ch] font-display text-[clamp(1.9rem,4.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.012em] text-balance text-[color:var(--text)]"
          style={vivo ? { opacity: dolorOpacity } : undefined}
        >
          <Palabras texto={item.dolor} progreso={i === 0 ? entrada : p} rango={rango} />
        </motion.h3>

        <div className="mt-4 grid gap-5 md:mt-7 md:gap-6">
          <motion.p
            data-anim
            className="max-w-[38ch] text-[17px] leading-[1.5] text-pretty text-[color:var(--text-dim)] md:text-[19px] md:leading-[1.55]"
            style={vivo ? { opacity: detalleOpacity } : undefined}
          >
            {item.detalle}
          </motion.p>
          <motion.div
            data-anim
            style={vivo ? { opacity: solOpacity, transform: solTransform } : undefined}
          >
            <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              <span aria-hidden className="inline-block h-px w-6 bg-[color:var(--accent)]" />
              {content.resuelvo.solucionLabel}
            </p>
            <p className="max-w-[40ch] text-[17px] leading-[1.55] text-pretty text-[color:var(--text)] md:text-[20px]">
              {item.solucion}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        data-anim
        className="relative order-2 h-[290px] lg:h-[440px] vivo:h-[30svh] lg:vivo:h-[440px]"
        style={vivo ? { opacity: visualOpacity, transform: visualTransform } : undefined}
      >
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[480px] -translate-x-1/2 -translate-y-1/2 scale-[0.66] sm:scale-[0.82] lg:scale-100">
          {item.visual === "chats" ? <VisualChats p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "planilla" ? <VisualPlanilla p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "tienda" ? <VisualTienda p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "diagnostico" ? <VisualDiagnostico p={p} i={i} vivo={vivo} /> : null}
        </div>
      </motion.div>
    </motion.article>
  );
}

// ── piezas comunes de las ilustraciones ─────────────────────────────────

const PANEL = "absolute inset-0 border border-[color:var(--hairline-strong)] bg-[color:var(--surface)]";
const ETIQUETA = "font-mono text-[10px] uppercase tracking-[0.12em]";
const EASE = [0.16, 1, 0.3, 1] as const;

/** Contador que sube solo mientras la escena esta en pantalla (y con movimiento). */
function useContador(ref: React.RefObject<Element | null>, base: number, cada: number, vivo: boolean) {
  const activa = useActiva(ref);
  const [n, setN] = useState(base);
  useEffect(() => {
    if (!activa || !vivo) return;
    const id = window.setInterval(() => setN((x) => x + 1), cada);
    return () => window.clearInterval(id);
  }, [activa, cada, vivo]);
  return n;
}

/** Algo que aparece con el orden (o) de la escena. */
function useAparece(p: MotionValue<number>, i: number, desde: number, hasta: number) {
  return useTransform(p, (v) => tramo(orden(v, i), [desde, hasta]));
}

/** true con la ilustracion ya ordenada: recien ahi arrancan los loops que mueven datos. */
function useOrdenada(p: MotionValue<number>, i: number) {
  const [ordenada, setOrdenada] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const o = orden(v, i) > 0.98;
    setOrdenada((previa) => (previa === o ? previa : o));
  });
  return ordenada;
}

/** Pose del desorden a la pose ordenada: desplazamiento, giro y escala. */
function usePose(p: MotionValue<number>, i: number, dx: number, dy: number, giro: number) {
  return useTransform(p, (v) => {
    const k = 1 - orden(v, i);
    return `translate(${dx * k}px, ${dy * k}px) rotate(${giro * k}deg) scale(${1 - 0.06 * k})`;
  });
}

// ── 1. chats amontonados que colapsan en un panel de pedidos ────────────
//
// Ya ordenado, el panel sigue vivo: cada tanto entra un pedido nuevo POR
// ARRIBA, con su propio estado ("Nuevo", que despues pasa a "Pagado"), y las
// demas filas bajan un lugar. Nada se superpone: el estado vive en su columna.

const CAOS_CHATS = [
  { dx: -40, dy: 150, giro: -11 },
  { dx: 60, dy: 70, giro: 8 },
  { dx: -70, dy: 40, giro: 6 },
  { dx: 40, dy: -40, giro: -7 },
  { dx: -20, dy: -110, giro: 10 },
  { dx: 70, dy: -170, giro: -5 },
];

/** Alto de cada fila del panel de pedidos (y lo que baja cuando entra uno nuevo). */
const PASO_FILA = 48;
const TOPE_FILAS = 96;
const COLUMNAS_PEDIDOS = "grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_88px] items-center gap-3";

type Pedido = { id: number; cliente: string; detalle: string; estado: string; final?: string; nuevo?: boolean };

/** El pedido nuevo pasa a su estado real. */
const resolver = (f: Pedido): Pedido => (f.nuevo ? { ...f, estado: f.final ?? f.estado, nuevo: false } : f);

function VisualChats({ p, i, vivo }: EscenaProps) {
  const { chats } = content.resuelvo;
  const ref = useRef<HTMLDivElement>(null);
  const activa = useActiva(ref);
  const ordenada = useOrdenada(p, i);
  const marco = useAparece(p, i, 0.2, 0.7);
  // los mensajes sueltos se van antes de que aparezca el encabezado del panel
  const caos = useTransform(p, (v) => 1 - tramo(orden(v, i), [0, 0.25]));
  const [lista, setLista] = useState<Pedido[]>(() => chats.filas.map((f, k) => ({ id: k, ...f })));
  const siguiente = useRef(0);
  const [llegados, setLlegados] = useState(0);

  // un pedido nuevo cada tanto, solo con el panel ordenado y en pantalla
  useEffect(() => {
    if (!vivo || !activa || !ordenada) return;
    const pendientes: number[] = [];
    const entra = () => {
      const k = siguiente.current++;
      setLlegados(k + 1);
      const e = chats.entrantes[k % chats.entrantes.length];
      const id = 100 + k;
      setLista((l) => [
        { id, cliente: e.cliente, detalle: e.detalle, estado: chats.nuevo, final: e.estado, nuevo: true },
        ...l.slice(0, -1),
      ]);
      pendientes.push(
        window.setTimeout(() => setLista((l) => l.map((f) => (f.id === id ? resolver(f) : f))), 1900)
      );
    };
    const primero = window.setTimeout(entra, 900);
    const cada = window.setInterval(entra, 3800);
    return () => {
      window.clearTimeout(primero);
      window.clearInterval(cada);
      pendientes.forEach((t) => window.clearTimeout(t));
      // si el loop se corta en el medio, ningun pedido queda "Nuevo" para siempre
      setLista((l) => (l.some((f) => f.nuevo) ? l.map(resolver) : l));
    };
  }, [vivo, activa, ordenada, chats]);

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div className={PANEL} style={vivo ? { opacity: marco } : undefined} />
      <motion.div
        className="absolute inset-x-6 top-5 flex items-baseline justify-between"
        style={vivo ? { opacity: marco } : undefined}
      >
        <span className="text-[15px] font-medium text-[color:var(--text)]">{chats.panelTitulo}</span>
        <span className={`${ETIQUETA} tabular-nums text-[color:var(--accent)]`}>
          {chats.contadorBase + llegados} {chats.contadorLabel}
        </span>
      </motion.div>
      <motion.div
        className={`absolute inset-x-6 top-[60px] h-[28px] border-b border-[color:var(--hairline-strong)] ${COLUMNAS_PEDIDOS}`}
        style={vivo ? { opacity: marco } : undefined}
      >
        {chats.columnas.map((col, k) => (
          <span
            key={col}
            className={`${ETIQUETA} self-start text-[color:var(--text-faint)] ${k === 2 ? "text-center" : ""}`}
          >
            {col}
          </span>
        ))}
      </motion.div>

      {chats.filas.map((_, k) => (
        <FilaChat key={k} p={p} i={i} k={k} vivo={vivo} pedido={lista[k]} />
      ))}

      {/* mientras es caos, los mensajes siguen llegando */}
      {vivo ? (
        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: caos }}>
          {[
            { x: 300, y: 20, d: 0.6 },
            { x: 10, y: 300, d: 2 },
            { x: 330, y: 330, d: 3.4 },
          ].map((b, k) => (
            <span
              key={k}
              className="loop a-asoma absolute border border-[color:var(--accent-line)] bg-[color:var(--surface-2)] px-3 py-2 text-[13px] text-[color:var(--text-soft)]"
              style={{ left: b.x, top: b.y, animationDelay: `${b.d}s` }}
            >
              {chats.mensajes[(k + 2) % chats.mensajes.length]}
            </span>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}

function FilaChat({ p, i, k, vivo, pedido }: EscenaProps & { k: number; pedido: Pedido }) {
  const { chats } = content.resuelvo;
  const c = CAOS_CHATS[k];
  const ultima = k === chats.filas.length - 1;
  const transform = usePose(p, i, c.dx, c.dy, c.giro);
  // las burbujas llegan de a una, despues del titular
  const llega = useTransform(p, (v) => {
    const t = local(v, i);
    const a = ENTRA[0];
    return suave(tramo(t, [a + k * 0.02, a + 0.06 + k * 0.02]));
  });
  const burbuja = useTransform(p, (v) => {
    const a = ENTRA[0];
    return tramo(local(v, i), [a + k * 0.02, a + 0.06 + k * 0.02]) * (1 - tramo(orden(v, i), [0.35, 0.75]));
  });
  const burbujaTransform = useTransform(llega, (l) => `translateY(${(1 - l) * 10}px) scale(${0.86 + 0.14 * l})`);
  const dato = useTransform(p, (v) => tramo(orden(v, i), [0.45, 0.9]));

  return (
    <motion.div
      className="absolute left-6 right-6 h-[44px]"
      style={{ top: TOPE_FILAS + k * PASO_FILA, ...(vivo ? { transform } : {}) }}
    >
      {vivo ? (
        <motion.div
          className="absolute left-0 top-0 max-w-[78%] origin-bottom-left border border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)] px-3 py-2 text-[14px] text-[color:var(--text)]"
          style={{ opacity: burbuja, transform: burbujaTransform }}
        >
          {chats.mensajes[k]}
          <span
            aria-hidden
            className="absolute -bottom-[5px] left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)]"
          />
        </motion.div>
      ) : null}
      <motion.div className="absolute inset-0" style={vivo ? { opacity: dato } : undefined}>
        <AnimatePresence initial={false}>
          <motion.div
            key={pedido.id}
            className={`absolute inset-0 border-b border-[color:var(--hairline)] text-[14px] ${COLUMNAS_PEDIDOS}`}
            // la fila de arriba entra desde afuera; las demas bajan un lugar
            initial={k === 0 ? { y: -14, opacity: 0 } : { y: -PASO_FILA, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={
              ultima
                ? { y: 14, opacity: 0, transition: { duration: 0.45, ease: EASE } }
                : { opacity: 0, transition: { duration: 0 } }
            }
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="truncate font-medium text-[color:var(--text)]">{pedido.cliente}</span>
            <span className="truncate text-[color:var(--text-dim)]">{pedido.detalle}</span>
            <Estado pedido={pedido} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/** El estado del pedido, siempre en su columna y con el mismo ancho. */
function Estado({ pedido }: { pedido: Pedido }) {
  const tono = pedido.nuevo
    ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--bg)]"
    : pedido.estado === content.resuelvo.chats.filas[0].estado
      ? "border-[color:var(--accent-line)] text-[color:var(--accent)]"
      : "border-[color:var(--hairline-strong)] text-[color:var(--text-dim)]";
  return (
    <span className="relative grid h-[24px] w-[88px] place-items-center">
      <AnimatePresence initial={false}>
        <motion.span
          key={pedido.estado}
          className={`absolute inset-0 grid place-items-center border ${ETIQUETA} ${tono}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {pedido.estado}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── 2. celdas de planilla sueltas que se acomodan en tu panel ───────────

const CAOS_CELDAS = [
  { dx: -60, dy: -90, giro: -14 },
  { dx: 80, dy: -40, giro: 9 },
  { dx: 40, dy: 120, giro: -8 },
  { dx: -90, dy: 30, giro: 12 },
  { dx: 20, dy: -150, giro: 6 },
  { dx: -30, dy: 90, giro: -10 },
  { dx: 100, dy: 60, giro: 15 },
  { dx: -110, dy: -40, giro: -6 },
  { dx: 60, dy: 150, giro: 7 },
];

function VisualPlanilla({ p, i, vivo }: EscenaProps) {
  const { planilla } = content.resuelvo;
  const marco = useAparece(p, i, 0.3, 0.8);
  const celdas = planilla.productos.flatMap((prod) => [prod.nombre, prod.precio, prod.stock]);

  return (
    <div className="absolute inset-0">
      <motion.div className={PANEL} style={vivo ? { opacity: marco } : undefined} />
      <motion.div
        className="absolute inset-x-6 top-5 flex items-center justify-between"
        style={vivo ? { opacity: marco } : undefined}
      >
        <span className="text-[15px] font-medium text-[color:var(--text)]">{planilla.panelTitulo}</span>
        <span className={`loop a-llega ${ETIQUETA} border border-[color:var(--accent-line)] px-2 py-1 text-[color:var(--accent)]`}>
          {planilla.guardado}
        </span>
      </motion.div>
      <motion.div
        className="absolute inset-x-6 top-[70px] grid grid-cols-[1.4fr_1fr_0.6fr] gap-3 border-b border-[color:var(--hairline)] pb-2"
        style={vivo ? { opacity: marco } : undefined}
      >
        {planilla.columnas.map((col) => (
          <span key={col} className={`${ETIQUETA} text-[color:var(--text-faint)]`}>
            {col}
          </span>
        ))}
      </motion.div>
      <div className="absolute inset-x-6 top-[106px] grid grid-cols-[1.4fr_1fr_0.6fr] gap-3">
        {celdas.map((valor, k) => (
          <CeldaPlanilla key={k} p={p} i={i} k={k} vivo={vivo} valor={valor} />
        ))}
      </div>
      {/* el precio que se edita solo, al momento */}
      <motion.div
        className="absolute inset-x-6 bottom-6 flex items-center justify-between border border-[color:var(--accent-line)] bg-[color:var(--bg)] px-4 py-3"
        style={vivo ? { opacity: marco } : undefined}
      >
        <span className="text-[14px] text-[color:var(--text-dim)]">{planilla.productos[0].nombre}</span>
        <span className="relative font-mono text-[15px] text-[color:var(--accent)]">
          {planilla.precioNuevo}
          <span aria-hidden className="loop a-latido ml-1 inline-block h-4 w-px translate-y-[3px] bg-[color:var(--accent)]" />
        </span>
      </motion.div>
    </div>
  );
}

function CeldaPlanilla({ p, i, k, vivo, valor }: EscenaProps & { k: number; valor: string }) {
  const { planilla } = content.resuelvo;
  const c = CAOS_CELDAS[k % CAOS_CELDAS.length];
  const transform = usePose(p, i, c.dx, c.dy, c.giro);
  const sucio = useTransform(p, (v) => 1 - tramo(orden(v, i), [0.3, 0.7]));
  const limpio = useTransform(p, (v) => tramo(orden(v, i), [0.4, 0.85]));

  return (
    <motion.div
      className="relative h-[46px] border border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)]"
      style={vivo ? { transform } : undefined}
    >
      {vivo ? (
        <motion.span
          className="absolute inset-0 flex items-center px-2 font-mono text-[12px] text-[color:var(--text-faint)]"
          style={{ opacity: sucio }}
        >
          {planilla.celdas[k % planilla.celdas.length]}
        </motion.span>
      ) : null}
      <motion.span
        className={`absolute inset-0 flex items-center px-3 text-[14px] ${
          k % 3 === 0 ? "text-[color:var(--text)]" : "text-[color:var(--text-dim)]"
        }`}
        style={vivo ? { opacity: limpio } : undefined}
      >
        {valor}
      </motion.span>
    </motion.div>
  );
}

// ── 3. la tienda linda y vacia que se ordena y empieza a vender ─────────

function VisualTienda({ p, i, vivo }: EscenaProps) {
  const { tienda } = content.resuelvo;
  const ref = useRef<HTMLDivElement>(null);
  const extra = useContador(ref, 0, 2800, vivo);
  const precio = useAparece(p, i, 0.1, 0.45);
  const cta = useAparece(p, i, 0.3, 0.65);
  const ctaTransform = useTransform(p, (v) => `translateY(${(1 - tramo(orden(v, i), [0.3, 0.65])) * 16}px)`);
  const confianza = useAparece(p, i, 0.5, 0.85);
  const llenado = useTransform(p, (v) => Math.round(orden(v, i) * 3));
  const cuenta = useTransform(llenado, (n) => String(n + (n >= 3 ? extra : 0)));

  return (
    <div ref={ref} className="absolute inset-0">
      <div className={PANEL} />
      {/* encabezado de la tienda con su carrito */}
      <div className="absolute inset-x-5 top-4 flex items-center justify-between border-b border-[color:var(--hairline)] pb-3">
        <span className="font-display text-[16px] font-semibold text-[color:var(--text)]">{tienda.marca}</span>
        <span className="relative flex items-center gap-2 text-[13px] text-[color:var(--text-dim)]">
          <IconoCarrito />
          {tienda.carrito}
          <motion.span className="grid h-5 min-w-5 place-items-center bg-[color:var(--accent)] px-1 font-mono text-[11px] font-medium text-[color:var(--bg)]">
            {vivo ? cuenta : "3"}
          </motion.span>
          {vivo ? (
            <span aria-hidden className="pointer-events-none absolute -top-2 left-1 h-3 w-3">
              <span className="loop a-cae absolute inset-0 bg-[color:var(--accent)]" />
            </span>
          ) : null}
        </span>
      </div>
      {/* foto y datos */}
      <div className="absolute left-5 top-[70px] h-[200px] w-[200px] border border-[color:var(--hairline-strong)] bg-[radial-gradient(circle_at_50%_40%,var(--accent-soft),transparent_70%)]">
        <span className="a-flotar loop absolute left-1/2 top-1/2 h-[96px] w-[64px] -translate-x-1/2 -translate-y-1/2 border border-[color:var(--accent-line)] bg-[color:var(--surface-2)]" />
      </div>
      <div className="absolute left-[240px] right-5 top-[74px] flex flex-col gap-3">
        <span className="h-3 w-[86%] bg-[color:var(--text-soft)] opacity-80" />
        <span className="h-3 w-[60%] bg-[color:var(--text-soft)] opacity-80" />
        <motion.div className="mt-3 flex flex-col gap-1" style={vivo ? { opacity: precio } : undefined}>
          <span className="font-display text-[24px] font-semibold text-[color:var(--text)]">{tienda.precio}</span>
          <span className="text-[13px] text-[color:var(--accent)]">{tienda.cuotas}</span>
        </motion.div>
        <motion.span
          className="mt-3 grid h-10 place-items-center bg-[color:var(--accent)] text-[12px] font-medium uppercase tracking-[0.12em] text-[color:var(--bg)]"
          style={vivo ? { opacity: cta, transform: ctaTransform } : undefined}
        >
          {tienda.cta}
        </motion.span>
      </div>
      <motion.ul
        className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2"
        style={vivo ? { opacity: confianza } : undefined}
      >
        {tienda.confianza.map((t) => (
          <li
            key={t}
            className="border border-[color:var(--hairline-strong)] px-2 py-3 text-center text-[12px] text-[color:var(--text-soft)]"
          >
            {t}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

function IconoCarrito() {
  return (
    <svg viewBox="0 0 20 18" className="h-4 w-4" aria-hidden>
      <path
        d="M1 2h3l2.4 9h9.2L18 5H5.2M8 15.5a1 1 0 1 0 0 .1M15 15.5a1 1 0 1 0 0 .1"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

// ── 4. a ciegas: una revision que tilda y llena el medidor ──────────────

function VisualDiagnostico({ p, i, vivo }: EscenaProps) {
  const { diagnostico } = content.resuelvo;
  const medidor = useTransform(p, (v) => `scaleX(${orden(v, i)})`);

  return (
    <div className="absolute inset-0">
      <div className={PANEL} />
      <p className="absolute inset-x-6 top-5 text-[15px] font-medium text-[color:var(--text)]">{diagnostico.titulo}</p>
      <ul className="absolute inset-x-6 top-[64px] flex flex-col">
        {diagnostico.items.map((texto, k) => (
          <ItemDiagnostico key={texto} p={p} i={i} k={k} vivo={vivo} texto={texto} />
        ))}
      </ul>
      {/* escaneo en loop sobre la lista */}
      <span
        aria-hidden
        className="loop a-escanea pointer-events-none absolute inset-x-6 top-[64px] h-px bg-[color:var(--accent)] opacity-0 [--recorrido:240px]"
      />
      <div className="absolute inset-x-6 bottom-6">
        <div className="mb-2 flex justify-between">
          <span className={`${ETIQUETA} text-[color:var(--text-dim)]`}>{diagnostico.medidor}</span>
        </div>
        <div className="h-2 bg-[color:var(--hairline-strong)]">
          <motion.div
            className="h-full w-full origin-left bg-[color:var(--accent)]"
            style={vivo ? { transform: medidor } : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function ItemDiagnostico({ p, i, k, vivo, texto }: EscenaProps & { k: number; texto: string }) {
  const n = content.resuelvo.diagnostico.items.length;
  const hecho = useTransform(p, (v) => tramo(orden(v, i), [k / n, (k + 0.8) / n]));
  const duda = useTransform(hecho, (h) => 1 - h);
  const fila = useTransform(hecho, (h) => 0.45 + 0.55 * h);

  return (
    <li className="flex h-[48px] items-center justify-between border-b border-[color:var(--hairline)]">
      <motion.span className="text-[15px] text-[color:var(--text)]" style={vivo ? { opacity: fila } : undefined}>
        {texto}
      </motion.span>
      <span className="relative grid h-6 w-6 place-items-center border border-[color:var(--hairline-strong)]">
        {vivo ? (
          <motion.span className="absolute font-mono text-[12px] text-[color:var(--text-faint)]" style={{ opacity: duda }}>
            ?
          </motion.span>
        ) : null}
        <motion.svg viewBox="0 0 12 12" className="h-3 w-3" style={vivo ? { opacity: hecho } : undefined} aria-hidden>
          <path d="M1.5 6.5l3 3 6-7" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        </motion.svg>
      </span>
    </li>
  );
}
