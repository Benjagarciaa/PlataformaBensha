"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { onFrame } from "@/lib/raf";
import { irASeccion, registrarLenis } from "@/lib/lenis";

/**
 * TrazoProvider: el reloj global del sitio.
 *
 * Un solo requestAnimationFrame (lib/raf.ts) para todo lo que necesita correr
 * por frame en JS: hoy es solo el scroll suave de Lenis. Lo que "respira" en
 * pantalla (pulsos, loops ambientales) va con animaciones CSS de transform y
 * opacity, que corren en el compositor y no tocan el hilo principal.
 *
 * Antes este provider escribia --trazo en :root en cada frame: eso invalidaba
 * el estilo de TODA la pagina sesenta veces por segundo y era la causa
 * principal del TBT en mobile. Ahora no escribe nada por frame.
 *
 * Tambien decide si las escenas pueden estar "vivas": con JS cargado y sin
 * reduced-motion pone data-escenas en <html>. Sin eso (servidor, sin JS, JS
 * que no cargo, reduced-motion) cada escena muestra su version estatica.
 *
 * Ademas, cada seccion se enciende recien cuando se acerca a la pantalla
 * (<Section>, components/ui/Section.tsx): al cargar solo vive el hero y el
 * resto queda en su version estatica, que es mas liviana. Un salto por ancla
 * (nav, riel, link con #) las enciende todas antes de medir a donde ir.
 */

type Trazo = {
  /** true cuando las escenas de scroll pueden animar */
  vivo: boolean;
};

const TrazoContext = createContext<Trazo>({ vivo: false });

const CONSULTA = "(prefers-reduced-motion: reduce)";

function suscribir(avisar: () => void) {
  const media = window.matchMedia(CONSULTA);
  media.addEventListener("change", avisar);
  return () => media.removeEventListener("change", avisar);
}

const conMovimiento = () => !window.matchMedia(CONSULTA).matches;
// En el servidor y al hidratar: estatico. Las escenas se encienden despues.
const enServidor = () => false;

// ── "encender todas": antes de un salto por ancla ─────────────────────────
let todas = false;
const avisos = new Set<() => void>();

/** Enciende todas las secciones (sus alturas finales quedan fijas). */
export function activarTodas() {
  if (todas) return;
  todas = true;
  avisos.forEach((a) => a());
}

function suscribirTodas(avisar: () => void) {
  avisos.add(avisar);
  return () => {
    avisos.delete(avisar);
  };
}

/** true despues de activarTodas(). */
export function useTodas() {
  return useSyncExternalStore(
    suscribirTodas,
    () => todas,
    () => false
  );
}

export function TrazoProvider({ children }: { children: React.ReactNode }) {
  const vivo = useSyncExternalStore(suscribir, conMovimiento, enServidor);

  useEffect(() => {
    const raiz = document.documentElement;
    if (vivo) raiz.dataset.escenas = "vivas";
    else delete raiz.dataset.escenas;
    // si se entra con un ancla (#contacto): se encienden todas (alturas
    // finales) y se vuelve a ir al ancla, ya bien medida
    if (vivo && window.location.hash) irASeccion(window.location.hash, { sostener: true });
  }, [vivo]);

  // Scroll suave, colgado del loop global. Con reduced-motion, scroll nativo.
  useEffect(() => {
    if (!vivo) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.05,
    });
    registrarLenis(lenis);
    const baja = onFrame((t) => lenis.raf(t));
    return () => {
      baja();
      lenis.destroy();
      registrarLenis(null);
    };
  }, [vivo]);

  // Con teclado: al primer Tab se montan todas las secciones diferidas. Asi el
  // foco nunca entra en HTML del servidor que despues se reemplaza (el foco se
  // perderia en <body>).
  useEffect(() => {
    const tab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      window.removeEventListener("keydown", tab);
      activarTodas();
    };
    window.addEventListener("keydown", tab);
    return () => window.removeEventListener("keydown", tab);
  }, []);

  const valor = useMemo(() => ({ vivo }), [vivo]);
  return <TrazoContext.Provider value={valor}>{children}</TrazoContext.Provider>;
}

/** true cuando las escenas de scroll pueden animar (cliente, sin reduced-motion). */
export function useVivo() {
  return useContext(TrazoContext).vivo;
}
