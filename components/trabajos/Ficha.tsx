"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import type { TextosTrabajos, Trabajo } from "@/content/trabajos";
import type { Rect } from "./plano";

/**
 * Ficha de un trabajo: un <dialog> modal (foco atrapado, Escape, el resto de
 * la pagina inerte) que nace en el lugar de la tarjeta y se expande a
 * pantalla completa con FLIP: se mide el layout final, se lo invierte hasta
 * el rect de origen y se anima de vuelta a cero. Solo transform y opacity.
 *
 * El escenario arranca mostrando la misma miniatura que la tarjeta (la
 * textura ya esta en cache), asi el relevo 3D a HTML no se nota; el video y
 * la galeria se piden recien ahora.
 */

const EASE_SALE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_ENTRA: [number, number, number, number] = [0.6, 0, 0.84, 0.3];

type Fase = "abriendo" | "abierta" | "cerrando";

type Props = {
  items: Trabajo[];
  indice: number;
  origen: Rect | null;
  textos: TextosTrabajos;
  reducido: boolean;
  /** a donde vuelve al cerrar (rect en la ventana) o null para salir con fundido */
  destino: (i: number) => Rect | null;
  onAbierta: () => void;
  onCerrando: () => void;
  onCerrada: (i: number) => void;
  onCambiar: (j: number) => void;
};

const pad = (v: number) => String(v).padStart(2, "0");

type Inversa = { x: number; y: number; sx: number; sy: number };

/** Transform que lleva el rect final al de origen (para FLIP). */
function invertir(desde: Rect, final: DOMRect): Inversa {
  return {
    x: desde.x - final.left,
    y: desde.y - final.top,
    sx: desde.w / Math.max(1, final.width),
    sy: desde.h / Math.max(1, final.height),
  };
}

/** Keyframes explicitos: de la inversa a cero (abrir) o de cero a la inversa (cerrar). */
function flip(inv: Inversa, hacia: "final" | "origen") {
  const par = (a: number, b: number) => (hacia === "final" ? [a, b] : [b, a]);
  return { x: par(inv.x, 0), y: par(inv.y, 0), scaleX: par(inv.sx, 1), scaleY: par(inv.sy, 1) };
}

/** La inversa aplicada ya mismo, antes del primer cuadro: nunca se ve el layout final de golpe. */
function fijar(el: HTMLElement, inv: Inversa) {
  el.style.transform = `translateX(${inv.x}px) translateY(${inv.y}px) scaleX(${inv.sx}) scaleY(${inv.sy})`;
}

export function Ficha({
  items,
  indice,
  origen,
  textos,
  reducido,
  destino,
  onAbierta,
  onCerrando,
  onCerrada,
  onCambiar,
}: Props) {
  const t = items[indice];
  const n = items.length;
  const f = textos.ficha;

  const dialogo = useRef<HTMLDialogElement>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const superficie = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const escenario = useRef<HTMLDivElement>(null);
  const desplazable = useRef<HTMLDivElement>(null);
  const cerrarBtn = useRef<HTMLButtonElement>(null);
  const cerrando = useRef(false);
  const indiceRef = useRef(indice);

  const [fase, setFase] = useState<Fase>("abriendo");
  /** despues de pasar de proyecto, el contenido nuevo entra con un fundido corto */
  const [navego, setNavego] = useState(false);
  const idTitulo = useId();
  const idResumen = useId();

  useEffect(() => {
    indiceRef.current = indice;
  }, [indice]);

  /** lo que entra despues del escenario: cabecera, tira y texto */
  const secundarios = () =>
    Array.from(panel.current?.querySelectorAll<HTMLElement>("[data-ficha-sec]") ?? []);

  // ── apertura ──
  useLayoutEffect(() => {
    const d = dialogo.current;
    const esc = escenario.current;
    const sup = superficie.current;
    const fon = fondo.current;
    if (!d || !esc || !sup || !fon) return;
    if (!d.open) d.showModal();
    cerrarBtn.current?.focus({ preventScroll: true });

    const sec = secundarios();
    let vivo = true;
    const listo = () => {
      if (!vivo) return;
      setFase("abierta");
      onAbierta();
    };

    if (!origen || reducido) {
      const todos = [fon, sup, ...sec, esc];
      todos.forEach((el) => (el.style.opacity = "0"));
      const anim = todos.map((el) =>
        animate(el, { opacity: [0, el === fon ? 0.94 : 1] }, { duration: reducido ? 0.18 : 0.32 })
      );
      Promise.all(anim).then(listo);
      return () => {
        vivo = false;
      };
    }

    const invEsc = invertir(origen, esc.getBoundingClientRect());
    const invSup = invertir(origen, sup.getBoundingClientRect());
    fijar(esc, invEsc);
    fijar(sup, invSup);
    sec.forEach((el) => (el.style.opacity = "0"));
    fon.style.opacity = "0";

    const dur = 0.62;
    Promise.all([
      animate(esc, flip(invEsc, "final"), { duration: dur, ease: EASE_SALE }),
      animate(sup, flip(invSup, "final"), { duration: dur, ease: EASE_SALE }),
      animate(fon, { opacity: [0, 0.94] }, { duration: dur * 0.8 }),
      ...sec.map((el, k) =>
        animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: 0.5, delay: 0.2 + k * 0.05, ease: EASE_SALE })
      ),
    ]).then(listo);
    return () => {
      vivo = false;
    };
    // solo al montar: cambiar de proyecto no vuelve a abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── cierre: el camino inverso hasta la tarjeta ──
  const cerrar = async () => {
    if (cerrando.current) return;
    cerrando.current = true;
    const i = indiceRef.current;
    onCerrando();
    setFase("cerrando");

    const d = dialogo.current;
    const esc = escenario.current;
    const sup = superficie.current;
    const fon = fondo.current;
    const sec = secundarios();
    const meta = destino(i);
    if (desplazable.current) desplazable.current.scrollTop = 0;

    if (esc && sup && fon && meta && !reducido) {
      await Promise.all(sec.map((el) => animate(el, { opacity: 0 }, { duration: 0.2 })));
      const invEsc = invertir(meta, esc.getBoundingClientRect());
      const invSup = invertir(meta, sup.getBoundingClientRect());
      const dur = 0.4;
      await Promise.all([
        animate(esc, flip(invEsc, "origen"), { duration: dur, ease: EASE_ENTRA }),
        animate(sup, flip(invSup, "origen"), { duration: dur, ease: EASE_ENTRA }),
        animate(fon, { opacity: [0.94, 0] }, { duration: dur }),
      ]);
    } else if (panel.current && sup && fon) {
      await Promise.all(
        [panel.current, sup, fon].map((el) => animate(el, { opacity: 0 }, { duration: 0.22 }))
      );
    }
    d?.close();
    onCerrada(i);
  };

  // ── deslizar hacia abajo para cerrar (pantallas tactiles) ──
  useEffect(() => {
    const s = desplazable.current;
    const p = panel.current;
    const sup = superficie.current;
    const fon = fondo.current;
    if (!s || !p || !sup || !fon) return;
    let y0 = 0;
    let t0 = 0;
    let dy = 0;
    let siguiendo = false;

    const inicio = (e: TouchEvent) => {
      if (cerrando.current || s.scrollTop > 0 || e.touches.length > 1) return;
      y0 = e.touches[0].clientY;
      t0 = e.timeStamp;
      dy = 0;
      siguiendo = true;
    };
    const mover = (e: TouchEvent) => {
      if (!siguiendo) return;
      dy = e.touches[0].clientY - y0;
      if (dy <= 0) {
        if (dy < -6) siguiendo = false;
        return;
      }
      e.preventDefault();
      const y = dy * 0.92;
      p.style.transform = `translateY(${y}px)`;
      sup.style.transform = `translateY(${y}px)`;
      fon.style.opacity = String(0.94 * Math.max(0, 1 - dy / 520));
    };
    const fin = async (e: TouchEvent) => {
      if (!siguiendo) return;
      siguiendo = false;
      if (dy <= 0) return;
      const vel = dy / Math.max(1, e.timeStamp - t0);
      if (dy > 120 || vel > 0.65) {
        cerrando.current = true;
        const i = indiceRef.current;
        onCerrando();
        setFase("cerrando");
        const alto = window.innerHeight;
        await Promise.all([
          animate(p, { y: [dy * 0.92, alto] }, { duration: 0.32, ease: EASE_SALE }),
          animate(sup, { y: [dy * 0.92, alto] }, { duration: 0.32, ease: EASE_SALE }),
          animate(fon, { opacity: 0 }, { duration: 0.3 }),
        ]);
        dialogo.current?.close();
        onCerrada(i);
      } else {
        animate(p, { y: [dy * 0.92, 0] }, { type: "spring", stiffness: 380, damping: 34 });
        animate(sup, { y: [dy * 0.92, 0] }, { type: "spring", stiffness: 380, damping: 34 });
        animate(fon, { opacity: 0.94 }, { duration: 0.2 });
      }
    };
    s.addEventListener("touchstart", inicio, { passive: true });
    s.addEventListener("touchmove", mover, { passive: false });
    s.addEventListener("touchend", fin);
    s.addEventListener("touchcancel", fin);
    return () => {
      s.removeEventListener("touchstart", inicio);
      s.removeEventListener("touchmove", mover);
      s.removeEventListener("touchend", fin);
      s.removeEventListener("touchcancel", fin);
    };
    // los callbacks del padre son estables durante la vida de la ficha
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irA = (j: number) => {
    if (cerrando.current || j === indice) return;
    setNavego(true);
    onCambiar(j);
  };
  const cambiar = (delta: number) => irA((indice + delta + n) % n);

  const indicePar = t.par ? items.findIndex((x) => x.slug === t.par) : -1;
  const par = indicePar >= 0 ? items[indicePar] : null;

  return (
    <dialog
      ref={dialogo}
      className="trabajos-ficha fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-[color:var(--text)]"
      aria-labelledby={idTitulo}
      aria-describedby={idResumen}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          cambiar(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          cambiar(-1);
        }
      }}
    >
      {/* afuera de la ficha: click cierra */}
      <div ref={fondo} aria-hidden className="absolute inset-0 bg-[color:var(--bg-deep)]" onClick={cerrar} />

      {/* la superficie que crece desde la tarjeta */}
      <div
        ref={superficie}
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-top-left bg-[color:var(--bg)] lg:inset-5 lg:border lg:border-[color:var(--hairline)]"
      />

      <div ref={panel} className="absolute inset-0 flex flex-col lg:inset-5">
        <header
          data-ficha-sec
          className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-4 md:h-16 md:px-6"
        >
          <p className="flex min-w-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            <span className="text-[color:var(--text)]">
              {pad(indice + 1)} / {pad(n)}
            </span>
            <span className="hidden h-3 w-px bg-[color:var(--hairline)] sm:block" />
            <span className="hidden truncate sm:block">{textos.tipos[t.tipo]}</span>
          </p>
          <p className="sr-only" aria-live="polite">
            {`${indice + 1} ${f.de} ${n}: ${t.marca}${t.subtitulo ? `, ${t.subtitulo}` : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <BotonIcono etiqueta={f.anterior} onClick={() => cambiar(-1)}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </BotonIcono>
            <BotonIcono etiqueta={f.siguiente} onClick={() => cambiar(1)}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </BotonIcono>
            <BotonIcono ref={cerrarBtn} etiqueta={f.cerrar} onClick={cerrar} acento>
              <X aria-hidden className="h-4 w-4" />
            </BotonIcono>
          </div>
        </header>

        <div
          ref={desplazable}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:overflow-hidden"
        >
          <Medios
            key={`m-${t.slug}`}
            trabajo={t}
            textos={textos}
            fase={fase}
            reducido={reducido}
            escenarioRef={escenario}
          />

          <div
            key={`t-${t.slug}`}
            data-ficha-sec
            className="px-5 pb-16 pt-2 md:px-8 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-[color:var(--hairline)] lg:px-10 lg:pb-12 lg:pt-10"
          >
            <div className={navego ? "trabajos-entra" : undefined}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                {t.rubro}
              </p>
              <h2
                id={idTitulo}
                className="mt-3 font-display text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[color:var(--text)]"
              >
                {t.marca}
              </h2>
              {t.subtitulo ? (
                <p className="mt-2 text-[18px] text-[color:var(--text-dim)]">{t.subtitulo}</p>
              ) : null}

              {t.destacado ? (
                <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[color:var(--accent)] pt-4">
                  <span className="font-display text-[clamp(2.2rem,3.6vw,3.25rem)] font-semibold leading-none tracking-[-0.03em] text-[color:var(--accent)]">
                    {t.destacado.valor}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]">
                    {t.destacado.detalle}
                  </span>
                </p>
              ) : null}

              <ul aria-label={f.etiquetas} className="mt-6 flex flex-wrap gap-2">
                {t.etiquetas.map((e) => (
                  <li
                    key={e}
                    className="border border-[color:var(--hairline)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]"
                  >
                    {e}
                  </li>
                ))}
              </ul>

              <p id={idResumen} className="mt-7 max-w-[60ch] text-[17px] leading-relaxed text-[color:var(--text)] md:text-[18px]">
                {t.resumen}
              </p>

              <section className="mt-9">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                  {f.logros}
                </h3>
                <ul className="mt-4 space-y-3">
                  {t.logros.map((l) => (
                    <li key={l} className="flex gap-3 text-[16px] leading-snug text-[color:var(--text-dim)]">
                      <span aria-hidden className="mt-[0.45em] h-[6px] w-[6px] shrink-0 bg-[color:var(--accent)]" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-9 grid gap-8 sm:grid-cols-2">
                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                    {f.queHice}
                  </h3>
                  <ul className="mt-4 space-y-2 text-[15px] leading-snug text-[color:var(--text-dim)]">
                    {t.queHice.map((q) => (
                      <li key={q} className="border-b border-[color:var(--hairline)] pb-2">
                        {q}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                    {f.conQue}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--text-dim)]">{t.conQue}</p>
                </section>
              </div>

              {t.nota ? (
                <p className="mt-8 border-l border-[color:var(--accent)] pl-3 text-[13px] leading-relaxed text-[color:var(--text-dim)]">
                  {t.nota}
                </p>
              ) : null}

              {par ? (
                <button
                  type="button"
                  onClick={() => irA(indicePar)}
                  className="group mt-9 flex w-full cursor-pointer items-center justify-between gap-4 border border-[color:var(--hairline)] px-4 py-4 text-left transition-colors duration-300 hover:bg-[color:var(--accent-soft)]"
                >
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                      {f.verPar}
                    </span>
                    <span className="mt-1 block text-[16px] text-[color:var(--text)]">
                      {par.marca}
                      {par.subtitulo ? `: ${par.subtitulo}` : ""}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-[color:var(--accent)] transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              ) : null}

              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)] lg:hidden">
                {f.arrastrar}
              </p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

type BotonIconoProps = {
  etiqueta: string;
  onClick: () => void;
  acento?: boolean;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

function BotonIcono({ etiqueta, onClick, acento = false, children, ref }: BotonIconoProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center border transition-colors duration-300 active:translate-y-px ${
        acento
          ? "border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
          : "border-[color:var(--hairline)] text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

// ── escenario: video estrella y galeria ─────────────────────────────────

type Medio =
  | { tipo: "video"; src: string; poster: string; vertical: boolean; alt: string }
  | { tipo: "imagen"; src: string; ancho: number; alto: number; vertical: boolean; alt: string };

function Medios({
  trabajo,
  textos,
  fase,
  reducido,
  escenarioRef,
}: {
  trabajo: Trabajo;
  textos: TextosTrabajos;
  fase: Fase;
  reducido: boolean;
  escenarioRef: React.RefObject<HTMLDivElement | null>;
}) {
  const f = textos.ficha;
  const medios: Medio[] = [
    ...(trabajo.media.video
      ? [
          {
            tipo: "video" as const,
            src: trabajo.media.video.src,
            poster: trabajo.media.video.poster,
            vertical: trabajo.media.video.alto > trabajo.media.video.ancho,
            alt: trabajo.media.video.descripcion,
          },
        ]
      : []),
    ...trabajo.media.galeria.map((g) => ({
      tipo: "imagen" as const,
      src: g.src,
      ancho: g.ancho,
      alto: g.alto,
      vertical: g.alto > g.ancho,
      alt: g.alt,
    })),
  ];

  const [sel, setSel] = useState(0);
  const [cargado, setCargado] = useState(false);
  const [pausado, setPausado] = useState(reducido);
  const video = useRef<HTMLVideoElement>(null);
  const actual = medios[sel];
  const abierta = fase === "abierta";
  // el medio se muestra una vez terminada la apertura; al cerrar vuelve la miniatura
  const visible = abierta && cargado;

  useEffect(() => {
    const v = video.current;
    if (!v || actual.tipo !== "video") return;
    if (abierta && !pausado) v.play().catch(() => setPausado(true));
    else v.pause();
  }, [abierta, pausado, actual.tipo]);

  const elegir = (k: number) => {
    setSel((k + medios.length) % medios.length);
    setCargado(false);
  };

  return (
    <div className="px-4 pb-6 pt-4 md:px-6 lg:flex lg:flex-col lg:justify-center lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:py-10">
      <div
        ref={escenarioRef}
        className="relative aspect-[16/10] w-full origin-top-left overflow-hidden border border-[color:var(--hairline)] bg-[color:var(--bg-deep)]"
      >
        {/* la miniatura: la misma imagen que la tarjeta, para el relevo */}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: visible && actual.vertical ? 0.1 : 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- misma URL que la textura 3D, ya en cache: el relevo tiene que ser instantaneo */}
          <img src={trabajo.media.textura} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element -- la version nitida de la misma miniatura, encima */}
          <img src={trabajo.media.miniatura} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {actual.tipo === "video" ? (
            <video
              ref={video}
              key={actual.src}
              src={actual.src}
              poster={actual.poster}
              muted
              loop
              playsInline
              preload="auto"
              aria-label={actual.alt}
              onLoadedData={() => setCargado(true)}
              className={`absolute inset-0 h-full w-full ${actual.vertical ? "object-contain" : "object-cover"}`}
            />
          ) : (
            <Image
              key={actual.src}
              src={actual.src}
              alt={actual.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 60vw"
              onLoad={() => setCargado(true)}
              className={actual.vertical ? "object-contain" : "object-cover object-top"}
            />
          )}
        </div>

        {medios.length > 1 ? (
          <div data-ficha-sec className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <span className="mr-1 bg-[color:var(--bg-deep)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]">
              {sel + 1} / {medios.length}
            </span>
            <BotonMedio etiqueta={f.mediaAnterior} onClick={() => elegir(sel - 1)}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </BotonMedio>
            <BotonMedio etiqueta={f.mediaSiguiente} onClick={() => elegir(sel + 1)}>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </BotonMedio>
          </div>
        ) : null}

        {actual.tipo === "video" ? (
          <div data-ficha-sec className="absolute bottom-3 left-3">
            <BotonMedio etiqueta={pausado ? f.reproducir : f.pausar} onClick={() => setPausado((p) => !p)}>
              {pausado ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
            </BotonMedio>
          </div>
        ) : null}
      </div>

      {medios.length > 1 ? (
        <ul
          data-ficha-sec
          aria-label={f.galeria}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {medios.map((m, k) => (
            <li key={m.src} className="shrink-0">
              <button
                type="button"
                aria-label={`${f.verMedia}: ${m.alt}`}
                aria-current={k === sel ? "true" : undefined}
                onClick={() => elegir(k)}
                className={`relative block h-14 cursor-pointer overflow-hidden border bg-[color:var(--bg-deep)] transition-colors duration-300 md:h-16 ${
                  m.vertical ? "w-8 md:w-9" : "w-[5.6rem] md:w-[6.4rem]"
                } ${k === sel ? "border-[color:var(--accent)]" : "border-[color:var(--hairline)] opacity-70 hover:opacity-100"}`}
              >
                <Image
                  src={m.tipo === "video" ? m.poster : m.src}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover object-top"
                />
                {m.tipo === "video" ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play aria-hidden className="h-3.5 w-3.5 text-[color:var(--text)]" />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function BotonMedio({
  etiqueta,
  onClick,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[color:var(--hairline)] bg-[color:var(--bg-deep)] text-[color:var(--text)] transition-colors duration-300 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
    >
      {children}
    </button>
  );
}
