"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Section, useSeccionViva } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { content } from "@/content/data";
import { irASeccion } from "@/lib/lenis";
import { preseleccionar } from "@/lib/preseleccion";
import { suave, tramo } from "@/lib/escena";

/**
 * Servicios: por donde empezar.
 *
 * Cada tarjeta entra girada de costado y gira en 3D con el scroll hasta quedar
 * de frente (CSS 3D, transform y opacity). Arranca a 70 grados y transparente,
 * y aparece recien pasando los 55: nunca se ve el canto como una astilla.
 * Arriba de cada una, una mini escena en loop que cuenta el servicio sin
 * palabras: el carrito que se llena, las filas de un panel que cargan, la
 * aguja que pasa a rapido, el escudo que escanea. Los loops corren solo con
 * la seccion en pantalla.
 *
 * En el celular las cuatro van en una fila que se desliza de costado (snap),
 * como los pasos de Como trabajamos: la seccion mide poco mas de una pantalla.
 *
 * Tocar "Consultar por esto" deja elegido ese servicio en el cotizador
 * (lib/preseleccion: Contacto lo lee al montarse) y baja al formulario.
 */

type Item = (typeof content.servicios.items)[number];

export function Servicios() {
  const { servicios } = content;

  return (
    <Section id="servicios">
      <SectionTitle eyebrow={servicios.eyebrow} title={servicios.titulo} intro={servicios.intro} lado />
      <div className="-mx-6 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 py-3 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:py-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 md:grid md:w-full md:grid-cols-2 md:gap-6">
          {servicios.items.map((item, i) => (
            <Tarjeta key={item.id} item={item} i={i} />
          ))}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-faint)] md:hidden">
        <span aria-hidden className="inline-block h-px w-6 bg-[color:var(--text-faint)]" />
        {servicios.deslizar}
      </p>
    </Section>
  );
}

function Tarjeta({ item, i }: { item: Item; i: number }) {
  const { servicios } = content;
  const ref = useRef<HTMLDivElement>(null);
  const vivo = useSeccionViva();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.98", "start 0.45"] });
  const sentido = i % 2 === 0 ? 1 : -1;
  const GIRO = 70;
  const transform = useTransform(scrollYProgress, (v) => {
    const t = suave(tramo(v, [0, 1]));
    return `rotateY(${sentido * GIRO * (1 - t)}deg) scale(${0.92 + 0.08 * t})`;
  });
  // transparente mientras esta muy de costado (mas de 55 grados)
  const opacity = useTransform(scrollYProgress, (v) => {
    const angulo = GIRO * (1 - suave(tramo(v, [0, 1])));
    return tramo(GIRO - angulo, [GIRO - 55, GIRO - 25]);
  });

  const consultar = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    irASeccion("contacto", { alMontar: () => preseleccionar(item.id) });
  };

  return (
    <div ref={ref} className="w-[85vw] max-w-[360px] shrink-0 snap-start [perspective:1600px] md:w-auto md:max-w-none">
      <motion.div
        data-anim
        className="relative h-full"
        style={vivo ? { transform, opacity } : undefined}
      >
        <article className="group relative flex h-full flex-col border border-[color:var(--hairline-strong)] bg-[color:var(--surface)]">
          <div className="relative h-[136px] overflow-hidden border-b border-[color:var(--hairline)] bg-[radial-gradient(ellipse_70%_90%_at_50%_100%,var(--accent-glow),transparent)] md:h-[148px]">
            <MiniEscena tipo={item.escena} />
          </div>
          <div className="flex flex-1 flex-col p-5 md:p-7">
            <h3 className="font-display text-[clamp(1.45rem,2.2vw,2.1rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-balance text-[color:var(--text)]">
              {item.nombre}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5 md:mt-4 md:gap-2">
              {item.claves.map((clave) => (
                <li
                  key={clave}
                  className="border border-[color:var(--accent-line)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent)] md:px-2.5 md:py-1 md:text-[11px] md:tracking-[0.14em]"
                >
                  {clave}
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-[52ch] flex-1 text-[15px] leading-[1.55] text-pretty text-[color:var(--text-dim)] md:mt-4 md:text-[17px] md:leading-[1.6]">
              {item.texto}
            </p>
            <a
              href="#contacto"
              onClick={consultar}
              className="mt-5 inline-flex w-fit items-center gap-3 border-b border-[color:var(--accent-line)] pb-1 text-[15px] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:mt-6"
            >
              {servicios.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </article>
      </motion.div>
    </div>
  );
}

// ── mini escenas en loop ────────────────────────────────────────────────

const ETIQUETA = "font-mono text-[10px] uppercase tracking-[0.12em]";

function MiniEscena({ tipo }: { tipo: string }) {
  const { escenas } = content.servicios;

  if (tipo === "carrito") {
    return (
      <div aria-hidden className="absolute inset-0">
        <div className="absolute bottom-3 left-1/2 h-[92px] w-[150px] -translate-x-1/2 origin-bottom scale-[0.88] md:scale-100">
          {/* productos que caen */}
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="loop a-cae absolute top-2 h-7 w-7 border border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
              style={{ left: 30 + k * 32, animationDelay: `${k * 0.6}s` }}
            />
          ))}
          <svg viewBox="0 0 150 92" className="absolute inset-0 h-full w-full">
            <path
              d="M2 6h22l14 58h92l14-44H34"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="52" cy="80" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="118" cy="80" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          </svg>
        </div>
        <span className={`absolute right-5 top-5 border border-[color:var(--accent-line)] px-2 py-1 ${ETIQUETA} text-[color:var(--accent)]`}>
          {escenas.carrito.label} · {escenas.carrito.total}
        </span>
      </div>
    );
  }

  if (tipo === "panel") {
    return (
      // el panel asoma desde abajo y se funde antes del borde: ninguna fila queda cortada al medio
      <div aria-hidden className="absolute inset-x-8 -bottom-px top-5 border border-[color:var(--hairline-strong)] bg-[color:var(--bg)] p-4 [mask-image:linear-gradient(to_bottom,var(--bg)_55%,transparent_92%)]">
        <p className={`${ETIQUETA} mb-3 text-[color:var(--text-dim)]`}>{escenas.panel.label}</p>
        <div className="flex flex-col gap-2">
          {escenas.panel.filas.map((nombre, k) => (
            <div key={nombre} className="relative h-[22px]">
              <span className="absolute inset-0 bg-[color:var(--hairline)]" />
              <span
                className="loop a-carga absolute inset-0 flex items-center gap-2 bg-[color:var(--surface-2)] px-2"
                style={{ animationDelay: `${k * 0.35}s` }}
              >
                <span className="h-2.5 w-2.5 rounded-full border border-[color:var(--accent)]" />
                <span className="text-[12px] text-[color:var(--text)]">{nombre}</span>
                <span className="ml-auto h-[6px] w-10 bg-[color:var(--accent-line)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tipo === "velocidad") {
    return (
      <div aria-hidden className="absolute inset-0">
        <div className="absolute bottom-6 left-1/2 h-[120px] w-[220px] -translate-x-1/2 origin-bottom scale-[0.82] md:scale-[0.9]">
          <svg viewBox="0 0 220 120" className="absolute inset-0 h-full w-full">
            <path d="M14 112a96 96 0 0 1 192 0" fill="none" stroke="var(--hairline-strong)" strokeWidth="6" />
            <path d="M150 28a96 96 0 0 1 56 84" fill="none" stroke="var(--accent)" strokeWidth="6" />
          </svg>
          {/* la aguja gira sobre su base */}
          <span className="loop a-aguja absolute bottom-[8px] left-1/2 h-[86px] w-[2px] -translate-x-1/2 origin-bottom bg-[color:var(--text)]" />
          <span className="absolute bottom-[3px] left-1/2 h-3 w-3 -translate-x-1/2 bg-[color:var(--accent)]" />
        </div>
        <span className={`absolute bottom-3 left-[calc(50%-120px)] ${ETIQUETA} text-[color:var(--text-faint)]`}>
          {escenas.velocidad.lento}
        </span>
        <span className={`absolute bottom-3 right-[calc(50%-124px)] ${ETIQUETA} text-[color:var(--accent)]`}>
          {escenas.velocidad.rapido}
        </span>
      </div>
    );
  }

  // escudo que escanea
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute left-1/2 top-[42%] h-[136px] w-[112px] -translate-x-1/2 -translate-y-1/2 scale-[0.68] overflow-hidden md:scale-[0.76]">
        <svg viewBox="0 0 112 136" className="absolute inset-0 h-full w-full">
          <path
            d="M56 4l48 18v40c0 32-20 56-48 70C28 118 8 94 8 62V22z"
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <path d="M36 68l14 14 28-30" fill="none" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        <span className="loop a-escanea absolute inset-x-0 top-0 h-[2px] bg-[color:var(--text)] opacity-0 [--recorrido:132px]" />
      </div>
      <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 ${ETIQUETA} flex items-center gap-2 text-[color:var(--accent)]`}>
        <span className="loop a-latido h-[6px] w-[6px] bg-[color:var(--accent)]" />
        {escenas.escudo.label}
      </span>
    </div>
  );
}
