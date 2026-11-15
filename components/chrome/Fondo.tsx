"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useVivo } from "@/lib/trazo";

/**
 * Fondo del sitio: azul noche casi negro con profundidad (degradados radiales
 * quietos) y una luz celeste difusa que acompaña el scroll.
 *
 * Arriba de todo la luz esta donde se arma el sistema del hero (a la derecha
 * en desktop, abajo en mobile), asi la escena 3D y el resto de la pagina
 * comparten la misma fuente de luz. Despues viaja de un lado a otro, seccion
 * por seccion. Es una capa fija que solo se traslada (sin escala: componer una
 * capa enorme que ademas cambia de tamaño era lo mas caro del scroll). El
 * navegador la mueve en el compositor. Sin escenas vivas queda quieta.
 */

// [progreso de la pagina, x en vw, y en vh]
type Punto = readonly [number, number, number];

const DESKTOP: Punto[] = [
  [0, 20, 4],
  [0.1, 22, 0],
  [0.22, -26, -6],
  [0.38, 24, 8],
  [0.55, -22, -4],
  [0.7, 18, 6],
  [0.86, -14, 0],
  [1, 0, 10],
];

const MOBILE: Punto[] = [
  [0, 0, 22],
  [0.08, 0, 20],
  [0.22, -24, -8],
  [0.4, 22, 6],
  [0.58, -20, -6],
  [0.76, 18, 4],
  [1, 0, 12],
];

function interpolar(puntos: Punto[], v: number, campo: 1 | 2) {
  if (v <= puntos[0][0]) return puntos[0][campo];
  for (let i = 1; i < puntos.length; i++) {
    const [p1] = puntos[i];
    if (v <= p1) {
      const a = puntos[i - 1];
      const t = (v - a[0]) / (p1 - a[0]);
      const s = t * t * (3 - 2 * t);
      return a[campo] + (puntos[i][campo] - a[campo]) * s;
    }
  }
  return puntos[puntos.length - 1][campo];
}

export function Fondo() {
  const vivo = useVivo();
  const desktop = useRef(true);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const aplicar = () => {
      desktop.current = media.matches;
    };
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, []);

  const puntos = () => (desktop.current ? DESKTOP : MOBILE);
  const x = useTransform(scrollYProgress, (v) => `${interpolar(puntos(), v, 1)}vw`);
  const y = useTransform(scrollYProgress, (v) => `${interpolar(puntos(), v, 2)}vh`);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* profundidad: el centro un poco mas alto, los bordes caen a negro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,var(--surface)_0%,transparent_70%),radial-gradient(ellipse_80%_60%_at_50%_110%,var(--bg-deep)_0%,transparent_70%)]" />
      {/* la luz que acompaña el scroll */}
      <motion.div
        className="absolute left-1/2 top-1/2 -ml-[40vmax] -mt-[40vmax] h-[80vmax] w-[80vmax] bg-[radial-gradient(closest-side,var(--accent-glow)_0%,transparent_100%)] will-change-transform [transform:translate(0,22vh)] lg:[transform:translate(20vw,4vh)]"
        style={vivo ? { x, y } : undefined}
      />
    </div>
  );
}
