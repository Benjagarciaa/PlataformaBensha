"use client";

/**
 * Un solo requestAnimationFrame para todo el sitio.
 *
 * Antes había cinco loops corriendo a la vez y cada componente medía por su
 * cuenta en cada frame. Además de gastar de más, cada getBoundingClientRect
 * fuerza al navegador a recalcular el layout: sesenta veces por segundo, por
 * once secciones, es tiempo de bloqueo del hilo principal que se paga en
 * Lighthouse y se siente en un celular de gama baja.
 *
 * Acá hay UN loop. Los suscriptores dicen cada cuánto quieren correr:
 * el progreso del scroll necesita fluidez, saber en qué sección estás no.
 * Cuando no queda nadie suscrito, el loop se apaga solo.
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
