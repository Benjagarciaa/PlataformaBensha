/**
 * ¿Hay WebGL con aceleración por hardware?
 *
 * Si el navegador solo renderiza por software (SwiftShader, llvmpipe: PCs sin
 * GPU, servidores de medición), la escena 3D costaría más de lo que aporta:
 * el hero usa el SVG estático y la cortina de entrada no hace falta (su razón
 * de ser es darle tiempo a cargar a la escena). `?webgl=forzar` en la URL
 * saltea el chequeo, solo para QA con navegadores headless.
 *
 * Se calcula una sola vez por carga: crear un contexto WebGL no es gratis.
 */

let cache: boolean | null = null;

export function hayWebGLAcelerado() {
  if (cache !== null) return cache;
  try {
    const forzar = new URLSearchParams(window.location.search).get("webgl") === "forzar";
    const opciones: WebGLContextAttributes = { failIfMajorPerformanceCaveat: !forzar };
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", opciones) ?? canvas.getContext("webgl", opciones);
    if (!gl) {
      cache = false;
      return cache;
    }
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cache = forzar || !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    cache = false;
  }
  return cache;
}
