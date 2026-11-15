"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";

/**
 * Riel de avance. Desktop: una linea fina al margen izquierdo con un punto por
 * seccion (navegacion). Mobile: solo una barra de 2px de progreso.
 *
 * Los puntos estan repartidos parejos, pero las secciones no miden lo mismo
 * (hay escenas fijas largas y secciones cortas). Por eso la linea no sigue el
 * progreso total de la pagina: avanza por tramos. Entre el punto i y el i+1
 * recorre la seccion i, medida de verdad, y llega al punto siguiente justo
 * cuando esa seccion cruza el centro de la pantalla. La seccion activa sale
 * del mismo calculo: el punto encendido es siempre el que la linea ya
 * alcanzo, y coincide con lo que se ve.
 *
 * Sin polling ni listeners de scroll: el scroll llega por useScroll de motion
 * y las posiciones se miden solo cuando cambia el alto de la pagina
 * (ResizeObserver), al montarse una seccion diferida o al cambiar el tamaño.
 */
export function Riel() {
  const { scrollYProgress, scrollY } = useScroll();
  const llenadoMovil = useTransform(scrollYProgress, (v) => `scaleY(${v})`);
  const opacidad = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - 300) / 400)));
  const tops = useRef<number[]>([]);
  const alto = useRef(900);
  const version = useMotionValue(0);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    const medir = () => {
      const y = window.scrollY;
      let previo = 0;
      tops.current = content.waypoints.map((w) => {
        const el = document.getElementById(w.id);
        // si una seccion no esta (todavia), hereda la posicion de la anterior
        previo = el ? el.getBoundingClientRect().top + y : previo;
        return previo;
      });
      alto.current = window.innerHeight;
      version.set(version.get() + 1);
    };
    medir();
    // el alto de la pagina cambia cuando una escena se enciende o se monta
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);
    window.addEventListener("resize", medir);
    window.addEventListener("escenas:montada", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
      window.removeEventListener("escenas:montada", medir);
    };
  }, [version]);

  // avance por tramos: 0 en el primer punto, 1 en el ultimo
  const avance = useTransform([scrollY, version], ([y]: number[]) => {
    const t = tops.current;
    const n = t.length;
    if (n < 2) return 0;
    const centro = y + alto.current * 0.5;
    if (centro <= t[0]) return 0;
    for (let i = n - 1; i >= 0; i--) {
      if (centro < t[i]) continue;
      if (i === n - 1) return 1;
      const largo = Math.max(1, t[i + 1] - t[i]);
      return (i + Math.min(1, (centro - t[i]) / largo)) / (n - 1);
    }
    return 0;
  });
  const llenado = useTransform(avance, (v) => `scaleY(${v})`);

  useMotionValueEvent(avance, "change", (v) => {
    const i = Math.min(content.waypoints.length - 1, Math.floor(v * (content.waypoints.length - 1) + 1e-4));
    setActiva((previa) => (previa === i ? previa : i));
  });

  return (
    <>
      {/* mobile: solo el progreso */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 h-dvh w-[2px] bg-[color:var(--hairline)] lg:hidden"
      >
        <motion.div
          className="h-full w-full origin-top bg-[color:var(--accent)]"
          style={{ transform: llenadoMovil }}
        />
      </div>

      {/* desktop: la linea y un punto por seccion */}
      <motion.nav
        aria-label={content.riel.aria}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-dvh w-[88px] lg:block"
        style={{ opacity: opacidad }}
      >
        <div className="absolute bottom-[18vh] left-[44px] top-[18vh] w-px bg-[color:var(--hairline)]">
          <motion.div
            className="h-full w-full origin-top bg-[color:var(--accent)]"
            style={{ transform: llenado }}
          />
        </div>

        <ul className="pointer-events-auto absolute bottom-[18vh] left-[44px] top-[18vh] w-px">
          {content.waypoints.map((punto, i) => {
            const top = (i / (content.waypoints.length - 1)) * 100;
            const esActiva = i === activa;
            return (
              <li key={punto.id} className="absolute left-0" style={{ top: `${top}%` }}>
                <button
                  type="button"
                  onClick={() => irASeccion(punto.id)}
                  aria-label={punto.label}
                  aria-current={esActiva ? "true" : undefined}
                  className="group relative block -translate-x-1/2 -translate-y-1/2 p-2"
                >
                  <span
                    className="block h-[7px] w-[7px] transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: esActiva ? "scale(1.3)" : "scale(0.7)",
                      backgroundColor: esActiva ? "var(--accent)" : "var(--text-faint)",
                    }}
                  />
                  <span className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[color:var(--bg)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {punto.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}
