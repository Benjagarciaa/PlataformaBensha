"use client";

/**
 * Un solo requestAnimationFrame para todo el sitio.
 *
 * Acá hay UN loop, y lo maneja TrazoProvider (lib/trazo.tsx). Hoy lo usa solo
 * el scroll suave de Lenis: nada mide el layout ni escribe estilos por frame.
 * Las escenas leen el scroll con useScroll de motion y los loops ambientales
 * son animaciones CSS en el compositor. Cuando no queda nadie suscrito, el
 * loop se apaga solo. La escena 3D del hero es la excepción documentada.
 */

type Suscriptor = {
  cb: (t: number) => void;
  intervalo: number;
  ultimo: number;
};

const suscriptores = new Set<Suscriptor>();
let raf = 0;
let corriendo = false;

function loop(t: number) {
  for (const s of suscriptores) {
    if (t - s.ultimo >= s.intervalo) {
      s.ultimo = t;
      s.cb(t);
    }
  }
  raf = window.requestAnimationFrame(loop);
}

function arrancar() {
  if (corriendo) return;
  corriendo = true;
  raf = window.requestAnimationFrame(loop);
}

function frenar() {
  corriendo = false;
  window.cancelAnimationFrame(raf);
}

/**
 * Suscribe un callback al loop compartido.
 * @param cb        qué hacer en cada tick
 * @param fps       cuántas veces por segundo. 60 es el máximo, 10 alcanza
 *                  para cosas que el ojo no percibe como animación.
 * @returns         la función para darse de baja
 */
export function onFrame(cb: (t: number) => void, fps = 60): () => void {
  const s: Suscriptor = {
    cb,
    intervalo: fps >= 60 ? 0 : 1000 / fps,
    ultimo: 0,
  };
  suscriptores.add(s);
  arrancar();

  return () => {
    suscriptores.delete(s);
    if (suscriptores.size === 0) frenar();
  };
}

/** Pausa el loop con la pestaña oculta: no tiene sentido medir sin nadie mirando. */
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) frenar();
    else if (suscriptores.size > 0) arrancar();
  });
}
