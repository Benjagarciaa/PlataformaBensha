import { Hero } from "@/components/sections/Hero";
import { Resuelvo } from "@/components/sections/Resuelvo";
import { Proyectos } from "@/components/sections/Proyectos";
import { Criterio } from "@/components/sections/Criterio";
import { Servicios } from "@/components/sections/Servicios";
import { Proceso } from "@/components/sections/Proceso";
import { SobreMi } from "@/components/sections/SobreMi";
import { Testimonios } from "@/components/sections/Testimonios";
import { Contacto } from "@/components/sections/Contacto";
import { Footer } from "@/components/sections/Footer";
import { Diferida } from "@/components/ui/Diferida";

/**
 * Una escena por sección, una idea por pantalla (02-DESIGN.md, sección 10).
 * El orden de los waypoints en content/data.ts sigue este mismo orden.
 *
 * Todo lo que está debajo del hero se hidrata recién cuando se acerca
 * (<Diferida>): el HTML llega completo desde el servidor, pero la primera
 * carga solo paga el JavaScript de lo que se ve.
 */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Hero />
      <Diferida>
        <Resuelvo />
      </Diferida>
      <Diferida>
        <Proyectos />
      </Diferida>
      <Diferida>
        <Criterio />
      </Diferida>
      <Diferida>
        <Servicios />
      </Diferida>
      <Diferida>
        <Proceso />
      </Diferida>
      <Diferida>
        <SobreMi />
      </Diferida>
      <Testimonios />
      <Diferida>
        <Contacto />
      </Diferida>
      <Footer />
    </main>
  );
}
