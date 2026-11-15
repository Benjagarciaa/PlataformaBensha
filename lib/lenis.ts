import type Lenis from "lenis";
import { activarTodas } from "@/lib/trazo";

/**
 * Puente para alcanzar la instancia de Lenis desde cualquier componente.
 *
 * Lenis maneja el scroll suave en el loop global. Si se navega con el
 * scrollIntoView nativo, Lenis lo pisa en el frame siguiente y el salto "se
 * pierde" (el bug de tener que tocar dos veces). Con su scrollTo el movimiento
 * vive dentro de su loop y responde al primer click.
 *
 * TrazoProvider registra la instancia al montar y la limpia al desmontar.
 * Con reduced-motion no hay Lenis y el salto es directo.
 */

let instancia: Lenis | null = null;

export function registrarLenis(lenis: Lenis | null) {
  instancia = lenis;
}

/**
 * Baja suave a una seccion por id. Cae al scroll nativo si Lenis no esta.
 * Antes enciende todas las escenas (cambian de alto al encenderse) y espera
 * dos cuadros a que React las pinte: asi el destino se mide bien.
 */
export function irASeccion(id: string) {
  activarTodas();
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => {
      const objetivo = document.getElementById(id.replace(/^#/, ""));
      if (!objetivo) return;
      if (instancia) {
        instancia.scrollTo(objetivo);
        return;
      }
      const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      objetivo.scrollIntoView({ behavior: quieto ? "auto" : "smooth" });
    })
  );
}
