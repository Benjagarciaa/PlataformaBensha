import { useSyncExternalStore } from "react";

/**
 * El servicio que se eligio en Servicios ("Consultar por esto") para el
 * cotizador de Contacto.
 *
 * Es un estado de modulo y no un evento: Contacto se hidrata recien cuando se
 * acerca (<Diferida>), y un evento disparado antes de que exista se pierde.
 * Asi lo lee al montarse y cada vez que cambia.
 */

let elegido: { id: string; vez: number } | null = null;
const avisos = new Set<() => void>();

export function preseleccionar(id: string) {
  elegido = { id, vez: (elegido?.vez ?? 0) + 1 };
  avisos.forEach((a) => a());
}

function suscribir(avisar: () => void) {
  avisos.add(avisar);
  return () => {
    avisos.delete(avisar);
  };
}

/** El ultimo servicio elegido (con un contador: elegir el mismo dos veces tambien avisa). */
export function usePreseleccion() {
  return useSyncExternalStore(
    suscribir,
    () => elegido,
    () => null
  );
}
