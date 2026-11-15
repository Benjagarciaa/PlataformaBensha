"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import type { MarcoMedio, TextosTrabajos, Trabajo } from "@/content/data";
import type { Rect } from "./plano";

/**
 * Ficha de un trabajo: un <dialog> modal (foco atrapado, Escape, el resto de
 * la pagina inerte) que nace en el lugar de la tarjeta y se expande a
 * pantalla completa con FLIP: se mide el layout final, se lo invierte hasta
 * el rect de origen y se anima de vuelta a cero. Solo transform y opacity.
 *
 * El escenario arranca mostrando la misma miniatura que la tarjeta (la
 * textura ya esta en cache), asi el relevo 3D a HTML no se nota; el video y
 * la galeria se piden recien con la ficha abierta.
 *
 * Cada medio se presenta en su marco: las capturas de compu en una ventana de
 * navegador, las del celular en un celular y las laminas ya compuestas sin
 * marco, siempre sobre la luz celeste del visor. Los controles del video y de
 * la galeria viven en una barra propia debajo del visor: nunca tapan la
 * captura.
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

  /** lo que entra despues del escenario: cabecera, controles, tira y texto */
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
    let x0 = 0;
    let t0 = 0;
    let dy = 0;
    let siguiendo = false;

    const inicio = (e: TouchEvent) => {
      if (cerrando.current || s.scrollTop > 0 || e.touches.length > 1) return;
      y0 = e.touches[0].clientY;
      x0 = e.touches[0].clientX;
      t0 = e.timeStamp;
      dy = 0;
      siguiendo = true;
    };
    const mover = (e: TouchEvent) => {
      if (!siguiendo) return;
      dy = e.touches[0].clientY - y0;
      const dx = e.touches[0].clientX - x0;
      // un gesto de costado es para la galeria, no para cerrar
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
        if (dy < -6 || Math.abs(dx) > 10) siguiendo = false;
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
        className="pointer-events-none absolute inset-0 origin-top-left bg-[color:var(--bg)] lg:inset-4 lg:border lg:border-[color:var(--hairline)]"
      />

      <div ref={panel} className="absolute inset-0 flex flex-col lg:inset-4">
        <header
          data-ficha-sec
          className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-4 md:h-16 md:px-6"
        >
          <p className="flex min-w-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            <span className="text-[color:var(--text)]">
              {pad(indice + 1)} / {pad(n)}
            </span>
            <span className="h-3 w-px bg-[color:var(--hairline-strong)]" />
            <span className="truncate">{textos.tipos[t.tipo]}</span>
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
            <span aria-hidden className="mx-1 h-6 w-px bg-[color:var(--hairline)]" />
            <BotonIcono ref={cerrarBtn} etiqueta={f.cerrar} onClick={cerrar} acento>
              <X aria-hidden className="h-4 w-4" />
            </BotonIcono>
          </div>
        </header>

        <div
          ref={desplazable}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:overflow-hidden"
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
            className="px-5 pb-16 pt-4 md:px-8 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-[color:var(--hairline)] lg:px-10 lg:pb-12 lg:pt-9"
          >
            <div className={`max-w-[38rem] ${navego ? "trabajos-entra" : ""}`}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                {t.rubro}
              </p>
              <h2
                id={idTitulo}
                className="mt-3 text-balance font-display text-[clamp(2.3rem,3.9vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[color:var(--text)]"
              >
                {t.marca}
              </h2>
              {t.subtitulo ? (
                <p className="mt-2 text-[18px] leading-snug text-[color:var(--text-soft)]">{t.subtitulo}</p>
              ) : null}

              {t.destacado ? (
                <p className="mt-6 border-l-2 border-[color:var(--accent)] pl-4">
                  <span className="block font-display text-[clamp(2.1rem,3.2vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-[color:var(--accent)]">
                    {t.destacado.valor}
                  </span>
                  <span className="mt-2 block text-[15px] leading-snug text-[color:var(--text-dim)]">
                    {t.destacado.detalle}
                  </span>
                </p>
              ) : null}

              <ul aria-label={f.etiquetas} className="mt-6 flex flex-wrap gap-2">
                {t.etiquetas.map((e) => (
                  <li
                    key={e}
                    className="border border-[color:var(--hairline-strong)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-dim)]"
                  >
                    {e}
                  </li>
                ))}
              </ul>

              <p
                id={idResumen}
                className="mt-7 text-pretty text-[17px] leading-[1.65] text-[color:var(--text-soft)] md:text-[18px]"
              >
                {t.resumen}
              </p>

              <section className="mt-10">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                  {f.logros}
                </h3>
                <ol className="mt-3 border-t border-[color:var(--hairline)]">
                  {t.logros.map((l, k) => (
                    <li
                      key={l}
                      className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 border-b border-[color:var(--hairline)] py-3.5"
                    >
                      <span aria-hidden className="pt-[0.2em] font-mono text-[11px] tracking-[0.12em] text-[color:var(--accent)]">
                        {pad(k + 1)}
                      </span>
                      <span className="text-[16px] leading-snug text-[color:var(--text)]">{l}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                    {f.queHice}
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-[15px] leading-snug text-[color:var(--text-dim)]">
                    {t.queHice.map((q) => (
                      <li key={q} className="flex gap-3">
                        <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-[color:var(--accent)]" />
                        <span>{q}</span>
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
                <p className="mt-9 border-l border-[color:var(--accent-line)] pl-3 text-[14px] leading-relaxed text-[color:var(--text-dim)]">
                  {t.nota}
                </p>
              ) : null}

              {par ? (
                <button
                  type="button"
                  onClick={() => irA(indicePar)}
                  className="group mt-9 flex w-full cursor-pointer items-center justify-between gap-4 border border-[color:var(--hairline-strong)] px-4 py-4 text-left transition-colors duration-300 hover:border-[color:var(--accent-line)] hover:bg-[color:var(--accent-soft)]"
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
          : "border-[color:var(--hairline-strong)] text-[color:var(--text)] hover:border-[color:var(--accent-line)] hover:bg-[color:var(--accent-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

// ── visor: video estrella y galeria, cada uno en su marco ───────────────

type Medio = {
  tipo: "video" | "imagen";
  src: string;
  /** la imagen de la miniatura: el poster del video o la misma captura */
  vista: string;
  ancho: number;
  alto: number;
  marco: MarcoMedio;
  alt: string;
};

/** alto de la barra del navegador, en px */
const BARRA = 30;
/** bisel del celular: arriba (con el parlante), abajo y a los costados, en px */
const BISEL = { arriba: 20, abajo: 14, lado: 6 };

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
  const v = trabajo.media.video;
  const medios: Medio[] = [
    ...(v
      ? [
          {
            tipo: "video" as const,
            src: v.src,
            vista: v.poster,
            ancho: v.ancho,
            alto: v.alto,
            marco: (v.alto > v.ancho ? "celular" : "navegador") as MarcoMedio,
            alt: v.descripcion,
          },
        ]
      : []),
    ...trabajo.media.galeria.map((g) => ({
      tipo: "imagen" as const,
      src: g.src,
      vista: g.src,
      ancho: g.ancho,
      alto: g.alto,
      marco: g.marco,
      alt: g.alt,
    })),
  ];
  const total = medios.length;

  /** el medio pedido */
  const [sel, setSel] = useState(0);
  /** el que se ve: el pedido apenas termina de cargar, mientras tanto el anterior */
  const [mostrado, setMostrado] = useState(0);
  const [cargados, setCargados] = useState<ReadonlySet<number>>(() => new Set());
  const [pausado, setPausado] = useState(reducido);
  const selRef = useRef(0);
  const video = useRef<HTMLVideoElement>(null);
  const toque = useRef<{ id: number; x: number; y: number } | null>(null);

  const abierta = fase === "abierta";
  // la galeria se pide recien cuando termina la apertura: el vuelo no compite con la red
  const montar = fase !== "abriendo";
  const listo = abierta && cargados.has(mostrado);
  const actual = medios[mostrado];
  const pedido = medios[sel];
  const horizontal = actual.ancho >= actual.alto;
  const conBarra = listo && horizontal && actual.marco === "navegador";

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (abierta && !pausado && medios[mostrado].tipo === "video") el.play().catch(() => setPausado(true));
    else el.pause();
    // medios se deriva de las props en cada render; alcanza con el indice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, pausado, mostrado]);

  const alCargar = (k: number) => {
    setCargados((prev) => {
      if (prev.has(k)) return prev;
      const s = new Set(prev);
      s.add(k);
      return s;
    });
    if (selRef.current === k) setMostrado(k);
  };

  const elegir = (k: number) => {
    const j = (k + total) % total;
    selRef.current = j;
    setSel(j);
    if (cargados.has(j)) setMostrado(j);
  };

  // en pantallas tactiles, deslizar de costado sobre el visor pasa de imagen
  const alBajar = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    toque.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const alSoltar = (e: React.PointerEvent) => {
    const t0 = toque.current;
    toque.current = null;
    if (!t0 || t0.id !== e.pointerId || total < 2) return;
    const dx = e.clientX - t0.x;
    const dy = e.clientY - t0.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) elegir(sel + (dx < 0 ? 1 : -1));
  };

  /** se monta el video solo si esta pedido o a la vista */
  const montado = (m: Medio, k: number) => montar && (m.tipo === "imagen" || k === sel || k === mostrado);

  const capa = (m: Medio, k: number) => {
    const visible = listo && k === mostrado;
    const clase = `absolute inset-0 h-full w-full transition-opacity duration-300 ${
      m.marco === "lamina" ? "object-contain" : "object-cover object-top"
    }`;
    if (!montado(m, k)) return null;
    return m.tipo === "video" ? (
      <video
        key={m.src}
        ref={video}
        src={m.src}
        poster={m.vista}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={m.alt}
        onLoadedData={() => alCargar(k)}
        className={clase}
        style={{ opacity: visible ? 1 : 0 }}
      />
    ) : (
      <Image
        key={m.src}
        src={m.src}
        alt={visible ? m.alt : ""}
        fill
        loading="eager"
        sizes={m.ancho >= m.alto ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 1023px) 60vw, 340px"}
        onLoad={() => alCargar(k)}
        className={clase}
        style={{ opacity: visible ? 1 : 0 }}
      />
    );
  };

  return (
    <div className="flex flex-col px-4 pb-6 pt-4 md:px-6 lg:h-full lg:min-h-0 lg:px-8 lg:pb-6 lg:pt-6">
      {/* el visor: luz celeste de fondo y el medio en su marco */}
      <div
        className="relative h-[clamp(280px,50svh,480px)] touch-pan-y select-none [container-type:size] lg:h-auto lg:min-h-0 lg:flex-1"
        onPointerDown={alBajar}
        onPointerUp={alSoltar}
        onPointerCancel={() => (toque.current = null)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_52%_at_50%_56%,var(--accent-soft),transparent_72%)]"
        />

        {/* pantalla apaisada: compu y laminas. Es tambien el elemento del FLIP */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={escenarioRef}
            className="relative aspect-[16/10] origin-top-left"
            style={{
              width: `min(calc(100cqw - 8px), calc((100cqh - ${BARRA + 8}px) * 1.6))`,
              marginTop: BARRA,
            }}
          >
            {/* marco del navegador: barra y borde, sin direccion (solo la marca) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[-1px] bottom-[-1px] border border-[color:var(--accent-line)] transition-opacity duration-300"
              style={{ top: -BARRA - 1, opacity: conBarra ? 1 : 0 }}
            >
              <div
                className="flex items-center gap-3 border-b border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-3"
                style={{ height: BARRA }}
              >
                <span className="flex gap-1.5">
                  <span className="h-[7px] w-[7px] bg-[color:var(--hairline-strong)]" />
                  <span className="h-[7px] w-[7px] bg-[color:var(--hairline-strong)]" />
                  <span className="h-[7px] w-[7px] bg-[color:var(--hairline-strong)]" />
                </span>
                <span className="mx-auto flex h-[18px] w-[min(46%,22rem)] items-center justify-center border border-[color:var(--hairline)] bg-[color:var(--bg-deep)] px-2">
                  <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    {trabajo.marca}
                  </span>
                </span>
                <span className="w-[33px]" />
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden bg-[color:var(--bg-deep)] transition-opacity duration-300" style={{ opacity: listo && !horizontal ? 0 : 1 }}>
              {/* la miniatura: la misma imagen que la tarjeta, para el relevo */}
              <div aria-hidden className="absolute inset-0 transition-opacity duration-500" style={{ opacity: listo ? 0 : 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- misma URL que la textura 3D, ya en cache: el relevo tiene que ser instantaneo */}
                <img src={trabajo.media.textura} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element -- la version nitida de la misma miniatura, encima */}
                <img src={trabajo.media.miniatura} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              {medios.map((m, k) => (m.ancho >= m.alto ? capa(m, k) : null))}
            </div>
          </div>
        </div>

        {/* columna vertical: el celular (o la lamina vertical, sin bisel) */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{
            opacity: listo && !horizontal ? 1 : 0,
            ["--alto-tel" as string]: `min(calc(100cqh - 8px), calc((100cqw - ${2 * BISEL.lado + 8}px) * 844 / 390 + ${BISEL.arriba + BISEL.abajo}px))`,
          }}
        >
          <div
            className={`flex flex-col items-center ${
              actual.marco === "celular"
                ? "border border-[color:var(--accent-line)] bg-[color:var(--surface)]"
                : ""
            }`}
            style={
              actual.marco === "celular"
                ? { padding: `0 ${BISEL.lado}px ${BISEL.abajo}px` }
                : { paddingTop: BISEL.arriba, paddingBottom: BISEL.abajo }
            }
          >
            {actual.marco === "celular" ? (
              <span aria-hidden className="flex items-center justify-center" style={{ height: BISEL.arriba }}>
                <span className="h-[3px] w-9 bg-[color:var(--hairline-strong)]" />
              </span>
            ) : null}
            <div
              className={`relative overflow-hidden bg-[color:var(--bg-deep)] ${
                actual.marco === "celular" ? "border border-[color:var(--hairline)]" : ""
              }`}
              style={{
                height: `calc(var(--alto-tel) - ${BISEL.arriba + BISEL.abajo}px)`,
                aspectRatio: "390 / 844",
              }}
            >
              {medios.map((m, k) => (m.ancho < m.alto ? capa(m, k) : null))}
            </div>
          </div>
        </div>
      </div>

      {/* controles: en su propia barra, nunca encima de la captura */}
      <div data-ficha-sec className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <p
          aria-live="polite"
          className="order-2 min-w-0 basis-full text-[14px] leading-snug text-[color:var(--text-dim)] sm:order-none sm:flex-1 sm:basis-0 md:text-[15px]"
        >
          {pedido.tipo === "video" ? (
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)]">
              {f.videoMiniatura}
            </span>
          ) : null}
          {pedido.alt}
        </p>
        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
          {pedido.tipo === "video" ? (
            <BotonMedio etiqueta={pausado ? f.reproducir : f.pausar} onClick={() => setPausado((p) => !p)}>
              {pausado ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
            </BotonMedio>
          ) : null}
          {total > 1 ? (
            <>
              <span className="mr-auto min-w-[4.25rem] text-center font-mono text-[11px] tracking-[0.14em] text-[color:var(--text-faint)] sm:mr-0">
                <span className="text-[color:var(--text)]">{pad(sel + 1)}</span> / {pad(total)}
              </span>
              <BotonMedio etiqueta={f.mediaAnterior} onClick={() => elegir(sel - 1)}>
                <ChevronLeft aria-hidden className="h-4 w-4" />
              </BotonMedio>
              <BotonMedio etiqueta={f.mediaSiguiente} onClick={() => elegir(sel + 1)}>
                <ChevronRight aria-hidden className="h-4 w-4" />
              </BotonMedio>
            </>
          ) : null}
        </div>
      </div>

      {total > 1 ? (
        <ul
          data-ficha-sec
          aria-label={f.galeria}
          className="-mx-1 mt-3 flex shrink-0 gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none]"
        >
          {medios.map((m, k) => (
            <li key={m.src} className="shrink-0">
              <button
                type="button"
                aria-label={`${f.verMedia}: ${m.alt}`}
                aria-current={k === sel ? "true" : undefined}
                onClick={() => elegir(k)}
                className={`relative block h-[4.25rem] cursor-pointer overflow-hidden border bg-[color:var(--bg-deep)] transition-[opacity,border-color] duration-300 md:h-[4.75rem] ${
                  m.ancho >= m.alto ? "w-[6.8rem] md:w-[7.6rem]" : "w-[3.4rem] md:w-[3.8rem]"
                } ${
                  k === sel
                    ? "border-[color:var(--accent)]"
                    : "border-[color:var(--hairline-strong)] opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={m.vista}
                  alt=""
                  fill
                  loading="eager"
                  sizes="128px"
                  className={m.marco === "lamina" ? "object-cover" : "object-cover object-top"}
                />
                {m.tipo === "video" ? (
                  <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center bg-[color:var(--bg-deep)] text-[color:var(--accent)]">
                    <Play aria-hidden className="h-3 w-3" />
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
      className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[color:var(--hairline-strong)] text-[color:var(--text)] transition-colors duration-300 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] active:translate-y-px"
    >
      {children}
    </button>
  );
}
