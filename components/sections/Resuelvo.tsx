"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Palabras } from "@/components/ui/Palabras";
import { content } from "@/content/data";
import { mezcla, suave, tramo, useActiva } from "@/lib/escena";

/**
 * Lo que te resuelvo. Una escena fija (sticky) por dolor, una idea por
 * pantalla. Con el scroll: el dolor se revela palabra por palabra, la
 * ilustracion pasa del desorden al orden y aparece como se resuelve.
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

/** Progreso local de la escena i dentro del recorrido total. */
const local = (v: number, i: number) => tramo(v, [i / N, (i + 1) / N]);
/** Factor de orden de la ilustracion (0 caos, 1 ordenado). */
const orden = (v: number, i: number) => suave(tramo(local(v, i), [0.34, 0.66]));

type EscenaProps = { p: MotionValue<number>; i: number; vivo: boolean };

export function Resuelvo() {
  return (
    <Section id="resuelvo" contenedor={false} aire={false}>
      <Escenas />
    </Section>
  );
}

function Escenas() {
  const { resuelvo } = content;
  const pistaRef = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const { scrollYProgress: p } = useScroll({ target: pistaRef, offset: ["start start", "end end"] });

  return (
    <>
      <Contenedor className="pb-6 pt-28 md:pb-10 md:pt-40">
        <SectionTitle eyebrow={resuelvo.eyebrow} title={resuelvo.titulo} intro={resuelvo.intro} />
      </Contenedor>

      <div ref={pistaRef} className="relative vivo:h-[440svh] lg:vivo:h-[500svh]">
        <div className="vivo:sticky vivo:top-0 vivo:h-svh vivo:overflow-hidden">
          <Contenedor className="vivo:h-full">
            <div className="flex flex-col gap-28 pb-28 vivo:grid vivo:h-full vivo:gap-0 vivo:pb-0">
              {resuelvo.items.map((item, i) => (
                <Escena key={item.id} p={p} i={i} vivo={vivo} />
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

function Escena({ p, i, vivo }: EscenaProps) {
  const item = content.resuelvo.items[i];
  const ultima = i === N - 1;

  const opacity = useTransform(p, (v) => {
    const t = local(v, i);
    const entra = i === 0 ? 1 : tramo(t, [0, 0.1]);
    const sale = ultima ? 0 : tramo(t, [0.9, 1]);
    // fuera de su tramo, la escena no existe
    if (v < i / N - 0.001 && i > 0) return 0;
    if (!ultima && v > (i + 1) / N) return 0;
    return entra * (1 - sale);
  });
  const transform = useTransform(p, (v) => {
    const t = local(v, i);
    const y = (i === 0 ? 0 : 1 - tramo(t, [0, 0.12])) * 50 - (ultima ? 0 : tramo(t, [0.88, 1])) * 60;
    return `translateY(${y}px)`;
  });
  const dolorOpacity = useTransform(p, (v) => 1 - 0.55 * orden(v, i));
  const detalleOpacity = useTransform(p, (v) => {
    const t = local(v, i);
    return tramo(t, [0.16, 0.3]) * (1 - tramo(t, [0.4, 0.5]));
  });
  const solOpacity = useTransform(p, (v) => tramo(local(v, i), [0.46, 0.64]));
  const solTransform = useTransform(p, (v) => `translateY(${mezcla(28, 0, suave(tramo(local(v, i), [0.46, 0.66])))}px)`);

  const rango = [i / N + (i === 0 ? 0 : 0.04 / N), (i + 0.34) / N] as const;

  return (
    <motion.article
      className="grid gap-10 vivo:[grid-area:1/1] vivo:h-full vivo:content-center vivo:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:vivo:gap-16"
      style={vivo ? { opacity, transform } : undefined}
    >
      <div className="order-2 lg:order-1">
        <motion.h3
          className="font-display text-[clamp(1.9rem,4.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.012em] text-[color:var(--text)]"
          style={vivo ? { opacity: dolorOpacity } : undefined}
        >
          <Palabras texto={item.dolor} progreso={p} rango={rango} />
        </motion.h3>

        <div className="mt-6 grid gap-6 vivo:gap-0 md:mt-8">
          <motion.p
            data-anim
            className="max-w-[38ch] text-[17px] leading-[1.55] text-[color:var(--text-dim)] vivo:[grid-area:1/1] md:text-[19px]"
            style={vivo ? { opacity: detalleOpacity } : undefined}
          >
            {item.detalle}
          </motion.p>
          <motion.div
            data-anim
            className="vivo:[grid-area:1/1]"
            style={vivo ? { opacity: solOpacity, transform: solTransform } : undefined}
          >
            <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              <span aria-hidden className="inline-block h-px w-6 bg-[color:var(--accent)]" />
              {content.resuelvo.solucionLabel}
            </p>
            <p className="max-w-[40ch] text-[17px] leading-[1.55] text-[color:var(--text)] md:text-[20px]">
              {item.solucion}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative order-1 h-[300px] lg:order-2 lg:h-[440px] vivo:h-[34svh] lg:vivo:h-[440px]">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[480px] -translate-x-1/2 -translate-y-1/2 scale-[0.68] sm:scale-[0.82] lg:scale-100">
          {item.visual === "chats" ? <VisualChats p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "planilla" ? <VisualPlanilla p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "tienda" ? <VisualTienda p={p} i={i} vivo={vivo} /> : null}
          {item.visual === "diagnostico" ? <VisualDiagnostico p={p} i={i} vivo={vivo} /> : null}
        </div>
      </div>
    </motion.article>
  );
}

// ── piezas comunes de las ilustraciones ─────────────────────────────────

const PANEL = "absolute inset-0 border border-[color:var(--hairline-strong)] bg-[color:var(--surface)]";
const ETIQUETA = "font-mono text-[10px] uppercase tracking-[0.12em]";

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

/** Pose del desorden a la pose ordenada: desplazamiento, giro y escala. */
function usePose(p: MotionValue<number>, i: number, dx: number, dy: number, giro: number) {
  return useTransform(p, (v) => {
    const k = 1 - orden(v, i);
    return `translate(${dx * k}px, ${dy * k}px) rotate(${giro * k}deg) scale(${1 - 0.06 * k})`;
  });
}

// ── 1. chats amontonados que colapsan en un panel de pedidos ────────────

const CAOS_CHATS = [
  { dx: -40, dy: 150, giro: -11 },
  { dx: 60, dy: 70, giro: 8 },
  { dx: -70, dy: 40, giro: 6 },
  { dx: 40, dy: -40, giro: -7 },
  { dx: -20, dy: -110, giro: 10 },
  { dx: 70, dy: -170, giro: -5 },
];

function VisualChats({ p, i, vivo }: EscenaProps) {
  const { chats } = content.resuelvo;
  const ref = useRef<HTMLDivElement>(null);
  const pedidos = useContador(ref, 23, 2600, vivo);
  const marco = useAparece(p, i, 0.2, 0.7);
  const caos = useTransform(p, (v) => 1 - orden(v, i));

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div className={PANEL} style={vivo ? { opacity: marco } : undefined} />
      <motion.div
        className="absolute inset-x-5 top-4 flex items-center justify-between border-b border-[color:var(--hairline)] pb-3"
        style={vivo ? { opacity: marco } : undefined}
      >
        <span className="text-[15px] font-medium text-[color:var(--text)]">{chats.panelTitulo}</span>
        <span className={`${ETIQUETA} text-[color:var(--accent)]`}>
          {pedidos} {chats.contadorLabel}
        </span>
      </motion.div>
      {vivo ? (
        // la animacion CSS pisa la opacidad inline: van en elementos distintos
        <motion.span className="absolute right-5 top-14" style={{ opacity: marco }}>
          <span
            className={`loop a-llega block border border-[color:var(--accent-line)] bg-[color:var(--bg)] px-2 py-1 ${ETIQUETA} text-[color:var(--accent)]`}
          >
            {chats.nuevo}
          </span>
        </motion.span>
      ) : null}

      {chats.filas.map((fila, k) => (
        <FilaChat key={fila.cliente} p={p} i={i} k={k} vivo={vivo} />
      ))}

      {/* mientras es caos, los mensajes siguen llegando */}
      {vivo ? (
        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: caos }}>
          {[
            { x: 300, y: 20, d: 0 },
            { x: 10, y: 300, d: 1.4 },
            { x: 330, y: 330, d: 2.8 },
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

function FilaChat({ p, i, k, vivo }: EscenaProps & { k: number }) {
  const { chats } = content.resuelvo;
  const fila = chats.filas[k];
  const c = CAOS_CHATS[k];
  const transform = usePose(p, i, c.dx, c.dy, c.giro);
  const burbuja = useTransform(p, (v) => 1 - tramo(orden(v, i), [0.35, 0.75]));
  const dato = useTransform(p, (v) => tramo(orden(v, i), [0.45, 0.9]));
  const top = 64 + k * 52;

  return (
    <motion.div
      className="absolute left-5 right-5 h-[42px]"
      style={{ top, ...(vivo ? { transform } : {}) }}
    >
      {vivo ? (
        <motion.div
          className="absolute left-0 top-0 max-w-[78%] border border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)] px-3 py-2 text-[14px] text-[color:var(--text)]"
          style={{ opacity: burbuja }}
        >
          {chats.mensajes[k]}
          <span
            aria-hidden
            className="absolute -bottom-[5px] left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-[color:var(--hairline-strong)] bg-[color:var(--surface-2)]"
          />
        </motion.div>
      ) : null}
      <motion.div
        className="absolute inset-0 grid grid-cols-[1fr_1.2fr_auto] items-center gap-3 border-b border-[color:var(--hairline)] text-[14px]"
        style={vivo ? { opacity: dato } : undefined}
      >
        <span className="text-[color:var(--text)]">{fila.cliente}</span>
        <span className="text-[color:var(--text-dim)]">{fila.detalle}</span>
        <span
          className={`${ETIQUETA} border px-2 py-1 ${
            fila.estado === "Pagado"
              ? "border-[color:var(--accent-line)] text-[color:var(--accent)]"
              : "border-[color:var(--hairline-strong)] text-[color:var(--text-dim)]"
          }`}
        >
          {fila.estado}
        </span>
      </motion.div>
    </motion.div>
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
