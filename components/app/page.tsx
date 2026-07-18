import { Hero } from "@/components/sections/Hero";
import { SobreMi } from "@/components/sections/SobreMi";
import { Anatomia } from "@/components/sections/Anatomia";
import { Servicios } from "@/components/sections/Servicios";
import { Proceso } from "@/components/sections/Proceso";
import { Herramientas } from "@/components/sections/Herramientas";
import { Oficio } from "@/components/sections/Oficio";
import { Recorrido } from "@/components/sections/Recorrido";
import { Contacto } from "@/components/sections/Contacto";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    // overflow-x-clip y NO overflow-hidden: overflow:hidden en un ancestro
    // rompe position:sticky, y Anatomia y SobreMi dependen de sticky.
    <main className="relative min-h-screen overflow-x-clip">
      <Hero />
      <SobreMi />
      <Anatomia />
      <Servicios />
      <Proceso />
      <Herramientas />
      <Oficio />
      <Recorrido />
      <Contacto />
      <Footer />
    </main>
  );
}
