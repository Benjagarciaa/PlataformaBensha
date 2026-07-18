import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-[5] bg-[linear-gradient(rgba(120,180,230,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(120,180,230,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_85%)]" />
      <div className="pointer-events-none fixed inset-0 z-[70] opacity-[0.025]" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"1\"/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 py-24 md:px-12 lg:pl-28 lg:pr-20">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          <span>{content.identity.locationShort}</span>
          <span className="h-px w-8 bg-[color:var(--hairline)]" />
          <span>{content.nav.status}</span>
        </div>

        <div className="max-w-5xl">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            {content.identity.role}
          </p>
          <h1 className="font-display text-[clamp(4rem,10.5vw,9rem)] uppercase leading-[0.9] tracking-[-0.03em] text-[color:var(--text)]">
            {content.identity.firstName}
            <br />
            {content.identity.lastName}
          </h1>
          <p className="mt-8 max-w-[65ch] text-[17px] leading-relaxed text-[color:var(--text-dim)]">
            {content.hero.title}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button>{content.hero.ctaPrimary}</Button>
            <Button variant="secondary">{content.hero.ctaSecondary}</Button>
          </div>
        </div>
      </section>

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
