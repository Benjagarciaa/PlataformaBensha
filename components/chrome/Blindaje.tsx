"use client";

import { useEffect } from "react";

/**
 * Blindaje anticopia. El mismo componente que se le vende a los clientes,
 * corriendo en el propio sitio.
 *
 * QUÉ HACE
 *  - bloquea el click derecho
 *  - impide seleccionar texto y arrastrar imágenes
 *  - bloquea F12, Ctrl+Shift+I/J/C, Ctrl+U y Ctrl+S
 *
 * QUÉ NO HACE, Y HAY QUE SABERLO
 * No es seguridad. Todo lo que corre en el navegador es inspeccionable por
 * alguien con conocimiento: se puede abrir devtools desde el menú del
 * navegador, usar view-source, o pedir el HTML por consola desde afuera.
 * Esto frena la copia manual y casual, que es el 95% de los casos reales.
 * Nunca prometer "100% segura" a un cliente: el comprador técnico lo sabe y
 * el que te descubre exagerando ahí, no te cree nada más.
 *
 * QUÉ QUEDA AFUERA A PROPÓSITO
 * El teléfono, el mail y los campos del formulario siguen siendo
 * seleccionables. Bloquear eso sería pegarse un tiro en el pie: el visitante
 * que quiere copiar tu mail para escribirte es exactamente el que querés.
 * Se marcan con el atributo data-copiable.
 *
 * SOLO EN PRODUCCIÓN. En desarrollo se desactiva solo, o no podrías usar
 * devtools para trabajar en tu propio sitio.
 */
export function Blindaje() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const permitido = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest("input, textarea, [data-copiable]"),
      );
    };

    const sinMenu = (e: MouseEvent) => {
      if (permitido(e.target)) return;
      e.preventDefault();
    };

    const sinSeleccion = (e: Event) => {
      if (permitido(e.target)) return;
      e.preventDefault();
    };

    const sinArrastre = (e: DragEvent) => {
      e.preventDefault();
    };

    const sinAtajos = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / J / C  →  devtools
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(k)) {
        e.preventDefault();
        return;
      }
      // Ctrl+U  →  ver código fuente
      // Ctrl+S  →  guardar la página
      if (e.ctrlKey && ["U", "S"].includes(k)) {
        if (permitido(e.target)) return;
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", sinMenu);
    document.addEventListener("selectstart", sinSeleccion);
    document.addEventListener("dragstart", sinArrastre);
    document.addEventListener("keydown", sinAtajos);

    document.documentElement.dataset.blindado = "1";

    return () => {
      document.removeEventListener("contextmenu", sinMenu);
      document.removeEventListener("selectstart", sinSeleccion);
      document.removeEventListener("dragstart", sinArrastre);
      document.removeEventListener("keydown", sinAtajos);
      delete document.documentElement.dataset.blindado;
    };
  }, []);

  return null;
}
