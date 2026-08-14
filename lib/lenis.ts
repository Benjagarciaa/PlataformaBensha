import type Lenis from "lenis";

/**
 * Puente para alcanzar la instancia de Lenis desde cualquier componente.
 *
 * Lenis maneja el scroll en su propio loop (rAF). Si se navega con el
 * scrollIntoView nativo, el navegador arranca su animacion pero Lenis la pisa
 * en el frame siguiente y el salto "se pierde": de ahi el bug clasico de que
 * hay que tocar dos veces. Usando el scrollTo de Lenis el movimiento vive
 * dentro de su loop y responde siempre al primer click.
 *
 * LenisProvider registra la instancia al montar y la limpia al desmontar.
 */

let instancia: Lenis | null = null;

export function registrarLenis(lenis: Lenis | null) {
  instancia = lenis;
}

/** Baja suave a una seccion por id. Cae al scroll nativo si Lenis no esta listo. */
export function irASeccion(id: string) {
  const objetivo = document.getElementById(id.replace(/^#/, ""));
  if (!objetivo) return;
  if (instancia) {
    instancia.scrollTo(objetivo);
  } else {
    objetivo.scrollIntoView({ behavior: "smooth" });
  }
}
