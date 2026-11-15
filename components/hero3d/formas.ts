import { FORMA_CARRITO } from "./iconos";
import type { Tipo } from "./plano";

/**
 * Formas base 2D de los fragmentos del caos, normalizadas a [-0.5, 0.5].
 * Geometria pura: la usan la escena WebGL y el caos en SVG que se ve
 * mientras la escena carga, asi los dos dibujan exactamente lo mismo.
 *
 * Cada segmento trae su posicion en el caos, su posicion ya ordenada (alt)
 * y un nivel de detalle: 0 estructura, 0.5 contenido (queda tenue), 1 solo
 * existe en el caos (la colita del chat, el doblez del post-it).
 */

export type P2 = [number, number];

export type Seg = {
  a: P2;
  b: P2;
  aa?: P2;
  bb?: P2;
  det: number;
  /** linea de contenido: al ordenarse su largo cambia en cada casillero */
  varia?: boolean;
};

function seg(a: P2, b: P2, det = 0, aa?: P2, bb?: P2): Seg {
  return { a, b, det, aa, bb };
}

/** Marca segmentos como lineas de contenido de largo variable. */
function varia(segs: Seg[]): Seg[] {
  return segs.map((x) => ({ ...x, varia: true }));
}

function poli(puntos: P2[], det = 0, cerrado = false, alt?: P2[]): Seg[] {
  const out: Seg[] = [];
  const n = cerrado ? puntos.length : puntos.length - 1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % puntos.length;
    out.push(seg(puntos[i], puntos[j], det, alt?.[i], alt?.[j]));
  }
  return out;
}

function rect(x0: number, y0: number, x1: number, y1: number, det = 0): Seg[] {
  return poli(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    det,
    true
  );
}

function circulo(cx: number, cy: number, r: number, n: number, det = 0): Seg[] {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poli(pts, det, true);
}

/** Linea escrita a mano que al ordenarse queda recta. */
function garabato(x0: number, x1: number, y: number, det = 0.5): Seg[] {
  const pts: P2[] = [];
  const alt: P2[] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, y + Math.sin(i * 2.1 + y * 9) * 0.045]);
    alt.push([x, y]);
  }
  return poli(pts, det, false, alt);
}

export function formaLineas(tipo: Tipo): Seg[] {
  switch (tipo) {
    case "chat":
      return [
        ...rect(-0.5, -0.5, 0.5, 0.5),
        // la colita de la burbuja: al ordenarse se retrae al borde
        ...poli(
          [
            [-0.32, -0.5],
            [-0.42, -0.85],
            [-0.12, -0.5],
          ],
          1,
          false,
          [
            [-0.32, -0.5],
            [-0.27, -0.5],
            [-0.12, -0.5],
          ]
        ),
        ...varia([seg([-0.36, 0.16], [0.3, 0.16], 0.5), seg([-0.36, -0.14], [0.08, -0.14], 0.5)]),
      ];
    case "celda":
      return [
        ...rect(-0.5, -0.5, 0.5, 0.5),
        seg([-0.17, -0.5], [-0.17, 0.5], 0.5),
        seg([0.17, -0.5], [0.17, 0.5], 0.5),
        seg([-0.42, 0], [-0.26, 0], 1),
        seg([-0.09, 0], [0.06, 0], 1),
        seg([0.25, 0], [0.42, 0], 1),
      ];
    case "postit":
      return [
        // esquina doblada que al ordenarse queda en escuadra
        ...poli(
          [
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.26],
            [0.26, 0.5],
            [-0.5, 0.5],
          ],
          0,
          true,
          [
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.5],
            [0.5, 0.5],
            [-0.5, 0.5],
          ]
        ),
        ...poli(
          [
            [0.26, 0.5],
            [0.26, 0.26],
            [0.5, 0.26],
          ],
          1,
          false,
          [
            [0.5, 0.5],
            [0.5, 0.5],
            [0.5, 0.5],
          ]
        ),
        ...varia([...garabato(-0.36, 0.22, 0.2), ...garabato(-0.36, 0.3, -0.02), ...garabato(-0.36, 0.04, -0.24)]),
      ];
    case "ticket": {
      // borde de abajo cortado en zigzag: al ordenarse queda recto
      const zz: P2[] = [
        [0.5, 0.5],
        [-0.5, 0.5],
      ];
      const zzAlt: P2[] = [
        [0.5, 0.5],
        [-0.5, 0.5],
      ];
      const dientes = 8;
      for (let i = 0; i <= dientes; i++) {
        const x = -0.5 + i / dientes;
        zz.push([x, i % 2 === 0 ? -0.5 : -0.42]);
        zzAlt.push([x, -0.5]);
      }
      return [
        ...poli(zz, 0, true, zzAlt),
        ...varia([seg([-0.36, 0.34], [0.3, 0.34], 0.5)]),
        seg([-0.36, 0.14], [0.1, 0.14], 1),
        seg([0.22, 0.14], [0.36, 0.14], 1),
        seg([-0.36, -0.02], [0.02, -0.02], 1),
        seg([0.22, -0.02], [0.36, -0.02], 1),
        ...varia([seg([-0.36, -0.24], [0.36, -0.24], 0.5)]),
      ];
    }
    case "reloj":
      return [...circulo(0, 0, 0.5, 20), seg([0, 0], [0, 0.32], 0.5), seg([0, 0], [0.22, -0.08], 0.5)];
    case "carrito":
      return FORMA_CARRITO.map(([a, b]) => seg([a[0], a[1]], [b[0], b[1]]));
  }
}

/** Tamaño de cada tipo en el caos (ancho, alto), antes del azar. */
export const TAM_CAOS: Record<Tipo, [number, number]> = {
  chat: [0.62, 0.36],
  celda: [0.78, 0.2],
  postit: [0.42, 0.42],
  ticket: [0.34, 0.6],
  reloj: [0.3, 0.3],
  carrito: [0.34, 0.3],
};

/** Los tipos que se transforman en iconos del panel: van sin relleno. */
export const esIcono = (tipo: Tipo) => tipo === "reloj" || tipo === "carrito";
