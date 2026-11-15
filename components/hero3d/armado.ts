import { MEDIDAS, TIPOS, type Casillero, type Tipo } from "./plano";
import { TAM_CAOS } from "./formas";
import { normalizar, type V3 } from "./mat";

/**
 * Como se reparte el caos y donde se arma el sistema. Geometria pura (sin
 * WebGL): la usan la escena y el caos en SVG que se ve mientras carga. Asi el
 * SVG es una foto exacta del primer cuadro de la escena y el crossfade entre
 * los dos no se nota.
 */

export const CAM = { fov: 35, z: 10, cerca: 0.1, lejos: 60 } as const;

/** numeros al azar fijos por fragmento */
export const AZAR = 10;

export type Grupo = {
  tipo: Tipo;
  casilleros: Casillero[];
  /** AZAR numeros por fragmento, siempre los mismos */
  azar: Float32Array;
};

/** Agrupa los casilleros por tipo y les da su azar fijo (semilla). */
export function agrupar(casilleros: Casillero[], semilla = 7): Grupo[] {
  let s = semilla;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return TIPOS.map((tipo) => {
    const propios = casilleros.filter((c) => c.tipo === tipo);
    const azar = new Float32Array(propios.length * AZAR);
    for (let i = 0; i < azar.length; i++) azar[i] = rnd();
    return { tipo, casilleros: propios, azar };
  });
}

export type Encuadre = {
  /** layout apilado (mobile y tablet): sistema abajo del texto */
  apilado: boolean;
  ancho: number;
  alto: number;
  escala: number;
  pos: V3;
  /** rotacion del sistema (euler XYZ) */
  rot: V3;
  /** rectangulo NDC donde vive el texto (x0, y0, x1, y1): ahi el caos se atenua */
  zonaTexto: [number, number, number, number];
  /** centro del sistema en el mundo, para la orbita final */
  centro: V3;
};

export const TAN_FOV = Math.tan(((CAM.fov / 2) * Math.PI) / 180);

export function calcularEncuadre(anchoPx: number, altoPx: number): Encuadre {
  const aspecto = anchoPx / Math.max(1, altoPx);
  const alto = 2 * CAM.z * TAN_FOV;
  const ancho = alto * aspecto;
  const apilado = anchoPx < 1024;

  let escala: number;
  let pos: V3;
  let rot: V3;
  let zonaTexto: Encuadre["zonaTexto"];

  if (!apilado) {
    escala = Math.min(1, (ancho * 0.42) / MEDIDAS.ancho, (alto * 0.56) / MEDIDAS.alto);
    const cx = ancho / 2 - ancho * 0.275;
    pos = [cx - MEDIDAS.centroX * escala, -0.12 * escala, 0];
    rot = [0.3, -0.44, 0];
    zonaTexto = [-1, -0.7, 0.02, 0.75];
  } else {
    // mobile: el sistema abajo y un poco mas chico, sin pisar el texto
    escala = Math.min((ancho * 0.74) / MEDIDAS.ancho, (alto * 0.25) / MEDIDAS.alto);
    pos = [-(MEDIDAS.centroX + 0.12) * escala, -alto / 2 + alto * 0.225, 0];
    rot = [0.34, -0.12, 0];
    zonaTexto = [-1, -0.05, 1, 1];
  }

  return {
    apilado,
    ancho,
    alto,
    escala,
    pos,
    rot,
    zonaTexto,
    centro: [pos[0] + MEDIDAS.centroX * escala, pos[1], 0],
  };
}

export type Caos = {
  /** posicion en el caos (mundo) */
  p: V3;
  /** eje y angulo de la rotacion inicial */
  eje: V3;
  angulo: number;
  /** tamaño en el caos */
  s: [number, number];
  /** demora de salida, fase, vuelo en z, velocidad propia */
  rnd: [number, number, number, number];
};

/**
 * El fragmento i del grupo en el caos. El texto vive a la izquierda (desktop)
 * o arriba (mobile): la mayoria del caos lo esquiva.
 */
export function caosDe(g: Grupo, i: number, enc: Pick<Encuadre, "apilado" | "ancho" | "alto">, movil: boolean): Caos {
  const r = (k: number) => g.azar[i * AZAR + k];
  const c = g.casilleros[i];
  const [tw, th] = TAM_CAOS[g.tipo];

  // repartido en todo el cuadro, con profundidad
  const z = -3.6 + r(2) * 5;
  const abre = (CAM.z - z) / CAM.z;
  let u: number;
  let w: number;
  if (enc.apilado) {
    u = r(0) - 0.5;
    w = Math.pow(r(1), 1.25) - 0.5;
    // mobile: el texto vive arriba; casi todo el caos se corre abajo
    if (w > -0.04 && r(8) < 0.72) w = -0.5 + r(9) * 0.46;
  } else {
    u = 1 - Math.pow(1 - r(0), 1.2) - 0.5;
    w = r(1) - 0.5;
    // desktop: la mayoria esquiva el texto hacia la derecha o hacia las
    // franjas de arriba y abajo
    if (u < 0.03 && w > -0.36 && w < 0.38 && r(8) < 0.82) {
      if (r(9) < 0.62) u = 0.05 + r(0) * 0.45;
      else w = w > 0 ? 0.38 + r(1) * 0.1 : -0.36 - r(1) * 0.12;
    }
  }

  const tam = (0.8 + r(7) * 0.45) * (movil ? 0.78 : 1);
  const demora = Math.min(0.45, c.orden * 0.86 + r(5) * 0.06);
  return {
    p: [u * enc.ancho * 1.02 * abre, w * enc.alto * 0.94 * abre, z],
    eje: normalizar([r(3) - 0.5, r(4) - 0.5, r(5) - 0.5 + 1.1]),
    angulo: (r(6) - 0.5) * 2.6,
    s: [tw * tam, th * tam],
    rnd: [demora, r(4), (0.5 + r(3) * 1.1) * (movil ? 0.6 : 1), 0.6 + r(6) * 0.6],
  };
}

/** Deriva del caos en el instante t (la misma del vertex shader). */
export function deriva(rnd: Caos["rnd"], t: number): { d: V3; giro: number } {
  const tt = t * rnd[3];
  const s = rnd[1] * 6.2831;
  return {
    d: [Math.sin(tt * 0.53 + s) * 0.22, Math.cos(tt * 0.41 + s * 1.3) * 0.18, Math.sin(tt * 0.37 + s * 0.7) * 0.35],
    giro: tt * 0.16 + Math.sin(tt * 0.3 + s) * 0.25,
  };
}

/** Profundidad a brillo, como en el shader de fragmentos. */
export function brilloProfundidad(z: number) {
  const t = Math.min(1, Math.max(0, (z + 4) / 5.5));
  return 0.35 + 0.65 * t * t * (3 - 2 * t);
}

/** Cuanto se atenua el caos detras del texto (1 nada, 0.14 lo maximo). */
export function atenuacion(ndcX: number, ndcY: number, zona: Encuadre["zonaTexto"]) {
  const ss = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const adentro =
    ss(zona[0] - 0.2, zona[0], ndcX) *
    (1 - ss(zona[2], zona[2] + 0.3, ndcX)) *
    ss(zona[1] - 0.2, zona[1], ndcY) *
    (1 - ss(zona[3], zona[3] + 0.2, ndcY));
  return 1 - adentro * 0.86;
}

