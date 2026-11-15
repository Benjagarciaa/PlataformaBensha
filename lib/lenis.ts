import type Lenis from "lenis";
import { activarTodas } from "@/lib/trazo";

/**
 * Puente para alcanzar la instancia de Lenis desde cualquier componente.
 *
 * Lenis maneja el scroll suave en el loop global. Si se navega con el
 * scrollIntoView nativo, Lenis lo pisa en el frame siguiente y el salto "se
 * pierde" (el bug de tener que tocar dos veces). Con su scrollTo el movimiento
 * vive dentro de su loop y responde al primer click.
 *
 * TrazoProvider registra la instancia al montar y la limpia al desmontar.
 * Con reduced-motion no hay Lenis y el salto es directo.
 */

let instancia: Lenis | null = null;

export function registrarLenis(lenis: Lenis | null) {
  instancia = lenis;
}

const dosCuadros = (cb: () => void) =>
  window.requestAnimationFrame(() => window.requestAnimationFrame(cb));

/** Lo que falta para que el destino quede arriba de todo (0 es llegar). */
const desvio = (objetivo: HTMLElement) => objetivo.getBoundingClientRect().top;

/**
 * Lenis guarda el alto de la pagina y lo actualiza con un ResizeObserver con
 * demora: si las escenas recien se encendieron, su limite es viejo y el salto
 * queda corto. Antes de saltar se le pide que vuelva a medir, y al llegar se
 * confirma la posicion: si quedo corta (otra seccion cambio de alto en el
 * camino), se completa el salto, hasta dos veces.
 */
function llegar(objetivo: HTMLElement, intento = 0) {
  if (!instancia) return;
  instancia.resize();
  instancia.scrollTo(objetivo, {
    onComplete: () => {
      if (Math.abs(desvio(objetivo)) > 2 && intento < 2) llegar(objetivo, intento + 1);
    },
  });
}

/**
 * Mientras el alto de la pagina siga cambiando (fuentes, imagenes, secciones
 * que se montan), el destino se vuelve a alinear apenas el alto se queda
 * quieto unos 300 ms. Se usa al entrar con un ancla en la URL. Deja de mirar
 * a los 3 s o con la primera rueda o toque de la persona.
 */
function sostener(objetivo: HTMLElement) {
  let quieto = 0;
  const corregir = () => {
    if (Math.abs(desvio(objetivo)) <= 2) return;
    if (instancia) {
      instancia.resize();
      instancia.scrollTo(objetivo, { immediate: true, force: true });
    } else {
      objetivo.scrollIntoView({ behavior: "auto" });
    }
  };
  const ro = new ResizeObserver(() => {
    window.clearTimeout(quieto);
    quieto = window.setTimeout(corregir, 300);
  });
  ro.observe(document.body);
  const soltar = () => {
    ro.disconnect();
    window.clearTimeout(quieto);
    window.clearTimeout(tope);
    window.removeEventListener("wheel", soltar);
    window.removeEventListener("touchstart", soltar);
    window.removeEventListener("keydown", soltar);
  };
  const tope = window.setTimeout(soltar, 3000);
  window.addEventListener("wheel", soltar, { passive: true, once: true });
  window.addEventListener("touchstart", soltar, { passive: true, once: true });
  window.addEventListener("keydown", soltar, { once: true });
  document.fonts?.ready.then(() => {
    window.clearTimeout(quieto);
    quieto = window.setTimeout(corregir, 300);
  });
}

/**
 * Baja suave a una seccion por id. Cae al scroll nativo si Lenis no esta.
 * Antes enciende todas las escenas (cambian de alto al encenderse) y espera
 * dos cuadros a que React las pinte: asi el destino se mide bien.
 * `alMontar` corre con todas las secciones ya montadas, antes del scroll.
 * `sostener` vuelve a alinear el destino mientras el alto de la pagina cambie.
 */
export function irASeccion(id: string, opciones: { alMontar?: () => void; sostener?: boolean } = {}) {
  activarTodas();
  dosCuadros(() => {
    opciones.alMontar?.();
    const objetivo = document.getElementById(id.replace(/^#/, ""));
    if (!objetivo) return;
    if (opciones.sostener) sostener(objetivo);
    if (instancia) {
      llegar(objetivo);
      return;
    }
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    objetivo.scrollIntoView({ behavior: quieto ? "auto" : "smooth" });
  });
}

/** Baja suave hasta una posicion absoluta de la pagina (en px). */
export function irAPosicion(y: number) {
  if (instancia) {
    instancia.scrollTo(y);
    return;
  }
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: quieto ? "auto" : "smooth" });
}
