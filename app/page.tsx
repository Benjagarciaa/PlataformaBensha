import { Hero } from "@/components/sections/Hero";
import { SobreMi } from "@/components/sections/SobreMi";
import { Anatomia } from "@/components/sections/Anatomia";
import { Proyectos } from "@/components/sections/Proyectos";
import { Servicios } from "@/components/sections/Servicios";
import { Proceso } from "@/components/sections/Proceso";
import { Herramientas } from "@/components/sections/Herramientas";
import { Recorrido } from "@/components/sections/Recorrido";
import { Testimonios } from "@/components/sections/Testimonios";
import { Contacto } from "@/components/sections/Contacto";
import { Footer } from "@/components/sections/Footer";
 
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Hero />
      <SobreMi />
      <Anatomia />
      <Proyectos />
      <Servicios />
      <Proceso />
      <Herramientas />
      <Recorrido />
      <Testimonios />
      <Contacto />
      <Footer />
    </main>
  );
}
 