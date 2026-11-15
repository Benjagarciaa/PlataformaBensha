"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTodas, useVivo } from "@/lib/trazo";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  /** envuelve el contenido en el contenedor estandar (ancho y margenes) */
  contenedor?: boolean;
  /** el aire vertical estandar entre secciones */
  aire?: boolean;
  /** etiqueta accesible cuando la seccion no tiene un h2 visible al inicio */
  ariaLabel?: string;
  /**
   * false: la seccion no enciende sus loops entera. Para secciones altas, que
   * encienden cada ilustracion por su cuenta (useLoops o su propia escena).
   */
  loops?: boolean;
  children: ReactNode;
};

const SeccionViva = createContext(false);

/**
 * true cuando la escena de esta seccion puede animar: JS cargado, sin
 * reduced-motion y la seccion cerca de la pantalla (o encendidas todas).
 * Mientras tanto la seccion muestra su version estatica.
 */
export function useSeccionViva() {
  return useContext(SeccionViva);
}

/**
 * Seccion del sitio.
 *
 *  - Se enciende (data-viva + contexto) recien a una pantalla y media de
 *    distancia: al cargar, las secciones de abajo no gastan nada y quedan en
 *    su version estatica. Una vez encendida, no se apaga.
 *  - Sus loops ambientales corren solo mientras esta en pantalla: otro
 *    IntersectionObserver pone data-activa y el CSS (.loop) pausa el resto.
 *    Las secciones altas (loops={false}) encienden cada ilustracion aparte.
 */
export function Section({
  id,
  className,
  contenedor = true,
  aire = true,
  ariaLabel,
  loops = true,
  children,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const vivo = useVivo();
  const todas = useTodas();
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // los loops corren solo con la seccion a la vista (sin margen: afuera no aportan)
    const enVista = new IntersectionObserver(([entrada]) => {
      if (loops) el.toggleAttribute("data-activa", entrada.isIntersecting);
    });
    enVista.observe(el);
    const enciende = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setCerca(true);
        enciende.disconnect();
      },
      { rootMargin: "150% 0px" }
    );
    enciende.observe(el);
    return () => {
      enVista.disconnect();
      enciende.disconnect();
    };
  }, [loops]);

  const viva = vivo && (cerca || todas);

  return (
    <SeccionViva.Provider value={viva}>
      <section
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        data-viva={viva ? "" : undefined}
        className={cn("relative z-10 w-full", aire && "py-20 md:py-28", className)}
      >
        {contenedor ? <Contenedor>{children}</Contenedor> : children}
      </section>
    </SeccionViva.Provider>
  );
}

/** Ancho y margenes estandar. En desktop deja libre el carril del riel. */
export function Contenedor({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:pl-28 lg:pr-20", className)}>
      {children}
    </div>
  );
}
