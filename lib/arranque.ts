/**
 * El arranque de la pagina: la escena del hero tiene prioridad.
 *
 * Los primeros segundos el hilo principal es del hero: el motor 3D crea su
 * contexto, compila los shaders y sube las geometrias. Lo que no se ve todavia
 * (montar la primera seccion de abajo, pedir el carrusel de trabajos) espera a
 * que la escena avise que esta lista y a un momento ocioso del navegador.
 *
 * Sin cortina de entrada: el primer cuadro ya es el hero del servidor, con el
 * caos en SVG moviendose. La escena funde con ese SVG cuando llega.
 */

const LISTA = "plano:escena-lista";

let lista = false;

/** La escena del hero pinto su primer cuadro (o no va a haber escena). */
export function avisarEscenaLista() {
  if (lista) return;
  lista = true;
  window.dispatchEvent(new Event(LISTA));
}

/** Llama a `cb` cuando la escena esta lista. Devuelve la baja. */
export function alEscenaLista(cb: () => void): () => void {
  if (lista) {
    cb();
    return () => {};
  }
  window.addEventListener(LISTA, cb, { once: true });
  return () => window.removeEventListener(LISTA, cb);
}

/** Resuelve cuando la escena esta lista (o al tope, como red de seguridad). */
export function esperarEscena(tope = 4000): Promise<void> {
  if (lista) return Promise.resolve();
  return new Promise((resolve) => {
    const listo = () => {
      window.clearTimeout(timer);
      baja();
      resolve();
    };
    const timer = window.setTimeout(listo, tope);
    const baja = alEscenaLista(listo);
  });
}

/** Resuelve en un momento ocioso del navegador (con tope). */
export function cuandoEsteOcioso(tope: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: tope });
    } else {
      window.setTimeout(resolve, 120);
    }
  });
}

/** Despues del proximo pintado: el trabajo pesado no demora ese cuadro. */
export function trasPintar(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}
