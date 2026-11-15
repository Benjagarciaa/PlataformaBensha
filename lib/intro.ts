/**
 * Aviso de que la cortina de entrada (Intro) termino.
 *
 * El hero 3D espera a esto para cargar WebGL: mientras la cortina tapa la
 * pagina no tiene sentido gastar CPU en una escena que nadie ve, y asi la
 * carga pesada no compite con la primera pintura.
 */

const EVENTO = "plano:intro-fin";
let terminada = false;

export function marcarIntroFin() {
  if (terminada) return;
  terminada = true;
  window.dispatchEvent(new Event(EVENTO));
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
