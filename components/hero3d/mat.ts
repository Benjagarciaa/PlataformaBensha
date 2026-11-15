/**
 * Matematica minima de la escena del hero: vectores, cuaterniones y matrices
 * 4x4 (column-major, como las espera WebGL). Es lo unico que la escena
 * necesitaba de three: con esto el hero no baja una libreria de 700 KB para
 * dibujar lineas. Las formulas son las mismas que usa three, asi el encuadre,
 * la orbita y el zoom quedan identicos.
 */

export type V3 = [number, number, number];
/** cuaternion x, y, z, w */
export type Q = [number, number, number, number];
export type M4 = Float32Array;

export const QI: Q = [0, 0, 0, 1];

export function m4(): M4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** out = a * b */
export function multiplicar(out: M4, a: M4, b: M4): M4 {
  const r = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let f = 0; f < 4; f++) {
      r[c * 4 + f] =
        a[f] * b[c * 4] + a[4 + f] * b[c * 4 + 1] + a[8 + f] * b[c * 4 + 2] + a[12 + f] * b[c * 4 + 3];
    }
  }
  out.set(r);
  return out;
}

/** Posicion, rotacion y escala a matriz (Matrix4.compose de three). */
export function componer(out: M4, p: V3, q: Q, s: number | V3 = 1): M4 {
  const [x, y, z, w] = q;
  const [sx, sy, sz] = typeof s === "number" ? [s, s, s] : s;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = p[0];
  out[13] = p[1];
  out[14] = p[2];
  out[15] = 1;
  return out;
}

/** Proyeccion en perspectiva (PerspectiveCamera de three, fov vertical). */
export function perspectiva(out: M4, fovGrados: number, aspecto: number, cerca: number, lejos: number): M4 {
  const arriba = cerca * Math.tan((Math.PI / 180) * 0.5 * fovGrados);
  const x = cerca / (aspecto * arriba);
  const y = cerca / arriba;
  out.fill(0);
  out[0] = x;
  out[5] = y;
  out[10] = -(lejos + cerca) / (lejos - cerca);
  out[11] = -1;
  out[14] = (-2 * lejos * cerca) / (lejos - cerca);
  return out;
}

/** Matriz de vista de una camara en `ojo` que mira a `objetivo`. */
export function mirar(out: M4, ojo: V3, objetivo: V3, arriba: V3): M4 {
  let z = restar(ojo, objetivo);
  if (largo(z) === 0) z = [0, 0, 1];
  z = normalizar(z);
  let x = cruz(arriba, z);
  if (largo(x) === 0) {
    z = normalizar([z[0] + 0.0001, z[1], z[2]]);
    x = cruz(arriba, z);
  }
  x = normalizar(x);
  const y = cruz(z, x);
  out[0] = x[0];
  out[1] = y[0];
  out[2] = z[0];
  out[3] = 0;
  out[4] = x[1];
  out[5] = y[1];
  out[6] = z[1];
  out[7] = 0;
  out[8] = x[2];
  out[9] = y[2];
  out[10] = z[2];
  out[11] = 0;
  out[12] = -punto(x, ojo);
  out[13] = -punto(y, ojo);
  out[14] = -punto(z, ojo);
  out[15] = 1;
  return out;
}

/** Euler en orden XYZ (el de three por defecto) a cuaternion. */
export function qEuler(x: number, y: number, z: number): Q {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  return [
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 + s1 * s2 * c3,
    c1 * c2 * c3 - s1 * s2 * s3,
  ];
}

/** Rotacion de `angulo` alrededor de `eje` (normalizado adentro). */
export function qEje(eje: V3, angulo: number): Q {
  const e = normalizar(eje);
  const s = Math.sin(angulo / 2);
  return [e[0] * s, e[1] * s, e[2] * s, Math.cos(angulo / 2)];
}

/** a * b: primero b, despues a. */
export function qMul(a: Q, b: Q): Q {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function rotar(q: Q, v: V3): V3 {
  const [qx, qy, qz, qw] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [vx + qw * tx + qy * tz - qz * ty, vy + qw * ty + qz * tx - qx * tz, vz + qw * tz + qx * ty - qy * tx];
}

/** Punto por matriz (con w = 1). */
export function aplicar(m: M4, v: V3): V3 {
  const [x, y, z] = v;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

export const restar = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const sumarEsc = (a: V3, b: V3, k: number): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const punto = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cruz = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const largo = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export function normalizar(a: V3): V3 {
  const l = largo(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
