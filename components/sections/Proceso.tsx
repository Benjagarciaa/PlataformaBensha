// Sin "use client": esta sección no usa estado ni efectos, así que se
// renderiza solo en el servidor y no manda JavaScript al navegador.
// <Reveal> sí es de cliente, y está bien: un componente de servidor
// puede renderizar uno de cliente sin problema.
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";

/**
 * Proceso. La UNICA seccion numerada del sitio, porque acá el orden es
 * informacion real: no se puede diseñar antes de escribir el copy.
 *
 * UN SOLO DOM. Antes había dos listas, una para desktop y otra para mobile,
 * y las dos viajaban al navegador aunque una estuviera oculta: un lector de
 * pantalla leía los seis pasos dos veces y Google veía contenido duplicado.
 * Ahora hay una sola lista y el CSS cambia la dirección.
 *
 * El <Reveal> va ADENTRO del <li>, no envolviéndolo: <ol><div><li> es HTML
 * inválido y rompe la numeración.
 *
 * OJO con el marcador: el <li> lleva padding, no margen en el hijo. Si el
 * padding va en cero y el margen en el hijo, ese margen se escapa hacia
 * afuera y arrastra al marcador absoluto.
 */
export function Proceso() {
  const { proceso } = content;

  return (
    <Section id="proceso">
      <SectionTitle title={proceso.title} />

      <Reveal>
        <p className="mb-14 max-w-[62ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:mb-16 md:text-[17px]">
          {proceso.intro}
        </p>
      </Reveal>

      <div className="relative">
        {/* cota vertical, hasta 1279px */}
        <span
          aria-hidden
          className="absolute bottom-8 left-[4px] top-2 w-px bg-[color:var(--hairline)] xl:hidden"
        />

        {/* cota horizontal, desde 1280px */}
        <span
          aria-hidden
          className="absolute left-0 right-0 top-[6px] hidden h-px bg-[color:var(--hairline)] xl:block"
        />
        <span
          aria-hidden
          className="absolute left-0 top-0 hidden h-[13px] w-px bg-[color:var(--accent)] xl:block"
        />
        <span
          aria-hidden
          className="absolute right-0 top-0 hidden h-[13px] w-px bg-[color:var(--accent)] xl:block"
        />

        <ol className="flex flex-col xl:grid xl:grid-cols-6 xl:gap-6">
          {proceso.pasos.map((paso, index) => (
            <li
              key={paso.n}
              className="group relative pb-10 pl-9 last:pb-0 xl:pb-0 xl:pl-0 xl:pt-10"
            >
              <span
                aria-hidden
                className="absolute left-0 top-[4px] block h-[9px] w-[9px] border border-[color:var(--accent)] bg-[color:var(--accent)] transition-all duration-300 xl:top-[2px] xl:border-[color:var(--hairline)] xl:bg-[color:var(--bg)] xl:group-hover:border-[color:var(--accent)] xl:group-hover:bg-[color:var(--accent)]"
              />
              <Reveal delay={index * 0.06}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  {paso.n}
                </p>
                <h3 className="mt-2 font-display text-[1.3rem] font-medium leading-tight tracking-[-0.02em] text-[color:var(--text)] md:text-[1.5rem] xl:mt-3 xl:text-[1.3rem]">
                  {paso.titulo}
                </h3>
                <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-[color:var(--text-dim)] md:text-[16px] xl:mt-2.5 xl:text-[15px]">
                  {paso.detalle}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
