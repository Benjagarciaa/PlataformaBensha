# Sistema de diseño del portfolio · Inmersivo

> **Concepto:** del caos al sistema, de punta a punta. El hero 3D arma una notebook y un
> celular con el panel de un negocio; cada sección siguiente es una escena de scroll que
> cuenta una sola idea por pantalla: el desorden que se ordena, la tienda que se desarma en
> capas, las tarjetas que se dan vuelta, la línea que conecta los pasos.
> **Mensaje en 5 segundos:** "tu negocio, ordenado: una web que vende y un panel que manejás
> vos". El protagonista es el negocio del cliente; Benjamín aparece como respaldo.

Design Read: portfolio de un desarrollador que trabaja al nivel de un estudio (criterio de
producto, UX/UI y conversión, y sistemas a medida) para dueños de negocios que venden
online en Argentina. Lenguaje técnico y limpio, oscuro, con una sola luz celeste.
Dials: `DESIGN_VARIANCE: 8 / MOTION_INTENSITY: 8 / VISUAL_DENSITY: 3`.

Lo que cambió respecto del sistema "plano técnico" anterior: **sale la grilla de fondo** y
se reduce el ruido de plano (sin líneas de cota, marcas de esquina solo en el marco del
hero). Más aire, tipografía más grande y con más jerarquía, y profundidad real (CSS 3D y la
escena WebGL) en lugar de decoración.

---

## 1. Paleta (LOCK, un solo acento)

Todos los colores salen de las variables de `app/globals.css`. Ningún color escrito a mano
en componentes. Las dos excepciones documentadas: `themeColor` en `app/layout.tsx` y la
imagen OG (`app/opengraph-image.tsx`), que no pueden leer variables CSS y copian los valores.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#060d18` | Fondo global: azul noche casi negro. Nunca `#000` |
| `--bg-deep` | `#03080f` | Footer, profundidad de los bordes del fondo |
| `--surface` | `#0b1626` | Tarjetas, campos, paneles de las ilustraciones |
| `--surface-2` | `#0f1e33` | Segundo nivel (burbujas, celdas, carta destacada) |
| `--text` | `#eaf0f7` | Texto principal (16.9:1 sobre `--bg`) |
| `--text-soft` | `#c3cfde` | Bajadas y párrafos destacados (12.3:1) |
| `--text-dim` | `#9aabc2` | Párrafos de apoyo y etiquetas (8.3:1) |
| `--text-faint` | `#7084a0` | Solo detalles y ≥18px (5.1:1) |
| `--accent` | `#4fd4ff` | ÚNICO croma: el celeste del sistema (11.3:1) |
| `--accent-soft` | `rgba(79,212,255,.12)` | Fondos encendidos, halos |
| `--accent-line` | `rgba(79,212,255,.4)` | Bordes en acento suave |
| `--accent-glow` | `rgba(79,212,255,.075)` | La luz difusa del fondo |
| `--hairline` / `--hairline-strong` | `rgba(200,224,255,.09 / .17)` | Bordes de 1px |
| `--veil` | `rgba(6,13,24,.86)` | Velo de lectura del hero y nav sólida |

Prohibido: verde, ámbar, violeta, rosa o cualquier croma fuera del celeste; degradados
multicolor; `box-shadow`. El único degradado permitido es la luz radial celeste. El acento
se raciona: menos del 12% de la superficie visible.

## 2. Fondo

- `components/chrome/Fondo.tsx`: capa fija `z-0`. Degradados radiales quietos (el centro
  apenas más alto, los bordes caen a negro) y **una luz celeste difusa que acompaña el
  scroll**: arranca donde se arma el sistema del hero (derecha en desktop, abajo en mobile)
  y viaja de lado a lado sección por sección. Solo cambia su `transform` (compositor).
- `components/chrome/Grano.tsx`: grano SVG al 2.5%, fijo, `z-70`, sin eventos.
- Sin grilla, sin cuadrícula, sin cotas.

## 3. Tipografía

| Voz | Fuente | Variable | Uso |
|---|---|---|---|
| Display | Clash Display 500/600 (local) | `--font-clash` → `font-display` | Titulares |
| Prosa | Switzer 400/500 (local) | `--font-switzer` → `font-sans` (body) | Párrafos, UI, botones |
| Etiqueta | JetBrains Mono 400 (Google) | `--font-jetbrains` → `font-mono` | Eyebrows, etiquetas, datos. Nunca párrafos |

El mapeo vive en `@theme inline` de `globals.css` y apunta a las variables que define
`next/font` en `layout.tsx` (antes se referenciaban a sí mismas y el sitio caía a la fuente
del sistema). Solo se cargan los pesos que se usan.

Escala (siempre `clamp()`): titulares de sección `clamp(2.5rem, 6vw, 5.5rem)` peso 600,
interlineado .98, tracking `-0.015em` (Clash ya es apretada: más negativo empasta las
palabras). Frases grandes de escena `clamp(1.9rem, 4.4vw, 4.2rem)`. Bajadas
`clamp(1.15rem, 1.7vw, 1.5rem)` en `--text-soft`. Cuerpo 17-20px. Etiquetas mono 10-11px,
mayúsculas, tracking `.11-.15em`.

## 4. Forma, espacio y layout

- Radio 0 en todo (los únicos círculos son avatares y ruedas dentro de ilustraciones).
- Marcas de esquina: solo las cuatro del marco del hero. Nada de cotas.
- Bordes de 1px (`--hairline-strong`) en tarjetas; el estado encendido pasa a `--accent`.
- Secciones normales: `py-28 md:py-44`. Contenedor `max-w-[1400px]`, `px-6 md:px-12`, y en
  desktop `lg:pl-28 lg:pr-20` para dejar libre el carril del riel.
- Z-index: fondo 0, contenido 10, riel 30, nav 40, grano 70, cortina 100.

## 5. Motion (el sistema TRAZO, rediseñado)

**Un solo `requestAnimationFrame` global** (`lib/raf.ts`, manejado por `TrazoProvider` en
`lib/trazo.tsx`). Hoy solo lo usa el scroll suave de Lenis. **Nada escribe estilos ni
variables en `:root` por frame**: antes `--trazo` se escribía en `:root` en cada cuadro y
recalculaba el estilo de toda la página 60 veces por segundo (la causa principal del TBT).

- Solo se animan `transform` y `opacity`.
- Escenas de scroll: `useScroll` de motion sobre la pista de cada escena; transformaciones en
  forma de función (`lib/escena.ts`: `tramo`, `meseta`, `mapa`, `suave`). Sin listeners de
  scroll propios.
- Entradas: `Reveal` y `SectionTitle` con `useInView` (IntersectionObserver), una vez.
- Loops ambientales: animaciones CSS (`.a-*` en `globals.css`) con la clase `.loop`, que
  queda en pausa salvo dentro de una sección con `data-activa` (IntersectionObserver de
  `<Section>`). Con la pestaña oculta el navegador no pinta.
- Contadores en JS (pedidos que suben, carrito): `setInterval` lento solo con la escena en
  pantalla y la pestaña visible (`useActiva`).
- Easing: `--ease` `cubic-bezier(.16,1,.3,1)`; loops `--ease-io`.
- GSAP no se usa (alcanza con motion y CSS; menos JS).

**Encendido por sección.** `<Section>` pone `data-viva` (y el contexto `useSeccionViva`)
recién cuando la sección está a una pantalla y media. El variante de Tailwind `vivo:` aplica
solo adentro de `[data-viva]`: así cada escena tiene dos layouts, el estático (por defecto)
y el fijo con pista (`vivo:sticky`, `vivo:h-[...svh]`). Un salto por ancla (`irASeccion`)
enciende todas antes de medir.

**Hidratación diferida.** Todo lo que está debajo del hero va envuelto en `<Diferida>`: el
servidor manda el HTML completo, React no lo hidrata al cargar y lo monta recién cuando la
sección se acerca. La primera carga solo paga el JS del hero y del cromo.

**Visible por defecto, reduced-motion nítido.** Sin JS, con JS que no cargó o con
`prefers-reduced-motion`, cada escena muestra su versión estática (lista ordenada, pila 3D
quieta, tarjetas de frente). Los loops quedan en su reposo (`animation: none`). La red de
seguridad `html:not([data-escenas]) [data-anim]` fuerza opacidad 1 y sin transform.

## 6. Primitivas (`components/ui/`)

- `Section` + `Contenedor` + `useSeccionViva`: estructura, encendido por sección y pausa de loops.
- `Diferida`: hidratación diferida de secciones de abajo.
- `SectionTitle`: eyebrow mono celeste, titular que sube desde una máscara, bajada.
- `Reveal`: entrada única (sube y aparece).
- `Palabras`: revelado palabra por palabra atado a un progreso de scroll.
- `Button` (primario celeste, secundario con borde), `Field`, `TextArea`.

## 7. Cromo (`components/chrome/`)

- `Intro`: cortina con el nombre. Existe para darle tiempo a cargar a la escena 3D: el hero
  baja three y arma el canvas detrás (loop en pausa) y lo enciende al levantarse. Sin WebGL
  acelerado o con reduced-motion no aparece. Anima solo transform y opacity (WAAPI).
- `Nav`: nombre, cuatro secciones y "TOMANDO PROYECTOS". Se esconde al bajar.
- `Riel`: desktop, línea de avance (transform) y un punto por sección (IntersectionObserver).
  Mobile: barra de 2px.
- `Fondo`, `Grano`, `Blindaje`, `Analitica` (Clarity con la primera interacción o a los 7 s).

## 8. Copy

Todo el texto vive en `content/data.ts`. Voseo, frases cortas, desde el negocio del cliente.
Sin tecnicismos: si se nombra una tecnología, se dice qué cambia en su día. Sin relleno
("potenciar", "soluciones integrales"). **Prohibidos el guion largo y el medio en texto
visible.** Punto medio `·` máximo uno por línea. Números reales solamente (+200 páginas,
+130 marcas, 13 trabajos destacados: 9 tiendas y 4 sistemas). Testimonios: no se inventan.

## 9. Las secciones (una escena cada una)

| # | Sección | id | Archivo | Escena de scroll | Loop ambiental |
|---|---|---|---|---|---|
| 1 | Hero 3D | `inicio` | `Hero.tsx` + `hero3d/` | Del caos al sistema (ver sección 10). Al final la cámara entra en la pantalla de la notebook y funde con lo que sigue | Barras que se llenan, contadores que suben, notificación de pedido nuevo en el celular |
| 2 | Lo que te resuelvo | `resuelvo` | `Resuelvo.tsx` | Fija, un dolor por pantalla: la frase se revela por palabra, la ilustración pasa del caos al orden (chats → panel de pedidos; celdas de planilla → tu panel; tienda vacía → carrito que se llena; revisión que tilda y llena el medidor) y aparece cómo se resuelve | Chats que siguen llegando, contador de pedidos, "Guardado", productos que caen al carrito, escaneo |
| 3 | Proyectos | `proyectos` | `Proyectos.tsx` | Provisoria (se reemplaza por el carrusel 3D): entradas y mockups | Mockups que flotan |
| 4 | Qué miro en una tienda | `criterio` | `Criterio.tsx` | Fija, CSS 3D: la página de producto arranca de frente a pantalla completa, se aleja, gira y se desarma en 7 capas; se recorren de a una con su por qué | La pila se mece; barra de carga en la capa de velocidad. Medidor "camino a la compra" atado al scroll |
| 5 | Servicios | `servicios` | `Servicios.tsx` | Cada tarjeta entra dada vuelta y gira en 3D hasta quedar de frente | Carrito que se llena, filas que cargan, aguja que pasa a rápido, escudo que escanea |
| 6 | Cómo trabajamos | `proceso` | `Proceso.tsx` | Una línea se dibuja y conecta los pasos; cada nodo se enciende al alcanzarlo | Chat escribiendo, firma, bloques que se apilan, check |
| 7 | Sobre mí | `sobre-mi` | `SobreMi.tsx` | Frase por palabra; la formación llega como un mazo que se reparte | Números reales que cuentan una vez al entrar |
| 8 | Testimonios | `testimonios` | `Testimonios.tsx` | No se renderiza mientras esté vacío | |
| 9 | Contacto | `contacto` | `Contacto.tsx` | Cotizador con preselección desde Servicios | Pulso de "respondo en el día", confirmación con check al enviar |
| 10 | Footer | | `Footer.tsx` | | Punto que respira |

## 10. 3D (WebGL, solo el hero)

**Aislamiento.** three y React Three Fiber viven solo en `components/hero3d/`:
`Escena3D.tsx` (único archivo que importa R3F), `geometrias.ts` (geometrías, shaders y
estado). `plano.ts` (casilleros, tramos, contadores) e `iconos.ts` (íconos del panel) son
geometría pura que comparten la escena, el texto HTML y los SVG estáticos
(`IlustracionSistema.tsx`, `IlustracionCaos.tsx`).

**Carga.** El texto del hero es HTML del servidor y es el LCP. Durante la cortina, en un
momento ocioso, se chequea WebGL acelerado (`lib/webgl.ts`), se importa la escena y se arma
el canvas con `frameloop="never"`: compila los shaders y pinta un cuadro. Al levantarse la
cortina el loop arranca. Mientras tanto se ve el caos en SVG, que hace crossfade con el
canvas: el hero nunca queda vacío.

**Loop.** Corre solo con la cortina levantada, el hero en pantalla y la pestaña visible.
Todo el movimiento está en el vertex shader; por frame la CPU escribe un puñado de uniforms.

**Íconos del panel.** Relojes y carritos del caos se transforman al llegar en íconos
distintos de un panel real (inicio, productos, pedidos, clientes, estadísticas, WhatsApp,
ajustes; buscar y campana arriba; carrito en la tienda del celular). La geometría trae un
casillero de morfeo por ícono y cada instancia enciende solo el suyo. Las líneas de
contenido tienen largo propio por casillero, así filas y tarjetas no se ven calcadas.

**Panel vivo.** Ya armado: las barras del gráfico se llenan en ola, contadores de siete
segmentos suben solos (KPI y total) y en el celular baja una notificación de pedido nuevo.
Todo en el shader (`uLoop`, `uTime`).

**Legibilidad.** Velo del color de fondo detrás del texto (sin borde de caja), el caos
esquiva la zona del texto al repartirse y se atenúa detrás de ella en el shader. En mobile
el sistema queda abajo y más chico, sin pisar el texto.

**Zoom final.** En el último tramo la cámara se pone de frente a la pantalla de la notebook
y entra hasta llenarla; el texto, el velo y el halo se van y un fundido al color de fondo
conecta con la sección siguiente.

**Presupuesto.** Desktop 177 fragmentos, mobile 91; 19 draw calls; dpr máx 1.75/1.5;
sin postprocesado; máximo 11 atributos por vértice en el shader de fragmentos.

**Fallbacks.** Reduced-motion, ahorro de datos, sin WebGL acelerado o sin JS: sin canvas,
el sistema armado en SVG (con los mismos íconos) y el texto en su estado final
(`hero3d/estatico.ts`).

## 11. Performance (innegociable)

Objetivo PageSpeed mobile ≥ 90. LCP es el titular del hero (HTML). Medido contra
`next start` con Lighthouse mobile: ver el reporte de la entrega. Reglas que lo sostienen:
nada por frame en `:root`; un rAF; loops en CSS y pausados fuera de pantalla; secciones
encendidas por cercanía; hidratación diferida; three solo con GPU; Clarity diferido.
