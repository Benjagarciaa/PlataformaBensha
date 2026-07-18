import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Hero />

      <Section id="sobre-mi" cota="contenido base">
        <SectionTitle title="Una página, una persona." eyebrow="Sobre mí" />
        <p className="max-w-[65ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
          Soy Benjamin, desarrollador de ecommerce en Córdoba. Armo páginas de producto para marcas que venden online en Argentina.
        </p>
      </Section>

      <Section id="servicios" cota="servicios">
        <SectionTitle title="Qué hago" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[color:var(--surface)] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">Página de producto</p>
            <h3 className="mt-4 font-display text-2xl uppercase tracking-[-0.03em] text-[color:var(--text)]">Página de producto que vende</h3>
            <p className="mt-3 text-[17px] leading-relaxed text-[color:var(--text-dim)]">La página completa, pensada para responder objeciones y empujar al checkout.</p>
          </div>
          <div className="bg-[color:var(--surface)] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">Shopify</p>
            <h3 className="mt-4 font-display text-2xl uppercase tracking-[-0.03em] text-[color:var(--text)]">Tienda Shopify completa</h3>
            <p className="mt-3 text-[17px] leading-relaxed text-[color:var(--text-dim)]">Desde cero, con estructura, catálogo, checkout y medios de pago listos para vender.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
