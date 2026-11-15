import * as THREE from "three";
import {
  GIRO,
  TARJETA,
  VUELO,
  calcularEncuadre,
  indiceFrente,
  normalizar,
  paso,
  radioAnillo,
  totalPara,
  type ControlEscena,
  type Encuadre,
  type Puente,
  type Rect,
} from "./plano";

/**
 * Anillo 3D de trabajos: geometrias, shaders y estado mutable.
 *
 * Cada trabajo es un plano levemente curvo (un gajo del mismo cilindro) con su
 * captura como textura. Por frame la CPU mueve 15 matrices y escribe un
 * puñado de uniforms; el brillo, el filete, las escuadras, la niebla y la
 * pasada del trazo se resuelven en el fragment shader.
 *
 * Mismo lenguaje que el hero: lineas de 1 px en el acento, luz celeste
 * difusa con blending aditivo y ningun color escrito en el codigo (se leen de
 * las variables CSS al montar).
 */

const VERT_TARJETA = /* glsl */ `
  uniform float uCurva;
  uniform float uEspejo;
  varying vec2 vUv;
  varying vec3 vPosV;
  varying vec3 vNorV;

  void main() {
    vec3 p = position;
    vec3 nrm = vec3(0.0, 0.0, 1.0);
    // gajo de cilindro: la tarjeta se curva hacia atras en los costados
    if (uCurva > 0.0001) {
      float a = p.x * uCurva;
      p.x = sin(a) / uCurva;
      p.z = (cos(a) - 1.0) / uCurva;
      nrm = vec3(sin(a), 0.0, cos(a));
    }
    // el reflejo en el piso es la misma tarjeta dada vuelta
    if (uEspejo > 0.5) p.y = -p.y;
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vPosV = mv.xyz;
    vNorV = normalize(normalMatrix * nrm);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG_TARJETA = /* glsl */ `
  uniform sampler2D uMapa;
  uniform float uTexOn;
  uniform float uHover;
  uniform float uDim;
  uniform float uVuelo;
  uniform float uEspejo;
  uniform float uDestacado;
  uniform float uTiempo;
  uniform vec3 uAcento;
  uniform vec3 uFondo;
  uniform vec3 uSuperficie;
  uniform vec2 uTam;
  uniform vec2 uMargen;
  uniform vec2 uNiebla;
  varying vec2 vUv;
  varying vec3 vPosV;
  varying vec3 vNorV;

  float linea(float d, float px) {
    return 1.0 - smoothstep(0.0, px * 1.25, abs(d));
  }

  void main() {
    bool frente = gl_FrontFacing;
    if (uEspejo > 0.5) frente = !frente;

    // q: coordenadas dentro de la imagen; d: distancia al borde (negativa afuera)
    vec2 q = (vUv - uMargen) / (1.0 - 2.0 * uMargen);
    vec2 lado = min(q, 1.0 - q) * uTam;
    float d = min(lado.x, lado.y);
    float px = max(fwidth(d), 1e-5);
    float niebla = smoothstep(uNiebla.x, uNiebla.y, -vPosV.z);
    float vivo = 1.0 - uDim;

    // dorso: solo el contorno, como un plano visto de atras
    if (!frente) {
      if (uEspejo > 0.5 || d < 0.0) discard;
      float a = (linea(d, px) * 0.42 + 0.025) * vivo * (1.0 - niebla * 0.5);
      gl_FragColor = vec4(uAcento, a);
      return;
    }

    // margen: las escuadras en L de las esquinas, el detalle firma del sitio
    if (d < 0.0) {
      if (uEspejo > 0.5) discard;
      vec2 r = abs(q - 0.5) * uTam - 0.5 * uTam;
      float off = 0.045;
      float largo = 0.17;
      float bx = linea(r.y - off, px) * step(off - largo, r.x) * step(r.x, off);
      float by = linea(r.x - off, px) * step(off - largo, r.y) * step(r.y, off);
      float a = max(bx, by) * max(uHover, max(uDestacado * 0.7, uVuelo)) * vivo;
      if (a < 0.004) discard;
      gl_FragColor = vec4(uAcento, a);
      return;
    }

    vec3 c = mix(uSuperficie, texture2D(uMapa, q).rgb, uTexOn);
    c *= mix(0.8, 1.0, max(uHover, uVuelo));

    // brillo celeste sutil: el borde y el reflejo rasante de los costados
    vec3 V = normalize(-vPosV);
    float rasante = pow(1.0 - abs(dot(normalize(vNorV), V)), 3.0);
    float halo = exp(-d / 0.05);
    float apagado = 1.0 - uVuelo;
    c += uAcento * (rasante * 0.26 + halo * (0.05 + 0.16 * uHover)) * apagado;

    // la pasada del trazo: una banda de luz que baja cada 5.2 s
    float banda = 1.25 - fract(uTiempo / 5.2) * 1.6;
    c += uAcento * exp(-pow((q.y - banda) / 0.03, 2.0)) * 0.05 * apagado;

    // filete de 1 px
    float f = linea(d, px);
    c = mix(c, uAcento, f * mix(0.32, 0.95, max(uHover, uDestacado * 0.6)) * apagado);

    // lejos se funde con el fondo; las demas se apagan cuando una vuela
    c = mix(c, uFondo, niebla * 0.62 * apagado);
    c = mix(c, uFondo, uDim * 0.8);

    float alfa = 1.0;
    if (uEspejo > 0.5) alfa = 0.15 * (1.0 - smoothstep(0.0, 0.5, q.y)) * vivo * apagado;
    gl_FragColor = vec4(c, alfa);
  }
`;

const VERT_PISO = /* glsl */ `
  attribute float aBrillo;
  varying float vProf;
  varying float vBrillo;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vProf = -mv.z;
    vBrillo = aBrillo;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG_PISO = /* glsl */ `
  uniform vec3 uAcento;
  uniform vec2 uNiebla;
  uniform float uAlfa;
  varying float vProf;
  varying float vBrillo;
  void main() {
    float n = smoothstep(uNiebla.x, uNiebla.y, vProf);
    gl_FragColor = vec4(uAcento, uAlfa * vBrillo * (1.0 - n * 0.85));
  }
`;

const FRAG_LUZ = /* glsl */ `
  uniform vec3 uAcento;
  uniform float uAlfa;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(uAcento, pow(clamp(1.0 - d, 0.0, 1.0), 2.4) * uAlfa);
  }
`;

const VERT_LUZ = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

type Tarjeta = {
  malla: THREE.Mesh;
  reflejo: THREE.Mesh | null;
  u: {
    uMapa: THREE.IUniform<THREE.Texture>;
    uTexOn: THREE.IUniform<number>;
    uHover: THREE.IUniform<number>;
    uDim: THREE.IUniform<number>;
    uVuelo: THREE.IUniform<number>;
    uCurva: THREE.IUniform<number>;
    uDestacado: THREE.IUniform<number>;
  };
  cargada: boolean;
  hover: number;
  /** ultimo estado escrito en su boton, para no tocar el DOM de mas */
  visible: boolean | null;
  z: number;
};

export type EntradaCuadro = {
  t: number;
  dt: number;
  /** progreso del paso de la seccion por la pantalla (0..1; 0.5 con el escenario centrado) */
  scroll: number;
  puente: Puente;
  camara: THREE.Camera;
  ancho: number;
  alto: number;
};

export type Anillo = {
  raiz: THREE.Group;
  colores: (c: { acento: string; fondo: string; superficie: string }) => void;
  cargar: (renderer: THREE.WebGLRenderer, urls: string[]) => () => void;
  encuadrar: (camara: THREE.Camera, ancho: number, alto: number, puente: Puente) => Encuadre;
  cuadro: (e: EntradaCuadro) => void;
  control: ControlEscena;
  dispose: () => void;
};

const suave = (k: number) => 1 - Math.exp(-k);

export function crearAnillo(n: number, opciones: { reflejo: boolean; destacados: boolean[] }): Anillo {
  const R = radioAnillo(n);
  const a = paso(n);
  const W = TARJETA.ancho;
  const H = TARJETA.alto;
  const M = TARJETA.margen;
  const pisoY = -H / 2 - 0.12;

  const compartidos = {
    uAcento: { value: new THREE.Color() },
    uFondo: { value: new THREE.Color() },
    uSuperficie: { value: new THREE.Color() },
    uTiempo: { value: 0 },
    uTam: { value: new THREE.Vector2(W, H) },
    uMargen: { value: new THREE.Vector2(M / (W + 2 * M), M / (H + 2 * M)) },
    uNiebla: { value: new THREE.Vector2(8, 16) },
  };

  const vacia = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  vacia.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(W + 2 * M, H + 2 * M, 28, 1);
  const materiales: THREE.Material[] = [];
  const texturas: THREE.Texture[] = [];
  const raiz = new THREE.Group();

  const tarjetas: Tarjeta[] = [];
  for (let i = 0; i < n; i++) {
    const u = {
      uMapa: { value: vacia as THREE.Texture },
      uTexOn: { value: 0 },
      uHover: { value: 0 },
      uDim: { value: 0 },
      uVuelo: { value: 0 },
      uCurva: { value: 1 / R },
      uDestacado: { value: opciones.destacados[i] ? 1 : 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...compartidos, ...u, uEspejo: { value: 0 } },
      vertexShader: VERT_TARJETA,
      fragmentShader: FRAG_TARJETA,
      side: THREE.DoubleSide,
      transparent: true,
    });
    materiales.push(mat);
    const malla = new THREE.Mesh(geo, mat);
    malla.frustumCulled = false;
    raiz.add(malla);

    let reflejo: THREE.Mesh | null = null;
    if (opciones.reflejo) {
      const matR = new THREE.ShaderMaterial({
        uniforms: { ...compartidos, ...u, uEspejo: { value: 1 } },
        vertexShader: VERT_TARJETA,
        fragmentShader: FRAG_TARJETA,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      });
      materiales.push(matR);
      reflejo = new THREE.Mesh(geo, matR);
      reflejo.frustumCulled = false;
      reflejo.renderOrder = -2;
      raiz.add(reflejo);
    }
    tarjetas.push({ malla, reflejo, u, cargada: false, hover: 0, visible: null, z: -1 });
  }

  // ── el piso: un transportador de lineas finas que gira con el anillo ──
  const pos: number[] = [];
  const brillo: number[] = [];
  const segs = 160;
  const rPiso = R * 0.985;
  for (let s = 0; s < segs; s++) {
    const a0 = (s / segs) * Math.PI * 2;
    const a1 = ((s + 1) / segs) * Math.PI * 2;
    pos.push(rPiso * Math.sin(a0), 0, rPiso * Math.cos(a0), rPiso * Math.sin(a1), 0, rPiso * Math.cos(a1));
    brillo.push(0.7, 0.7);
  }
  for (let k = 0; k < n * 3; k++) {
    const ang = (k / (n * 3)) * Math.PI * 2;
    const mayor = k % 3 === 0;
    const r1 = rPiso + (mayor ? 0.2 : 0.08);
    pos.push(rPiso * Math.sin(ang), 0, rPiso * Math.cos(ang), r1 * Math.sin(ang), 0, r1 * Math.cos(ang));
    brillo.push(mayor ? 1.4 : 0.8, mayor ? 1.4 : 0.8);
  }
  const geoPiso = new THREE.BufferGeometry();
  geoPiso.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geoPiso.setAttribute("aBrillo", new THREE.Float32BufferAttribute(brillo, 1));
  const matPiso = new THREE.ShaderMaterial({
    uniforms: { uAcento: compartidos.uAcento, uNiebla: compartidos.uNiebla, uAlfa: { value: 0.32 } },
    vertexShader: VERT_PISO,
    fragmentShader: FRAG_PISO,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  materiales.push(matPiso);
  const piso = new THREE.LineSegments(geoPiso, matPiso);
  piso.position.y = pisoY;
  piso.frustumCulled = false;
  piso.renderOrder = -3;
  raiz.add(piso);

  // luz celeste difusa sobre el piso, mas fuerte adelante: un sprite, sin postproceso
  const geoLuz = new THREE.PlaneGeometry(1, 1);
  const matLuz = new THREE.ShaderMaterial({
    uniforms: { uAcento: compartidos.uAcento, uAlfa: { value: 0.16 } },
    vertexShader: VERT_LUZ,
    fragmentShader: FRAG_LUZ,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  materiales.push(matLuz);
  const luz = new THREE.Mesh(geoLuz, matLuz);
  luz.rotation.x = -Math.PI / 2;
  luz.position.set(0, pisoY - 0.01, R * 0.45);
  luz.scale.setScalar(R * 2.6);
  luz.frustumCulled = false;
  luz.renderOrder = -4;
  raiz.add(luz);

  // ── estado ────────────────────────────────────────────────────────────
  let enc = calcularEncuadre(1440, 900);
  let ancho = 1440;
  let alto = 900;
  const objetivo = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), escala: 1 };

  const giro = { ang: 0, vel: 0, auto: 0, scroll: NaN, arrastrando: false, frente: -1, t: 0, reposo: 0 };
  type Vuelo = { i: number; desde: number; hasta: number; t0: number; dur: number; v: number; fin: (() => void) | null };
  const vuelo: Vuelo = { i: -1, desde: 0, hasta: 0, t0: 0, dur: 1, v: 0, fin: null };

  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const ringQuat = new THREE.Quaternion();
  const eje = new THREE.Vector3(0, 1, 0);
  const punto = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const orden: number[] = Array.from({ length: n }, (_, i) => i);
  const cosenos = new Float32Array(n);

  /**
   * Cuanto suma el scroll al giro. Es cero con el escenario centrado en la
   * pantalla, asi el mejor caso queda de frente justo cuando se lo mira. En
   * el celular no suma nada: ahi la tarjeta de frente ocupa casi todo el
   * ancho y tiene que quedarse quieta mientras se lee.
   */
  const porScroll = (s: number) => (s - 0.5) * (enc.estrecho ? 0 : GIRO.scroll);

  function rectVuelo(): Rect {
    const w = enc.vuelo.ancho;
    const h = (w * H) / W;
    return { x: enc.vuelo.cx - w / 2, y: enc.vuelo.cy - h / 2, w, h };
  }

  function arrancarVuelo(i: number, hasta: number, dur: number) {
    return new Promise<void>((resolve) => {
      vuelo.fin?.();
      vuelo.i = i;
      vuelo.desde = vuelo.v;
      vuelo.hasta = hasta;
      vuelo.dur = dur;
      vuelo.t0 = NaN; // se fija en el proximo cuadro
      vuelo.fin = resolve;
    });
  }

  const control: ControlEscena = {
    async volar(i) {
      await arrancarVuelo(i, 1, VUELO.ida);
      return rectVuelo();
    },
    async volver(i) {
      if (vuelo.i !== i) {
        vuelo.i = i;
        vuelo.v = 1;
      }
      await arrancarVuelo(i, 0, VUELO.vuelta);
    },
    saltar(i) {
      vuelo.fin?.();
      vuelo.fin = null;
      vuelo.i = i;
      vuelo.v = 1;
      vuelo.desde = 1;
      vuelo.hasta = 1;
      // la nueva queda de frente en el anillo, asi vuelve a su lugar de frente
      const scroll = Number.isNaN(giro.scroll) ? 0.5 : giro.scroll;
      const total = giro.ang - porScroll(scroll);
      giro.ang = totalPara(i, total, n) + porScroll(scroll);
      giro.vel = 0;
    },
    rectVuelo,
  };

  return {
    raiz,
    control,

    // Sin conversion de espacio de color, igual que el hero: el shader
    // escribe el valor tal cual y el celeste del canvas es el del CSS.
    colores({ acento, fondo, superficie }) {
      if (acento) compartidos.uAcento.value.setStyle(acento, THREE.LinearSRGBColorSpace);
      if (fondo) compartidos.uFondo.value.setStyle(fondo, THREE.LinearSRGBColorSpace);
      if (superficie) compartidos.uSuperficie.value.setStyle(superficie, THREE.LinearSRGBColorSpace);
    },

    cargar(renderer, urls) {
      let vivo = true;
      const loader = new THREE.TextureLoader();
      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      // primero las que estan de frente
      const prioridad = [...urls.keys()].sort((x, y) => {
        const dx = Math.min(x, n - x);
        const dy = Math.min(y, n - y);
        return dx - dy;
      });
      for (const i of prioridad) {
        loader.load(urls[i], (tex) => {
          if (!vivo) {
            tex.dispose();
            return;
          }
          tex.anisotropy = aniso;
          texturas.push(tex);
          tarjetas[i].u.uMapa.value = tex;
          tarjetas[i].cargada = true;
        });
      }
      return () => {
        vivo = false;
      };
    },

    encuadrar(camaraBase, anchoPx, altoPx, puente) {
      const camara = camaraBase as THREE.PerspectiveCamera;
      ancho = anchoPx;
      alto = altoPx;
      enc = calcularEncuadre(anchoPx, altoPx);

      camara.fov = enc.fov;
      camara.aspect = anchoPx / altoPx;
      const e = enc.elevacion;
      camara.position.set(0, Math.sin(e) * enc.distancia, R + Math.cos(e) * enc.distancia);
      camara.lookAt(0, 0, R);
      // corre la imagen para que la tarjeta de frente quede a la altura justa
      const oy = (0.5 - enc.frenteY) * altoPx;
      camara.setViewOffset(anchoPx, altoPx, 0, oy, anchoPx, altoPx);
      camara.updateProjectionMatrix();
      camara.updateMatrixWorld();

      compartidos.uNiebla.value.set(enc.distancia + 0.6, enc.distancia + R * 2.1);

      // a donde vuela la tarjeta: un plano de frente a la camara que se ve
      // exactamente en el rect del vuelo
      const t = Math.tan((enc.fov * Math.PI) / 360);
      const dz = enc.distancia * 0.6;
      const mundoPorPx = (2 * dz * t) / altoPx;
      const sx = (enc.vuelo.cx - anchoPx / 2) * mundoPorPx;
      const sy = -(enc.vuelo.cy + oy - altoPx / 2) * mundoPorPx;
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camara.quaternion);
      const der = new THREE.Vector3(1, 0, 0).applyQuaternion(camara.quaternion);
      const arr = new THREE.Vector3(0, 1, 0).applyQuaternion(camara.quaternion);
      objetivo.pos
        .copy(camara.position)
        .addScaledVector(fwd, dz)
        .addScaledVector(der, sx)
        .addScaledVector(arr, sy);
      objetivo.quat.copy(camara.quaternion);
      objetivo.escala = (enc.vuelo.ancho * mundoPorPx) / W;

      // botones reales: tamaño base de la tarjeta de frente; cada cuadro solo
      // se les cambia el transform
      const bw = enc.anchoFrente;
      const bh = (bw * H) / W;
      for (const b of puente.botones) {
        if (!b) continue;
        b.style.width = `${bw}px`;
        b.style.height = `${bh}px`;
      }
      for (const tj of tarjetas) tj.visible = null;
      return enc;
    },

    cuadro({ t, dt, scroll, puente, camara }) {
      giro.t = t;
      compartidos.uTiempo.value = t;

      // scroll suavizado (Lenis ya suaviza; esto evita saltos al reanudar)
      if (Number.isNaN(giro.scroll)) giro.scroll = scroll;
      giro.scroll += (scroll - giro.scroll) * suave(dt * 9);

      // ── fisica del giro ──
      const radPorPx = a / (enc.anchoFrente * 1.1);
      const arr = puente.arrastre;
      if (arr.activo) {
        giro.ang += arr.dx * radPorPx;
        arr.dx = 0;
        giro.arrastrando = true;
        giro.vel = 0;
        puente.irA = null;
      } else if (giro.arrastrando) {
        giro.arrastrando = false;
        giro.vel = Math.max(-GIRO.velMax, Math.min(GIRO.velMax, arr.vel * radPorPx));
        arr.vel = 0;
      }

      const libre =
        puente.hover < 0 && puente.foco < 0 && !arr.activo && puente.irA === null && vuelo.i < 0;
      giro.auto += ((libre ? 1 : 0) - giro.auto) * suave(dt * 1.2);

      if (puente.irA !== null && !arr.activo) {
        const total = giro.ang - porScroll(giro.scroll);
        const meta = totalPara(puente.irA, total, n) + porScroll(giro.scroll);
        giro.ang += (meta - giro.ang) * suave(dt * 6);
        giro.vel = 0;
        if (Math.abs(meta - giro.ang) < 0.0015) {
          giro.ang = meta;
          puente.irA = null;
        }
      } else if (!arr.activo) {
        giro.ang += giro.vel * dt;
        giro.vel *= Math.exp(-GIRO.friccion * dt);
        if (vuelo.i < 0 && !enc.estrecho) {
          // compu: el anillo entero gira solo, despacio
          giro.ang -= GIRO.auto * giro.auto * dt;
        } else if (vuelo.i < 0 && Math.abs(giro.vel) < 0.4) {
          // celular: se asienta con una tarjeta de frente y avanza de a una
          const tot = giro.ang - porScroll(giro.scroll);
          const cerca = indiceFrente(tot, n);
          if (Math.abs(normalizar(-cerca * a - tot)) > 0.002) {
            puente.irA = cerca;
            giro.vel = 0;
          } else if (puente.hover < 0 && puente.foco < 0) {
            giro.reposo += dt;
            if (giro.reposo > GIRO.pausa) {
              giro.reposo = 0;
              puente.irA = (cerca + 1) % n;
            }
          }
        }
      }
      if (arr.activo || puente.irA !== null || puente.hover >= 0 || puente.foco >= 0 || vuelo.i >= 0) giro.reposo = 0;

      const total = giro.ang - porScroll(giro.scroll);
      const frente = indiceFrente(total, n);
      if (frente !== giro.frente) {
        giro.frente = frente;
        puente.frente = frente;
        puente.alCambiarFrente?.(frente);
      }

      // ── vuelo ──
      if (vuelo.i >= 0 && vuelo.desde !== vuelo.hasta) {
        if (Number.isNaN(vuelo.t0)) vuelo.t0 = t;
        const k = Math.min(1, (t - vuelo.t0) / vuelo.dur);
        // ida: acelera hacia la camara y la ficha HTML sigue el movimiento;
        // vuelta: sale rapido de la ficha y se posa suave en el anillo
        vuelo.v = vuelo.hasta > vuelo.desde ? k * k : (1 - k) * (1 - k);
        if (k >= 1) {
          vuelo.v = vuelo.hasta;
          vuelo.desde = vuelo.hasta;
          const fin = vuelo.fin;
          vuelo.fin = null;
          if (vuelo.hasta === 0) vuelo.i = -1;
          fin?.();
        }
      }
      const dimGlobal = vuelo.i >= 0 ? vuelo.v : 0;

      // ── tarjetas ──
      camPos.setFromMatrixPosition(camara.matrixWorld);
      for (let i = 0; i < n; i++) {
        const tj = tarjetas[i];
        const quiere = puente.hover === i || puente.foco === i ? 1 : 0;
        tj.hover += (quiere - tj.hover) * suave(dt * 10);
        if (tj.cargada) tj.u.uTexOn.value += (1 - tj.u.uTexOn.value) * suave(dt * 4);

        const th = i * a + total;
        cosenos[i] = Math.cos(th);
        const empuje = 0.24 * tj.hover;
        tmpPos.set((R + empuje) * Math.sin(th), 0.04 * tj.hover, (R + empuje) * Math.cos(th));
        ringQuat.setFromAxisAngle(eje, th);
        let escala = 1 + 0.05 * tj.hover;
        const v = vuelo.i === i ? vuelo.v : 0;
        if (v > 0) {
          tmpPos.lerp(objetivo.pos, v);
          tmpQuat.slerpQuaternions(ringQuat, objetivo.quat, v);
          escala += (objetivo.escala - escala) * v;
        } else {
          tmpQuat.copy(ringQuat);
        }

        const m = tj.malla;
        m.position.copy(tmpPos);
        m.quaternion.copy(tmpQuat);
        m.scale.setScalar(escala);
        m.renderOrder = vuelo.i === i ? 10 : 0;
        m.updateMatrixWorld();

        tj.u.uHover.value = tj.hover;
        tj.u.uVuelo.value = v;
        tj.u.uCurva.value = (1 - v) / R;
        tj.u.uDim.value = vuelo.i === i ? 0 : dimGlobal;

        if (tj.reflejo) {
          tj.reflejo.position.set(tmpPos.x, 2 * pisoY - tmpPos.y, tmpPos.z);
          tj.reflejo.quaternion.copy(tmpQuat);
          tj.reflejo.scale.setScalar(escala);
          tj.reflejo.visible = v < 0.98;
        }
      }
      piso.rotation.y = total;

      // ── botones: cada uno sobre el rect proyectado de su plano ──
      // la mas cercana arriba: es la que recibe el click donde se superponen
      orden.sort((x, y) => cosenos[y] - cosenos[x]);
      for (let r = 0; r < n; r++) tarjetas[orden[r]].z = n - r;
      for (let i = 0; i < n; i++) {
        const b = puente.botones[i];
        if (!b) continue;
        const tj = tarjetas[i];
        const m = tj.malla;
        const k = tj.u.uCurva.value;
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (let s = 0; s < 6; s++) {
          const lx = s < 4 ? (s % 2 === 0 ? -W / 2 : W / 2) : 0;
          const ly = s < 4 ? (s < 2 ? -H / 2 : H / 2) : s === 4 ? -H / 2 : H / 2;
          const bx = k > 0.0001 ? Math.sin(lx * k) / k : lx;
          const bz = k > 0.0001 ? (Math.cos(lx * k) - 1) / k : 0;
          punto.set(bx, ly, bz).applyMatrix4(m.matrixWorld).project(camara);
          const px = ((punto.x + 1) / 2) * ancho;
          const py = ((1 - punto.y) / 2) * alto;
          if (px < x0) x0 = px;
          if (px > x1) x1 = px;
          if (py < y0) y0 = py;
          if (py > y1) y1 = py;
        }
        const bw = enc.anchoFrente;
        const bh = (bw * H) / W;
        b.style.transform = `translate3d(${x0.toFixed(1)}px,${y0.toFixed(1)}px,0) scale(${((x1 - x0) / bw).toFixed(4)},${((y1 - y0) / bh).toFixed(4)})`;

        // de espaldas o muy de costado no se puede tocar (pero sigue en el orden del teclado)
        punto.set(0, 0, 1).applyQuaternion(m.quaternion);
        tmpPos.copy(camPos).sub(m.position);
        const visible = punto.dot(tmpPos) > 0 && cosenos[i] > -0.15;
        if (visible !== tj.visible) {
          tj.visible = visible;
          b.dataset.atras = visible ? "0" : "1";
        }
        const z = String(tj.z);
        if (b.style.zIndex !== z) b.style.zIndex = z;
      }
    },

    dispose() {
      geo.dispose();
      geoPiso.dispose();
      geoLuz.dispose();
      vacia.dispose();
      materiales.forEach((m) => m.dispose());
      texturas.forEach((tx) => tx.dispose());
      vuelo.fin?.();
    },
  };
}
