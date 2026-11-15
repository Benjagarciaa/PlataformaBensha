"use client";

import { useEffect } from "react";
import { content } from "@/content/data";

/**
 * Microsoft Clarity (mapas de calor y grabaciones), cargado sin competir con
 * la primera carga: entra con la primera interaccion de la persona (tocar,
 * hacer clic, la rueda o una tecla) o a los 7 segundos, lo que pase primero.
 * Asi el script de terceros no suma tiempo de bloqueo mientras la pagina
 * aparece. Sin listeners de scroll: la rueda y el toque alcanzan.
 */
const EVENTOS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export function Analitica() {
  useEffect(() => {
    const id = content.seo.clarityId;
    if (!id) return;
    let hecho = false;
    const cargar = () => {
      if (hecho) return;
      hecho = true;
      limpiar();
      const w = window as Window & { clarity?: ((...args: unknown[]) => void) & { q?: unknown[] } };
      w.clarity =
        w.clarity ||
        function (...args: unknown[]) {
          (w.clarity!.q = w.clarity!.q || []).push(args);
        };
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${id}`;
      document.head.appendChild(s);
    };
    const timer = window.setTimeout(cargar, 7000);
    const limpiar = () => {
      window.clearTimeout(timer);
      EVENTOS.forEach((e) => window.removeEventListener(e, cargar));
    };
    EVENTOS.forEach((e) => window.addEventListener(e, cargar, { once: true, passive: true }));
    return limpiar;
  }, []);

  return null;
}
