"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useTodas } from "@/lib/trazo";

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
 */
export function Diferida({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // servidor: la seccion completa. Cliente al hidratar: el contenedor vacio.
  const [montada, setMontada] = useState(() => typeof window === "undefined");
  const todas = useTodas();

  const montar = useCallback(() => {
    const el = ref.current;
    if (!el) return;
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
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        io.disconnect();
        montar();
      },
      { rootMargin: "150% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [montada, todas, montar]);

  if (montada) return <div ref={ref}>{children}</div>;
  return <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
}
