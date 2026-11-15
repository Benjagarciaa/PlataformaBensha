"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Section, Contenedor, useSeccionViva } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Palabras } from "@/components/ui/Palabras";
import { content } from "@/content/data";
import { suave, tramo } from "@/lib/escena";

/**
 * Sobre mi. Corto y humano: la frase se revela palabra por palabra, los
 * numeros reales cuentan una vez al entrar, y la formacion llega como un mazo
 * de cartas apiladas que se reparten con el scroll. La formacion va en texto,
 * sin imagenes de certificados. Diseño UX/UI va destacada: respalda que se
 * diseña producto, no solo se programa.
 */

type Carta = (typeof content.sobreMi.formacion)[number];

export function SobreMi() {
  return (
    <Section id="sobre-mi" contenedor={false} aire={false} ariaLabel={content.sobreMi.eyebrow}>
      <Contenido />
    </Section>
  );
}

function Contenido() {
  const { sobreMi } = content;
  const vivo = useSeccionViva();
  const fraseRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress: frase } = useScroll({ target: fraseRef, offset: ["start 0.9", "start 0.3"] });

  return (
    <>
      <Contenedor className="pt-28 md:pt-44">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.11em] text-[color:var(--accent)]">
          {sobreMi.eyebrow}
        </p>
        <p
          ref={fraseRef}
          className="max-w-5xl font-display text-[clamp(2.3rem,5.6vw,5.25rem)] font-semibold leading-[1] tracking-[-0.015em] text-[color:var(--text)]"
        >
          <Palabras texto={sobreMi.frase} progreso={frase} rango={[0, 1]} desde={0.16} />
        </p>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
          <div className="flex flex-col gap-6">
            {sobreMi.parrafos.map((parrafo, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="max-w-[56ch] text-[18px] leading-[1.65] text-[color:var(--text-soft)] md:text-[20px]">
                  {parrafo}
                </p>
              </Reveal>
            ))}
          </div>
          <dl className="grid grid-cols-3 gap-4 self-start border-t border-[color:var(--hairline-strong)] pt-8">
            {sobreMi.datos.map((dato) => (
              <div key={dato.label}>
                <dt className="sr-only">{dato.label}</dt>
                <dd>
                  <span className="block font-display text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.015em] text-[color:var(--text)]">
                    {dato.prefijo}
                    <Contador n={dato.n} vivo={vivo} />
                  </span>
                  <span aria-hidden className="mt-3 block font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-dim)] md:text-[11px]">
                    {dato.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Contenedor>

      <Mazo vivo={vivo} />

      <Contenedor className="pb-28 md:pb-44">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-20">
          <Reveal>
            <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.herramientasTitulo}
            </h3>
            <ul>
              {sobreMi.herramientas.map((h) => (
                <li
                  key={h.nombre}
                  className="grid gap-1 border-t border-[color:var(--hairline)] py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-6"
                >
                  <span className="text-[17px] font-medium text-[color:var(--text)]">{h.nombre}</span>
                  <span className="text-[16px] leading-[1.55] text-[color:var(--text-dim)]">{h.para}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {sobreMi.recorridoTitulo}
            </h3>
            <ul>
              {sobreMi.recorrido.map((r) => (
                <li key={r.titulo} className="border-t border-[color:var(--hairline)] py-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                    {r.anio}
                  </span>
                  <span className="mt-1 block text-[17px] font-medium text-[color:var(--text)]">{r.titulo}</span>
                  <span className="block text-[15px] text-[color:var(--text-dim)]">{r.lugar}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Contenedor>
    </>
  );
}

/** Numero real que cuenta desde 0 una sola vez al entrar. Arranca mostrando el valor final. */
function Contador({ n, vivo }: { n: number; vivo: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enVista = useInView(ref, { once: true, amount: 0.6 });
  const valor = useMotionValue(n);
  const texto = useTransform(valor, (v) => String(Math.round(v)));

  useEffect(() => {
    if (!vivo || !enVista) return;
    valor.set(0);
    const control = animate(valor, n, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => control.stop();
  }, [vivo, enVista, n, valor]);

  return <motion.span ref={ref}>{texto}</motion.span>;
}

// ── la formacion: un mazo que se reparte con el scroll ──────────────────

const GIROS = [-7, 5, -3, 8, -5, 3];

function Mazo({ vivo }: { vivo: boolean }) {
  const { sobreMi } = content;
  const pistaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: pistaRef, offset: ["start start", "end end"] });
  const columnas = useRef(3);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const aplicar = () => {
      columnas.current = media.matches ? 3 : 2;
    };
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, []);

  return (
    <div ref={pistaRef} className="relative py-24 vivo:h-[230svh] vivo:py-0 md:py-32">
      <div className="vivo:sticky vivo:top-0 vivo:flex vivo:h-svh vivo:items-center vivo:overflow-hidden">
        <Contenedor>
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 md:mb-12">
            <h3 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.012em] text-[color:var(--text)]">
              {sobreMi.formacionTitulo}
            </h3>
            <p className="text-[16px] text-[color:var(--text-dim)] md:text-[18px]">{sobreMi.formacionIntro}</p>
          </div>
          <ol className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
            {sobreMi.formacion.map((carta, k) => (
              <CartaFormacion key={carta.id} carta={carta} k={k} p={p} vivo={vivo} columnas={columnas} />
            ))}
          </ol>
        </Contenedor>
      </div>
    </div>
  );
}

function CartaFormacion({
  carta,
  k,
  p,
  vivo,
  columnas,
}: {
  carta: Carta;
  k: number;
  p: MotionValue<number>;
  vivo: boolean;
  columnas: React.RefObject<number>;
}) {
  const total = content.sobreMi.formacion.length;
  const transform = useTransform(p, (v) => {
    const c = columnas.current;
    const filas = Math.ceil(total / c);
    const col = k % c;
    const fila = Math.floor(k / c);
    // del mazo (centro de la grilla, cada carta girada) a su lugar
    const d = suave(tramo(v, [0.12 + k * 0.07, 0.42 + k * 0.07]));
    const dx = ((c - 1) / 2 - col) * 104 * (1 - d);
    const dy = ((filas - 1) / 2 - fila) * 106 * (1 - d);
    return `translate(${dx}%, ${dy}%) rotate(${GIROS[k] * (1 - d)}deg)`;
  });

  const destacado = "destacado" in carta && carta.destacado;
  const sello = "sello" in carta ? carta.sello : undefined;

  return (
    <motion.li
      data-anim
      className={`relative flex min-h-[176px] flex-col border p-4 md:min-h-[230px] md:p-7 ${
        destacado
          ? "border-[color:var(--accent)] bg-[color:var(--surface-2)]"
          : "border-[color:var(--hairline-strong)] bg-[color:var(--surface)]"
      }`}
      style={vivo ? { transform, zIndex: total - k } : undefined}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
        {carta.anio}
      </span>
      <span className="mt-3 font-display text-[17px] font-semibold leading-[1.15] tracking-[-0.005em] text-[color:var(--text)] md:text-[22px]">
        {carta.titulo}
      </span>
      <span className="mt-2 text-[13px] leading-[1.4] text-[color:var(--text-dim)] md:text-[15px]">
        {carta.institucion}
      </span>
      <span className="mt-auto hidden pt-4 text-[14px] leading-[1.5] text-[color:var(--text-soft)] md:block">
        {carta.nota}
      </span>
      {sello ? (
        <span
          className={`mt-3 w-fit border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.11em] md:mt-4 md:text-[10px] ${
            destacado
              ? "border-[color:var(--accent)] text-[color:var(--accent)]"
              : "border-[color:var(--hairline-strong)] text-[color:var(--text-soft)]"
          }`}
        >
          {sello}
        </span>
      ) : null}
    </motion.li>
  );
}
