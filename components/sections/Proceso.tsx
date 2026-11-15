"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Section, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/content/data";
import { tramo } from "@/lib/escena";

/**
 * Como trabajamos. La unica seccion numerada del sitio (el orden es
 * informacion) y la unica que se lee de costado: rompe el ritmo vertical del
 * resto de la pagina.
 *
 * Los cuatro pasos van en fila, unidos por una linea. En desktop la fila
 * entera entra en pantalla y la linea avanza con el scroll de la pagina: cada
 * tramo se llena (scaleX) y el nodo siguiente se enciende al alcanzarlo, sin
 * pista fija ni scroll de mas. En mobile la fila se desliza con el dedo
 * (scroll horizontal nativo con snap) y la linea sigue a ese deslizamiento;
 * al entrar en pantalla la fila amaga un poco hacia el costado para avisar
 * que se puede deslizar.
 *
 * Cada paso tiene su icono en loop: el chat que escribe, la propuesta que se
 * firma, los bloques que se apilan, el check de entrega. Cierra con lo que
 * baja el miedo: sin abonos.
 */

type Paso = (typeof content.proceso.pasos)[number];

const N = content.proceso.pasos.length;
/** Donde cae el paso k sobre el avance de la linea (0..1). */
const punto = (k: number) => k / (N - 1);

export function Proceso() {
  return (
    <Section id="proceso">
      <Pasos />
    </Section>
  );
}

function Pasos() {
  const { proceso } = content;
  const vivo = useSeccionViva();
  const filaRef = useRef<HTMLDivElement>(null);
  const carrilRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLOListElement>(null);
  const enVista = useInView(filaRef, { once: true, amount: 0.5 });
  // 1 en desktop (la linea sigue al scroll de la pagina), 0 en mobile (sigue al dedo)
  const desktop = useMotionValue(1);
  // debajo de 1024 px la fila se desliza: tambien con teclado
  const [deslizable, setDeslizable] = useState(false);

  // la linea termina cuando la fila entera ya se ve: llegando desde el menu
  // (seccion arriba de todo) los cuatro pasos quedan encendidos
  const { scrollYProgress: vertical } = useScroll({ target: filaRef, offset: ["start 0.85", "end 0.9"] });
  const { scrollXProgress: horizontal } = useScroll({ container: carrilRef });
  const avance = useTransform([vertical, horizontal, desktop], ([v, h, d]: number[]) => (d ? v : h));

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const aplicar = () => {
      desktop.set(media.matches ? 1 : 0);
      setDeslizable(!media.matches);
    };
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, [desktop]);

  // mobile: un amague hacia el costado, una sola vez, para avisar que se desliza
  useEffect(() => {
    const lista = listaRef.current;
    if (!vivo || !enVista || !lista || window.matchMedia("(min-width: 1024px)").matches) return;
    const control = animate(lista, { x: [0, -36, 0] }, { duration: 1.2, delay: 0.5, ease: [0.65, 0, 0.35, 1] });
    return () => control.stop();
  }, [vivo, enVista]);

  return (
    <>
      <SectionTitle eyebrow={proceso.eyebrow} title={proceso.titulo} intro={proceso.intro} lado />

      <div ref={filaRef}>
        <div
          ref={carrilRef}
          role={deslizable ? "region" : undefined}
          aria-label={deslizable ? proceso.carril : undefined}
          tabIndex={deslizable ? 0 : undefined}
          onKeyDown={(e) => {
            if (!deslizable || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
            e.preventDefault();
            const paso = listaRef.current?.firstElementChild?.getBoundingClientRect().width ?? 300;
            carrilRef.current?.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * (paso + 16), behavior: "smooth" });
          }}
          className="-mx-6 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-2 outline-none [scrollbar-width:none] focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[color:var(--accent)] md:-mx-12 md:scroll-px-12 md:px-12 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          <ol ref={listaRef} className="flex w-max gap-4 md:gap-6 lg:grid lg:w-full lg:grid-cols-4 lg:gap-8">
            {proceso.pasos.map((paso, k) => (
              <PasoCelda key={paso.n} paso={paso} k={k} p={avance} vivo={vivo} />
            ))}
          </ol>
        </div>
        <p className="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-faint)] lg:hidden">
          <span aria-hidden className="inline-block h-px w-6 bg-[color:var(--text-faint)]" />
          {proceso.deslizar}
        </p>
      </div>

      <Reveal className="mt-14 border-t border-[color:var(--accent-line)] pt-8 md:mt-20 md:pt-10">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <p className="font-display text-[clamp(2rem,4.4vw,3.75rem)] font-semibold leading-[1] tracking-[-0.015em] text-balance text-[color:var(--accent)]">
            {proceso.cierre.titulo}
          </p>
          <p className="max-w-[44ch] text-[clamp(1.1rem,1.5vw,1.35rem)] leading-[1.5] text-pretty text-[color:var(--text-soft)] lg:pb-[0.3em]">
            {proceso.cierre.texto}
          </p>
        </div>
      </Reveal>
    </>
  );
}

function PasoCelda({ paso, k, p, vivo }: { paso: Paso; k: number; p: MotionValue<number>; vivo: boolean }) {
  const encendido = useTransform(p, (v) => tramo(v, [punto(k) - 0.05, punto(k) + 0.01]));
  const texto = useTransform(p, (v) => 0.38 + 0.62 * tramo(v, [punto(k) - 0.16, punto(k)]));
  const tramoLinea = useTransform(p, (v) =>
    k < N - 1 ? `scaleX(${tramo(v, [punto(k), punto(k + 1)])})` : "scaleX(0)"
  );

  return (
    <li className="relative w-[min(78vw,330px)] shrink-0 snap-start lg:w-auto">
      {/* el nodo y el tramo de linea hasta el paso siguiente */}
      <div className="relative">
        {k < N - 1 ? (
          <span
            aria-hidden
            className="absolute -right-4 left-16 top-1/2 h-px bg-[color:var(--hairline-strong)] md:-right-6 md:left-[72px] lg:-right-8"
          >
            <motion.span
              className="block h-full w-full origin-left bg-[color:var(--accent)]"
              style={vivo ? { transform: tramoLinea } : undefined}
            />
          </span>
        ) : null}
        <div className="relative z-10 grid h-16 w-16 place-items-center border border-[color:var(--hairline-strong)] bg-[color:var(--bg)] md:h-[72px] md:w-[72px]">
          <motion.span
            aria-hidden
            className="absolute -inset-px border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
            style={{ opacity: vivo ? encendido : 1 }}
          />
          <Icono tipo={paso.icono} />
        </div>
      </div>

      <motion.div data-anim className="mt-6 md:mt-7" style={vivo ? { opacity: texto } : undefined}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="text-[color:var(--accent)]">{paso.n}</span>
          <span className="border border-[color:var(--hairline-strong)] px-2 py-0.5 text-[color:var(--text-dim)]">
            {paso.nota}
          </span>
        </p>
        <h3 className="mt-4 max-w-[14ch] font-display text-[clamp(1.5rem,2.1vw,1.95rem)] font-semibold leading-[1.06] tracking-[-0.01em] text-balance text-[color:var(--text)]">
          {paso.titulo}
        </h3>
        <p className="mt-3 max-w-[36ch] text-[16px] leading-[1.6] text-pretty text-[color:var(--text-dim)] md:text-[17px]">
          {paso.detalle}
        </p>
      </motion.div>
    </li>
  );
}

/** Iconos en loop (CSS, transform y opacity). */
function Icono({ tipo }: { tipo: string }) {
  if (tipo === "chat") {
    return (
      <span aria-hidden className="relative flex h-7 w-9 items-center justify-center gap-1 border border-[color:var(--accent)]">
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className="loop a-tipea h-1 w-1 bg-[color:var(--accent)]"
            style={{ animationDelay: `${k * 0.15}s` }}
          />
        ))}
        <span className="absolute -bottom-[5px] left-2 h-2 w-2 rotate-45 border-b border-r border-[color:var(--accent)] bg-[color:var(--bg)]" />
      </span>
    );
  }
  if (tipo === "firma") {
    return (
      <span aria-hidden className="relative block h-9 w-7 border border-[color:var(--accent)] p-1">
        <span className="mt-0.5 block h-px w-full bg-[color:var(--text-faint)]" />
        <span className="mt-1 block h-px w-3/4 bg-[color:var(--text-faint)]" />
        <span className="mt-1 block h-px w-full bg-[color:var(--text-faint)]" />
        <span className="loop a-traza absolute bottom-1.5 left-1 h-[2px] w-[18px] origin-left bg-[color:var(--accent)]" />
      </span>
    );
  }
  if (tipo === "bloques") {
    return (
      <span aria-hidden className="relative block h-9 w-9">
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className="loop a-apila absolute left-1/2 h-2.5 w-7 -translate-x-1/2 border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
            style={{ bottom: k * 11, animationDelay: `${k * 0.45}s` }}
          />
        ))}
      </span>
    );
  }
  return (
    <span aria-hidden className="relative grid h-8 w-8 place-items-center border border-[color:var(--accent)]">
      <svg viewBox="0 0 16 16" className="loop a-asoma h-4 w-4">
        <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
    </span>
  );
}
