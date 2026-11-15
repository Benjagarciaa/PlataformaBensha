"use client";

import { useEffect } from "react";
import { content } from "@/content/data";
import { cuandoEsteOcioso } from "@/lib/arranque";

/**
 * Microsoft Clarity (mapas de calor y grabaciones), cargado sin competir con
 * el hero: entra en un momento ocioso cuando el hero ya salio de la pantalla
 * o a los 12 segundos, lo que pase primero. Nunca con la primera rueda o el
 * primer toque, que es justo cuando el hero arma su escena.
 *
 * Ademas le pasa a Clarity los tiempos reales de la escena 3D (las marcas
 * hero:montar, hero:listo y hero:visible), medidos en cada dispositivo.
 */
export function Analitica() {
  useEffect(() => {
    const id = content.seo.clarityId;
    if (!id) return;
    let hecho = false;
    const cargar = () => {
      if (hecho) return;
      hecho = true;
      limpiar();
      type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] };
      const w = window as Window & { clarity?: Clarity };
      const cola: Clarity = (...args: unknown[]) => {
        (cola.q = cola.q || []).push(args);
      };
      w.clarity = w.clarity || cola;
      for (const nombre of ["hero:montar", "hero:listo", "hero:visible"]) {
        const marca = performance.getEntriesByName(nombre)[0];
        if (marca) w.clarity("set", nombre, String(Math.round(marca.startTime)));
      }
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${id}`;
      document.head.appendChild(s);
    };
    const ocioso = () => {
      cuandoEsteOcioso(3000).then(cargar);
    };
    const timer = window.setTimeout(ocioso, 12000);
    const hero = document.getElementById("inicio");
    const io = hero
      ? new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) ocioso();
        })
      : null;
    if (hero) io?.observe(hero);
    const limpiar = () => {
      window.clearTimeout(timer);
      io?.disconnect();
    };
    return limpiar;
  }, []);

  return null;
}
