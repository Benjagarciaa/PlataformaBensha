/**
 * Iconos del panel armado, en trazos sueltos (segmentos) normalizados a
 * [-0.5, 0.5], y arriba es y positivo. Geometria pura, sin three: la usan la
 * escena WebGL (los relojes y carritos del caos se transforman en estos
 * iconos al llegar a su casillero) y la ilustracion SVG del modo estatico.
 *
 * Cada icono tiene como mucho SEGMENTOS_ICONO trazos: es el tamaño del
 * casillero de morfeo en el shader.
 */

export type Punto = readonly [number, number];
export type Segmento = readonly [Punto, Punto];

export type Icono =
  | "inicio"
  | "productos"
  | "pedidos"
  | "clientes"
  | "estadisticas"
  | "whatsapp"
  | "ajustes"
  | "buscar"
  | "campana"
  | "carrito";

/** Orden fijo: el indice es el que viaja al shader. */
export const ICONOS: Icono[] = [
  "inicio",
  "productos",
  "pedidos",
  "clientes",
  "estadisticas",
  "whatsapp",
  "ajustes",
  "buscar",
  "campana",
  "carrito",
];

export const SEGMENTOS_ICONO = 24;

function poli(puntos: Punto[], cerrado = false): Segmento[] {
  const out: Segmento[] = [];
  const n = cerrado ? puntos.length : puntos.length - 1;
  for (let i = 0; i < n; i++) out.push([puntos[i], puntos[(i + 1) % puntos.length]]);
  return out;
}

function arco(cx: number, cy: number, r: number, desde: number, hasta: number, n: number): Punto[] {
  const pts: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const a = desde + ((hasta - desde) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function circulo(cx: number, cy: number, r: number, n: number): Segmento[] {
  return poli(arco(cx, cy, r, 0, Math.PI * 2, n).slice(0, n), true);
}

function rect(x0: number, y0: number, x1: number, y1: number): Segmento[] {
  return poli(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    true
  );
}

/** El carrito del caos: tambien es el icono del encabezado de la tienda. */
export const FORMA_CARRITO: Segmento[] = [
  ...poli([
    [-0.5, 0.42],
    [-0.32, 0.42],
    [-0.18, -0.2],
    [0.36, -0.2],
    [0.48, 0.24],
    [-0.26, 0.24],
  ]),
  ...circulo(-0.1, -0.38, 0.09, 8),
  ...circulo(0.28, -0.38, 0.09, 8),
];

export const FORMAS_ICONO: Record<Icono, Segmento[]> = {
  inicio: [
    ...poli([
      [-0.46, 0.02],
      [0, 0.46],
      [0.46, 0.02],
    ]),
    ...poli([
      [-0.32, 0.12],
      [-0.32, -0.44],
      [0.32, -0.44],
      [0.32, 0.12],
    ]),
    ...poli([
      [-0.1, -0.44],
      [-0.1, -0.12],
      [0.1, -0.12],
      [0.1, -0.44],
    ]),
  ],
  productos: [
    ...poli(
      [
        [0, 0.48],
        [0.42, 0.25],
        [0.42, -0.25],
        [0, -0.48],
        [-0.42, -0.25],
        [-0.42, 0.25],
      ],
      true
    ),
    ...poli([
      [-0.42, 0.25],
      [0, 0.02],
      [0.42, 0.25],
    ]),
    [
      [0, 0.02],
      [0, -0.48],
    ],
  ],
  pedidos: [
    ...rect(-0.34, -0.46, 0.34, 0.4),
    ...poli([
      [-0.14, 0.4],
      [-0.14, 0.5],
      [0.14, 0.5],
      [0.14, 0.4],
    ]),
    [
      [-0.2, 0.18],
      [0.2, 0.18],
    ],
    [
      [-0.2, -0.01],
      [0.2, -0.01],
    ],
    [
      [-0.2, -0.2],
      [0.06, -0.2],
    ],
  ],
  clientes: [
    ...circulo(0, 0.2, 0.19, 10),
    ...poli([
      [-0.4, -0.47],
      [-0.35, -0.24],
      [-0.2, -0.09],
      [0.2, -0.09],
      [0.35, -0.24],
      [0.4, -0.47],
    ]),
  ],
  estadisticas: [
    [
      [-0.46, -0.45],
      [0.46, -0.45],
    ],
    ...poli([
      [-0.36, -0.45],
      [-0.36, -0.12],
      [-0.18, -0.12],
      [-0.18, -0.45],
    ]),
    ...poli([
      [-0.09, -0.45],
      [-0.09, 0.14],
      [0.09, 0.14],
      [0.09, -0.45],
    ]),
    ...poli([
      [0.18, -0.45],
      [0.18, 0.42],
      [0.36, 0.42],
      [0.36, -0.45],
    ]),
  ],
  whatsapp: [
    ...poli(arco(0.02, 0.03, 0.42, Math.PI * 1.28, Math.PI * 1.28 + Math.PI * 1.86, 15)),
    ...poli([
      arco(0.02, 0.03, 0.42, Math.PI * 1.28, Math.PI * 1.28, 1)[0],
      [-0.46, -0.48],
      arco(0.02, 0.03, 0.42, Math.PI * 1.14, Math.PI * 1.14, 1)[0],
    ]),
    ...poli([
      [-0.14, 0.2],
      [-0.2, 0.07],
      [-0.08, -0.1],
      [0.08, -0.2],
      [0.2, -0.15],
    ]),
  ],
  ajustes: [
    [
      [-0.46, 0.28],
      [0.46, 0.28],
    ],
    [
      [-0.46, 0],
      [0.46, 0],
    ],
    [
      [-0.46, -0.28],
      [0.46, -0.28],
    ],
    ...rect(-0.24, 0.2, -0.08, 0.36),
    ...rect(0.12, -0.08, 0.28, 0.08),
    ...rect(-0.32, -0.36, -0.16, -0.2),
  ],
  buscar: [
    ...circulo(-0.08, 0.08, 0.3, 12),
    [
      [0.14, -0.14],
      [0.46, -0.46],
    ],
  ],
  campana: [
    ...poli(
      [
        [-0.38, -0.26],
        [-0.26, -0.14],
        [-0.26, 0.12],
        [-0.17, 0.3],
        [0, 0.38],
        [0.17, 0.3],
        [0.26, 0.12],
        [0.26, -0.14],
        [0.38, -0.26],
      ],
      true
    ),
    [
      [-0.09, -0.38],
      [0.09, -0.38],
    ],
    [
      [0, 0.38],
      [0, 0.47],
    ],
  ],
  carrito: FORMA_CARRITO,
};
