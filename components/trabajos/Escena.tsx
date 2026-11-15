"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { crearAnillo } from "./anillo";
import type { Puente } from "./plano";

/**
 * Escena WebGL del carrusel de trabajos.
 *
 * Componente hoja: junto con anillo.ts es lo unico de la seccion que toca
 * three y R3F, y se carga con next/dynamic (ssr: false) recien cuando la
 * seccion esta cerca de la pantalla. Su loop es la misma excepcion
 * documentada que el hero: corre solo con la seccion en pantalla, la pestaña
 * visible y la ficha cerrada.
 */

type Props = {
  puenteRef: React.RefObject<Puente>;
  progreso: MotionValue<number>;
  activo: boolean;
  movil: boolean;
  texturas: string[];
  destacados: boolean[];
  onListo: () => void;
};

function Anillo({
  puenteRef,
  progreso,
  movil,
  texturas,
  destacados,
}: Omit<Props, "activo" | "onListo">) {
  const gl = useThree((s) => s.gl);
  const camara = useThree((s) => s.camera);
  const ancho = useThree((s) => s.size.width);
  const alto = useThree((s) => s.size.height);

  const anillo = useMemo(
    () => crearAnillo(texturas.length, { reflejo: !movil, destacados }),
    [texturas.length, movil, destacados]
  );
  useEffect(() => () => anillo.dispose(), [anillo]);

  // Colores desde las variables CSS: ningun color escrito a mano.
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    anillo.colores({
      acento: css.getPropertyValue("--accent").trim(),
      fondo: css.getPropertyValue("--bg").trim(),
      superficie: css.getPropertyValue("--surface").trim(),
    });
  }, [anillo]);

  useEffect(() => anillo.cargar(gl, texturas), [anillo, gl, texturas]);

  useEffect(() => {
    anillo.encuadrar(camara, ancho, alto, puenteRef.current);
  }, [anillo, camara, ancho, alto, puenteRef]);

  useEffect(() => {
    const puente = puenteRef.current;
    puente.control = anillo.control;
    return () => {
      puente.control = null;
    };
  }, [anillo, puenteRef]);

  useFrame((state, delta) => {
    anillo.cuadro({
      t: state.clock.elapsedTime,
      dt: Math.min(delta, 0.05),
      scroll: progreso.get(),
      puente: puenteRef.current,
      camara,
      ancho,
      alto,
    });
  });

  return <primitive object={anillo.raiz} />;
}

export default function Escena({ activo, onListo, movil, ...resto }: Props) {
  return (
    <Canvas
      aria-hidden
      frameloop={activo ? "always" : "never"}
      dpr={[1, 1.5]}
      flat
      gl={{
        antialias: !movil,
        alpha: true,
        depth: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 30, position: [0, 1, 12], near: 0.1, far: 80 }}
      style={{ pointerEvents: "none" }}
      onCreated={() => {
        // un frame pintado antes de mostrarse: el fade nunca deja ver el vacio
        window.requestAnimationFrame(() => onListo());
      }}
    >
      <Anillo movil={movil} {...resto} />
    </Canvas>
  );
}
