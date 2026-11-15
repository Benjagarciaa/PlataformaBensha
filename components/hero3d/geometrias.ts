import {
  ALTO_PANTALLA_SOBRE_BISAGRA,
  MEDIDAS,
  NOTIFICACION,
  PANEL,
  TRAMOS,
  armarCasilleros,
  armarTendencias,
  indiceIcono,
  type Superficie,
  type Tipo,
} from "./plano";
import { FORMAS_ICONO, ICONOS, SEGMENTOS_ICONO, type Segmento } from "./iconos";
import { esIcono, formaLineas } from "./formas";
import { CAM, TAN_FOV, agrupar, caosDe, calcularEncuadre, type Encuadre, type Grupo } from "./armado";
import {
  QI,
  aplicar,
  componer,
  lerp3,
  m4,
  mirar,
  multiplicar,
  normalizar,
  perspectiva,
  qEuler,
  qMul,
  rotar,
  sumarEsc,
  type M4,
  type Q,
  type V3,
} from "./mat";

/**
 * Geometrias, shaders y estado del hero 3D. Sin three: datos en Float32Array
 * que el motor (motor.ts) sube a WebGL2 tal cual.
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
 * Una vez armado, el panel vive solo: barras que se llenan, una tendencia que
 * corre en cada tarjeta y una notificacion de pedido nuevo en el celular.
 * Todo en el shader.
 */

// ── descriptores que entiende el motor ───────────────────────────────────

export type Atributo = { datos: Float32Array; tam: number; instancia?: boolean };

export type Programa = "aparato" | "pantalla" | "vivo" | "frag" | "halo";

/** De que matriz cuelga cada dibujo. */
export type Modelo = "raiz" | Superficie | "halo";

export type Dibujo = {
  programa: Programa;
  lineas: boolean;
  atributos: Record<string, Atributo>;
  vertices: number;
  /** 0: no instanciado */
  instancias: number;
  modelo: Modelo;
  /** uniforms propios del dibujo (alfa y banda de lineas y rellenos) */
  propios?: Record<string, number>;
};

const f32 = (n: number) => new Float32Array(n);

// ── shaders ──────────────────────────────────────────────────────────────
// GLSL estilo three (attribute / varying / gl_FragColor). El motor les pone el
// prefijo de WebGL2 y declara modelMatrix, viewMatrix, projectionMatrix,
// modelViewMatrix, position y uv.

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

// ── el panel vivo: tendencias en las tarjetas y la notificacion ──────────
// Geometria fija pegada a la pantalla y al celular. Aparece cuando el sistema
// se enciende (uLoop) y se mueve solo con uTime: la CPU no hace nada.

const VERT_VIVO = /* glsl */ `
  uniform float uTime;
  uniform float uLoop;
  // tendencia: indice del punto, fase, base y alto de la franja
  attribute vec4 aDig;
  // 0 tendencia, 1 notificacion, 2 marca del ultimo dato
  attribute float aKind;
  attribute float aPeso;
  varying float vA;
  varying vec3 vW;

  // el dato del punto i: suma de ondas que corre hacia la izquierda
  float dato(float i, float fase) {
    float s = i * 0.62 + uTime * 0.5 + fase;
    return 0.5 + 0.24 * sin(s * 1.13) + 0.15 * sin(s * 2.31 + 1.7) + 0.08 * sin(s * 4.7 + 0.3);
  }

  void main() {
    vec3 p = position;
    float a = 1.0;
    if (aKind < 0.5) {
      p.y = aDig.z + dato(aDig.x, aDig.y) * aDig.w;
      // el dato mas viejo se apaga en la punta izquierda
      a = smoothstep(0.0, 1.6, aDig.x);
    } else if (aKind > 1.5) {
      p.y += aDig.z + dato(aDig.x, aDig.y) * aDig.w;
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
    // asi las filas y tarjetas no se ven calcadas. En las tarjetas KPI quedan
    // cortas para dejarle lugar a la tendencia.
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

const VERT_HALO = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const FRAG_HALO = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(uColor, pow(clamp(1.0 - d, 0.0, 1.0), 2.2) * uGlow);
  }
`;

export const SHADERS: Record<Programa, { vert: string; frag: string }> = {
  aparato: { vert: VERT_APARATO, frag: FRAG_APARATO },
  pantalla: { vert: VERT_PANTALLA, frag: FRAG_PANTALLA },
  vivo: { vert: VERT_VIVO, frag: FRAG_VIVO },
  frag: { vert: VERT_FRAG, frag: FRAG_FRAG },
  halo: { vert: VERT_HALO, frag: FRAG_HALO },
};

// ── geometrias base ─────────────────────────────────────────────────────

type P3 = V3;

/** Un plano de w x h (dos triangulos, antihorario), con uv. */
function plano(w: number, h: number, ox = 0, oy = 0, oz = 0) {
  const esquinas: [number, number][] = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ];
  const pos = f32(18);
  const uv = f32(12);
  esquinas.forEach(([x, y], i) => {
    pos.set([ox + x * w, oy + y * h, oz], i * 3);
    uv.set([x + 0.5, y + 0.5], i * 2);
  });
  return { pos, uv, n: 6 };
}

/** Lineas de los aparatos. aLen es el orden de dibujo (0..1). */
function lineasAparato(segmentos: [P3, P3][], detalle: number[] = []): Dibujo {
  const n = segmentos.length;
  const pos = f32(n * 6);
  const len = f32(n * 2);
  const det = f32(n * 2);
  segmentos.forEach(([a, b], i) => {
    pos.set(a, i * 6);
    pos.set(b, i * 6 + 3);
    const t = i / Math.max(1, n - 1);
    len[i * 2] = t;
    len[i * 2 + 1] = Math.min(1, t + 0.6 / n);
    const d = detalle[i] ?? 0;
    det[i * 2] = d;
    det[i * 2 + 1] = d;
  });
  return {
    programa: "aparato",
    lineas: true,
    atributos: { position: { datos: pos, tam: 3 }, aLen: { datos: len, tam: 1 }, aDet: { datos: det, tam: 1 } },
    vertices: n * 2,
    instancias: 0,
    modelo: "pantalla",
  };
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

/** dig: los datos de cada punta del segmento (la tendencia los necesita por punta) */
function geoVivo(segs: [P3, P3][], dig: [number[], number[]][], kind: number[], peso: number): Dibujo {
  const n = segs.length;
  const pos = f32(n * 6);
  const aDig = f32(n * 8);
  const aKind = f32(n * 2);
  segs.forEach(([a, b], i) => {
    pos.set(a, i * 6);
    pos.set(b, i * 6 + 3);
    const [da, db] = dig[i] ?? [[0, 0, 0, 0], [0, 0, 0, 0]];
    aDig.set(da, i * 8);
    aDig.set(db, i * 8 + 4);
    aKind[i * 2] = aKind[i * 2 + 1] = kind[i] ?? 1;
  });
  return {
    programa: "vivo",
    lineas: true,
    atributos: {
      position: { datos: pos, tam: 3 },
      aDig: { datos: aDig, tam: 4 },
      aKind: { datos: aKind, tam: 1 },
      aPeso: { datos: f32(n * 2).fill(peso), tam: 1 },
    },
    vertices: n * 2,
    instancias: 0,
    modelo: "pantalla",
  };
}

/** Las tendencias de las tarjetas KPI y la marca del ultimo dato. */
function geoTendencias(denso: boolean): Dibujo {
  const segs: [P3, P3][] = [];
  const dig: [number[], number[]][] = [];
  const kind: number[] = [];
  const z = 0.014;
  for (const t of armarTendencias(denso)) {
    const paso = (t.x1 - t.x0) / (t.puntos - 1);
    const datos = (i: number) => [i, t.fase, t.y0, t.alto];
    for (let i = 0; i < t.puntos - 1; i++) {
      // el shader calcula la altura de cada punta: aca solo va su x
      segs.push([
        [t.x0 + paso * i, 0, z],
        [t.x0 + paso * (i + 1), 0, z],
      ]);
      dig.push([datos(i), datos(i + 1)]);
      kind.push(0);
    }
    // marca del ultimo dato: un cuadradito que sigue a la punta
    const m = 0.022;
    const ultimo = datos(t.puntos - 1);
    for (const [a, b] of rect3(t.x1 - m, -m, t.x1 + m, m, z)) {
      segs.push([a, b]);
      dig.push([ultimo, ultimo]);
      kind.push(2);
    }
  }
  return geoVivo(segs, dig, kind, 0.95);
}

function geoNotificacion(): Dibujo {
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
  return { ...geoVivo(segs, [], [], 1), modelo: "celular" };
}

/** Relleno de la notificacion: tapa apenas lo que tiene detras. */
function geoNotificacionFondo(): Dibujo {
  const n = NOTIFICACION;
  const pl = plano(n.w, n.h, n.x, n.y, 0.016);
  return {
    programa: "vivo",
    lineas: false,
    atributos: {
      position: { datos: pl.pos, tam: 3 },
      aDig: { datos: f32(pl.n * 4), tam: 4 },
      aKind: { datos: f32(pl.n).fill(1), tam: 1 },
      aPeso: { datos: f32(pl.n).fill(0.14), tam: 1 },
    },
    vertices: pl.n,
    instancias: 0,
    modelo: "celular",
  };
}

function geoPantalla(w: number, h: number, modelo: Modelo): Dibujo {
  const pl = plano(w, h, 0, 0, -0.005);
  return {
    programa: "pantalla",
    lineas: false,
    atributos: { position: { datos: pl.pos, tam: 3 }, uv: { datos: pl.uv, tam: 2 } },
    vertices: pl.n,
    instancias: 0,
    modelo,
  };
}

/** Las lineas de los aparatos, las pantallas y el panel vivo. */
function dibujosSistema(denso: boolean): Dibujo[] {
  const m = MEDIDAS;
  const out: Dibujo[] = [];

  // ── notebook: pantalla ──
  const { hw, hh, bisel } = m.pantalla;
  const p = PANEL;
  const segPantalla: [P3, P3][] = [
    ...placa(-hw - bisel, -hh - bisel, hw + bisel, hh + bisel, 0.06, denso),
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
  out.push(lineasAparato(segPantalla, detPantalla));
  out.push(geoPantalla(hw * 2, hh * 2, "pantalla"));

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
  out.push({ ...lineasAparato(segBase, detBase), modelo: "base" });

  // ── celular ──
  const c = m.celular;
  const segCel: [P3, P3][] = [
    ...placa(-c.hw - c.bisel, -c.hh - c.bisel - 0.04, c.hw + c.bisel, c.hh + c.bisel + 0.04, 0.09, denso),
    ...rect3(-c.hw, -c.hh, c.hw, c.hh),
    [[-0.12, c.hh + 0.06, 0], [0.12, c.hh + 0.06, 0]],
    [[-0.18, -c.hh - 0.07, 0], [0.18, -c.hh - 0.07, 0]],
  ];
  out.push({ ...lineasAparato(segCel), modelo: "celular" });
  out.push(geoPantalla(c.hw * 2, c.hh * 2, "celular"));

  // ── el panel vivo: tendencias en la notebook, pedido nuevo en el celular ──
  out.push(geoTendencias(denso));
  out.push(geoNotificacionFondo());
  out.push(geoNotificacion());
  return out;
}

// ── fragmentos ────────────────────────────────────────────────────────────

/**
 * Relojes y carritos: un casillero de morfeo por icono. En cada uno, el
 * segmento i del caos viaja al segmento i del icono. Lo que sobra de un lado
 * se desvanece en su lugar (det 1) y lo que falta nace en su destino (nace 1).
 */
function lineasIconos(tipo: "reloj" | "carrito") {
  const caos = formaLineas(tipo);
  const n = SEGMENTOS_ICONO;
  const total = ICONOS.length * n;
  const pos = f32(total * 6);
  const alt = f32(total * 4);
  const meta = f32(total * 8);
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
  return { pos, alt, meta, n: total * 2 };
}

function lineasBase(tipo: Tipo) {
  const segs = formaLineas(tipo);
  const n = segs.length;
  const pos = f32(n * 6);
  const alt = f32(n * 4);
  const meta = f32(n * 8);
  segs.forEach((s, i) => {
    const aa = s.aa ?? s.a;
    const bb = s.bb ?? s.b;
    pos.set([s.a[0], s.a[1], 0, s.b[0], s.b[1], 0], i * 6);
    alt.set([aa[0], aa[1], bb[0], bb[1]], i * 4);
    const v = s.varia ? 1 : 0;
    meta.set([s.det, v, 0, 0, s.det, v, 0, 0], i * 8);
  });
  return { pos, alt, meta, n: n * 2 };
}

function rellenoBase() {
  const pl = plano(1, 1);
  const alt = f32(pl.n * 2);
  for (let i = 0; i < pl.n; i++) {
    alt[i * 2] = pl.pos[i * 3];
    alt[i * 2 + 1] = pl.pos[i * 3 + 1];
  }
  return { pos: pl.pos, alt, meta: f32(pl.n * 4), n: pl.n };
}

/** Atributos por instancia: los escribe encuadrar() cada vez que cambia el tamaño. */
type Instancias = Record<"aP0" | "aQ0" | "aS0" | "aP1" | "aQ1" | "aS1" | "aRnd" | "aExtra", Atributo>;

function crearInstancias(g: Grupo): Instancias {
  const n = g.casilleros.length;
  const a = (tam: number): Atributo => ({ datos: f32(n * tam), tam, instancia: true });
  const out: Instancias = {
    aP0: a(3),
    aQ0: a(4),
    aS0: a(2),
    aP1: a(3),
    aQ1: a(4),
    aS1: a(2),
    aRnd: a(4),
    aExtra: a(3),
  };
  // icono, tipo de loop (1 barra, 2 KPI) y fase: las barras se llenan en ola
  const barras = g.casilleros.filter((c) => c.vivo === "barra").length;
  let b = 0;
  g.casilleros.forEach((c, i) => {
    const tipoLoop = c.vivo === "barra" ? 1 : c.vivo === "kpi" ? 2 : 0;
    const fase = c.vivo === "barra" ? (b++ / Math.max(1, barras)) * 0.45 : 0;
    out.aExtra.datos.set([indiceIcono(c), tipoLoop, fase], i * 3);
  });
  return out;
}

// ── la escena completa ────────────────────────────────────────────────────

function tramo(v: number, [a, b]: readonly [number, number]) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

function suave(t: number) {
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
};

export type Uniform = number | Float32Array;

export type Escena = {
  dibujos: Dibujo[];
  uniforms: Record<string, Uniform>;
  /** matrices de cada modelo, de la camara y de la proyeccion */
  modelos: Record<Modelo, M4>;
  vista: M4;
  proyeccion: M4;
  colores: (acento: string, caliente: string) => void;
  /** recalcula el encuadre; devuelve los atributos que hay que volver a subir */
  encuadrar: (anchoPx: number, altoPx: number) => Atributo[];
  cuadro: (e: EntradaCuadro) => void;
};

/** "#4fd4ff", "#fff" o "rgb(79, 212, 255)" a 0..1, sin conversion de color. */
function color(css: string, out: Float32Array) {
  const s = css.trim();
  let r = 0;
  let g = 0;
  let b = 0;
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : s;
    const v = parseInt(h.slice(1, 7), 16);
    r = (v >> 16) & 255;
    g = (v >> 8) & 255;
    b = v & 255;
  } else {
    const n = s.match(/[\d.]+/g)?.map(Number) ?? [];
    [r = 0, g = 0, b = 0] = n;
  }
  out.set([r / 255, g / 255, b / 255]);
}

/**
 * Arma la escena entera (datos de CPU) y devuelve su control. Todo lo mutable
 * (uniforms, camara, encuadre) vive aca adentro, fuera de React.
 */
export function crearEscena(movil: boolean): Escena {
  const uniforms: Record<string, Uniform> = {
    uA: 0,
    uTime: 0,
    uRepel: 0,
    uMouse: new Float32Array([99, 99]),
    uZona: new Float32Array([-1, -1, -1, -1]),
    uColor: new Float32Array(3),
    uHot: new Float32Array(3),
    uOn: 0,
    uDraw: 0,
    uPulseX: -99,
    uPulse: 0,
    uGlow: 0,
    uLoop: 0,
    uZoom: 0,
  };

  const denso = !movil;
  const grupos = agrupar(armarCasilleros(denso));
  const dibujos: Dibujo[] = dibujosSistema(denso);
  const instancias: { g: Grupo; attrs: Instancias }[] = [];

  // fragmentos: un dibujo de lineas por tipo y otro de relleno
  const relleno = rellenoBase();
  for (const g of grupos) {
    if (g.casilleros.length === 0) continue;
    const attrs = crearInstancias(g);
    instancias.push({ g, attrs });
    const base = esIcono(g.tipo) ? lineasIconos(g.tipo as "reloj" | "carrito") : lineasBase(g.tipo);
    const porVertice = (geo: typeof base) => ({
      position: { datos: geo.pos, tam: 3 },
      aAlt: { datos: geo.alt, tam: 2 },
      aMeta: { datos: geo.meta, tam: 4 },
    });
    dibujos.push({
      programa: "frag",
      lineas: true,
      atributos: { ...porVertice(base), ...attrs },
      vertices: base.n,
      instancias: g.casilleros.length,
      modelo: "raiz",
      propios: { uAlpha: 0.52, uBanda: 0.6 },
    });
    // los iconos van sin relleno: son solo trazo
    if (!esIcono(g.tipo)) {
      dibujos.push({
        programa: "frag",
        lineas: false,
        atributos: { ...porVertice(relleno), ...attrs },
        vertices: relleno.n,
        instancias: g.casilleros.length,
        modelo: "raiz",
        propios: { uAlpha: 0.05, uBanda: 0.08 },
      });
    }
  }

  // halo celeste detras del sistema: un plano, no postprocesado
  const halo = plano(1, 1);
  dibujos.unshift({
    programa: "halo",
    lineas: false,
    atributos: { position: { datos: halo.pos, tam: 3 }, uv: { datos: halo.uv, tam: 2 } },
    vertices: halo.n,
    instancias: 0,
    modelo: "halo",
  });

  // jerarquia del sistema (relativa a la raiz): grupo > bisagra > pantalla,
  // grupo > base, grupo > celular
  const m = MEDIDAS;
  const qBisagra = qEuler(m.bisagra.inclinacion, 0, 0);
  const qBase = qEuler(-Math.PI / 2, 0, 0);
  const qCelular = qEuler(0, m.celular.rotY, 0);
  const local: Record<Superficie, M4> = {
    pantalla: multiplicar(
      m4(),
      componer(m4(), [0, m.bisagra.y, 0], qBisagra),
      componer(m4(), [0, ALTO_PANTALLA_SOBRE_BISAGRA, 0], QI)
    ),
    base: componer(m4(), [0, m.bisagra.y, 0], qBase),
    celular: componer(m4(), [m.celular.x, m.celular.y, m.celular.z], qCelular),
  };
  const enRaiz: Record<Superficie, M4> = { pantalla: m4(), base: m4(), celular: m4() };
  const giroEnRaiz: Record<Superficie, Q> = { pantalla: QI, base: QI, celular: QI };
  const haloLocal = m4();

  const modelos: Record<Modelo, M4> = { raiz: m4(), pantalla: m4(), base: m4(), celular: m4(), halo: m4() };
  const vista = m4();
  const proyeccion = m4();

  let enc: Encuadre = calcularEncuadre(1440, 900);
  const subir: Atributo[] = instancias.flatMap(({ attrs }) => [
    attrs.aP0,
    attrs.aQ0,
    attrs.aS0,
    attrs.aP1,
    attrs.aQ1,
    attrs.aS1,
    attrs.aRnd,
  ]);

  function ubicar() {
    const qG = qEuler(enc.rot[0], enc.rot[1], enc.rot[2]);
    const grupo = componer(m4(), enc.pos, qG, enc.escala);
    (Object.keys(local) as Superficie[]).forEach((sup) => multiplicar(enRaiz[sup], grupo, local[sup]));
    giroEnRaiz.pantalla = qMul(qG, qBisagra);
    giroEnRaiz.base = qMul(qG, qBase);
    giroEnRaiz.celular = qMul(qG, qCelular);

    for (const { g, attrs } of instancias) {
      g.casilleros.forEach((c, i) => {
        const caos = caosDe(g, i, enc, movil);
        attrs.aP0.datos.set(caos.p, i * 3);
        attrs.aQ0.datos.set([...caos.eje, caos.angulo], i * 4);
        attrs.aS0.datos.set(caos.s, i * 2);
        // destino: el casillero, llevado a la raiz por su superficie (los
        // fragmentos cuelgan de la raiz, asi la orbita no se aplica dos veces)
        attrs.aP1.datos.set(aplicar(enRaiz[c.sup], [c.x, c.y, 0.012]), i * 3);
        attrs.aQ1.datos.set(giroEnRaiz[c.sup], i * 4);
        attrs.aS1.datos.set([c.w * enc.escala, c.h * enc.escala], i * 2);
        attrs.aRnd.datos.set(caos.rnd, i * 4);
      });
    }

    componer(haloLocal, [enc.centro[0], enc.centro[1] + 0.2 * enc.escala, -1.5], QI, MEDIDA_HALO * enc.escala);
    (uniforms.uZona as Float32Array).set(enc.zonaTexto);
    perspectiva(proyeccion, CAM.fov, enc.ancho / enc.alto, CAM.cerca, CAM.lejos);
  }

  const ARRIBA: V3 = [0, 1, 0];
  const ORIGEN: V3 = [0, 0, 0];

  return {
    dibujos,
    uniforms,
    modelos,
    vista,
    proyeccion,

    // Sin conversion de espacio de color: el shader escribe el valor tal
    // cual, asi el celeste del canvas es el mismo que el del CSS.
    colores(acento, caliente) {
      if (acento) color(acento, uniforms.uColor as Float32Array);
      if (caliente) color(caliente, uniforms.uHot as Float32Array);
    },

    encuadrar(anchoPx, altoPx) {
      enc = calcularEncuadre(anchoPx, altoPx);
      ubicar();
      return subir;
    },

    cuadro({ p, t, mx, my, rx, ry, repel }) {
      const u = uniforms;
      u.uTime = t;
      u.uA = tramo(p, TRAMOS.ensamble);
      const dibujo = suave(tramo(p, TRAMOS.dibujo));
      u.uDraw = dibujo;
      const on = suave(tramo(p, TRAMOS.encendido));
      u.uOn = on;
      u.uLoop = on;
      const zoom = suave(tramo(p, TRAMOS.zoom));
      u.uZoom = zoom;
      u.uGlow = (0.05 + 0.17 * dibujo + 0.2 * on) * (1 - zoom);

      // Pulso: una pasada al terminar de armarse y despues una cada 5.2 s,
      // al ritmo del trazo del resto del sitio.
      const recorrido = MEDIDAS.ancho * 0.5 * enc.escala + 2.5;
      const cx = enc.centro[0] + enc.centro[1] * 0.35;
      const pasada = tramo(p, TRAMOS.pulso);
      if (pasada > 0 && pasada < 1) {
        u.uPulseX = cx - recorrido + pasada * recorrido * 2;
        u.uPulse = Math.sin(pasada * Math.PI);
      } else if (pasada >= 1) {
        const k = Math.min(1, ((t % PERIODO_TRAZO) / PERIODO_TRAZO) * 1.6);
        u.uPulseX = cx - recorrido + k * recorrido * 2;
        u.uPulse = 0.6 * Math.sin(k * Math.PI);
      } else {
        u.uPulse = 0;
      }

      u.uRepel = repel;
      (u.uMouse as Float32Array).set([(rx * enc.ancho) / 2, (ry * enc.alto) / 2]);

      // Al final del tramo, una orbita leve: toda la escena gira sobre el
      // centro del sistema (asi no se corre de su lugar en pantalla) y la
      // camara hace un dolly corto. Mas el parallax del mouse.
      const o = suave(tramo(p, TRAMOS.orbita));
      const giro = (enc.apilado ? 0.1 : 0.2) * o;
      const qR = qEuler(0, giro, 0);
      const pivote = rotar(qR, enc.centro);
      componer(
        modelos.raiz,
        [enc.centro[0] - pivote[0], enc.centro[1] - pivote[1], enc.centro[2] - pivote[2]],
        qR
      );
      multiplicar(modelos.pantalla, modelos.raiz, enRaiz.pantalla);
      multiplicar(modelos.base, modelos.raiz, enRaiz.base);
      multiplicar(modelos.celular, modelos.raiz, enRaiz.celular);
      multiplicar(modelos.halo, modelos.raiz, haloLocal);

      const libre = 1 - zoom;
      const camBase: V3 = [mx * 0.35 * libre, my * 0.2 * libre, CAM.z - (enc.apilado ? 0.25 : 0.6) * o];

      if (zoom <= 0) {
        mirar(vista, camBase, ORIGEN, ARRIBA);
        return;
      }

      // Zoom final: la camara se pone de frente a la pantalla de la notebook
      // y entra hasta que la pantalla llena el cuadro (y un poco mas).
      const centroPantalla = aplicar(modelos.pantalla, ORIGEN);
      const giroPantalla = qMul(qR, giroEnRaiz.pantalla);
      const normal = rotar(giroPantalla, [0, 0, 1]);
      const arriba = rotar(giroPantalla, ARRIBA);
      const aspecto = enc.ancho / enc.alto;
      const llena = Math.min(
        (MEDIDAS.pantalla.hh * enc.escala) / TAN_FOV,
        (MEDIDAS.pantalla.hw * enc.escala) / (TAN_FOV * aspecto)
      );
      const acerca = suave(Math.min(1, zoom / 0.7));
      const entra = suave(tramo(zoom, [0.6, 1]));
      const camDentro = sumarEsc(centroPantalla, normal, llena * (1 - 0.55 * entra));
      mirar(
        vista,
        lerp3(camBase, camDentro, acerca),
        lerp3(ORIGEN, centroPantalla, acerca),
        normalizar(lerp3(ARRIBA, arriba, acerca))
      );
    },
  };
}
