/**
 * Aviso de que la cortina de entrada (Intro) termino.
 *
 * El hero 3D carga three y arma el canvas DURANTE la cortina (con el loop en
 * pausa) y lo enciende cuando la cortina se levanta: asi la escena ya esta
 * cuando se ve el hero, sin un instante vacio.
 */

const EVENTO = "plano:intro-fin";
let terminada = false;

export function marcarIntroFin() {
  if (terminada) return;
  terminada = true;
  window.dispatchEvent(new Event(EVENTO));
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
      window.removeEventListener(EVENTO, listo);
      resolve();
    };
    // Red de seguridad: si la intro no aparece, no bloquear para siempre.
    const timer = window.setTimeout(listo, tope);
    window.addEventListener(EVENTO, listo);
  });
}
