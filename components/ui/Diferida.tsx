"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useTodas } from "@/lib/trazo";
import { cuandoEsteOcioso, esperarEscena } from "@/lib/arranque";

/**
 * Hidratacion diferida de una seccion de abajo.
 *
 * El servidor manda la seccion entera (se lee igual sin JS y para buscadores).
 * En el cliente, React NO la hidrata al cargar: el contenedor se hidrata con
 * innerHTML vacio y suppressHydrationWarning, y React deja intacto el HTML
 * del servidor. Recien cuando la seccion queda a una pantalla y media (o un
 * salto por ancla enciende todas), se monta de verdad: se vacia el contenedor
 * y React pinta lo mismo en el mismo cuadro (flushSync), sin parpadeo.
 *
 * Asi la primera carga solo paga el JS del hero y el cromo, que es lo que se
 * ve. Es la diferencia mas grande en el tiempo de bloqueo en mobile.
 *
 * Mientras no esta montada, la seccion lleva content-visibility:auto: el
 * navegador no calcula su estilo ni su layout hasta que se acerca, y el primer
 * layout de la pagina procesa solo lo que se ve. Se quita al montar (con
 * contencion en un ancestro, la ficha fija y los tramos sticky se romperian).
 *
 * `trasEscena`: la seccion que sigue al hero espera a que la escena 3D este
 * lista y a un momento ocioso, asi no le roba el hilo al armado. Si la persona
 * baja rapido y la seccion ya esta cerca de verse, se monta igual.
 */

const SERVIDOR = typeof window === "undefined";
const SIN_MONTAR: CSSProperties = { contentVisibility: "auto", containIntrinsicSize: "auto 100svh" };

export function Diferida({ children, trasEscena = false }: { children: ReactNode; trasEscena?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [montada, setMontada] = useState(false);
  const todas = useTodas();

  const montar = useCallback(() => {
    const el = ref.current;
    if (!el || el.dataset.montada) return;
    el.dataset.montada = "";
    el.innerHTML = "";
    flushSync(() => setMontada(true));
    window.dispatchEvent(new Event("escenas:montada"));
  }, []);

  useEffect(() => {
    if (montada) return;
    if (todas) {
      montar();
      return;
    }
    const el = ref.current;
    if (!el) return;
    let vivo = true;
    const cerca = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        cerca.disconnect();
        if (!trasEscena) {
          montar();
          return;
        }
        esperarEscena(3000)
          .then(() => cuandoEsteOcioso(800))
          .then(() => {
            if (vivo) montar();
          });
      },
      { rootMargin: "150% 0px" }
    );
    cerca.observe(el);
    // ya casi a la vista: no se espera a nadie
    const ya = trasEscena
      ? new IntersectionObserver(
          ([entrada]) => {
            if (entrada.isIntersecting) montar();
          },
          { rootMargin: "35% 0px" }
        )
      : null;
    ya?.observe(el);
    return () => {
      vivo = false;
      cerca.disconnect();
      ya?.disconnect();
    };
  }, [montada, todas, montar, trasEscena]);

  if (montada) return <div ref={ref}>{children}</div>;
  if (SERVIDOR)
    return (
      <div ref={ref} style={SIN_MONTAR}>
        {children}
      </div>
    );
  return <div ref={ref} style={SIN_MONTAR} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
}
