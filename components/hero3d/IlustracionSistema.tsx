import { ALTO_PANTALLA_SOBRE_BISAGRA, MEDIDAS, PANEL, armarCasilleros, type Casillero } from "./plano";

/**
 * El sistema ya armado, en SVG estatico.
 *
 * Es el fallback del hero 3D: reduced-motion, ahorro de datos, sin WebGL
 * acelerado o sin JS. Sale de los mismos casilleros que la escena WebGL
 * (version liviana), asi el dibujo es el mismo plano que se ve armado en 3D.
 * Sin texto adentro: es decorativo, el mensaje lo lleva el HTML.
 *
 * RENDIMIENTO. --trazo cambia en :root en cada frame y eso recalcula el
 * estilo de todos los nodos de la pagina. Dibujado rect por rect serian unos
 * 120 nodos SVG; aca cada grupo es UN <path> con muchos subtrazos, asi el
 * dibujo entero son unos 15 nodos. No va como imagen ni como mascara CSS: eso
 * cuenta como candidato a LCP y, como aparece tarde (cuando se decide el modo
 * estatico), se volvia el LCP de la pagina.
 */

const U = 100; // unidades de escena a unidades SVG
const CENTRO_PANTALLA_Y = MEDIDAS.bisagra.y + ALTO_PANTALLA_SOBRE_BISAGRA;
const ESCORZO = 0.3; // la base se ve acostada: se acorta en vertical
const VIEWBOX = { x: -265, y: -200, w: 632, h: 420 };

const n = (v: number) => +v.toFixed(1);
const sx = (x: number) => n(x * U);
const sy = (y: number) => n(-y * U);

/** Punto de la base (y negativo = hacia adelante) llevado al dibujo. */
function puntoBase(x: number, y: number) {
  const adelante = -y;
  const abre = 1 + adelante * 0.05;
  return `${sx(x * abre)},${sy(MEDIDAS.bisagra.y - adelante * ESCORZO)}`;
}

// Cada forma es un subtrazo de un path: "M x,y L ... Z".
function poligonoBase(x0: number, y0: number, x1: number, y1: number) {
  return `M${puntoBase(x0, y0)}L${puntoBase(x1, y0)}L${puntoBase(x1, y1)}L${puntoBase(x0, y1)}Z`;
}

function rect(x0: number, yArriba: number, w: number, h: number) {
  return `M${sx(x0)},${sy(yArriba)}h${n(w * U)}v${n(h * U)}h${n(-w * U)}Z`;
}

function linea(x1: number, y1: number, x2: number, y2: number) {
  return `M${sx(x1)},${sy(y1)}L${sx(x2)},${sy(y2)}`;
}

function casilleroRect(c: Casillero, ox: number, oy: number) {
  return rect(ox + c.x - c.w / 2, oy + c.y + c.h / 2, c.w, c.h);
}

type Trazo = { d: string; trazo: number; relleno: number };

/** Un grupo del dibujo: un solo path, con trazo y relleno opcional. */
function grupo(d: string, trazo: number, relleno = 0): Trazo {
  return { d, trazo, relleno };
}

function armarDibujo() {
  const casilleros = armarCasilleros(false);
  const { hw, hh, bisel } = MEDIDAS.pantalla;
  const cel = MEDIDAS.celular;
  const b = MEDIDAS.base;
  const p = PANEL;
  const oy = CENTRO_PANTALLA_Y;
  const v = VIEWBOX;

  // El celular tapa a la notebook: la notebook se recorta con un agujero
  // donde esta el celular (evenodd), sin depender de rellenos opacos.
  const celX0 = sx(cel.x - cel.hw - cel.bisel);
  const celY0 = sy(cel.y + cel.hh + cel.bisel + 0.04);
  const celW = sx(2 * (cel.hw + cel.bisel));
  const celH = sx(2 * (cel.hh + cel.bisel + 0.04));
  const recorte = `M${v.x},${v.y}h${v.w}v${v.h}h${-v.w}zM${celX0},${celY0}h${celW}v${celH}h${-celW}z`;

  const sobre = (sup: Casillero["sup"]) => casilleros.filter((c) => c.sup === sup);

  const notebook = [
    // base y teclado
    grupo(poligonoBase(-b.hw, 0, b.hw, -b.prof), 0.55),
    grupo(poligonoBase(p.teclado.x0 - 0.06, p.teclado.y1 + 0.06, p.teclado.x1 + 0.06, p.teclado.y0 - 0.06), 0.3),
    grupo(
      sobre("base")
        .map((c) => poligonoBase(c.x - c.w / 2, c.y + c.h / 2, c.x + c.w / 2, c.y - c.h / 2))
        .join(""),
      0.4,
      0.05
    ),
    // pantalla
    grupo(rect(-hw - bisel, oy + hh + bisel, 2 * (hw + bisel), 2 * (hh + bisel)), 0.6),
    grupo(rect(-hw, oy + hh, 2 * hw, 2 * hh), 0.6, 0.04),
    grupo(
      linea(-hw, oy + p.barraY, hw, oy + p.barraY) +
        linea(p.lateralX, oy - hh, p.lateralX, oy + p.barraY) +
        [p.grafico, p.pedidos, p.tabla].map((r) => rect(r.x0, oy + r.y1, r.x1 - r.x0, r.y1 - r.y0)).join(""),
      0.25
    ),
    grupo(sobre("pantalla").map((c) => casilleroRect(c, 0, oy)).join(""), 0.5, 0.06),
  ];

  const celular = [
    grupo(
      rect(cel.x - cel.hw - cel.bisel, cel.y + cel.hh + cel.bisel + 0.04, 2 * (cel.hw + cel.bisel), 2 * (cel.hh + cel.bisel + 0.04)) +
        linea(cel.x - 0.12, cel.y + cel.hh + 0.06, cel.x + 0.12, cel.y + cel.hh + 0.06) +
        linea(cel.x - 0.18, cel.y - cel.hh - 0.07, cel.x + 0.18, cel.y - cel.hh - 0.07),
      0.65
    ),
    grupo(rect(cel.x - cel.hw, cel.y + cel.hh, 2 * cel.hw, 2 * cel.hh), 0.65, 0.04),
    grupo(sobre("celular").map((c) => casilleroRect(c, cel.x, cel.y)).join(""), 0.55, 0.06),
  ];

  return { recorte, notebook, celular };
}

// Se arma una vez por modulo: los mismos paths en el servidor y en el cliente.
const DIBUJO = armarDibujo();
const { x, y, w, h } = VIEWBOX;

function Trazos({ lista }: { lista: Trazo[] }) {
  return (
    <>
      {lista.map((t, i) => (
        <path
          key={i}
          d={t.d}
          vectorEffect="non-scaling-stroke"
          style={{
            stroke: "var(--accent)",
            strokeOpacity: t.trazo,
            strokeWidth: 1,
            fill: t.relleno > 0 ? "var(--accent)" : "none",
            fillOpacity: t.relleno,
          }}
        />
      ))}
    </>
  );
}

export function IlustracionSistema({ className }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox={`${x} ${y} ${w} ${h}`} className={className}>
      <defs>
        <clipPath id="hero3d-recorte">
          <path clipRule="evenodd" d={DIBUJO.recorte} />
        </clipPath>
      </defs>
      <g clipPath="url(#hero3d-recorte)">
        <Trazos lista={DIBUJO.notebook} />
      </g>
      <Trazos lista={DIBUJO.celular} />
    </svg>
  );
}
