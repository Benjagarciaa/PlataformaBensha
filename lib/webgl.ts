/**
 * ¿Hay WebGL2 con aceleración por hardware?
 *
 * Si el navegador solo renderiza por software (SwiftShader, llvmpipe: PCs sin
 * GPU, servidores de medición), la escena 3D costaría más de lo que aporta:
 * el hero usa el SVG estático y el carrusel de trabajos, la grilla. Con
 * `?webgl=forzar` en la URL se saltea el chequeo, solo para QA headless.
 *
 * Se calcula una sola vez por carga. Crear un contexto no es gratis, así que el
 * del chequeo no se tira: se crea con las opciones de la escena del hero y el
 * motor lo toma (tomarContexto) en vez de crear otro.
 */

let cache: boolean | null = null;
let reserva: { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null = null;

/** Celular o tablet: escena liviana, sin antialias y con menos densidad. */
export function esMovil() {
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
}

export function webglForzado() {
  return new URLSearchParams(window.location.search).get("webgl") === "forzar";
}

/** Las opciones del contexto de la escena del hero. */
export function opcionesContexto(movil: boolean, forzar: boolean): WebGLContextAttributes {
  return {
    alpha: true,
    antialias: !movil,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: !forzar,
  };
}

/** Densidad de pixeles de la escena del hero (con tope: no rasterizar de mas). */
export function dprEscena(movil: boolean) {
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), movil ? 1.5 : 1.75);
}

/**
 * Crear un contexto es caro (con GPU por software, cientos de ms): quien lo
 * llama lo hace despues del primer pintado, nunca durante la hidratacion.
 * `tam` es el tamaño final del canvas en pixeles: el contexto nace con su
 * backbuffer definitivo y el motor no lo tiene que volver a reservar.
 */
export function hayWebGLAcelerado(tam?: { ancho: number; alto: number }) {
  if (cache !== null) return cache;
  try {
    const forzar = webglForzado();
    const canvas = document.createElement("canvas");
    if (tam && tam.ancho > 0 && tam.alto > 0) {
      canvas.width = tam.ancho;
      canvas.height = tam.alto;
    }
    const gl = canvas.getContext("webgl2", opcionesContexto(esMovil(), forzar));
    if (!gl) {
      cache = false;
      return cache;
    }
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    cache = forzar || !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    if (cache) reserva = { canvas, gl };
    else gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cache = false;
  }
  return cache;
}

/** El contexto que creó el chequeo, para la escena. Se entrega una sola vez. */
export function tomarContexto() {
  const r = reserva;
  reserva = null;
  return r && !r.gl.isContextLost() ? r : null;
}
