import { Hero } from "@/components/sections/Hero";
import { SobreMi } from "@/components/sections/SobreMi";
import { Anatomia } from "@/components/sections/Anatomia";
import { Servicios } from "@/components/sections/Servicios";

export default function Home() {
  return (
    // overflow-x-clip y NO overflow-hidden: overflow:hidden en un ancestro
    // rompe position:sticky, y Anatomia depende de sticky para el plano fijo.
    <main className="relative min-h-screen overflow-x-clip">
      <Hero />
      <SobreMi />
      <Anatomia />
      <Servicios />
    </main>
  );
}