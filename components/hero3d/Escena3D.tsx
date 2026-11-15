"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { CAM, crearEscena } from "./geometrias";

/**
 * Escena WebGL del hero: del caos al sistema.
 *
 * Componente hoja. Es lo unico del sitio que importa three y R3F, y se carga
 * con next/dynamic (ssr: false) recien cuando el texto ya pinto. Su loop es la
 * excepcion documentada al rAF unico (02-DESIGN.md, seccion 3D): corre solo
 * mientras el hero esta en pantalla y con la pestaña visible.
 */

type Props = {
  progreso: MotionValue<number>;
  activo: boolean;
  movil: boolean;
  /** pointer fine: hay parallax y repulsion del mouse */
  puntero: boolean;
  /** contenedor que escucha el mouse (el canvas no recibe eventos) */
  zonaPuntero: React.RefObject<HTMLElement | null>;
  onListo: () => void;
};

type Movimiento = { p: number; mx: number; my: number; repel: number };

function Sistema({ progreso, movil, puntero, zonaPuntero }: Omit<Props, "activo" | "onListo">) {
  const ancho = useThree((s) => s.size.width);
  const alto = useThree((s) => s.size.height);

  // Se arma una sola vez: casilleros y geometrias no dependen del tamaño.
  const escena = useMemo(() => crearEscena(movil), [movil]);
  useEffect(() => () => escena.dispose(), [escena]);

  // Colores desde las variables CSS: ningun color escrito a mano.
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    escena.colores(css.getPropertyValue("--accent").trim(), css.getPropertyValue("--text").trim());
  }, [escena]);

  // Encuadre: donde va el sistema y por donde flota el caos.
  useEffect(() => escena.encuadrar(ancho, alto), [escena, ancho, alto]);

  // Mouse: posicion normalizada. Pointer events, nada de listeners de scroll.
  const mouse = useRef({ x: 0, y: 0, adentro: false });
  useEffect(() => {
    const zona = zonaPuntero.current;
    if (!puntero || !zona) return;
    const mover = (e: PointerEvent) => {
      const r = zona.getBoundingClientRect();
      mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouse.current.adentro = true;
    };
    const salir = () => {
      mouse.current.adentro = false;
    };
    zona.addEventListener("pointermove", mover, { passive: true });
    zona.addEventListener("pointerleave", salir);
    return () => {
      zona.removeEventListener("pointermove", mover);
      zona.removeEventListener("pointerleave", salir);
    };
  }, [puntero, zonaPuntero]);

  const mov = useRef<Movimiento | null>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const m = mouse.current;
    const actual = progreso.get();
    const st = (mov.current ??= { p: actual, mx: 0, my: 0, repel: 0 });

    // Lenis ya suaviza el scroll; esto solo evita saltos al reanudar el loop.
    st.p += (actual - st.p) * (1 - Math.exp(-dt * 9));
    const k = 1 - Math.exp(-dt * 4);
    const adentro = puntero && m.adentro;
    st.mx += ((adentro ? m.x : 0) - st.mx) * k;
    st.my += ((adentro ? m.y : 0) - st.my) * k;
    st.repel += ((adentro ? 1 : 0) - st.repel) * k;

    escena.cuadro({
      p: st.p,
      t: state.clock.elapsedTime,
      mx: st.mx,
      my: st.my,
      rx: m.x,
      ry: m.y,
      repel: st.repel,
      camara: state.camera,
    });
  });

  return <primitive object={escena.raiz} />;
}

export default function Escena3D({ progreso, activo, movil, puntero, zonaPuntero, onListo }: Props) {
  return (
    <Canvas
      aria-hidden
      frameloop={activo ? "always" : "never"}
      dpr={[1, movil ? 1.5 : 1.75]}
      flat
      gl={{
        antialias: !movil,
        alpha: true,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ fov: CAM.fov, position: [0, 0, CAM.z], near: 0.1, far: 60 }}
      style={{ pointerEvents: "none" }}
      onCreated={() => {
        // un frame pintado antes de mostrarse: el fade in nunca deja ver el vacio
        window.requestAnimationFrame(() => onListo());
      }}
    >
      <Sistema progreso={progreso} movil={movil} puntero={puntero} zonaPuntero={zonaPuntero} />
    </Canvas>
  );
}
