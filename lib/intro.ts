/**
 * La cortina de entrada (Intro) y la escena del hero se coordinan aca.
 *
 *  - La cortina avisa cuando aparece (tapa), cuando empieza a subir y cuando
 *    termino.
 *  - La escena avisa cuando ya pinto su primer cuadro (lista). La cortina se
 *    levanta apenas la escena esta lista (con un minimo para que se lea el
 *    nombre y un maximo para no hacer esperar a nadie): cuando sube, el caos
 *    ya se esta moviendo detras.
 *  - Si la escena llega con la cortina tapando, aparece de una (no hay nada
 *    que fundir). Si llega despues, funde con el caos en SVG.
 */

const FIN = "plano:intro-fin";
const LISTA = "plano:escena-lista";

let tapando = false;
let terminada = false;
let lista = false;

/** La cortina se va a ver: tapa el hero hasta que empiece a subir. */
export function marcarIntroTapa() {
  if (!terminada) tapando = true;
}

/** La cortina empieza a subir: desde ahora el hero se ve. */
export function marcarIntroSube() {
  tapando = false;
}

export function marcarIntroFin() {
  tapando = false;
  if (terminada) return;
  terminada = true;
  window.dispatchEvent(new Event(FIN));
}

/** true mientras la cortina tapa el hero (todavia no empezo a subir). */
export function cortinaTapa() {
  return tapando;
}

export function introTerminada() {
  return terminada;
}

/** Resuelve cuando la intro termino (o enseguida si ya termino). */
export function esperarIntro(tope = 4000): Promise<void> {
  if (terminada) return Promise.resolve();
  return new Promise((resolve) => {
    const listo = () => {
      window.clearTimeout(timer);
      window.removeEventListener(FIN, listo);
      resolve();
    };
    // Red de seguridad: si la intro no aparece, no bloquear para siempre.
    const timer = window.setTimeout(listo, tope);
    window.addEventListener(FIN, listo);
  });
}

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
