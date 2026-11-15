import * as THREE from "three";
import {
  ALTO_PANTALLA_SOBRE_BISAGRA,
  MEDIDAS,
  NOTIFICACION,
  PANEL,
  TIPOS,
  TRAMOS,
  armarCasilleros,
  armarContadores,
  indiceIcono,
  type Casillero,
  type Superficie,
  type Tipo,
} from "./plano";
import { FORMAS_ICONO, FORMA_CARRITO, ICONOS, SEGMENTOS_ICONO, type Segmento } from "./iconos";

/**
 * Geometrias y shaders del hero 3D.
 *
 * Todo el movimiento de los fragmentos vive en el vertex shader: la CPU solo
 * actualiza un puñado de uniforms por frame (progreso, tiempo, mouse, pulso).
 * Cada tipo de fragmento es UN draw call de lineas y otro de relleno, con
 * geometria instanciada, sin importar cuantos fragmentos haya.
 *
 * Las lineas son gl.LINES de 1px: el trazo fino de un plotter, y lo mas barato
 * que puede dibujar una GPU.
 *
 * Relojes y carritos llegan a la barra lateral y se transforman en iconos
 * distintos (inicio, productos, pedidos...): su geometria trae un casillero de
 * morfeo por icono y cada instancia enciende solo el suyo.
 * Una vez armado, el panel vive solo: barras que se llenan, contadores que
 * suben y una notificacion de pedido nuevo en el celular. Todo en el shader.
 */

// ── formas base 2D, normalizadas a [-0.5, 0.5] ───────────────────────────
// Cada segmento trae su posicion en el caos, su posicion ya ordenada (alt)
// y un nivel de detalle: 0 estructura, 0.5 contenido (queda tenue), 1 solo
// existe en el caos (la colita del chat, el doblez del post-it).

type Seg = {
  a: [number, number];
  b: [number, number];
  aa?: [number, number];
  bb?: [number, number];
  det: number;
  /** linea de contenido: al ordenarse su largo cambia en cada casillero */
  varia?: boolean;
};

function seg(
  a: [number, number],
  b: [number, number],
  det = 0,
  aa?: [number, number],
  bb?: [number, number]
): Seg {
  return { a, b, det, aa, bb };
}

/** Marca segmentos como lineas de contenido de largo variable. */
function varia(segs: Seg[]): Seg[] {
  return segs.map((x) => ({ ...x, varia: true }));
}

function poli(puntos: [number, number][], det = 0, cerrado = false, alt?: [number, number][]): Seg[] {
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
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poli(pts, det, true);
}

/** Linea escrita a mano que al ordenarse queda recta. */
function garabato(x0: number, x1: number, y: number, det = 0.5): Seg[] {
  const pts: [number, number][] = [];
  const alt: [number, number][] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, y + Math.sin(i * 2.1 + y * 9) * 0.045]);
    alt.push([x, y]);
  }
  return poli(pts, det, false, alt);
}

function formaLineas(tipo: Tipo): Seg[] {
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
      const zz: [number, number][] = [[0.5, 0.5], [-0.5, 0.5]];
      const zzAlt: [number, number][] = [[0.5, 0.5], [-0.5, 0.5]];
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
      return [
        ...circulo(0, 0, 0.5, 20),
        seg([0, 0], [0, 0.32], 0.5),
        seg([0, 0], [0.22, -0.08], 0.5),
      ];
    case "carrito":
      return FORMA_CARRITO.map(([a, b]) => seg([a[0], a[1]], [b[0], b[1]]));
  }
}

/**
 * Relojes y carritos: un casillero de morfeo por icono. En cada uno, el
 * segmento i del caos viaja al segmento i del icono. Lo que sobra de un lado
 * se desvanece en su lugar (det 1) y lo que falta nace en su destino (nace 1).
 */
function lineasIconos(tipo: "reloj" | "carrito") {
  const caos = formaLineas(tipo);
  const n = SEGMENTOS_ICONO;
  const total = ICONOS.length * n;
  const pos = new Float32Array(total * 6);
  const alt = new Float32Array(total * 4);
  const meta = new Float32Array(total * 8);
  ICONOS.forEach((icono, k) => {
    const destino: readonly Segmento[] = FORMAS_ICONO[icono];
    for (let i = 0; i < n; i++) {
      const j = k * n + i;
      const c = caos[i];
      const d = destino[i];
      let a: readonly [number, number] = [0, 0];
      let b: readonly [number, number] = [0, 0];
      let aa = a;
      let bb = b;
      let dt = 1;
      let nc = 1;
      if (c && d) {
        [a, b, aa, bb, dt, nc] = [c.a, c.b, d[0], d[1], 0, 0];
      } else if (c) {
        [a, b, aa, bb, dt, nc] = [c.a, c.b, c.a, c.b, 1, 0];
      } else if (d) {
        [a, b, aa, bb, dt, nc] = [d[0], d[1], d[0], d[1], 0, 1];
      }
      pos.set([a[0], a[1], 0, b[0], b[1], 0], j * 6);
      alt.set([aa[0], aa[1], bb[0], bb[1]], j * 4);
      meta.set([dt, 0, nc, k, dt, 0, nc, k], j * 8);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAlt", new THREE.BufferAttribute(alt, 2));
  geo.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  return geo;
}

// ── atributos instanciados ────────────────────────────────────────────────

export type Instancias = {
  tipo: Tipo;
  casilleros: Casillero[];
  attrs: {
    aP0: THREE.InstancedBufferAttribute;
    aQ0: THREE.InstancedBufferAttribute;
    aS0: THREE.InstancedBufferAttribute;
    aP1: THREE.InstancedBufferAttribute;
    aQ1: THREE.InstancedBufferAttribute;
    aS1: THREE.InstancedBufferAttribute;
    aRnd: THREE.InstancedBufferAttribute;
    aExtra: THREE.InstancedBufferAttribute;
  };
  /** azar fijo por instancia para recalcular el caos al cambiar el tamaño */
  azar: Float32Array;
};

/** numeros al azar fijos por instancia */
const AZAR = 10;

function attr(n: number, size: number) {
  return new THREE.InstancedBufferAttribute(new Float32Array(n * size), size);
}

export function crearInstancias(casilleros: Casillero[], semilla = 7): Instancias[] {
  let s = semilla;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return TIPOS.map((tipo) => {
    const propios = casilleros.filter((c) => c.tipo === tipo);
    const n = propios.length;
    const azar = new Float32Array(n * AZAR);
    for (let i = 0; i < azar.length; i++) azar[i] = rnd();
    // icono, tipo de loop (1 barra, 2 KPI) y fase: las barras se llenan en ola
    const aExtra = attr(n, 3);
    const barras = propios.filter((c) => c.vivo === "barra").length;
    let b = 0;
    propios.forEach((c, i) => {
      const tipoLoop = c.vivo === "barra" ? 1 : c.vivo === "kpi" ? 2 : 0;
      const fase = c.vivo === "barra" ? (b++ / Math.max(1, barras)) * 0.45 : 0;
      aExtra.setXYZ(i, indiceIcono(c), tipoLoop, fase);
    });
    return {
      tipo,
      casilleros: propios,
      attrs: {
        aP0: attr(n, 3),
        aQ0: attr(n, 4),
        aS0: attr(n, 2),
        aP1: attr(n, 3),
        aQ1: attr(n, 4),
        aS1: attr(n, 2),
        aRnd: attr(n, 4),
        aExtra,
      },
      azar,
    };
  });
}

/** Tamaño de cada tipo en el caos (ancho, alto), antes del azar. */
const TAM_CAOS: Record<Tipo, [number, number]> = {
  chat: [0.62, 0.36],
  celda: [0.78, 0.2],
  postit: [0.42, 0.42],
  ticket: [0.34, 0.6],
  reloj: [0.3, 0.3],
  carrito: [0.34, 0.3],
};

export type Encuadre = {
  /** layout apilado (mobile y tablet): sistema abajo del texto */
  apilado: boolean;
  ancho: number;
  alto: number;
  escala: number;
  pos: THREE.Vector3;
  rot: THREE.Euler;
  /** rectangulo NDC donde vive el texto (x0, y0, x1, y1): ahi el caos se atenua */
  zonaTexto: THREE.Vector4;
  /** centro del sistema en el mundo, para la orbita final */
  centro: THREE.Vector3;
};

export const CAM = { fov: 35, z: 10 };

export function calcularEncuadre(anchoPx: number, altoPx: number): Encuadre {
  const aspecto = anchoPx / Math.max(1, altoPx);
  const alto = 2 * CAM.z * Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2));
  const ancho = alto * aspecto;
  const apilado = anchoPx < 1024;

  let escala: number;
  const pos = new THREE.Vector3();
  const rot = new THREE.Euler();
  const zonaTexto = new THREE.Vector4();

  if (!apilado) {
    escala = Math.min(1, (ancho * 0.42) / MEDIDAS.ancho, (alto * 0.56) / MEDIDAS.alto);
    const cx = ancho / 2 - ancho * 0.275;
    pos.set(cx - MEDIDAS.centroX * escala, -0.12 * escala, 0);
    rot.set(0.3, -0.44, 0);
    zonaTexto.set(-1, -0.7, 0.02, 0.75);
  } else {
    // mobile: el sistema abajo y un poco mas chico, sin pisar el texto
    escala = Math.min((ancho * 0.74) / MEDIDAS.ancho, (alto * 0.25) / MEDIDAS.alto);
    pos.set(-(MEDIDAS.centroX + 0.12) * escala, -alto / 2 + alto * 0.225, 0);
    rot.set(0.34, -0.12, 0);
    zonaTexto.set(-1, -0.05, 1, 1);
  }

  return {
    apilado,
    ancho,
    alto,
    escala,
    pos,
    rot,
    zonaTexto,
    centro: new THREE.Vector3(pos.x + MEDIDAS.centroX * escala, pos.y, 0),
  };
}

// ── el sistema: superficies y lineas de los aparatos ──────────────────────

export type Sistema = {
  grupo: THREE.Group;
  superficies: Record<Superficie, THREE.Object3D>;
  material: THREE.ShaderMaterial;
  materialPantallas: THREE.ShaderMaterial;
  dispose: () => void;
};

type P3 = [number, number, number];

/** Arma las lineas de los aparatos. aLen es el orden de dibujo (0..1). */
function lineasAparato(segmentos: [P3, P3][], detalle: number[] = []) {
  const n = segmentos.length;
  const pos = new Float32Array(n * 6);
  const len = new Float32Array(n * 2);
  segmentos.forEach(([a, b], i) => {
    pos.set(a, i * 6);
    pos.set(b, i * 6 + 3);
    const t = i / Math.max(1, n - 1);
    len[i * 2] = t;
    len[i * 2 + 1] = Math.min(1, t + 0.6 / n);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aLen", new THREE.BufferAttribute(len, 1));
  const det = new Float32Array(n * 2);
  detalle.forEach((d, i) => {
    det[i * 2] = d;
    det[i * 2 + 1] = d;
  });
  geo.setAttribute("aDet", new THREE.BufferAttribute(det, 1));
  return geo;
}

function rect3(x0: number, y0: number, x1: number, y1: number, z = 0): [P3, P3][] {
  return [
    [[x0, y0, z], [x1, y0, z]],
    [[x1, y0, z], [x1, y1, z]],
    [[x1, y1, z], [x0, y1, z]],
    [[x0, y1, z], [x0, y0, z]],
  ];
}

/** Caja fina: frente, dorso y las cuatro aristas que los unen. */
function placa(x0: number, y0: number, x1: number, y1: number, espesor: number, completa: boolean): [P3, P3][] {
  const out = rect3(x0, y0, x1, y1, 0);
  if (!completa) return out;
  out.push(...rect3(x0, y0, x1, y1, -espesor));
  out.push(
    [[x0, y0, 0], [x0, y0, -espesor]],
    [[x1, y0, 0], [x1, y0, -espesor]],
    [[x1, y1, 0], [x1, y1, -espesor]],
    [[x0, y1, 0], [x0, y1, -espesor]]
  );
  return out;
}

const VERT_APARATO = /* glsl */ `
  attribute float aLen;
  attribute float aDet;
  varying float vLen;
  varying float vDet;
  varying vec3 vW;
  void main() {
    vLen = aLen;
    vDet = aDet;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG_APARATO = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uDraw;
  uniform float uAlpha;
  uniform float uOn;
  uniform float uPulseX;
  uniform float uPulse;
  varying float vLen;
  varying float vDet;
  varying vec3 vW;
  void main() {
    if (vLen > uDraw) discard;
    // la punta del plotter: brilla donde se esta dibujando
    float punta = smoothstep(uDraw - 0.05, uDraw, vLen) * step(uDraw, 0.995);
    float banda = exp(-pow((vW.x + vW.y * 0.35 - uPulseX) / 0.5, 2.0)) * uPulse;
    float a = uAlpha * mix(1.0, 0.45, vDet) * (0.55 + 0.45 * uOn) + punta * 0.6 + banda * 0.5;
    gl_FragColor = vec4(mix(uColor, uHot, clamp(punta + banda * 0.7, 0.0, 1.0)), a);
  }
`;

const VERT_PANTALLA = /* glsl */ `
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG_PANTALLA = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOn;
  uniform float uDraw;
  uniform float uPulseX;
  uniform float uPulse;
  uniform float uZoom;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    float banda = exp(-pow((vW.x + vW.y * 0.35 - uPulseX) / 0.7, 2.0)) * uPulse;
    // la pantalla se enciende de arriba hacia abajo
    float barrido = smoothstep(1.0 - uOn * 1.2, 1.0 - uOn * 1.2 + 0.2, vUv.y);
    float a = 0.018 * smoothstep(0.3, 1.0, uDraw) + 0.06 * barrido + banda * 0.07 + uZoom * 0.05;
    gl_FragColor = vec4(uColor, a);
  }
`;

// ── el panel vivo: contadores de siete segmentos y la notificacion ──────
// Geometria fija pegada a la pantalla y al celular. Aparece cuando el sistema
// se enciende (uLoop) y se mueve solo con uTime: la CPU no hace nada.

const VERT_VIVO = /* glsl */ `
  uniform float uTime;
  uniform float uLoop;
  attribute vec4 aDig;
  attribute float aKind;
  attribute float aPeso;
  varying float vA;
  varying vec3 vW;

  // segmentos encendidos de cada digito (bits a..g)
  float mascara(float d) {
    if (d < 0.5) return 63.0;
    if (d < 1.5) return 6.0;
    if (d < 2.5) return 91.0;
    if (d < 3.5) return 79.0;
    if (d < 4.5) return 102.0;
    if (d < 5.5) return 109.0;
    if (d < 6.5) return 125.0;
    if (d < 7.5) return 7.0;
    if (d < 8.5) return 127.0;
    return 111.0;
  }

  void main() {
    vec3 p = position;
    float a;
    if (aKind < 0.5) {
      // contador: el valor sube solo; cada vertice sabe su digito y segmento
      float valor = floor(aDig.z + uTime * aDig.w);
      float d = mod(floor((valor + 0.5) / pow(10.0, aDig.y)), 10.0);
      a = mod(floor((mascara(d) + 0.5) / pow(2.0, aDig.x)), 2.0);
    } else {
      // notificacion de pedido nuevo: baja, se queda y se va, cada 5 s
      float ciclo = fract(uTime / 5.0 + 0.35);
      float entra = smoothstep(0.0, 0.07, ciclo);
      float sale = smoothstep(0.62, 0.7, ciclo);
      p.y += (1.0 - entra) * 0.2;
      a = entra * (1.0 - sale);
    }
    vA = a * uLoop * aPeso;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG_VIVO = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uPulseX;
  uniform float uPulse;
  varying float vA;
  varying vec3 vW;
  void main() {
    if (vA < 0.01) discard;
    float banda = exp(-pow((vW.x + vW.y * 0.35 - uPulseX) / 0.45, 2.0)) * uPulse;
    gl_FragColor = vec4(mix(uColor, uHot, clamp(0.25 + banda * 0.6, 0.0, 1.0)), vA * (0.8 + banda * 0.3));
  }
`;

/** Segmentos a..g de un digito de siete segmentos (esquina inferior izquierda). */
function sieteSegmentos(x0: number, y0: number, an: number, al: number): [P3, P3][] {
  const s = al * 0.06;
  const x1 = x0 + an;
  const y1 = y0 + al;
  const ym = y0 + al / 2;
  const z = 0.014;
  return [
    [[x0 + s, y1, z], [x1 - s, y1, z]],
    [[x1, y1 - s, z], [x1, ym + s, z]],
    [[x1, ym - s, z], [x1, y0 + s, z]],
    [[x0 + s, y0, z], [x1 - s, y0, z]],
    [[x0, ym - s, z], [x0, y0 + s, z]],
    [[x0, y1 - s, z], [x0, ym + s, z]],
    [[x0 + s, ym, z], [x1 - s, ym, z]],
  ];
}

function geoVivo(segs: [P3, P3][], dig: number[][], kind: number) {
  const n = segs.length;
  const pos = new Float32Array(n * 6);
  const aDig = new Float32Array(n * 8);
  segs.forEach(([a, b], i) => {
    pos.set(a, i * 6);
    pos.set(b, i * 6 + 3);
    const d = dig[i] ?? [0, 0, 0, 0];
    aDig.set(d, i * 8);
    aDig.set(d, i * 8 + 4);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDig", new THREE.BufferAttribute(aDig, 4));
  geo.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(n * 2).fill(kind), 1));
  geo.setAttribute("aPeso", new THREE.BufferAttribute(new Float32Array(n * 2).fill(1), 1));
  return geo;
}

function geoContadores(denso: boolean) {
  const segs: [P3, P3][] = [];
  const dig: number[][] = [];
  for (const c of armarContadores(denso)) {
    const an = c.alto * 0.5;
    const gap = c.alto * 0.24;
    for (let k = 0; k < c.digitos; k++) {
      const x0 = c.x - an - k * (an + gap);
      sieteSegmentos(x0, c.y, an, c.alto).forEach((sg, i) => {
        segs.push(sg);
        dig.push([i, k, c.base, c.ritmo]);
      });
    }
  }
  return geoVivo(segs, dig, 0);
}

function geoNotificacion() {
  const { x, y, w, h } = NOTIFICACION;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const y0 = y - h / 2;
  const y1 = y + h / 2;
  const z = 0.02;
  const lado = h * 0.5;
  const ix = x0 + h * 0.25;
  const iy = y - lado / 2;
  const segs: [P3, P3][] = [
    ...rect3(x0, y0, x1, y1, z),
    ...rect3(ix, iy, ix + lado, iy + lado, z),
    [[ix + lado * 0.3, iy + lado * 0.5, z], [ix + lado * 0.45, iy + lado * 0.3, z]],
    [[ix + lado * 0.45, iy + lado * 0.3, z], [ix + lado * 0.75, iy + lado * 0.72, z]],
    [[ix + lado + 0.08, y + h * 0.14, z], [x1 - 0.12, y + h * 0.14, z]],
    [[ix + lado + 0.08, y - h * 0.16, z], [x0 + w * 0.6, y - h * 0.16, z]],
  ];
  return geoVivo(segs, [], 1);
}

export function crearSistema(
  uniforms: Record<string, THREE.IUniform>,
  liviano: boolean
): Sistema {
  const grupo = new THREE.Group();
  const m = MEDIDAS;

  // bisagra y superficies
  const bisagra = new THREE.Object3D();
  bisagra.position.set(0, m.bisagra.y, 0);
  bisagra.rotation.x = m.bisagra.inclinacion;
  const pantalla = new THREE.Object3D();
  pantalla.position.set(0, ALTO_PANTALLA_SOBRE_BISAGRA, 0);
  bisagra.add(pantalla);

  const base = new THREE.Object3D();
  base.position.set(0, m.bisagra.y, 0);
  base.rotation.x = -Math.PI / 2;

  const celular = new THREE.Object3D();
  celular.position.set(m.celular.x, m.celular.y, m.celular.z);
  celular.rotation.y = m.celular.rotY;

  grupo.add(bisagra, base, celular);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: uniforms.uColor,
      uHot: uniforms.uHot,
      uDraw: uniforms.uDraw,
      uAlpha: { value: 0.55 },
      uOn: uniforms.uOn,
      uPulseX: uniforms.uPulseX,
      uPulse: uniforms.uPulse,
    },
    vertexShader: VERT_APARATO,
    fragmentShader: FRAG_APARATO,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const materialPantallas = new THREE.ShaderMaterial({
    uniforms: {
      uColor: uniforms.uColor,
      uOn: uniforms.uOn,
      uDraw: uniforms.uDraw,
      uPulseX: uniforms.uPulseX,
      uPulse: uniforms.uPulse,
      uZoom: uniforms.uZoom,
    },
    vertexShader: VERT_PANTALLA,
    fragmentShader: FRAG_PANTALLA,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const geos: THREE.BufferGeometry[] = [];
  const agregarLineas = (padre: THREE.Object3D, segs: [P3, P3][], det: number[] = []) => {
    const geo = lineasAparato(segs, det);
    geos.push(geo);
    const lineas = new THREE.LineSegments(geo, material);
    lineas.frustumCulled = false;
    padre.add(lineas);
  };
  const agregarPantalla = (padre: THREE.Object3D, w: number, h: number) => {
    const geo = new THREE.PlaneGeometry(w, h);
    geos.push(geo);
    const malla = new THREE.Mesh(geo, materialPantallas);
    malla.position.z = -0.005;
    malla.frustumCulled = false;
    padre.add(malla);
  };

  // ── notebook: pantalla ──
  const { hw, hh, bisel } = m.pantalla;
  const p = PANEL;
  const segPantalla: [P3, P3][] = [
    ...placa(-hw - bisel, -hh - bisel, hw + bisel, hh + bisel, 0.06, !liviano),
    ...rect3(-hw, -hh, hw, hh),
  ];
  const detPantalla = segPantalla.map(() => 0);
  const divisiones: [P3, P3][] = [
    [[-hw, p.barraY, 0], [hw, p.barraY, 0]],
    [[p.lateralX, -hh, 0], [p.lateralX, p.barraY, 0]],
    ...rect3(p.grafico.x0, p.grafico.y0, p.grafico.x1, p.grafico.y1),
    ...rect3(p.pedidos.x0, p.pedidos.y0, p.pedidos.x1, p.pedidos.y1),
    ...rect3(p.tabla.x0, p.tabla.y0, p.tabla.x1, p.tabla.y1),
  ];
  segPantalla.push(...divisiones);
  detPantalla.push(...divisiones.map(() => 1));
  agregarLineas(pantalla, segPantalla, detPantalla);
  agregarPantalla(pantalla, hw * 2, hh * 2);

  // ── notebook: base con teclado y trackpad ──
  const b = m.base;
  const segBase: [P3, P3][] = [
    ...rect3(-b.hw, -b.prof, b.hw, 0),
    [[-b.hw, -b.prof, 0], [-b.hw, -b.prof, -b.espesor]],
    [[b.hw, -b.prof, 0], [b.hw, -b.prof, -b.espesor]],
    [[-b.hw, -b.prof, -b.espesor], [b.hw, -b.prof, -b.espesor]],
    [[-b.hw, 0, -b.espesor], [-b.hw, -b.prof, -b.espesor]],
    [[b.hw, 0, -b.espesor], [b.hw, -b.prof, -b.espesor]],
  ];
  const detBase = segBase.map(() => 0);
  const tecl: [P3, P3][] = [
    ...rect3(p.teclado.x0 - 0.06, p.teclado.y0 - 0.06, p.teclado.x1 + 0.06, p.teclado.y1 + 0.06),
    ...rect3(
      p.trackpad.x - p.trackpad.w / 2 - 0.04,
      p.trackpad.y - p.trackpad.h / 2 - 0.04,
      p.trackpad.x + p.trackpad.w / 2 + 0.04,
      p.trackpad.y + p.trackpad.h / 2 + 0.04
    ),
  ];
  segBase.push(...tecl);
  detBase.push(...tecl.map(() => 1));
  agregarLineas(base, segBase, detBase);

  // ── celular ──
  const c = m.celular;
  const segCel: [P3, P3][] = [
    ...placa(-c.hw - c.bisel, -c.hh - c.bisel - 0.04, c.hw + c.bisel, c.hh + c.bisel + 0.04, 0.09, !liviano),
    ...rect3(-c.hw, -c.hh, c.hw, c.hh),
    [[-0.12, c.hh + 0.06, 0], [0.12, c.hh + 0.06, 0]],
    [[-0.18, -c.hh - 0.07, 0], [0.18, -c.hh - 0.07, 0]],
  ];
  agregarLineas(celular, segCel);
  agregarPantalla(celular, c.hw * 2, c.hh * 2);

  // ── el panel vivo: contadores en la notebook, pedido nuevo en el celular ──
  const materialVivo = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uLoop: uniforms.uLoop,
      uColor: uniforms.uColor,
      uHot: uniforms.uHot,
      uPulseX: uniforms.uPulseX,
      uPulse: uniforms.uPulse,
    },
    vertexShader: VERT_VIVO,
    fragmentShader: FRAG_VIVO,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const agregarVivo = (padre: THREE.Object3D, objeto: THREE.Object3D) => {
    objeto.frustumCulled = false;
    padre.add(objeto);
  };
  const geoCont = geoContadores(!liviano);
  const geoNoti = geoNotificacion();
  // relleno de la notificacion: tapa apenas lo que tiene detras
  const n = NOTIFICACION;
  const geoNotiFondo = new THREE.PlaneGeometry(n.w, n.h);
  geoNotiFondo.translate(n.x, n.y, 0.016);
  const cuenta = geoNotiFondo.getAttribute("position").count;
  geoNotiFondo.setAttribute("aDig", new THREE.BufferAttribute(new Float32Array(cuenta * 4), 4));
  geoNotiFondo.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(cuenta).fill(1), 1));
  geoNotiFondo.setAttribute("aPeso", new THREE.BufferAttribute(new Float32Array(cuenta).fill(0.14), 1));
  geos.push(geoCont, geoNoti, geoNotiFondo);
  agregarVivo(pantalla, new THREE.LineSegments(geoCont, materialVivo));
  agregarVivo(celular, new THREE.Mesh(geoNotiFondo, materialVivo));
  agregarVivo(celular, new THREE.LineSegments(geoNoti, materialVivo));

  return {
    grupo,
    superficies: { pantalla, base, celular },
    material,
    materialPantallas,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      material.dispose();
      materialPantallas.dispose();
      materialVivo.dispose();
    },
  };
}

// ── fragmentos ────────────────────────────────────────────────────────────

const VERT_FRAG = /* glsl */ `
  uniform float uA;
  uniform float uTime;
  uniform float uRepel;
  uniform float uLoop;
  uniform vec2 uMouse;
  uniform vec4 uZona;
  attribute vec2 aAlt;
  // por vertice: detalle, largo variable, nace al ordenarse, casillero de icono
  attribute vec4 aMeta;
  // por instancia: icono, tipo de loop, fase del loop
  attribute vec3 aExtra;
  attribute vec3 aP0;
  attribute vec4 aQ0;
  attribute vec2 aS0;
  attribute vec3 aP1;
  attribute vec4 aQ1;
  attribute vec2 aS1;
  attribute vec4 aRnd;
  varying float vA;
  varying float vE;
  varying float vDim;
  varying vec3 vW;

  vec4 qEje(vec3 eje, float ang) {
    float h = ang * 0.5;
    return vec4(normalize(eje) * sin(h), cos(h));
  }
  vec3 qRot(vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
  }
  float suave(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
  }

  void main() {
    // relojes y carritos: cada instancia dibuja solo el casillero de su icono
    float aDet = aMeta.x;
    float aVar = aMeta.y;
    float aNace = aMeta.z;
    vec2 aVivo = aExtra.yz;
    if (abs(aMeta.w - aExtra.x) > 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      vA = 0.0;
      vE = 0.0;
      vDim = 0.0;
      vW = vec3(0.0);
      return;
    }

    // progreso propio de este fragmento: arranca con desfase, viaja 0.55
    float e = suave(clamp((uA - aRnd.x) / 0.55, 0.0, 1.0));
    float t = uTime * aRnd.w;
    float s = aRnd.y * 6.2831;

    // caos: deriva lenta, rotacion sutil y repulsion del puntero
    vec3 p0 = aP0 + vec3(sin(t * 0.53 + s), cos(t * 0.41 + s * 1.3), sin(t * 0.37 + s * 0.7)) * vec3(0.22, 0.18, 0.35);
    vec2 d = p0.xy - uMouse;
    float k = exp(-dot(d, d) / 0.8) * uRepel;
    p0.xy += normalize(d + vec2(0.0001)) * k * 0.7;
    vec4 q0 = qEje(aQ0.xyz, aQ0.w + t * 0.16 + sin(t * 0.3 + s) * 0.25);

    // sistema: casillero fijo
    vec4 q1 = aQ1;
    if (dot(q0, q1) < 0.0) q1 = -q1;
    vec4 q = normalize(mix(q0, q1, e));
    vec2 escala = mix(aS0, aS1, e);
    vec2 forma = mix(position.xy, aAlt, e);

    // lineas de contenido: al ordenarse cada casillero tiene su propio largo,
    // asi las filas y tarjetas no se ven calcadas. En los KPI quedan cortas
    // para dejarle lugar al numero.
    float largo = 0.4 + 0.6 * fract(aRnd.y * 7.31 + aRnd.w * 3.17);
    if (aVivo.x > 1.5) largo *= 0.45;
    forma.x = mix(forma.x, -0.36 + (forma.x + 0.36) * largo, aVar * e);
    vec2 lp = forma * escala;

    // barras del grafico: una vez armado se llenan en ola, en loop
    if (aVivo.x > 0.5 && aVivo.x < 1.5) {
      float ciclo = fract(uTime * 0.11 - aVivo.y);
      float llena = smoothstep(0.02, 0.3, ciclo) * (1.0 - smoothstep(0.86, 0.98, ciclo));
      float k = mix(1.0, 0.16 + 0.84 * llena, uLoop * e);
      lp.y = -0.5 * escala.y + (lp.y + 0.5 * escala.y) * k;
    }
    vec3 pos = mix(p0, aP1, e);
    pos.z += sin(e * 3.14159) * aRnd.z;

    vec4 w = modelMatrix * vec4(qRot(q, vec3(lp, 0.0)) + pos, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;

    // detras del texto el caos baja la voz
    vec2 ndc = gl_Position.xy / gl_Position.w;
    float adentro = smoothstep(uZona.x - 0.2, uZona.x, ndc.x) * (1.0 - smoothstep(uZona.z, uZona.z + 0.3, ndc.x))
                  * smoothstep(uZona.y - 0.2, uZona.y, ndc.y) * (1.0 - smoothstep(uZona.w, uZona.w + 0.2, ndc.y));
    vDim = 1.0 - adentro * 0.86 * (1.0 - e);
    vA = mix(1.0 - aNace, clamp(1.0 - aDet * 1.1, 0.0, 1.0), e);
    vE = e;
  }
`;

const FRAG_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uAlpha;
  uniform float uBanda;
  uniform float uOn;
  uniform float uPulseX;
  uniform float uPulse;
  varying float vA;
  varying float vE;
  varying float vDim;
  varying vec3 vW;
  void main() {
    float prof = mix(0.35, 1.0, smoothstep(-4.0, 1.5, vW.z));
    float a = uAlpha * vA * vDim * mix(prof, 1.0, vE) * (1.0 + uOn * 0.3 * vE);
    float banda = exp(-pow((vW.x + vW.y * 0.35 - uPulseX) / 0.45, 2.0)) * uPulse * vE;
    a += banda * uBanda * vA;
    gl_FragColor = vec4(mix(uColor, uHot, clamp(banda * 0.8, 0.0, 1.0)), a);
  }
`;

export type Fragmentos = {
  objetos: THREE.Object3D[];
  dispose: () => void;
};

function geoInstanciada(base: THREE.BufferGeometry, inst: Instancias) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  for (const nombre of ["position", "aAlt", "aMeta"]) geo.setAttribute(nombre, base.getAttribute(nombre));
  for (const [nombre, a] of Object.entries(inst.attrs)) geo.setAttribute(nombre, a);
  geo.instanceCount = inst.casilleros.length;
  return geo;
}

function lineasBase(tipo: Tipo) {
  const segs = formaLineas(tipo);
  const n = segs.length;
  const pos = new Float32Array(n * 6);
  const alt = new Float32Array(n * 4);
  const meta = new Float32Array(n * 8);
  segs.forEach((s, i) => {
    const aa = s.aa ?? s.a;
    const bb = s.bb ?? s.b;
    pos.set([s.a[0], s.a[1], 0, s.b[0], s.b[1], 0], i * 6);
    alt.set([aa[0], aa[1], bb[0], bb[1]], i * 4);
    const v = s.varia ? 1 : 0;
    meta.set([s.det, v, 0, 0, s.det, v, 0, 0], i * 8);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAlt", new THREE.BufferAttribute(alt, 2));
  geo.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  return geo;
}

function rellenoBase() {
  const geo = new THREE.PlaneGeometry(1, 1);
  const pos = geo.getAttribute("position");
  const alt = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    alt[i * 2] = pos.getX(i);
    alt[i * 2 + 1] = pos.getY(i);
  }
  geo.setAttribute("aAlt", new THREE.BufferAttribute(alt, 2));
  geo.setAttribute("aMeta", new THREE.BufferAttribute(new Float32Array(pos.count * 4), 4));
  return geo;
}

export function crearFragmentos(
  instancias: Instancias[],
  uniforms: Record<string, THREE.IUniform>
): Fragmentos {
  const comunes = {
    uA: uniforms.uA,
    uTime: uniforms.uTime,
    uRepel: uniforms.uRepel,
    uLoop: uniforms.uLoop,
    uMouse: uniforms.uMouse,
    uZona: uniforms.uZona,
    uColor: uniforms.uColor,
    uHot: uniforms.uHot,
    uOn: uniforms.uOn,
    uPulseX: uniforms.uPulseX,
    uPulse: uniforms.uPulse,
  };
  const matLineas = new THREE.ShaderMaterial({
    uniforms: { ...comunes, uAlpha: { value: 0.52 }, uBanda: { value: 0.6 } },
    vertexShader: VERT_FRAG,
    fragmentShader: FRAG_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const matRelleno = new THREE.ShaderMaterial({
    uniforms: { ...comunes, uAlpha: { value: 0.05 }, uBanda: { value: 0.08 } },
    vertexShader: VERT_FRAG,
    fragmentShader: FRAG_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const relleno = rellenoBase();
  const geos: THREE.BufferGeometry[] = [relleno];
  const objetos: THREE.Object3D[] = [];

  for (const inst of instancias) {
    if (inst.casilleros.length === 0) continue;
    const baseL =
      inst.tipo === "reloj" || inst.tipo === "carrito" ? lineasIconos(inst.tipo) : lineasBase(inst.tipo);
    geos.push(baseL);
    const geoL = geoInstanciada(baseL, inst);
    geos.push(geoL);
    const lineas = new THREE.LineSegments(geoL, matLineas);
    lineas.frustumCulled = false;
    objetos.push(lineas);

    // los iconos van sin relleno: son solo trazo
    if (inst.tipo !== "reloj" && inst.tipo !== "carrito") {
      const geoR = geoInstanciada(relleno, inst);
      geos.push(geoR);
      const malla = new THREE.Mesh(geoR, matRelleno);
      malla.frustumCulled = false;
      objetos.push(malla);
    }
  }

  return {
    objetos,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      matLineas.dispose();
      matRelleno.dispose();
    },
  };
}

/**
 * Escribe en los atributos el caos (segun el encuadre) y los destinos (segun
 * donde quedo el sistema). Se llama al montar y cuando cambia el tamaño.
 */
export function ubicarFragmentos(
  instancias: Instancias[],
  sistema: Sistema,
  enc: Encuadre,
  movil: boolean
) {
  sistema.grupo.position.copy(enc.pos);
  sistema.grupo.rotation.copy(enc.rot);
  sistema.grupo.scale.setScalar(enc.escala);
  sistema.grupo.updateMatrixWorld(true);

  const v = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const ejes = new THREE.Vector3();
  const quats: Record<Superficie, THREE.Quaternion> = {
    pantalla: sistema.superficies.pantalla.getWorldQuaternion(new THREE.Quaternion()),
    base: sistema.superficies.base.getWorldQuaternion(new THREE.Quaternion()),
    celular: sistema.superficies.celular.getWorldQuaternion(new THREE.Quaternion()),
  };
  const factorTam = movil ? 0.78 : 1;

  for (const inst of instancias) {
    const { aP0, aQ0, aS0, aP1, aQ1, aS1, aRnd } = inst.attrs;
    const [tw, th] = TAM_CAOS[inst.tipo];

    inst.casilleros.forEach((c, i) => {
      const r = (k: number) => inst.azar[i * AZAR + k];

      // caos: repartido en todo el cuadro, con profundidad
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
        // desktop: el texto vive a la izquierda. La mayoria del caos lo
        // esquiva hacia la derecha o hacia las franjas de arriba y abajo.
        if (u < 0.03 && w > -0.36 && w < 0.38 && r(8) < 0.82) {
          if (r(9) < 0.62) u = 0.05 + r(0) * 0.45;
          else w = w > 0 ? 0.38 + r(1) * 0.1 : -0.36 - r(1) * 0.12;
        }
      }
      aP0.setXYZ(i, u * enc.ancho * 1.02 * abre, w * enc.alto * 0.94 * abre, z);

      ejes.set(r(3) - 0.5, r(4) - 0.5, r(5) - 0.5 + 1.1).normalize();
      aQ0.setXYZW(i, ejes.x, ejes.y, ejes.z, (r(6) - 0.5) * 2.6);

      const tam = (0.8 + r(7) * 0.45) * factorTam;
      aS0.setXY(i, tw * tam, th * tam);

      // destino: el casillero, llevado al mundo por su superficie
      const sup = sistema.superficies[c.sup];
      v.set(c.x, c.y, 0.012).applyMatrix4(sup.matrixWorld);
      aP1.setXYZ(i, v.x, v.y, v.z);
      q.copy(quats[c.sup]);
      aQ1.setXYZW(i, q.x, q.y, q.z, q.w);
      aS1.setXY(i, c.w * enc.escala, c.h * enc.escala);

      // desfase: el orden del casillero manda, con un poco de azar
      const demora = Math.min(0.45, c.orden * 0.86 + r(5) * 0.06);
      aRnd.setXYZW(i, demora, r(4), (0.5 + r(3) * 1.1) * (movil ? 0.6 : 1), 0.6 + r(6) * 0.6);
    });

    for (const a of Object.values(inst.attrs)) a.needsUpdate = true;
  }
}

// ── la escena completa ────────────────────────────────────────────────────

function tramo(v: number, [a, b]: readonly [number, number]) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

function suaveJS(t: number) {
  return t * t * (3 - 2 * t);
}

const PERIODO_TRAZO = 5.2;
const MEDIDA_HALO = 9;

export type EntradaCuadro = {
  /** progreso de scroll ya suavizado (0..1) */
  p: number;
  t: number;
  /** mouse normalizado (-1..1) y suavizado, para el parallax */
  mx: number;
  my: number;
  /** mouse crudo (-1..1) para la repulsion */
  rx: number;
  ry: number;
  repel: number;
  camara: THREE.Camera;
};

export type Escena = {
  raiz: THREE.Group;
  colores: (acento: string, caliente: string) => void;
  encuadrar: (anchoPx: number, altoPx: number) => void;
  cuadro: (e: EntradaCuadro) => void;
  dispose: () => void;
};

/**
 * Arma la escena entera y devuelve su control. Todo lo mutable (uniforms,
 * camara, encuadre) vive aca adentro, fuera del ciclo de render de React.
 */
export function crearEscena(movil: boolean): Escena {
  const uniforms: Record<string, THREE.IUniform> = {
    uA: { value: 0 },
    uTime: { value: 0 },
    uRepel: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uZona: { value: new THREE.Vector4(-1, -1, -1, -1) },
    uColor: { value: new THREE.Color() },
    uHot: { value: new THREE.Color() },
    uOn: { value: 0 },
    uDraw: { value: 0 },
    uPulseX: { value: -99 },
    uPulse: { value: 0 },
    uGlow: { value: 0 },
    uLoop: { value: 0 },
    uZoom: { value: 0 },
  };

  const instancias = crearInstancias(armarCasilleros(!movil));
  const sistema = crearSistema(uniforms, movil);
  const fragmentos = crearFragmentos(instancias, uniforms);

  // halo celeste detras del sistema: un sprite, no postprocesado
  const geoHalo = new THREE.PlaneGeometry(1, 1);
  const matHalo = new THREE.ShaderMaterial({
    uniforms: { uColor: uniforms.uColor, uGlow: uniforms.uGlow },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uGlow;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        gl_FragColor = vec4(uColor, pow(clamp(1.0 - d, 0.0, 1.0), 2.2) * uGlow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(geoHalo, matHalo);
  halo.frustumCulled = false;

  const raiz = new THREE.Group();
  raiz.add(halo, sistema.grupo, ...fragmentos.objetos);

  let enc = calcularEncuadre(1440, 900);
  const pivote = new THREE.Vector3();
  const eje = new THREE.Vector3(0, 1, 0);
  // camara: pose de siempre y pose "adentro de la pantalla"
  const camBase = new THREE.Vector3();
  const camDentro = new THREE.Vector3();
  const mira = new THREE.Vector3();
  const centroPantalla = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const arriba = new THREE.Vector3();
  const giroPantalla = new THREE.Quaternion();
  const ARRIBA = new THREE.Vector3(0, 1, 0);
  const ORIGEN = new THREE.Vector3(0, 0, 0);

  return {
    raiz,

    // Sin conversion de espacio de color: el shader escribe el valor tal
    // cual, asi el celeste del canvas es el mismo que el del CSS.
    colores(acento, caliente) {
      if (acento) (uniforms.uColor.value as THREE.Color).setStyle(acento, THREE.LinearSRGBColorSpace);
      if (caliente) (uniforms.uHot.value as THREE.Color).setStyle(caliente, THREE.LinearSRGBColorSpace);
    },

    encuadrar(anchoPx, altoPx) {
      enc = calcularEncuadre(anchoPx, altoPx);
      ubicarFragmentos(instancias, sistema, enc, movil);
      (uniforms.uZona.value as THREE.Vector4).copy(enc.zonaTexto);
      halo.position.set(enc.centro.x, enc.centro.y + 0.2 * enc.escala, -1.5);
      halo.scale.setScalar(MEDIDA_HALO * enc.escala);
    },

    cuadro({ p, t, mx, my, rx, ry, repel, camara }) {
      uniforms.uTime.value = t;
      uniforms.uA.value = tramo(p, TRAMOS.ensamble);
      const dibujo = suaveJS(tramo(p, TRAMOS.dibujo));
      uniforms.uDraw.value = dibujo;
      const on = suaveJS(tramo(p, TRAMOS.encendido));
      uniforms.uOn.value = on;
      uniforms.uLoop.value = on;
      const zoom = suaveJS(tramo(p, TRAMOS.zoom));
      uniforms.uZoom.value = zoom;
      uniforms.uGlow.value = (0.05 + 0.17 * dibujo + 0.2 * on) * (1 - zoom);

      // Pulso: una pasada al terminar de armarse y despues una cada 5.2 s,
      // al ritmo del trazo del resto del sitio.
      const recorrido = MEDIDAS.ancho * 0.5 * enc.escala + 2.5;
      const cx = enc.centro.x + enc.centro.y * 0.35;
      const pasada = tramo(p, TRAMOS.pulso);
      if (pasada > 0 && pasada < 1) {
        uniforms.uPulseX.value = cx - recorrido + pasada * recorrido * 2;
        uniforms.uPulse.value = Math.sin(pasada * Math.PI);
      } else if (pasada >= 1) {
        const k = Math.min(1, ((t % PERIODO_TRAZO) / PERIODO_TRAZO) * 1.6);
        uniforms.uPulseX.value = cx - recorrido + k * recorrido * 2;
        uniforms.uPulse.value = 0.6 * Math.sin(k * Math.PI);
      } else {
        uniforms.uPulse.value = 0;
      }

      uniforms.uRepel.value = repel;
      (uniforms.uMouse.value as THREE.Vector2).set((rx * enc.ancho) / 2, (ry * enc.alto) / 2);

      // Al final del tramo, una orbita leve: toda la escena gira sobre el
      // centro del sistema (asi no se corre de su lugar en pantalla) y la
      // camara hace un dolly corto. Mas el parallax del mouse.
      const o = suaveJS(tramo(p, TRAMOS.orbita));
      const giro = (enc.apilado ? 0.1 : 0.2) * o;
      raiz.rotation.y = giro;
      pivote.copy(enc.centro).applyAxisAngle(eje, giro);
      raiz.position.copy(enc.centro).sub(pivote);
      const libre = 1 - zoom;
      camBase.set(mx * 0.35 * libre, my * 0.2 * libre, CAM.z - (enc.apilado ? 0.25 : 0.6) * o);

      if (zoom <= 0) {
        camara.up.copy(ARRIBA);
        camara.position.copy(camBase);
        camara.lookAt(ORIGEN);
        return;
      }

      // Zoom final: la camara se pone de frente a la pantalla de la notebook
      // y entra hasta que la pantalla llena el cuadro (y un poco mas).
      const pantalla = sistema.superficies.pantalla;
      raiz.updateMatrixWorld(true);
      pantalla.getWorldPosition(centroPantalla);
      pantalla.getWorldQuaternion(giroPantalla);
      normal.set(0, 0, 1).applyQuaternion(giroPantalla);
      arriba.set(0, 1, 0).applyQuaternion(giroPantalla);
      const tan = Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2));
      const aspecto = enc.ancho / enc.alto;
      const llena = Math.min(
        (MEDIDAS.pantalla.hh * enc.escala) / tan,
        (MEDIDAS.pantalla.hw * enc.escala) / (tan * aspecto)
      );
      const acerca = suaveJS(Math.min(1, zoom / 0.7));
      const entra = suaveJS(tramo(zoom, [0.6, 1]));
      camDentro.copy(centroPantalla).addScaledVector(normal, llena * (1 - 0.55 * entra));
      camara.position.lerpVectors(camBase, camDentro, acerca);
      mira.lerpVectors(ORIGEN, centroPantalla, acerca);
      camara.up.lerpVectors(ARRIBA, arriba, acerca).normalize();
      camara.lookAt(mira);
    },

    dispose() {
      sistema.dispose();
      fragmentos.dispose();
      geoHalo.dispose();
      matHalo.dispose();
    },
  };
}
