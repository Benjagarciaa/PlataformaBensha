import * as THREE from "three";
import {
  ALTO_PANTALLA_SOBRE_BISAGRA,
  MEDIDAS,
  PANEL,
  TIPOS,
  TRAMOS,
  armarCasilleros,
  type Casillero,
  type Superficie,
  type Tipo,
} from "./plano";

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
        seg([-0.36, 0.16], [0.3, 0.16], 0.5),
        seg([-0.36, -0.14], [0.08, -0.14], 0.5),
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
        ...garabato(-0.36, 0.22, 0.2),
        ...garabato(-0.36, 0.3, -0.02),
        ...garabato(-0.36, 0.04, -0.24),
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
        seg([-0.3, 0.34], [0.3, 0.34], 0.5),
        seg([-0.36, 0.14], [0.1, 0.14], 1),
        seg([0.22, 0.14], [0.36, 0.14], 1),
        seg([-0.36, -0.02], [0.02, -0.02], 1),
        seg([0.22, -0.02], [0.36, -0.02], 1),
        seg([-0.36, -0.24], [0.36, -0.24], 0.5),
      ];
    }
    case "reloj":
      return [
        ...circulo(0, 0, 0.5, 20),
        seg([0, 0], [0, 0.32], 0.5),
        seg([0, 0], [0.22, -0.08], 0.5),
      ];
    case "carrito":
      return [
        ...poli(
          [
            [-0.5, 0.42],
            [-0.32, 0.42],
            [-0.18, -0.2],
            [0.36, -0.2],
            [0.48, 0.24],
            [-0.26, 0.24],
          ],
          0
        ),
        ...circulo(-0.1, -0.38, 0.09, 8),
        ...circulo(0.28, -0.38, 0.09, 8),
      ];
  }
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
  };
  /** azar fijo por instancia para recalcular el caos al cambiar el tamaño */
  azar: Float32Array;
};

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
    const azar = new Float32Array(n * 8);
    for (let i = 0; i < azar.length; i++) azar[i] = rnd();
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
    escala = Math.min((ancho * 0.76) / MEDIDAS.ancho, (alto * 0.28) / MEDIDAS.alto);
    pos.set(-(MEDIDAS.centroX + 0.12) * escala, -alto / 2 + alto * 0.27, 0);
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
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    float banda = exp(-pow((vW.x + vW.y * 0.35 - uPulseX) / 0.7, 2.0)) * uPulse;
    // la pantalla se enciende de arriba hacia abajo
    float barrido = smoothstep(1.0 - uOn * 1.2, 1.0 - uOn * 1.2 + 0.2, vUv.y);
    float a = 0.018 * smoothstep(0.3, 1.0, uDraw) + 0.06 * barrido + banda * 0.07;
    gl_FragColor = vec4(uColor, a);
  }
`;

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

  return {
    grupo,
    superficies: { pantalla, base, celular },
    material,
    materialPantallas,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      material.dispose();
      materialPantallas.dispose();
    },
  };
}

// ── fragmentos ────────────────────────────────────────────────────────────

const VERT_FRAG = /* glsl */ `
  uniform float uA;
  uniform float uTime;
  uniform float uRepel;
  uniform vec2 uMouse;
  uniform vec4 uZona;
  attribute vec2 aAlt;
  attribute float aDet;
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
    vec2 lp = mix(position.xy, aAlt, e) * escala;
    vec3 pos = mix(p0, aP1, e);
    pos.z += sin(e * 3.14159) * aRnd.z;

    vec4 w = modelMatrix * vec4(qRot(q, vec3(lp, 0.0)) + pos, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;

    // detras del texto el caos baja la voz
    vec2 ndc = gl_Position.xy / gl_Position.w;
    float adentro = smoothstep(uZona.x - 0.2, uZona.x, ndc.x) * (1.0 - smoothstep(uZona.z, uZona.z + 0.3, ndc.x))
                  * smoothstep(uZona.y - 0.2, uZona.y, ndc.y) * (1.0 - smoothstep(uZona.w, uZona.w + 0.2, ndc.y));
    vDim = 1.0 - adentro * 0.62 * (1.0 - e);
    vA = mix(1.0, clamp(1.0 - aDet * 1.1, 0.0, 1.0), e);
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
  geo.setAttribute("position", base.getAttribute("position"));
  geo.setAttribute("aAlt", base.getAttribute("aAlt"));
  geo.setAttribute("aDet", base.getAttribute("aDet"));
  for (const [nombre, a] of Object.entries(inst.attrs)) geo.setAttribute(nombre, a);
  geo.instanceCount = inst.casilleros.length;
  return geo;
}

function lineasBase(tipo: Tipo) {
  const segs = formaLineas(tipo);
  const n = segs.length;
  const pos = new Float32Array(n * 6);
  const alt = new Float32Array(n * 4);
  const det = new Float32Array(n * 2);
  segs.forEach((s, i) => {
    const aa = s.aa ?? s.a;
    const bb = s.bb ?? s.b;
    pos.set([s.a[0], s.a[1], 0, s.b[0], s.b[1], 0], i * 6);
    alt.set([aa[0], aa[1], bb[0], bb[1]], i * 4);
    det[i * 2] = s.det;
    det[i * 2 + 1] = s.det;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAlt", new THREE.BufferAttribute(alt, 2));
  geo.setAttribute("aDet", new THREE.BufferAttribute(det, 1));
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
  geo.setAttribute("aDet", new THREE.BufferAttribute(new Float32Array(pos.count), 1));
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
    const baseL = lineasBase(inst.tipo);
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
      const r = (k: number) => inst.azar[i * 8 + k];

      // caos: repartido en todo el cuadro, con profundidad
      const z = -3.6 + r(2) * 5;
      const abre = (CAM.z - z) / CAM.z;
      let u: number;
      let w: number;
      if (enc.apilado) {
        u = r(0) - 0.5;
        w = Math.pow(r(1), 1.25) - 0.5;
      } else {
        u = 1 - Math.pow(1 - r(0), 1.2) - 0.5;
        w = r(1) - 0.5;
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
      uniforms.uGlow.value = 0.05 + 0.17 * dibujo + 0.2 * on;

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
      camara.position.set(mx * 0.35, my * 0.2, CAM.z - (enc.apilado ? 0.25 : 0.6) * o);
      camara.lookAt(0, 0, 0);
    },

    dispose() {
      sistema.dispose();
      fragmentos.dispose();
      geoHalo.dispose();
      matHalo.dispose();
    },
  };
}
