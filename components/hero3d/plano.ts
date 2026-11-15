/**
 * Plano del hero 3D: las medidas del "sistema" (notebook + celular) y los
 * casilleros de UI adonde vuela cada fragmento del caos.
 *
 * Es geometria pura, sin three. La usan la escena WebGL (para calcular los
 * destinos de cada fragmento) y la ilustracion SVG estatica del fallback, asi
 * las dos muestran exactamente el mismo sistema armado.
 *
 * Unidades: mundo de la escena. Cada superficie tiene su propio origen:
 *  - "pantalla": centro de la pantalla de la notebook
 *  - "base": bisagra de la notebook, plano horizontal (y negativo = hacia adelante)
 *  - "celular": centro de la pantalla del celular
 */

export type Tipo = "chat" | "celda" | "postit" | "ticket" | "reloj" | "carrito";

export const TIPOS: Tipo[] = ["chat", "celda", "postit", "ticket", "reloj", "carrito"];

export type Superficie = "pantalla" | "base" | "celular";

export type Casillero = {
  tipo: Tipo;
  sup: Superficie;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0 a 1: en que momento del ensamblaje sale este fragmento */
  orden: number;
};

/**
 * Tramos del progreso de scroll (0..1 del recorrido fijo del hero).
 * Los comparten la escena WebGL y el texto HTML, asi van sincronizados.
 */
export const TRAMOS = {
  ensamble: [0.05, 0.78],
  dibujo: [0.12, 0.62],
  encendido: [0.78, 0.92],
  pulso: [0.8, 0.95],
  orbita: [0.7, 1],
  textoCaosSale: [0.16, 0.32],
  textoSistemaEntra: [0.42, 0.58],
  indicadorSale: [0, 0.06],
} as const satisfies Record<string, readonly [number, number]>;

/** Medidas fijas del sistema. */
export const MEDIDAS = {
  pantalla: { hw: 2.1, hh: 1.325, bisel: 0.13 },
  bisagra: { y: -1.0, inclinacion: -0.12 },
  base: { hw: 2.35, prof: 2.7, espesor: 0.07 },
  celular: { x: 2.92, y: -0.6, z: 0.7, rotY: -0.08, hw: 0.525, hh: 1.075, bisel: 0.095 },
  /** centro horizontal aproximado del conjunto y su ancho total */
  centroX: 0.5,
  ancho: 5.9,
  alto: 3.7,
} as const;

/** Distancia del centro de la pantalla a la bisagra. */
export const ALTO_PANTALLA_SOBRE_BISAGRA = MEDIDAS.pantalla.hh + MEDIDAS.pantalla.bisel - 0.03;

/** Separadores del panel que se dibujan como lineas fijas del aparato. */
export const PANEL = {
  margen: 0.09,
  barraY: MEDIDAS.pantalla.hh - 0.26,
  lateralX: -1.53,
  main: { x0: -1.43, x1: 2.01 },
  grafico: { x0: -1.43, x1: 0.53, y0: -0.4, y1: 0.62 },
  pedidos: { x0: 0.63, x1: 2.01, y0: -0.4, y1: 0.62 },
  tabla: { x0: -1.43, x1: 2.01, y0: -1.27, y1: -0.46 },
  teclado: { x0: -2.0, x1: 2.0, y0: -1.38, y1: -0.28 },
  trackpad: { x: 0, y: -2.0, w: 1.4, h: 0.66 },
} as const;

/**
 * Genera los casilleros del sistema.
 * @param denso true en desktop (178 fragmentos), false en mobile (91)
 */
export function armarCasilleros(denso: boolean): Casillero[] {
  const out: Casillero[] = [];
  const { hh } = MEDIDAS.pantalla;
  const p = PANEL;

  // Orden de ensamblaje en la pantalla: de arriba hacia abajo, como una web
  // que se renderiza. Normalizado a 0..1 segun la altura.
  const ordenPantalla = (y: number) => (hh - y) / (2 * hh);

  // ── barra superior ──────────────────────────────────────────────────
  const barraY = hh - p.margen - 0.075;
  out.push({ tipo: "celda", sup: "pantalla", x: -0.65, y: barraY, w: 1.3, h: 0.12, orden: 0 });
  if (denso) {
    out.push({ tipo: "reloj", sup: "pantalla", x: 1.52, y: barraY, w: 0.12, h: 0.12, orden: 0.02 });
    out.push({ tipo: "carrito", sup: "pantalla", x: 1.72, y: barraY, w: 0.12, h: 0.12, orden: 0.03 });
  }
  out.push({ tipo: "postit", sup: "pantalla", x: 1.92, y: barraY, w: 0.13, h: 0.13, orden: 0.04 });

  // ── barra lateral: iconos ───────────────────────────────────────────
  const nLateral = denso ? 8 : 5;
  const pasoLateral = denso ? 0.25 : 0.38;
  const lado = denso ? 0.13 : 0.19;
  for (let i = 0; i < nLateral; i++) {
    const y = p.barraY - 0.2 - i * pasoLateral;
    out.push({
      tipo: i % 2 === 0 ? "reloj" : "carrito",
      sup: "pantalla",
      x: -1.78,
      y,
      w: lado,
      h: lado,
      orden: 0.05 + 0.25 * ordenPantalla(y),
    });
  }

  // ── tarjetas de numeros (KPI) ───────────────────────────────────────
  const nKpi = denso ? 4 : 3;
  const anchoMain = p.main.x1 - p.main.x0;
  const gapKpi = 0.08;
  const wKpi = (anchoMain - (nKpi - 1) * gapKpi) / nKpi;
  for (let i = 0; i < nKpi; i++) {
    out.push({
      tipo: "postit",
      sup: "pantalla",
      x: p.main.x0 + wKpi / 2 + i * (wKpi + gapKpi),
      y: 0.83,
      w: wKpi,
      h: 0.34,
      orden: 0.12 + i * 0.02,
    });
  }

  // ── grafico de barras: ventas que crecen ────────────────────────────
  const nBarras = denso ? 22 : 10;
  const g = p.grafico;
  const anchoG = g.x1 - g.x0 - 0.16;
  const paso = anchoG / nBarras;
  for (let i = 0; i < nBarras; i++) {
    const t = i / (nBarras - 1);
    const h = 0.14 + 0.66 * (0.5 + 0.5 * Math.sin(i * 1.7 + 0.6)) * (0.45 + 0.55 * t);
    const base = g.y0 + 0.08;
    out.push({
      tipo: "ticket",
      sup: "pantalla",
      x: g.x0 + 0.08 + paso * (i + 0.5),
      y: base + h / 2,
      w: paso * 0.62,
      h,
      orden: 0.3 + 0.15 * t,
    });
  }

  // ── lista de pedidos: los chats ahora son filas ─────────────────────
  const nPedidos = denso ? 10 : 5;
  const pd = p.pedidos;
  const pasoP = (pd.y1 - pd.y0 - 0.1) / nPedidos;
  for (let i = 0; i < nPedidos; i++) {
    const y = pd.y1 - 0.05 - pasoP * (i + 0.5);
    out.push({
      tipo: "chat",
      sup: "pantalla",
      x: (pd.x0 + pd.x1) / 2,
      y,
      w: pd.x1 - pd.x0 - 0.12,
      h: pasoP * 0.66,
      orden: 0.3 + 0.25 * ordenPantalla(y),
    });
  }

  // ── tabla: la planilla, pero ordenada ───────────────────────────────
  const filas = denso ? 11 : 5;
  const pesos = denso ? [1.5, 1, 1, 1, 1, 1] : [1.5, 1, 1, 1];
  const tb = p.tabla;
  const gapC = 0.04;
  const anchoT = tb.x1 - tb.x0 - 0.08 - gapC * (pesos.length - 1);
  const suma = pesos.reduce((a, b) => a + b, 0);
  const pasoF = (tb.y1 - tb.y0 - 0.06) / filas;
  for (let f = 0; f < filas; f++) {
    const y = tb.y1 - 0.03 - pasoF * (f + 0.5);
    let x = tb.x0 + 0.04;
    pesos.forEach((peso, c) => {
      const w = (anchoT * peso) / suma;
      out.push({
        tipo: c === 0 ? "chat" : "celda",
        sup: "pantalla",
        x: x + w / 2,
        y,
        w,
        h: pasoF * 0.7,
        orden: 0.5 + 0.12 * (f / filas) + 0.02 * c,
      });
      x += w + gapC;
    });
  }

  // ── teclado: los papelitos se vuelven teclas ────────────────────────
  const filasT = denso ? 4 : 3;
  const colsT = denso ? 12 : 10;
  const tk = p.teclado;
  const gapT = 0.05;
  const wT = (tk.x1 - tk.x0 - gapT * (colsT - 1)) / colsT;
  const hT = (tk.y1 - tk.y0 - gapT * (filasT - 1)) / filasT;
  for (let f = 0; f < filasT; f++) {
    for (let c = 0; c < colsT; c++) {
      out.push({
        tipo: "postit",
        sup: "base",
        x: tk.x0 + wT / 2 + c * (wT + gapT),
        y: tk.y1 - hT / 2 - f * (hT + gapT),
        w: wT,
        h: hT,
        orden: 0.18 + 0.1 * (f / filasT) + 0.08 * (c / colsT),
      });
    }
  }
  out.push({
    tipo: "postit",
    sup: "base",
    x: p.trackpad.x,
    y: p.trackpad.y,
    w: p.trackpad.w,
    h: p.trackpad.h,
    orden: 0.32,
  });

  // ── celular: la web que vende ───────────────────────────────────────
  const cel = (c: Omit<Casillero, "sup" | "orden">, orden: number) =>
    out.push({ ...c, sup: "celular", orden });
  cel({ tipo: "celda", x: -0.25, y: 0.96, w: 0.36, h: 0.07 }, 0.2);
  cel({ tipo: "carrito", x: 0.4, y: 0.96, w: 0.1, h: 0.1 }, 0.21);
  cel({ tipo: "postit", x: 0, y: 0.6, w: 0.93, h: 0.5 }, 0.24);
  cel({ tipo: "chat", x: -0.06, y: 0.25, w: 0.8, h: 0.08 }, 0.27);
  cel({ tipo: "chat", x: -0.17, y: 0.13, w: 0.58, h: 0.07 }, 0.29);
  [-0.12, -0.56].forEach((y, fila) => {
    [-0.235, 0.235].forEach((x, col) => {
      cel({ tipo: "ticket", x, y, w: 0.43, h: 0.32 }, 0.32 + fila * 0.05 + col * 0.02);
      cel({ tipo: "celda", x: x - 0.06, y: y - 0.2, w: 0.3, h: 0.045 }, 0.36 + fila * 0.05 + col * 0.02);
    });
  });
  cel({ tipo: "postit", x: 0, y: -0.93, w: 0.93, h: 0.12 }, 0.42);
  cel({ tipo: "chat", x: 0.33, y: -0.72, w: 0.24, h: 0.15 }, 0.45);

  return out;
}
