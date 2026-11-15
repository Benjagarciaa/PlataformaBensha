/**
 * Geometria pura del carrusel de trabajos, sin three.
 *
 * La comparten la escena 3D (anillo.ts), el HTML de la seccion y la ficha:
 * medidas del anillo, el encuadre de la camara segun el tamaño de pantalla,
 * la fisica del giro y el puente mutable entre el DOM y la escena.
 */

/** Tarjeta en unidades de mundo. La imagen es 16:10, como la captura de escritorio. */
export const TARJETA = {
  ancho: 1.6,
  alto: 1.0,
  /** aire alrededor de la imagen donde se dibujan las escuadras */
  margen: 0.09,
};

const SEPARACION = 0.26;

/** Radio del anillo para que las tarjetas queden con aire parejo entre si. */
export function radioAnillo(n: number) {
  return (TARJETA.ancho + SEPARACION) / (2 * Math.sin(Math.PI / n));
}

export const GIRO = {
  /** giro solo, en radianes por segundo (una vuelta en ~2 minutos) */
  auto: 0.05,
  /**
   * giro leve mientras la seccion pasa por la pantalla (radianes en todo el
   * paso, poco mas de una tarjeta): acompaña el scroll sin fijar la pagina
   */
  scroll: 0.5,
  /** freno de la inercia despues de soltar */
  friccion: 2.2,
  /** tope de velocidad al soltar, en radianes por segundo */
  velMax: 5,
  /** celular: segundos de reposo antes de pasar solo a la tarjeta siguiente */
  pausa: 4.5,
};

export const VUELO = {
  /** la tarjeta viaja hacia la camara (s) */
  ida: 0.42,
  /** y vuelve a su lugar (s) */
  vuelta: 0.5,
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Encuadre = {
  /** pantalla angosta o vertical: anillo mas cerca, sin reflejo */
  estrecho: boolean;
  /** campo visual vertical en grados */
  fov: number;
  /** distancia de la camara a la tarjeta de frente */
  distancia: number;
  /** inclinacion de la camara hacia abajo (rad) */
  elevacion: number;
  /** donde cae el centro de la tarjeta de frente, como fraccion del alto */
  frenteY: number;
  /** ancho en px de la tarjeta de frente */
  anchoFrente: number;
  /** a donde vuela la tarjeta al abrirse (px del lienzo) */
  vuelo: { ancho: number; cx: number; cy: number };
};

/**
 * Encuadre segun el tamaño del lienzo. El escenario ya no ocupa la pantalla
 * entera: es una franja apaisada en la compu y casi cuadrada en el celular.
 * En pantallas anchas la tarjeta de frente ocupa algo mas de un cuarto del
 * ancho y el anillo entra entero; en el celular la camara se acerca, la de
 * frente ocupa tres cuartos del ancho y las vecinas asoman por los costados.
 */
export function calcularEncuadre(ancho: number, alto: number): Encuadre {
  const aspecto = ancho / Math.max(1, alto);
  const estrecho = aspecto < 1.15 || ancho < 768;
  const fov = estrecho ? 36 : 30;
  const t = Math.tan((fov * Math.PI) / 360);

  let objetivo = estrecho
    ? ancho * lerp(0.76, 0.66, clamp01((aspecto - 0.7) / 0.45))
    : ancho * lerp(0.36, 0.27, clamp01((aspecto - 1.4) / 1.3));
  // la tarjeta nunca pasa de la mitad del alto: arriba asoma el fondo del anillo
  objetivo = Math.min(objetivo, alto * (estrecho ? 0.46 : 0.5) * (TARJETA.ancho / TARJETA.alto));

  const distancia = (TARJETA.ancho * alto) / (2 * t * objetivo);
  const anchoVuelo = estrecho
    ? Math.min(ancho * 0.9, alto * 0.62 * 1.6)
    : Math.min(ancho * 0.42, alto * 0.7 * 1.6);

  return {
    estrecho,
    fov,
    distancia,
    elevacion: estrecho ? 0.3 : 0.24,
    frenteY: estrecho ? 0.56 : 0.58,
    anchoFrente: objetivo,
    vuelo: { ancho: anchoVuelo, cx: ancho / 2, cy: alto * 0.52 },
  };
}

/** Lleva un angulo a (-PI, PI]. */
export function normalizar(a: number) {
  const dos = Math.PI * 2;
  return a - dos * Math.floor((a + Math.PI) / dos);
}

/** Paso angular entre tarjetas. */
export const paso = (n: number) => (Math.PI * 2) / n;

/**
 * Indice de la tarjeta que queda de frente para un giro total dado.
 * La tarjeta i esta en el angulo i * paso + total; de frente es angulo 0.
 */
export function indiceFrente(total: number, n: number) {
  const i = Math.round(-total / paso(n));
  return ((i % n) + n) % n;
}

/** Giro total mas cercano al actual que deja la tarjeta i de frente. */
export function totalPara(i: number, actual: number, n: number) {
  const base = -i * paso(n);
  return actual + normalizar(base - actual);
}

export type Rect = { x: number; y: number; w: number; h: number };

/** Lo que la escena le ofrece al HTML para abrir y cerrar la ficha. */
export type ControlEscena = {
  /** la tarjeta viaja hacia la camara; resuelve con su rect final en px del lienzo */
  volar: (i: number) => Promise<Rect>;
  /** la tarjeta vuelve a su lugar en el anillo */
  volver: (i: number) => Promise<void>;
  /** cambia de golpe cual tarjeta esta volada (pasar de proyecto en la ficha) */
  saltar: (i: number) => void;
  /** rect de la tarjeta volada en px del lienzo */
  rectVuelo: () => Rect;
};

/**
 * Estado compartido entre el DOM y la escena, fuera del ciclo de React.
 * El HTML escribe intenciones (hover, foco, arrastre, a donde girar) y la
 * escena escribe lo que mide (que tarjeta esta de frente) y ubica los botones.
 */
export type Puente = {
  n: number;
  hover: number;
  foco: number;
  /** pedido de girar hasta dejar esta tarjeta de frente */
  irA: number | null;
  arrastre: { activo: boolean; dx: number; vel: number };
  /** botones reales, uno por tarjeta, que la escena ubica sobre cada plano */
  botones: (HTMLElement | null)[];
  frente: number;
  alCambiarFrente: ((i: number) => void) | null;
  control: ControlEscena | null;
};

export function crearPuente(n: number): Puente {
  return {
    n,
    hover: -1,
    foco: -1,
    irA: null,
    arrastre: { activo: false, dx: 0, vel: 0 },
    botones: Array.from({ length: n }, () => null),
    frente: 0,
    alCambiarFrente: null,
    control: null,
  };
}
