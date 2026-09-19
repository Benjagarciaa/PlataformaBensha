"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Numero que cuenta desde 0 hasta su valor final, una sola vez, cuando entra
 * en pantalla (IntersectionObserver, nada de listeners de scroll).
 *
 * Arranca mostrando el valor final: asi el HTML del servidor y el caso sin JS
 * traen el numero real (DESIGN.md: visible por defecto, la animacion es un
 * agregado). Con reduced-motion no anima: queda el valor final fijo.
 *
 * Toma el numero del principio del texto ("25 millones" -> cuenta 25 y le
 * agrega " millones"). Si no encuentra numero, muestra el texto tal cual.
 */
export function StatCountUp({ valor }: { valor: string }) {
  const match = valor.match(/^(\d[\d.,]*)(.*)$/);
  const objetivo = match ? parseInt(match[1].replace(/[.,]/g, ""), 10) : null;
  const sufijo = match ? match[2] : "";

  const [display, setDisplay] = useState(valor);
  const ref = useRef<HTMLSpanElement | null>(null);
  const yaCorrio = useRef(false);

  useEffect(() => {
    if (objetivo === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || yaCorrio.current) return;
        yaCorrio.current = true;
        io.disconnect();

        const DURATION = 1400;
        const inicio = performance.now();
        let raf = 0;
        const loop = (now: number) => {
          const p = Math.min(1, (now - inicio) / DURATION);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${Math.round(objetivo * eased)}${sufijo}`);
          if (p < 1) raf = window.requestAnimationFrame(loop);
        };
        setDisplay(`0${sufijo}`);
        raf = window.requestAnimationFrame(loop);
        return () => window.cancelAnimationFrame(raf);
      },
      { threshold: 0.5 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [objetivo, sufijo]);

  return <span ref={ref}>{display}</span>;
}
