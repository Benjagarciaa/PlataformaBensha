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
