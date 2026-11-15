/**
 * El caos, en SVG estatico y liviano: el estado intermedio del hero mientras
 * la escena WebGL termina de cargar. Hace crossfade con el canvas cuando la
 * escena ya pinto, asi el hero nunca queda vacio (ni antes de hidratar).
 *
 * Fragmentos deterministas (mismo dibujo en servidor y cliente), repartidos
 * donde flota el caos de la escena: a la derecha y en las franjas en desktop,
 * abajo en mobile, esquivando el texto. Todo el dibujo es un solo <path> por
 * version: unos pocos nodos, y no compite por el LCP (es SVG inline, no imagen).
 */

type P = [number, number];

function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const r1 = (v: number) => +v.toFixed(1);

function rotar([x, y]: P, cx: number, cy: number, a: number): P {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [r1(cx + (x - cx) * c - (y - cy) * s), r1(cy + (x - cx) * s + (y - cy) * c)];
}

function forma(cx: number, cy: number, w: number, h: number, a: number, tipo: number) {
  const pts: P[] = [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ].map((p) => rotar(p as P, cx, cy, a));
  let d = `M${pts.map((p) => p.join(",")).join("L")}Z`;
  // contenido: lineas sueltas adentro, como texto escrito a mano
  const lineas = tipo === 1 ? 1 : 2;
  for (let i = 0; i < lineas; i++) {
    const y = cy - h * 0.15 + i * h * 0.3;
    const a1 = rotar([cx - w * 0.32, y], cx, cy, a);
    const a2 = rotar([cx + w * (0.05 + 0.2 * ((i + tipo) % 2)), y], cx, cy, a);
    d += `M${a1.join(",")}L${a2.join(",")}`;
  }
  // chat: la colita
  if (tipo === 0) {
    const t1 = rotar([cx - w * 0.3, cy + h / 2], cx, cy, a);
    const t2 = rotar([cx - w * 0.38, cy + h * 0.85], cx, cy, a);
    const t3 = rotar([cx - w * 0.12, cy + h / 2], cx, cy, a);
    d += `M${t1.join(",")}L${t2.join(",")}L${t3.join(",")}`;
  }
  return d;
}

function armar(ancho: number, alto: number, zona: (x: number, y: number) => boolean, semilla: number, n: number) {
  const rnd = azar(semilla);
  let d = "";
  let puestos = 0;
  let intentos = 0;
  while (puestos < n && intentos < n * 12) {
    intentos++;
    const x = rnd() * ancho;
    const y = rnd() * alto;
    if (zona(x, y)) continue;
    const tipo = Math.floor(rnd() * 3);
    const w = tipo === 1 ? 9 + rnd() * 6 : 6 + rnd() * 5;
    const h = tipo === 1 ? 2.6 + rnd() * 1.4 : 4 + rnd() * 3;
    d += forma(x, y, w, h, (rnd() - 0.5) * 1.1, tipo);
    puestos++;
  }
  return d;
}

// desktop: 160 x 100, el texto ocupa la izquierda al medio
const DESKTOP = armar(160, 100, (x, y) => x < 82 && y > 14 && y < 86, 11, 30);
// mobile: 100 x 216, el texto ocupa la mitad de arriba
const MOBILE = armar(100, 216, (x, y) => y < 112, 23, 22);

export function IlustracionCaos({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const trazo = {
    fill: "none",
    stroke: "var(--accent)",
    strokeOpacity: 0.32,
    strokeWidth: 1,
  } as const;
  return (
    <div aria-hidden className={className} style={style}>
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className="hidden h-full w-full lg:block">
        <path d={DESKTOP} vectorEffect="non-scaling-stroke" style={trazo} />
      </svg>
      <svg viewBox="0 0 100 216" preserveAspectRatio="xMidYMid slice" className="h-full w-full lg:hidden">
        <path d={MOBILE} vectorEffect="non-scaling-stroke" style={trazo} />
      </svg>
    </div>
  );
}
