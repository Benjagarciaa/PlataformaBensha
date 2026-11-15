import { armarCasilleros } from "./plano";
import { CAM, TAN_FOV, agrupar, atenuacion, brilloProfundidad, caosDe, deriva, type Encuadre } from "./armado";
import { formaLineas, type P2 } from "./formas";
import { qEje, rotar, type V3 } from "./mat";

/**
 * El caos en SVG: el primer cuadro de la escena WebGL, calculado con los
 * mismos datos (armado.ts) y proyectado con la misma camara. Se ve desde el
 * primer pintado, antes de hidratar, y mientras la escena termina de armarse.
 * Cuando la escena llega, el canvas arranca su reloj en 0 y funde con este
 * dibujo: los fragmentos estan en el mismo lugar, el cambio no se nota.
 *
 * No esta quieto: los fragmentos van en tres capas por profundidad que derivan
 * con animaciones CSS de transform (compositor, sin JS), las de adelante mas
 * que las de atras. Asi el hero se mueve desde el primer instante.
 *
 * Deterministico (mismo dibujo en servidor y cliente) y liviano: cada capa es
 * un puñado de <path> agrupados por opacidad, con coordenadas enteras y
 * relativas, los trazos simplificados a la escala de la pantalla y sin los
 * fragmentos que casi no se ven (los que quedan detras del texto). El viewBox se estira al tamaño del hero (preserveAspectRatio
 * none): las posiciones caen exactas en cualquier pantalla y las formas solo
 * se ensanchan un poco si el aspecto se aleja del de referencia.
 */

/** unidades del viewBox por lado */
const U = 1000;
/** niveles de opacidad del trazo: cada fragmento va al mas cercano */
const NIVELES = [0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52];
/** por debajo de esto el fragmento casi no se ve (detras del texto): no va */
const ALFA_MIN = 0.1;
/** tolerancia de simplificacion, en unidades del viewBox (~1 px) */
const TOLERANCIA = 1.4;

type Pt = [number, number];

/** Douglas-Peucker: saca los puntos que no cambian el dibujo a esta escala. */
function simplificar(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  let max = 0;
  let k = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / l;
    if (d > max) {
      max = d;
      k = i;
    }
  }
  if (max <= TOLERANCIA) return [a, b];
  return [...simplificar(pts.slice(0, k + 1)).slice(0, -1), ...simplificar(pts.slice(k))];
}

type Capa = { trazos: Map<number, string> };

function armar(denso: boolean, apilado: boolean, aspecto: number, zona: Encuadre["zonaTexto"]) {
  const grupos = agrupar(armarCasilleros(denso));
  const alto = 2 * CAM.z * TAN_FOV;
  const enc = { apilado, ancho: alto * aspecto, alto };
  const movil = !denso;
  const capas: Capa[] = [0, 1, 2].map(() => ({ trazos: new Map() }));

  for (const g of grupos) {
    const segs = formaLineas(g.tipo);
    for (let i = 0; i < g.casilleros.length; i++) {
      const c = caosDe(g, i, enc, movil);
      // el instante 0 del shader: deriva y giro iniciales
      const { d, giro } = deriva(c.rnd, 0);
      const p: V3 = [c.p[0] + d[0], c.p[1] + d[1], c.p[2] + d[2]];
      const q = qEje(c.eje, c.angulo + giro);

      // brillo: profundidad y la zona del texto, como en el shader
      const dist = CAM.z - p[2];
      const ndcX = p[0] / (dist * TAN_FOV * aspecto);
      const ndcY = p[1] / (dist * TAN_FOV);
      const alfa = 0.52 * brilloProfundidad(p[2]) * atenuacion(ndcX, ndcY, zona);
      if (alfa < ALFA_MIN || Math.abs(ndcX) > 1.12 || Math.abs(ndcY) > 1.12) continue;
      const nivel = NIVELES.reduce((a, b) => (Math.abs(b - alfa) < Math.abs(a - alfa) ? b : a));
      const capa = capas[p[2] < -1.6 ? 0 : p[2] < 0 ? 1 : 2];

      const pantalla = ([x, y]: P2): Pt => {
        const v = rotar(q, [x * c.s[0], y * c.s[1], 0]);
        const dz = CAM.z - (v[2] + p[2]);
        return [((v[0] + p[0]) / (dz * TAN_FOV * aspecto) + 1) * (U / 2), (1 - (v[1] + p[1]) / (dz * TAN_FOV)) * (U / 2)];
      };

      // los segmentos que se tocan van en una sola polilinea, simplificada
      const lineas: Pt[][] = [];
      for (const s of segs) {
        const a = pantalla(s.a);
        const b = pantalla(s.b);
        const ultima = lineas[lineas.length - 1];
        const fin = ultima?.[ultima.length - 1];
        if (fin && Math.abs(fin[0] - a[0]) < 1e-6 && Math.abs(fin[1] - a[1]) < 1e-6) ultima.push(b);
        else lineas.push([a, b]);
      }
      let dd = "";
      for (const linea of lineas) {
        const pts = simplificar(linea).map(([x, y]) => [Math.round(x), Math.round(y)] as Pt);
        dd += `M${pts[0][0]},${pts[0][1]}l`;
        for (let k = 1; k < pts.length; k++) {
          const dx = pts[k][0] - pts[k - 1][0];
          const dy = pts[k][1] - pts[k - 1][1];
          // pares implicitos: el signo menos ya separa los numeros
          dd += `${k > 1 && dx >= 0 ? " " : ""}${dx}${dy >= 0 ? "," : ""}${dy}`;
        }
      }
      capa.trazos.set(nivel, (capa.trazos.get(nivel) ?? "") + dd);
    }
  }
  return capas.map((c) => [...c.trazos.entries()].sort((x, y) => x[0] - y[0]));
}

// Se arma una vez por modulo, con el aspecto de referencia de cada version.
const DESKTOP = armar(true, false, 1.7, [-1, -0.7, 0.02, 0.75]);
const MOBILE = armar(false, true, 0.46, [-1, -0.05, 1, 1]);

/** Deriva de cada capa (atras, medio, adelante): mas cerca, mas se mueve. */
export const CSS_CAOS =
  // la deriva se nota desde el primer cuadro: el hero nunca parece quieto
  "@keyframes hero-deriva-0{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-9px,7px,0)}}" +
  "@keyframes hero-deriva-1{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(14px,-10px,0)}}" +
  "@keyframes hero-deriva-2{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-20px,-14px,0)}}" +
  ".hero-capa{position:absolute;inset:0}" +
  ".hero-capa-0{animation:hero-deriva-0 9s var(--ease-io) infinite}" +
  ".hero-capa-1{animation:hero-deriva-1 7s var(--ease-io) -2.5s infinite}" +
  ".hero-capa-2{animation:hero-deriva-2 5.5s var(--ease-io) -4s infinite}" +
  ".hero-caos path{vector-effect:non-scaling-stroke;stroke-width:1px}" +
  "@media (min-resolution:1.5dppx){.hero-caos path{stroke-width:.6px}}";

function Version({ capas, className }: { capas: ReturnType<typeof armar>; className: string }) {
  return (
    <div className={className}>
      {capas.map((trazos, i) => (
        <div key={i} className={`hero-capa hero-capa-${i}`}>
          <svg viewBox={`0 0 ${U} ${U}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
            {trazos.map(([alfa, d]) => (
              <path key={alfa} d={d} style={{ fill: "none", stroke: "var(--accent)", strokeOpacity: alfa }} />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}

export function IlustracionCaos({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div aria-hidden className={`hero-caos ${className ?? ""}`} style={style}>
      <Version capas={DESKTOP} className="absolute inset-0 hidden lg:block" />
      <Version capas={MOBILE} className="absolute inset-0 lg:hidden" />
    </div>
  );
}
