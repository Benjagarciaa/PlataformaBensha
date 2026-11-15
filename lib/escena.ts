"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Utilidades de las escenas de scroll. Todas las transformaciones se escriben
 * en forma de funcion sobre el progreso (0..1) que da useScroll de motion: asi
 * quedan en el mismo reloj, sin ViewTimeline nativo (que con sticky mide otro
 * rango) y sin listeners de scroll propios.
 */

export type Rango = readonly [number, number];

/** 0..1 dentro del tramo [a, b], clampeado. */
export function tramo(v: number, [a, b]: Rango) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

export function suave(t: number) {
  return t * t * (3 - 2 * t);
}

export function mezcla(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Sube en [a, b], se mantiene, baja en [c, d]. */
export function meseta(v: number, a: number, b: number, c: number, d: number) {
  return Math.min(tramo(v, [a, b]), 1 - tramo(v, [c, d]));
}

/** Funcion lista para useTransform: interpola desde-hasta dentro del tramo. */
export function mapa(rango: Rango, desde: number, hasta: number) {
  return (v: number) => mezcla(desde, hasta, suave(tramo(v, rango)));
}

/**
 * true mientras el elemento esta en pantalla y la pestaña visible. Para los
 * loops que corren en JS (contadores): fuera de pantalla no gastan nada.
 */
export function useActiva(ref: RefObject<Element | null>, margen = "0px") {
  const [enPantalla, setEnPantalla] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting), {
      rootMargin: margen,
    });
    io.observe(el);
    const cambio = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", cambio);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", cambio);
    };
  }, [ref, margen]);

  return enPantalla && visible;
}
