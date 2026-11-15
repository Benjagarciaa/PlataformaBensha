import { onFrame } from "@/lib/raf";
import { dprEscena, opcionesContexto, tomarContexto, webglForzado } from "@/lib/webgl";
import { SHADERS, crearEscena, type Atributo, type Dibujo, type Programa } from "./geometrias";
import { multiplicar, m4 } from "./mat";

/**
 * Motor de la escena del hero: WebGL2 directo, sin three ni React Three Fiber.
 *
 * La escena son lineas y planos con shaders propios: no necesita una libreria
 * de 900 KB. Este modulo pesa unos pocos KB y viaja con el hero. El hero lo
 * llama despues del primer pintado (nunca durante la hidratacion) y arma todo
 * con el caos en SVG ya moviendose a la vista:
 *  1. toma el contexto que ya creo el chequeo de WebGL (lib/webgl.ts),
 *  2. manda a compilar los shaders (en paralelo si el navegador puede),
 *  3. mientras tanto arma las geometrias y las sube a la GPU,
 *  4. pinta un primer cuadro oculto. Recien ahi avisa que esta lista.
 *
 * El loop cuelga del requestAnimationFrame unico del sitio (lib/raf.ts) y
 * corre solo cuando el hero lo pide (en pantalla, pestaña visible).
 */

export type OpcionesMotor = {
  /** donde va el canvas (ocupa todo el contenedor) */
  contenedor: HTMLElement;
  /** progreso del tramo fijo, 0..1 (un MotionValue sirve) */
  progreso: { get: () => number };
  movil: boolean;
  /** pointer fine: hay parallax y repulsion del mouse */
  puntero: boolean;
  /** el elemento que escucha el mouse (el canvas no recibe eventos) */
  zonaPuntero: HTMLElement | null;
  /** el navegador tiro el contexto: el hero vuelve a su version estatica */
  alPerder?: () => void;
};

export type Motor = {
  activar: (si: boolean) => void;
  /** vuelve el reloj del caos a 0: el primer cuadro es igual al caos en SVG */
  reiniciarReloj: () => void;
  destruir: () => void;
};

const PREFIJO_VERT = `#version 300 es
#define attribute in
#define varying out
precision highp float;
precision highp int;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position;
in vec2 uv;
`;

const PREFIJO_FRAG = `#version 300 es
#define varying in
precision highp float;
precision highp int;
layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
`;

type Uni = { loc: WebGLUniformLocation; tipo: number };
type Prog = {
  p: WebGLProgram;
  vs: WebGLShader;
  fs: WebGLShader;
  u: Map<string, Uni>;
  a: Map<string, number>;
};
type Listo = Dibujo & { vao: WebGLVertexArrayObject };

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function montar(o: OpcionesMotor): Promise<Motor> {
  performance.mark("hero:montar");
  const dpr = () => dprEscena(o.movil);

  // 1. contexto: el del chequeo de WebGL, o uno nuevo si no quedo
  const reserva = tomarContexto();
  const canvas = reserva?.canvas ?? document.createElement("canvas");
  const gl = reserva?.gl ?? canvas.getContext("webgl2", opcionesContexto(o.movil, webglForzado()));
  if (!gl) throw new Error("sin webgl2");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";

  // 2. shaders: se compilan mientras se arman las geometrias
  const paralelo = gl.getExtension("KHR_parallel_shader_compile");
  const progs = {} as Record<Programa, Prog>;
  for (const nombre of Object.keys(SHADERS) as Programa[]) {
    const { vert, frag } = SHADERS[nombre];
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, PREFIJO_VERT + vert);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, PREFIJO_FRAG + frag);
    gl.compileShader(fs);
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    progs[nombre] = { p, vs, fs, u: new Map(), a: new Map() };
  }

  // 3. geometrias: datos de CPU (ya encuadrados) y buffers en la GPU. Entre
  // paso y paso se le devuelve el hilo al navegador.
  await espera(0);
  const escena = crearEscena(o.movil);
  const css = getComputedStyle(document.documentElement);
  // colores desde las variables CSS: ningun color escrito a mano
  escena.colores(css.getPropertyValue("--accent").trim(), css.getPropertyValue("--text").trim());

  let ancho = 0;
  let alto = 0;
  const medir = (inicial = false) => {
    const w = o.contenedor.clientWidth;
    const h = o.contenedor.clientHeight;
    if (w === 0 || h === 0) return false;
    const r = dpr();
    const bw = Math.floor(w * r);
    const bh = Math.floor(h * r);
    if (w === ancho && h === alto && canvas.width === bw && canvas.height === bh) return false;
    ancho = w;
    alto = h;
    canvas.width = bw;
    canvas.height = bh;
    const cambiados = escena.encuadrar(w, h);
    if (!inicial) resubir(cambiados);
    return true;
  };
  medir(true);

  const buffers = new Map<Atributo, WebGLBuffer>();
  for (const d of escena.dibujos) {
    for (const a of Object.values(d.atributos)) {
      if (buffers.has(a)) continue;
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, a.datos, gl.STATIC_DRAW);
      buffers.set(a, b);
    }
  }
  function resubir(lista: Atributo[]) {
    for (const a of lista) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffers.get(a)!);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, a.datos);
    }
  }
  o.contenedor.appendChild(canvas);

  // 4. esperar la compilacion sin trabar el hilo principal
  await espera(0);
  if (paralelo) {
    const listo = () =>
      Object.values(progs).every((pr) => gl.getProgramParameter(pr.p, paralelo.COMPLETION_STATUS_KHR));
    for (let i = 0; i < 200 && !listo(); i++) await espera(4);
  }
  for (const pr of Object.values(progs)) {
    if (!gl.getProgramParameter(pr.p, gl.LINK_STATUS)) {
      throw new Error(
        `shader: ${gl.getProgramInfoLog(pr.p)} ${gl.getShaderInfoLog(pr.vs)} ${gl.getShaderInfoLog(pr.fs)}`
      );
    }
    const nu = gl.getProgramParameter(pr.p, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < nu; i++) {
      const info = gl.getActiveUniform(pr.p, i)!;
      const loc = gl.getUniformLocation(pr.p, info.name);
      if (loc) pr.u.set(info.name, { loc, tipo: info.type });
    }
    const na = gl.getProgramParameter(pr.p, gl.ACTIVE_ATTRIBUTES) as number;
    for (let i = 0; i < na; i++) {
      const info = gl.getActiveAttrib(pr.p, i)!;
      pr.a.set(info.name, gl.getAttribLocation(pr.p, info.name));
    }
    gl.detachShader(pr.p, pr.vs);
    gl.detachShader(pr.p, pr.fs);
    gl.deleteShader(pr.vs);
    gl.deleteShader(pr.fs);
  }

  // un VAO por dibujo, agrupados por programa (un useProgram por grupo)
  const porPrograma = new Map<Programa, Listo[]>();
  for (const d of escena.dibujos) {
    const pr = progs[d.programa];
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    for (const [nombre, a] of Object.entries(d.atributos)) {
      const loc = pr.a.get(nombre);
      if (loc === undefined || loc < 0) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.get(a)!);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, a.tam, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(loc, a.instancia ? 1 : 0);
    }
    const lista = porPrograma.get(d.programa) ?? [];
    lista.push({ ...d, vao });
    porPrograma.set(d.programa, lista);
  }
  gl.bindVertexArray(null);

  const fijar = (pr: Prog, nombre: string, v: number | Float32Array) => {
    const u = pr.u.get(nombre);
    if (!u) return;
    if (typeof v === "number") gl.uniform1f(u.loc, v);
    else if (u.tipo === gl.FLOAT_MAT4) gl.uniformMatrix4fv(u.loc, false, v);
    else if (u.tipo === gl.FLOAT_VEC2) gl.uniform2fv(u.loc, v);
    else if (u.tipo === gl.FLOAT_VEC3) gl.uniform3fv(u.loc, v);
    else if (u.tipo === gl.FLOAT_VEC4) gl.uniform4fv(u.loc, v);
  };

  const modelVista = m4();
  const pintar = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // aditivo, como AdditiveBlending de three sin alfa premultiplicado
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
    // los planos solo de frente (FrontSide)
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    for (const [nombre, dibujos] of porPrograma) {
      const pr = progs[nombre];
      gl.useProgram(pr.p);
      for (const [k, v] of Object.entries(escena.uniforms)) fijar(pr, k, v);
      fijar(pr, "viewMatrix", escena.vista);
      fijar(pr, "projectionMatrix", escena.proyeccion);
      for (const d of dibujos) {
        const modelo = escena.modelos[d.modelo];
        fijar(pr, "modelMatrix", modelo);
        if (nombre === "halo") fijar(pr, "modelViewMatrix", multiplicar(modelVista, escena.vista, modelo));
        if (d.propios) for (const [k, v] of Object.entries(d.propios)) fijar(pr, k, v);
        gl.bindVertexArray(d.vao);
        const modo = d.lineas ? gl.LINES : gl.TRIANGLES;
        if (d.instancias > 0) gl.drawArraysInstanced(modo, 0, d.vertices, d.instancias);
        else gl.drawArrays(modo, 0, d.vertices);
      }
    }
    gl.bindVertexArray(null);
  };

  // ── estado por cuadro ─────────────────────────────────────────────────
  const mouse = { x: 0, y: 0, adentro: false };
  const st = { p: o.progreso.get(), mx: 0, my: 0, repel: 0 };
  let reloj = 0;
  let ultimo = 0;

  const cuadro = (dt: number) => {
    const actual = o.progreso.get();
    // Lenis suaviza la rueda; esto suaviza el resto (touch, saltos) y le da
    // al armado un minimo de recorrido aunque el scroll sea rapido.
    st.p += (actual - st.p) * (1 - Math.exp(-dt * 6));
    if (Math.abs(actual - st.p) < 0.0004) st.p = actual;
    const k = 1 - Math.exp(-dt * 4);
    const adentro = o.puntero && mouse.adentro;
    st.mx += ((adentro ? mouse.x : 0) - st.mx) * k;
    st.my += ((adentro ? mouse.y : 0) - st.my) * k;
    st.repel += ((adentro ? 1 : 0) - st.repel) * k;
    escena.cuadro({ p: st.p, t: reloj, mx: st.mx, my: st.my, rx: mouse.x, ry: mouse.y, repel: st.repel });
    // al final del recorrido la escena ya fundio con la pagina: no hay nada que pintar
    if (st.p < 1) pintar();
  };

  const tick = (t: number) => {
    const dt = ultimo ? Math.min((t - ultimo) / 1000, 0.05) : 1 / 60;
    ultimo = t;
    reloj += dt;
    cuadro(dt);
  };

  // primer cuadro, oculto: estrena los programas con todo ya en la GPU
  await espera(0);
  cuadro(0);
  performance.mark("hero:listo");

  // ── tamaño, mouse y contexto ──────────────────────────────────────────
  let quitar: (() => void) | null = null;
  const ro = new ResizeObserver(() => {
    if (medir() && !quitar) cuadro(0);
  });
  ro.observe(o.contenedor);

  const zona = o.zonaPuntero;
  const mover = (e: PointerEvent) => {
    if (!zona) return;
    const r = zona.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    mouse.adentro = true;
  };
  const salir = () => {
    mouse.adentro = false;
  };
  if (o.puntero && zona) {
    zona.addEventListener("pointermove", mover, { passive: true });
    zona.addEventListener("pointerleave", salir);
  }

  const perdido = (e: Event) => {
    e.preventDefault();
    quitar?.();
    quitar = null;
    o.alPerder?.();
  };
  canvas.addEventListener("webglcontextlost", perdido);

  return {
    activar(si) {
      if (si && !quitar) {
        ultimo = 0;
        quitar = onFrame(tick);
      } else if (!si && quitar) {
        quitar();
        quitar = null;
      }
    },
    reiniciarReloj() {
      reloj = 0;
    },
    destruir() {
      quitar?.();
      quitar = null;
      ro.disconnect();
      zona?.removeEventListener("pointermove", mover);
      zona?.removeEventListener("pointerleave", salir);
      canvas.removeEventListener("webglcontextlost", perdido);
      for (const b of buffers.values()) gl.deleteBuffer(b);
      for (const lista of porPrograma.values()) for (const d of lista) gl.deleteVertexArray(d.vao);
      for (const pr of Object.values(progs)) gl.deleteProgram(pr.p);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}
