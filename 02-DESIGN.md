# PLANO · Sistema de diseño del portfolio

> **Concepto:** el sitio no es un portfolio, es **el plano técnico de una página que vende**.
> Fondo azul de plano de obra, líneas de cota, marcas de esquina, anotaciones al margen.
> Cada bloque del sitio está acotado y anotado como lo estaría en un plano real: no solo se
> muestra qué hay, se anota **por qué está ahí y qué hace por la conversión**. El riel
> izquierdo no es decoración: es un medidor de profundidad de scroll, la misma métrica con
> la que se mide una landing de verdad.
> **Mensaje en 5 segundos:** "este tipo no diseña páginas lindas, diseña páginas que venden,
> y sabe explicar cada decisión."

Design Read: portfolio de desarrollador de ecommerce y especialista en conversión, para
conseguir clientes (marcas, dropshippers, agencias) en Argentina. Lenguaje técnico-editorial
premium. Español argentino, voseo profesional.
Dials: `DESIGN_VARIANCE: 8 / MOTION_INTENSITY: 6 / VISUAL_DENSITY: 4`.

---

## 1. Paleta (LOCK, un solo acento, tema único en TODA la página)

| Token CSS | Valor | Uso |
|---|---|---|
| `--bg` | `#0A1524` | Fondo global. Azul de plano, **no negro**. Nunca `#000`, nunca negro cálido. |
| `--bg-deep` | `#06101C` | Viñeta del hero, footer, fondo de la banda de herramientas |
| `--surface` | `#0F1E31` | Placas, filas expandidas, inputs |
| `--text` | `#E8EEF6` | Texto principal (blanco papel frío, nunca `#fff`) |
| `--text-dim` | `#94A7BF` | Párrafos de apoyo. Contraste 7.5:1 sobre `--bg`, pasa AAA |
| `--text-faint` | `#5A6E88` | SOLO texto ≥18px o decorativo. Contraste 3.6:1, no sirve para body |
| `--accent` | `#4FD4FF` | ÚNICO croma: celeste de plotter. Contraste 10.7:1 sobre `--bg` |
| `--accent-soft` | `rgba(79,212,255,0.12)` | Halos, fills de hover, anillos |
| `--grid` | `rgba(120,180,230,0.06)` | La grilla del plano (fondo global) |
| `--hairline` | `rgba(200,224,255,0.10)` | Bordes 1px |

**Prohibido:** ámbar, naranja, amarillo, violeta, verde terminal, rosa, gradientes multicolor.
El único degradado permitido es radial de luz celeste (glow). El acento se raciona: **menos del
12% de la superficie visible**. Sin `box-shadow` en ninguna caja: la elevación se comunica con
hairlines, con marcas de esquina y con luz.

**Regla del azul:** todos los azules del sitio comparten el mismo hue frío (205-210°). Si un
azul se ve morado o verdoso, está mal.

---

## 2. Tipografía (tres voces)

| Voz | Fuente | Variable CSS | Uso |
|---|---|---|---|
| **Monumento** | Clash Display 500/600/700 (local, Fontshare) | `--font-display` → clase `font-display` | Titulares. Tracking `-0.03em`. Uppercase solo en hero e índices |
| **Prosa** | Switzer 400/500/700 (local, Fontshare) | `--font-sans` (default en body) | Párrafos, UI, botones |
| **Anotación** | JetBrains Mono 400/500 (Google) | `--font-mono` → clase `font-mono` | SOLO cotas, medidas, timestamps, métricas, labels. 11-13px, uppercase, tracking `+0.16em`. **JAMÁS párrafos** |

Escala display, siempre con `clamp()`:
- Hero: `clamp(4rem, 10.5vw, 9rem)`
- Títulos de sección: `clamp(2.5rem, 5vw, 4.5rem)`, peso 600
- Body: 17-18px, `leading-relaxed`, `max-w-[65ch]`
- Anotación mono: 11-13px

La voz mono es la que carga el concepto. Es la letra de las anotaciones de un plano. Por eso se
usa mucho **como etiqueta** y nunca como texto corrido.

---

## 3. Forma y espacio (LOCK)

- **Radio de esquinas: 0 en todo.** Un plano no tiene esquinas redondeadas.
- **Marcas de esquina en vez de bordes completos:** las placas y cards no llevan un borde de
  4 lados. Llevan cuatro escuadras en L de 10px, 1px `--hairline`, en las esquinas.
  Es el detalle firma del sistema. Se implementa con `background-image` de gradientes lineales
  o con cuatro `<span>` absolutos. Al hover, las escuadras pasan a `--accent`.
- **Líneas de cota:** separador horizontal con dos ticks verticales en los extremos y una
  etiqueta mono centrada arriba de la línea. Máximo **3 en toda la página**, como transición
  entre bloques importantes. No decorar con esto.
- **Grilla del plano:** fondo global fijo, cuadrícula de 40px en `--grid`, más una cuadrícula
  mayor de 200px levemente más marcada. `fixed inset-0 pointer-events-none z-[5]`,
  con máscara radial para que se apague en los bordes.
- **Grano:** overlay SVG turbulence al 2.5%, `fixed inset-0 pointer-events-none z-[70]`.
  Va **encima** de la grilla, y es lo que evita el look de plantilla.
- Secciones: `py-28 md:py-40`. Contenedor `max-w-[1400px] mx-auto px-6 md:px-12 lg:pl-28 lg:pr-20`.
- En desktop (≥lg) el contenido deja un carril izquierdo de ~96px libre para el riel.
- Z-index (documentado, no inventar): grilla 5, contenido 10, riel 30, nav 40, popup de prueba
  social 45, cursor 50, preloader 60, grano 70.

---

## 4. El sistema TRAZO (el reloj global)

Un solo reloj para TODO el sitio. Nada se anima por su cuenta.

- `lib/trazo.tsx` exporta `TrazoProvider`, que corre **UN** `requestAnimationFrame` global y:
  - calcula el sobre del trazo `--trazo` (0→1, ataque 140ms, decaimiento suave hasta 900ms)
    y lo escribe en `:root` cada frame; también `--trazo-b`, la misma señal desfasada medio
    intervalo, para que no lata todo al unísono.
  - expone `useTrazo()` → `{ onFrame(cb), onPass(cb), setRate(mult) }` para los canvas.
  - intervalo base **5200ms**; `setRate` lo acelera (clímax del formulario de contacto: hasta 1400ms).
  - se pausa con `document.hidden`.
  - con `prefers-reduced-motion` **no hay loop**: `--trazo: 0.5` fijo y el sitio queda quieto,
    nítido y perfectamente legible.
- Cualquier elemento que "vive" usa CSS con la variable, nunca su propio timer:
  `opacity: calc(0.5 + 0.5 * var(--trazo))` o `transform: scaleY(calc(1 + 0.015 * var(--trazo-b)))`.

**Qué significa el trazo:** es la pasada del plotter. Cada 5.2s una luz recorre el riel de
arriba a abajo, como si el plano se estuviera redibujando. No es un latido. No pulsa hacia
afuera: **viaja hacia abajo**, en el mismo sentido en que se lee el sitio.

---

## 5. El riel de profundidad (`components/plano/RielScroll.tsx`)

Carril fijo izquierdo, desktop ≥lg. Es el elemento firma ambiental.

- Línea vertical de 1.5px en `x ≈ 48px`, color `--hairline`.
- Encima, una línea `--accent` que **crece con el scroll real** (`useScroll` de motion, `scaleY`
  con `transformOrigin: top`). No es decoración: es la profundidad de scroll medida.
- Cada 20% hay un **tick de cota** hacia la derecha (8px) con su porcentaje en mono a 10px.
- **Waypoints:** un nodo cuadrado de 6px por sección. El activo se enciende en `--accent` y
  crece a 9px. Al hover aparece el nombre de la sección en mono, alineado a la izquierda.
  Al click, scrollea. Es indicador y navegación a la vez.
- Arriba de todo del riel, en vertical (`writing-mode: vertical-rl`), la lectura en mono:
  `PROFUNDIDAD DE SCROLL · 47%`. Se actualiza real.
- El trazo del plotter recorre el riel con cada pasada: un gradiente de 120px de alto que baja.
- Aparece con un crossfade al salir del hero (scrollY 300→700), no está desde el frame 0.
- **Mobile:** no existe el riel. Degrada a una barra de 2px en el borde izquierdo que solo
  muestra el progreso, sin canvas, sin waypoints, sin trazo.

---

## 6. Primitivas compartidas (`components/ui/`) — USARLAS, no reinventar

- **`Section`** · `<Section id bleed? cota?>`: wrapper con el padding estándar y el carril
  izquierdo. Con `cota`, dibuja una línea de cota arriba de la sección con su etiqueta mono.
- **`SectionTitle`** · título display con reveal por máscara (`clip-path` rise desde abajo).
  Prop `eyebrow?` solo mono-label. **Máximo 4 eyebrows en todo el sitio**
  (presupuesto asignado: Anatomía, Proyectos, Resultados, Contacto). Las demás secciones van
  con el título pelado.
- **`Reveal`** · `whileInView` una sola vez: `y: 24→0`, `opacity: 0→1`, `blur: 8→0`,
  ease `[0.16, 1, 0.3, 1]`. Respeta reduced-motion. Prop `delay`.
- **`Placa`** · la card del sistema: fondo `--surface`, sin borde, con las cuatro escuadras
  en L. Al hover las escuadras se encienden en `--accent` y el contenido sube 3px.
- **`Cota`** · línea de cota horizontal con ticks y etiqueta mono. Máximo 3 por página.
- **`Button`** · rectangular, radio 0.
  Primario: fondo `--accent`, texto `--bg`, peso 500.
  Secundario: hairline + texto claro, hover con fill `--accent-soft`.
  `:active` baja 1px. Label de máximo 3 palabras, nunca wrappea.
- **`MonoLabel`** · etiqueta mono 11px uppercase tracking `0.16em`, color `--text-faint`.
- **`Field`, `SelectField`, `TextArea`** · inputs de radio 0 sobre `--surface`, **label arriba
  siempre visible** (nunca placeholder como label), focus ring celeste de 1px, error inline
  abajo en celeste a 13px.

---

## 7. El popup de prueba social (`components/chrome/AvisoPrueba.tsx`)

Guiño honesto al oficio, y el elemento que más rápido explica a qué se dedica.

- Aparece **una sola vez por sesión**, cuando el usuario pasa la sección Anatomía.
- Tarjeta chica abajo a la izquierda (abajo al centro en mobile), entra con
  `x: -20 → 0` + fade, 320ms, ease del sistema. Se va sola a los 6 segundos.
- Contenido: avatar circular, texto tipo "Sofía de Rosario compró hace 3 minutos",
  y **arriba, en mono a 10px: `COMPONENTE PROPIO · PRUEBA SOCIAL`**.
- Debajo, en `--text-faint` a 11px: "esto es un bloque que armo para mis clientes".
- Se puede cerrar con la X y con `Esc`. `aria-live="polite"`.

La gracia es que no finge ser real: se presenta como demo de su propio trabajo. Si se muestra
más de una vez, deja de ser ingenioso y pasa a ser molesto. **Una vez.**

---

## 8. Motion (motivado o no existe)

- Easing global: `[0.16, 1, 0.3, 1]`. Springs: `stiffness 100, damping 20`.
- Animar **solo** `transform` y `opacity`. Nunca `width`, `height`, `top` ni `left`.
- **Prohibido `window.addEventListener("scroll")`.** Se usa `useScroll` de motion,
  ScrollTrigger de GSAP, o IntersectionObserver.
- GSAP **solo** en dos lugares: el pin de Proyectos y el scrub de Anatomía. Todo lo demás con
  `motion/react`. Jamás GSAP y motion sobre el mismo nodo.
- Todo `useEffect` con animación limpia al desmontar (`ctx.revert()` en GSAP).
- `useReducedMotion()` en cada componente animado: degradar a estático nítido, nunca a "sin nada".
- Patrón de revelado: **visible por defecto, la animación es un agregado.** Nada arranca en
  `opacity: 0` sin un fallback: si el JS no carga, el sitio se lee igual.

---

## 9. Copy y contenido

- **TODO el texto vive en `content/data.ts`.** Los componentes no hardcodean copy jamás.
- Español argentino profesional: voseo natural ("armá", "pedime", "podés"), sin lunfardo.
- Sin palabras de relleno: nada de "revolucionar", "potenciar", "elevar", "soluciones
  integrales", "seamless", "sinergia".
- **Prohibido el guion largo (—) y el guion medio (–) en todo texto visible.** Se usa coma,
  punto o dos puntos. Rangos con guion común: 2024-2026.
- Punto medio `·` máximo 1 por línea, solo en tiras mono.
- **Números reales solamente.** Si no hay dato verificable, no se inventa: se omite o se dice
  con honestidad.
- Sin numeración decorativa de secciones. La única sección numerada es Proceso, porque ahí el
  orden **es** información.
- Testimonios: no se inventan. Si todavía no hay, va el tratamiento honesto (ver sección 11).

---

## 10. Las 13 secciones

Una familia de layout por sección, cero repetición.

| # | Sección | id | Archivo | Layout | Motion |
|---|---|---|---|---|---|
| 1 | Hero | `inicio` | `Hero.tsx` + `PlanoCanvas.tsx` | Editorial monumental asimétrico: nombre gigante abajo a la izquierda, wireframe de una landing dibujándose a la derecha (SVG/canvas), tira de anotación mono arriba a la derecha (hora de Córdoba, uptime de sesión, disponibilidad) | Boot: el wireframe se dibuja bloque por bloque con `stroke-dashoffset` (hero, precio, prueba social, FAQ, CTA), y cuando termina, el nombre entra letra por letra con rise + blur |
| 2 | Sobre mí | `sobre-mi` | `About.tsx` | Split asimétrico 7/5. Texto dominante a la izquierda; a la derecha tu foto en duotono celeste dentro de un marco con marcas de esquina y una cota que mide el marco, anclada al riel con un conector de 1px | Párrafos revelados línea por línea con máscara; una única pasada de escaneo celeste sobre la foto, una sola vez |
| 3 | **Anatomía de una landing** | `anatomia` | `Anatomia.tsx` | **La sección firma.** Wireframe grande de una landing (izquierda, sticky) con sus bloques apilados. A la derecha, las anotaciones: al llegar a cada bloque se enciende su cota y aparece la nota de conversión ("bloque 04 · prueba social · va acá porque la objeción de confianza aparece justo después del precio") | Scrub con GSAP ScrollTrigger: el bloque activo se ilumina en `--accent`, los demás bajan a 25%. La anotación entra con blur + 12px |
| 4 | Proyectos | `proyectos` | `Proyectos.tsx` | Paneles caso apilados con pin GSAP, uno por marca. Cada panel: mockup de celular con captura real de la landing a la izquierda, datos a la derecha, y un anillo de specs mono alrededor del mockup (BUNDLES · STICKY BAR · UGC · FAQ · CHECKOUT DIRECTO) | Pin + los callouts se encienden en secuencia según el progreso del scroll |
| 5 | Servicios | `servicios` | `Servicios.tsx` | Grid asimétrico 2×2 desigual, la celda de "Landing de producto" dominante (ocupa 2 columnas). Placas con marcas de esquina, sin sombras | Hover: el contenido sube 4px y aparece un tick mono de confirmación |
| 6 | Proceso | `proceso` | `Proceso.tsx` | Tira horizontal de pasos numerados con una línea de cota que los atraviesa. **Es la única sección numerada del sitio**, porque el orden es información real | La cota se dibuja de izquierda a derecha con el scroll; cada paso se enciende al ser alcanzado |
| 7 | Herramientas | `herramientas` | `Herramientas.tsx` | Banda horizontal full-bleed sobre `--bg-deep`: módulos rectangulares con el beneficio en criollo grande y el nombre de la herramienta chico en mono. Scroll-snap horizontal contenido en la franja | Al entrar, los módulos se encienden en secuencia; después respiran con `--trazo` en offsets distintos |
| 8 | Lo que domino | `oficio` | `Oficio.tsx` | Constelación SVG de nodos agrupados (Construcción / Conversión / Contenido / Tráfico), unidos con líneas de 1px. **El peso tipográfico del label indica el dominio real**, sin barras ni porcentajes inventados | Los nodos respiran con `--trazo` y `--trazo-b`; al hover se ilumina la cadena real de dependencias |
| 9 | Recorrido | `recorrido` | `Recorrido.tsx` | Tabla tipográfica editorial full-width, tipo legajo, en dos bloques (Formación y Trayectoria) separados por una línea de cota. Año en mono al margen izquierdo, título, institución. Acordeón que abre el detalle. **Sin cards.** La fila de la carrera Full Stack va destacada con las escuadras en `--accent` y un sello mono `TOP 10` al margen derecho | Al expandir, el riel emite un pulso lateral hacia la fila |
| 10 | Resultados | `resultados` | `Resultados.tsx` | Dossier documental: cabecera mono, 3 columnas de datos duros, y abajo una cita del flujo real de una venta | Los números cuentan desde 0 **una sola vez** al entrar, disparados por la pasada del trazo |
| 11 | Testimonios | `testimonios` | `Testimonios.tsx` | Cita monumental única centrada en Clash Display 500. Si todavía no hay testimonios: achurado diagonal sutil + texto honesto | Transición por blur + 12px de desplazamiento |
| 12 | Contacto | `contacto` | `Contacto.tsx` | El cotizador: título grande + formulario en 2 columnas (campos a la izquierda, contexto y contacto directo a la derecha). El riel se aplana detrás | El trazo se acelera con cada campo completado (`setRate`); al enviar, golpe de matriz y se abre wa.me |
| 13 | Footer | (sin id) | `Footer.tsx` | Barra de estado full-width en mono: © 2026, Córdoba AR, uptime de sesión, hora local, colofón de imprenta, link "volver arriba". El riel termina en un punto que sigue trazando | El punto final vive con el reloj global |

Familias usadas: editorial-monumental, split-asimétrico, plano-anotado-sticky, paneles-pin,
grid-asimétrico, tira-de-cota, banda-racks, constelación-SVG, tabla-legajo, dossier,
cita-monumental, form-2col, barra-de-estado. **13 layouts, cero repetición.**

---

## 11. Zonas sin dato (regla de honestidad)

Si falta contenido real (testimonios, métricas, capturas), **no se inventa y no se deja vacío**.
Va el tratamiento "ZONA SIN RELEVAR": achurado diagonal de 45° a `rgba(200,224,255,0.045)`,
etiqueta mono, y una línea honesta en `--text-dim`. Ejemplo: "Las primeras marcas están
vendiendo. Sus palabras van a aparecer acá."

Un placeholder honesto genera más confianza que un testimonio falso, y no expone a nadie.

---

## 12. Contacto: el cotizador

Campos:
1. Nombre *
2. Email *
3. Qué necesitás * (select: Landing de producto / Tienda Shopify completa / Rediseño y optimización de una página que ya tengo / Copy y creativos / Otro)
4. Contame de tu producto o marca * (textarea)
5. Link de tu tienda o producto (opcional)

Validación inline en español, en el submit y en el blur (no mientras escribe). Al enviar:

```
https://wa.me/[[NUMERO]]?text=<encodeURIComponent(mensaje estructurado)>
```

El mensaje se arma en `lib/wa.ts`: saludo, nombre, email, tipo, descripción, link, cierre.
Se abre con `window.open(url, "_blank", "noopener")`. **Sin backend.** Además del formulario,
se muestran el mail y el WhatsApp directos, por si prefieren escribir sin llenar nada.

---

## 13. Performance y accesibilidad (innegociable)

- Un solo `requestAnimationFrame` global (el de `TrazoProvider`). Canvas acotados.
- `next/font/local` para Clash y Switzer, `next/font/google` para JetBrains Mono.
- Las capturas de las landings van optimizadas con `next/image`, con `sizes` correcto.
  Ninguna imagen de más de 400kb.
- GSAP se importa solo dentro de los componentes que lo usan.
- Lenis en un provider client, desactivado con reduced-motion.
- Focus visible siempre (ring celeste). Navegación completa por teclado. `aria-label` en
  waypoints e íconos. Contraste AA mínimo en todo texto, AAA en body.
- El cursor custom se desactiva en `pointer: coarse` y con reduced-motion.
- **Mobile:** riel → barra de 2px; anatomía → los bloques se apilan sin sticky, con la
  anotación debajo de cada uno; paneles pin → apilados normales; constelación → lista
  agrupada; wireframe del hero → versión simplificada, sin seguimiento del cursor.
- Objetivo: LCP menor a 2s en 4G, sin layout shift.
