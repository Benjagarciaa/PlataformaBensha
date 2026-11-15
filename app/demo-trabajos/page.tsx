import type { Metadata } from "next";
import { Trabajos } from "@/components/trabajos/Trabajos";

/**
 * RUTA TEMPORAL de prueba del carrusel de trabajos, aislado del resto del
 * sitio. Hay alto antes y despues para probar el tramo fijo con el scroll.
 * Se borra al integrar <Trabajos /> en app/page.tsx.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DemoTrabajos() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="h-[110svh]" />
      <Trabajos />
      <div aria-hidden className="h-[110svh]" />
    </main>
  );
}
