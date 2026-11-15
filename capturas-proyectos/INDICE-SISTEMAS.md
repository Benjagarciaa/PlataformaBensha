# Capturas de sistemas para el portfolio

Material para el carrusel 3D del portfolio de Benjamín García. Nada de esto se
publica desde acá: es material de trabajo.

Formatos: capturas en webp calidad 82; videos mp4 H.264 sin audio, 30 fps,
ancho máximo 1280 (desktop) o 720 (mobile), crf 28, preset slow, faststart.
Desktop a 1440x900 (dsf 1). Mobile a 390x844 con dsf 2 (los webp quedan a 780
px de ancho). Las capturas "completa" son la página entera.

Proyectos:

1. `salguero-admin/`: panel interno de gestión de Salguero Gourmet (datos de DEMO).
2. `salguero-landing/`: landing pública de Salguero Gourmet (pendiente en este índice hasta que se capture).
3. `descartables-panel/`: panel de carga del catálogo de Descartables Multipacking (local, rama `panel-v2`).
4. `descartables-catalogo/`: catálogo público de Descartables Multipacking en producción.

---

## 1. Salguero Admin (`salguero-admin/`)

### Ficha (para el texto del portfolio)

Panel de gestión interno de Salguero Gourmet, un catering de Córdoba. Lo usa
la dueña, que no es técnica, desde la compu y el celular: cada carga lleva
segundos y los números se calculan solos.

- **Clientes y eventos con cobros:** cada evento pasa de cotizado a contratado
  a realizado; se cobra en dos partes (seña 50% y saldo al terminar), en
  efectivo, transferencia o depósito, y cada cobro guarda el dólar blue del día
  para comparar en USD.
- **Finanzas:** "limpio del mes" (la ganancia real de lo cobrado en el mes,
  con el margen de cada evento), acumulado móvil de 12 meses, promedio por
  evento, comparativa interanual y avisos de lo que hay que hacer hoy
  (eventos próximos, saldos pendientes).
- **Medidor de monotributo:** porcentaje del tope anual de la categoría,
  sumando la última lectura de ARCA más lo cobrado después (separa facturado y
  en negro).
- **Precios con regla de margen:** catálogo de servicios editable (por persona
  o precio total), historial de precios con vigencia, costo total con los
  fijos prorrateados y aviso de qué servicios quedan debajo del margen mínimo
  del 50%. Sugiere cuánto actualizar por inflación.
- **Gastos** mensuales por categoría con promedio de los meses previos.
- **Buscador** global y **modo privacidad**: un ojo en la barra oculta todos los
  montos para mostrar la pantalla sin exponer la plata.
- Stack: Next.js 16 (app router), TypeScript, Tailwind v4, Drizzle sobre
  Postgres (PGlite en local, Neon en producción), auth propia con JWT y
  sesión deslizante, gráficos con Recharts.

**Datos:** todo lo que se ve es de DEMO, cargado con un script propio sobre una
base local: 18 clientes inventados (CUIT con formato válido pero ficticios,
mails con dominio `-demo`), 58 eventos (unos 38 en los últimos 12 meses y los
próximos 2), 95 cobros, gastos mensuales desde enero 2025, precios y
parámetros inventados. Ningún dato real de clientes. La base local se borró
al terminar.

### Mejores para el carrusel

- **Miniatura:** `salguero-admin/desktop/01-finanzas-fold.webp` (Finanzas: avisos, limpio del mes, monotributo, próximos eventos).
- **Video estrella:** `salguero-admin/videos/privacidad-ojo-desktop.mp4` (8 s: el cursor toca el ojo y todos los montos pasan a puntos, y vuelven). Alternativa mobile: `salguero-admin/videos/navegacion-mobile.mp4`.
- **Tercera:** `salguero-admin/desktop/13-evento-detalle-completa.webp` (evento abierto con tres cobros, margen y cotización) o `salguero-admin/mobile/03-finanzas-grafico.webp` (gráfico de facturación + interanual en el celular).

### Archivos

Desktop (`desktop/`, 1440x900):

| Archivo | Qué muestra |
| --- | --- |
| `00-bienvenida.webp` | Pantalla de bienvenida post login ("Buenas noches, Flor", frase del día y "faltan 5 días para el evento de..."). |
| `01-finanzas-fold.webp` | Finanzas, primer pantallazo: avisos "Para hoy", 5 indicadores, cubrir gastos fijos, inflación, medidor de monotributo y próximos eventos. |
| `02-finanzas-completa.webp` | Finanzas entera: además pendiente de cobro, gráfico de 12 meses, año contra año (+53%) y últimos cobros con USD. |
| `03-finanzas-grafico.webp` | Bloque: gráfico de facturación por mes + comparativa interanual. |
| `04-finanzas-monotributo.webp` | Bloque: medidor de monotributo (76%, lectura de ARCA + cobrado después). |
| `06-clientes.webp` / `07-clientes-completa.webp` | Lista de clientes (particulares y empresas, CUIT, eventos, total cobrado, último estado). |
| `08-cliente-ficha.webp` / `09-cliente-ficha-completa.webp` | Ficha de Clínica Santa Brígida: datos para facturar con "Copiar", historial de 5 eventos. |
| `10-eventos.webp` | Eventos con filtros por estado y columnas de precio por persona, cobrado y estado. |
| `11-eventos-calendario.webp` | Calendario de noviembre 2026 con los eventos del mes. |
| `12-evento-detalle.webp` / `13-evento-detalle-completa.webp` | Evento "Cena aniversario 25 años": datos, cobros (seña en dos partes + saldo), margen 60,6% y cotización vs inflación. |
| `14-evento-cobros.webp` | Mismo evento centrado en la card de cobros. |
| `15-gastos.webp` / `16-gastos-completa.webp` | Gastos de octubre 2026: carga rápida, total del mes vs promedio, agrupado por categoría. |
| `17-precios.webp` / `18-precios-completa.webp` | Precios vigentes con costo total y margen ("Cumple 50%" / "Debajo de 50%"), actualización por inflación, proyección, nuevo servicio y parámetros. |
| `19-buscador.webp` | Buscador global con "santa": cliente y sus eventos. |
| `20-buscador-coffee.webp` | Buscador con "coffee": servicio y eventos. |
| `21-privacidad-oculto.webp` | Finanzas con el modo privacidad activo (montos como puntos, porcentajes visibles). |

Mobile (`mobile/`, 390x844 @2x): los mismos nombres que desktop, más
`05-finanzas-limpio-y-monotributo.webp` (indicadores y medidor en el celular)
y `15b-gastos-mes.webp` (total del mes, promedio y categorías). En mobile la
tabla de cobros del evento (`14-evento-cobros.webp`) se corta a la derecha
porque así es la pantalla real (scroll horizontal).

Videos (`videos/`):

| Archivo | Duración | Qué muestra |
| --- | --- | --- |
| `privacidad-ojo-desktop.mp4` | 8 s | Finanzas en desktop, el cursor toca el ojo: los montos se ocultan y vuelven. |
| `privacidad-ojo-mobile.mp4` | 8 s | Lo mismo en el celular, con indicador de toque y scroll por las cards ocultas. |
| `navegacion-mobile.mp4` | 11 s | Recorrido mobile: Finanzas hasta el gráfico, Eventos, abrir un evento y bajar a sus cobros. |

---

## 3. Descartables Multipacking, panel de carga (`descartables-panel/`)

### Ficha (para el texto del portfolio)

Catálogo de consulta con panel de carga para Descartables Multipacking
(descartables, bolsas, bandejas, vasos y más; Córdoba). Reemplazó la tienda de
Tienda Nube: sin carrito, sin stock y sin precios públicos; las consultas van
a WhatsApp con el producto ya escrito. La dueña no es técnica y carga desde el
celular, así que cargar un producto con sus fotos lleva un minuto.

- **Inicio:** conteos (productos, categorías, fotos), sugerencias armadas con
  datos reales, "Para revisar" como avance (sin foto, sin categoría, sin
  ficha, ocultos) y los últimos editados.
- **Productos:** búsqueda sin tildes y con singular, filtro por categoría y
  chips (sin foto, sin categoría, sin ficha, ocultos, destacados), tarjetas en
  el celular y tabla en pantalla grande, con miniaturas.
- **Ficha de producto:** fotos desde la galería o la cámara, que se achican en
  el navegador antes de subir, se guardan al toque y se ordenan con flechas;
  nombre, visible y destacado, categorías múltiples y ficha técnica libre
  (etiqueta y valor). Borrado en dos pasos.
- **Categorías:** árbol de hasta 3 niveles; cada fila abre sus acciones
  (renombrar, subcategoría nueva, mover, subir o bajar, borrar).
- **Mi tienda:** datos del negocio, aviso de portada, plantilla del mensaje de
  WhatsApp con vista previa y descripción para buscadores.
- Dos hosts en un solo proyecto (catálogo público y `admin.` para el panel),
  importación inicial de 473 productos y 900 fotos desde Tienda Nube,
  respaldo semanal automático de la base.
- Stack: Next.js 16, TypeScript, Tailwind v4, Drizzle sobre Postgres (PGlite
  local, Neon en producción), Vercel Blob para fotos, auth propia con JWT.

**Datos y entorno:** panel corriendo en local (rama `panel-v2`) sobre una base
PGlite con la importación real del catálogo (474 productos, 76 categorías, 901
fotos: es el catálogo público, no hay datos personales). Usuarios de prueba.
El producto de demo del video ("MOLDE BUDIN ALUMINIO 750 GR", con 2 JPEG
generados con ffmpeg a partir de fotos del repo) se creó y se borró; después
`npm run db:verificar` dio "Todo coincide".

**Panel en producción vs `panel-v2`:** no se entró al panel de producción (tiene
datos reales). Por el código, `main` ya tiene el mismo sistema visual v2
(lateral oscuro, barra inferior de 5 pestañas en el celular, mismos tokens),
pero hay diferencias de detalle en 26 archivos del panel entre `panel-v2` y
`main` (inicio, ficha de producto, fotos, Mi tienda, categorías, componentes de
UI). Las capturas muestran la rama `panel-v2`; puede no ser idéntico a lo que
está publicado.

### Mejores para el carrusel

- **Miniatura:** `descartables-panel/mobile/02-inicio.webp` (inicio en el celular con conteos, accesos y barra de pestañas) o, en desktop, `descartables-panel/desktop/08-producto-ficha.webp` (ficha con 6 fotos).
- **Video estrella:** `descartables-panel/videos/carga-producto-mobile.mp4` (22 s: crear un producto, elegir categoría, cargar la ficha, subir 2 fotos y verlo primero en "Últimos editados").
- **Tercera:** `descartables-panel/mobile/14-mi-tienda-whatsapp.webp` (vista previa del mensaje de WhatsApp) o `descartables-panel/desktop/12-categorias-nodo-abierto.webp`.

### Archivos

Desktop (`desktop/`, 1440x900) y mobile (`mobile/`, 390x844 @2x), mismos nombres:

| Archivo | Qué muestra |
| --- | --- |
| `01-login.webp` | Login del panel ("Entrá al panel"). |
| `02-inicio.webp` / `03-inicio-completa.webp` | Inicio: "Hola, Luciana", conteos (474 productos, 76 categorías, 901 fotos), Nuevo producto, Sugerencias, Para revisar (467 de 474 completos) y Últimos editados con miniaturas. |
| `03b-inicio-para-revisar.webp` | Solo mobile: el bloque "Para revisar" con la barra de avance. |
| `04-productos.webp` / `05-productos-completa.webp` | Listado con buscador, filtro de categoría, chips y miniaturas (página 1 de 12). |
| `06-productos-busqueda-bandeja.webp` | Búsqueda "bandeja". |
| `07-productos-filtro-sin-ficha.webp` | Chip "Sin ficha" activo (4 productos). |
| `08-producto-ficha.webp` / `09-producto-ficha-completa.webp` | Ficha de BANDEJA F200 con 6 fotos (principal marcada, flechas para ordenar), datos, categorías y ficha técnica. |
| `09b-producto-ficha-tecnica.webp` | Solo mobile: la ficha técnica del producto. |
| `10-categorias.webp` / `11-categorias-completa.webp` | Árbol de categorías completo con el conteo de productos. |
| `12-categorias-nodo-abierto.webp` | BANDEJAS abierta con sus acciones (nombre, subcategoría nueva, mover, orden, borrar). |
| `13-mi-tienda.webp` / `15-mi-tienda-completa.webp` | Mi tienda: datos del negocio, aviso, mensaje de WhatsApp y presentación. |
| `14-mi-tienda-whatsapp.webp` | La card "Mensaje de WhatsApp" con la vista previa en burbuja. |
| `16-nuevo-producto.webp` | Alta de producto vacía. |

Videos (`videos/`):

| Archivo | Duración | Qué muestra |
| --- | --- | --- |
| `carga-producto-mobile.mp4` | 22 s | Flujo de carga en el celular: Nuevo producto, nombre, categoría MOLDES > BUDIN, ficha MATERIAL: ALUMINIO, Crear, Agregar fotos (2 a la vez, "¡Listo! 2 fotos guardadas") y el producto primero en el inicio. |
| `borrar-producto-mobile.mp4` | 7 s | El mismo producto se borra en dos pasos ("¿Seguro? Sí, borrar") y vuelve al listado con "Producto borrado." |

---

## 2. Salguero Gourmet, landing pública (`salguero-landing/`)

Capturado del sitio publicado, https://salguerogourmet.com (con la analítica
de terceros bloqueada durante la captura).

### Ficha (para el texto del portfolio)

Landing de una sola página para Salguero Gourmet, catering y pastelería de
Córdoba con más de 15 años. Un único objetivo de conversión: pedir
presupuesto por WhatsApp.

- **Hero "escenario" estilo Apple:** la caja del catering queda fija mientras
  se scrollea; la tapa se levanta hacia la cámara y los productos salen de la
  caja y quedan flotando, se rotulan uno por uno y cierra con "Tu pedido puede
  lucir así". Dos canvas dibujados en el mismo tick que el timeline (GSAP
  ScrollTrigger con pin y scrub, Lenis para el smooth scroll), cuadros
  decodificados solo alrededor del actual, y versión quieta para reducir
  movimiento, pantallas bajas o ahorro de datos.
- Servicios en cards, banda de Empresas con palabras gigantes en movimiento,
  galería "Las mesas hablan solas", la historia de Flor, reseñas de Google con
  contador, proceso en cuatro pasos, preguntas frecuentes y cotizador que arma
  el mensaje de WhatsApp.
- Stack: Next.js 16, TypeScript, Tailwind v4, GSAP + ScrollTrigger, Framer
  Motion y Lenis.

**Datos:** es el sitio público tal cual está publicado. La sección de reseñas
muestra reseñas públicas de Google con el nombre de quien las escribió (así
están en el sitio); por eso no se eligió como miniatura.

### Mejores para el carrusel

- **Miniatura:** `salguero-landing/desktop/04-hero-pedido-armado.webp` (los productos rotulados alrededor de la caja: "Tu pedido puede lucir así") o `salguero-landing/desktop/01-fold.webp` (la caja cerrada con el titular).
- **Video estrella:** `salguero-landing/videos/hero-caja-que-se-abre-desktop.mp4` (18 s, ida y vuelta: la tapa se levanta, los productos salen de la caja, se rotulan y la secuencia vuelve hasta la caja cerrada).
- **Tercera:** `salguero-landing/mobile/04-hero-pedido-armado.webp` o `salguero-landing/desktop/07-empresas.webp` (banda de Empresas).

### Archivos

Desktop (`desktop/`, 1440x900) y mobile (`mobile/`, 390x844 @2x), mismos nombres:

| Archivo | Qué muestra |
| --- | --- |
| `00-pagina-completa.webp` | Página entera en su versión quieta (reducir movimiento: el hero sin pin, todo visible). En mobile, partida en `-parte1` y `-parte2` (el webp no admite más de 16383 px de alto). |
| `01-fold.webp` | Primer pantallazo: "Cada encuentro, algo especial", la caja cerrada y las cifras. |
| `02-hero-caja-abriendose.webp` | La tapa levantándose (desenfocada hacia la cámara) y "Horneado el mismo día". |
| `03-hero-productos-flotando.webp` | Los productos fuera de la caja con 5.0 / +15 / +200. |
| `04-hero-pedido-armado.webp` | Productos rotulados y "Tu pedido puede lucir así" con el botón. |
| `05-servicios.webp` / `06-servicios-*.webp` | "Nuestras formas de servirte": catering, pastelería, boxes. |
| `07-empresas.webp` | Banda gigante "COFFEE BREAKS · AGASAJOS" y "Tu equipo también come bien". |
| `08-galeria-mesas.webp` / `09-galeria-grilla.webp` | "Las mesas hablan solas" y la grilla de fotos. |
| `10-flor.webp` | "La cocina y Flor". |
| `11-resenas.webp` | 5.0 en Google y reseñas (nombres públicos de Google). |
| `12-proceso.webp` | "Del mensaje a la mesa, en cuatro pasos" con el recorrido dibujado. |
| `13-faq.webp` | Preguntas frecuentes. |
| `14-cotizador.webp` | Cotizador que arma el pedido para WhatsApp. |
| `15-pie.webp` | Pie con contacto y wordmark. |

Videos (`videos/`):

| Archivo | Duración | Qué muestra |
| --- | --- | --- |
| `hero-caja-que-se-abre-desktop.mp4` | 18 s | La caja que se abre (scrub de ida y vuelta) en desktop. |
| `hero-caja-que-se-abre-mobile.mp4` | 16,5 s | Lo mismo en el celular. |
