"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useSeccionViva } from "@/components/ui/Section";
import { tramo, type Rango } from "@/lib/escena";

type PalabrasProps = {
  texto: string;
  /** progreso de scroll (0..1) que revela las palabras */
  progreso: MotionValue<number>;
  /** tramo del progreso en el que se revela la frase completa */
  rango: Rango;
  /** opacidad de una palabra todavia no revelada */
  desde?: number;
  className?: string;
};

/**
 * Revelado palabra por palabra, atado al scroll. Cada palabra pasa de casi
 * transparente a plena a medida que avanza el tramo. Sin escenas vivas, el
 * texto se ve entero desde el principio.
 */
export function Palabras({ texto, progreso, rango, desde = 0.14, className }: PalabrasProps) {
  const vivo = useSeccionViva();
  // estatico: texto plano, sin un componente por palabra
  if (!vivo) return <span className={className}>{texto}</span>;
  const palabras = texto.split(" ");
  const paso = (rango[1] - rango[0]) / palabras.length;

  return (
    <span className={className}>
      {palabras.map((palabra, i) => {
        const a = rango[0] + paso * i;
        return (
          <Palabra
            key={`${palabra}-${i}`}
            progreso={progreso}
            rango={[a, Math.min(rango[1], a + paso * 2)]}
            desde={desde}
            vivo={vivo}
          >
            {palabra}
          </Palabra>
        );
      })}
    </span>
  );
}

function Palabra({
  progreso,
  rango,
  desde,
  vivo,
  children,
}: {
  progreso: MotionValue<number>;
  rango: Rango;
  desde: number;
  vivo: boolean;
  children: string;
}) {
  const opacity = useTransform(progreso, (v) => desde + (1 - desde) * tramo(v, rango));
  return (
    <>
      <motion.span data-anim style={vivo ? { opacity } : undefined}>
        {children}
      </motion.span>{" "}
    </>
  );
}
