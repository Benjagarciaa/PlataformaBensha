# CONTENIDO · Todo el texto del sitio

Este archivo es la fuente de verdad del copy. Se traduce 1 a 1 a `content/data.ts`.
Ningún componente escribe texto adentro.

Datos personales y formación: **verificados contra CV y certificados**.
Lo que sigue entre `[[ ]]` es lo único que falta.

---

## ⚠️ PENDIENTE

- [ ] Dominio (sugerencias: `benjamingarcia.dev`, `bengarcia.com.ar`, `benjamurgarcia.com`)
- [ ] GitHub e Instagram, si querés mostrarlos
- [ ] Permiso de las marcas para nombrarlas. Sin permiso, se anonimizan
- [ ] Capturas mobile de las landings en `.webp` para `public/proyectos/`
- [ ] Foto tuya para Sobre mí
- [ ] Métricas reales, solo si son verificables
- [ ] **Decisión sobre los certificados:** llevan tu DNI impreso. O no se linkean
      (recomendado), o subís versiones con el número tapado

---

## IDENTITY

```ts
name: "Benjamin Garcia"          // legal completo: Benjamin Mur Garcia
firstName: "BENJAMIN"            // va gigante en el hero
lastName: "GARCIA"
role: "Desarrollador de ecommerce y especialista en conversión"
location: "Córdoba, Argentina"
locationShort: "CBA · AR"
email: "bmurgarcia@gmail.com"
phoneDisplay: "+54 9 351 512 2108"
whatsappNumber: "5493515122108"
github: "[[URL o null]]"
instagram: "[[URL o null]]"
```

**El DNI no va al sitio.** No aporta nada y expone un dato sensible.

**Tesis del hero** (se resalta "que venden" en peso 700):

> Diseño y programo páginas de producto que venden.

**Bajada:**

> Cada bloque de la página está pensado para responder una objeción y empujar al checkout.
> Copy, imágenes, código y medición: lo hago todo yo, y lo dejo funcionando en tu Shopify.

CTA primario: `Pedí tu presupuesto` · CTA secundario: `Ver proyectos`

**Tira de anotación mono del hero:**

```
BENJAMIN GARCIA · CBA AR
CÓRDOBA [hora local, se calcula sola]
SESIÓN [uptime, se calcula solo]
ESTADO · TOMANDO PROYECTOS
```

---

## NAV

Links: `Proyectos` → `#proyectos` · `Servicios` → `#servicios` · `Presupuesto` → `#contacto`
Etiqueta de estado: `DISPONIBLE`

---

## WAYPOINTS (riel izquierdo)

```
inicio        INICIO
sobre-mi      SOBRE MÍ
anatomia      ANATOMÍA
proyectos     PROYECTOS
servicios     SERVICIOS
proceso       PROCESO
herramientas  HERRAMIENTAS
oficio        LO QUE DOMINO
recorrido     RECORRIDO
resultados    RESULTADOS
testimonios   TESTIMONIOS
contacto      CONTACTO
```

---

## SOBRE MÍ

**Título:** Una página, una persona.

**Párrafos:**

> Soy Benjamin, desarrollador de ecommerce en Córdoba. Armo páginas de producto para marcas
> que venden online en Argentina: la escribo, la diseño, la programo y la dejo andando en
> tu tienda.

> Me formé como desarrollador full stack y terminé la carrera entre los diez mejores de mi
> camada. Esa base es la que me deja meterme en el código de tu tienda en vez de depender de
> apps y plantillas: si algo tiene que funcionar de una manera puntual, se programa y listo.

> No uso plantillas. Cada página se construye bloque por bloque, adentro de tu Shopify. Eso
> me deja controlar cada detalle: cómo entra cada sección, dónde aparece el precio, cuándo se
> muestra la garantía, qué pasa cuando alguien toca comprar.

> Trabajo para el mercado argentino y eso cambia todo: el precio en pesos, las cuotas, Mercado
> Pago, la forma de hablar. Una página traducida del inglés se nota, y se nota en la conversión.

**Ficha** (mono, al costado de la foto):

```
BASE          Córdoba, AR
FORMACIÓN     Full Stack, top 10 de camada
TRABAJO       Todo a medida, en código
PLATAFORMA    Shopify
IDIOMAS       Español, inglés, portugués
DISPONIBLE    Nuevos proyectos
```

---

## ANATOMÍA DE UNA LANDING (la sección firma)

**Eyebrow:** `POR QUÉ ESTÁ CADA COSA DONDE ESTÁ`
**Título:** Anatomía de una página que vende.
**Bajada:** Una landing no es una página larga con fotos lindas. Es una secuencia. Cada bloque
está donde está porque responde la objeción que aparece justo antes.

| # | Bloque | Anotación de conversión |
|---|---|---|
| 01 | Hero y promesa | Tenés menos de 3 segundos. Acá va el problema en las palabras del cliente, no el nombre del producto. |
| 02 | El problema | Antes de vender, hay que nombrar lo que le pasa. Si se siente identificado, sigue bajando. |
| 03 | Cómo funciona | El mecanismo, explicado simple. Sin esto, el producto es una promesa sin respaldo. |
| 04 | Prueba social | Va justo acá porque la desconfianza aparece cuando la promesa suena demasiado buena. |
| 05 | Antes y después | Lo visual convence donde el texto ya no alcanza. |
| 06 | Bundles y precio | Se muestra el precio recién cuando el valor ya está construido. Tres opciones, la del medio destacada. |
| 07 | Garantía | Saca el riesgo de encima justo cuando está por decidir. |
| 08 | Preguntas frecuentes | Las objeciones que quedaron. Cada pregunta es una venta que se estaba por perder. |
| 09 | Cierre y CTA fijo | La barra que sigue al scroll. El botón no se puede perder nunca de vista. |

---

## PROYECTOS

**Eyebrow:** `PÁGINAS EN PRODUCCIÓN`
**Título:** Proyectos

Estructura por proyecto:

```ts
{
  id: "...",
  marca: "[[nombre o versión anónima]]",
  producto: "[[qué es]]",
  rubro: "[[categoría]]",
  descripcion: "[[2 o 3 líneas: qué se armó y qué resolvía]]",
  bloques: ["Advertorial", "Bundles", "Prueba social", "FAQ", "Checkout directo"],
  captura: "/proyectos/xxx.webp",
  url: "[[link o null]]",
  callouts: [{ t: "...", d: "..." }],
}
```

Borrador (confirmá nombres y permisos):

1. **Suplemento probiótico femenino** · página editorial completa con ángulo de advertorial:
   hook, historia del problema, mecanismo, testimonios, comparativa de precio, bundles, FAQ y
   barra fija. Identidad tipográfica y paleta propias.
2. **Suplemento con capsaicina** · página de producto con identidad visual propia, bundles y
   checkout directo.
3. **Sérum ayurvédico para cuero cabelludo** · página completa con set de bloques propio e
   imágenes generadas con IA.
4. **Sérum antiedad con péptidos de cobre** · página completa, identidad visual distinta, set
   de bloques completo.

---

## SERVICIOS

**Título:** Qué hago

1. **Página de producto que vende** (celda dominante)
   La página completa: copy, diseño, imágenes, código y medición. Bloque por bloque adentro de
   tu Shopify, sin apps que la vuelvan lenta.
2. **Tienda Shopify completa**
   Desde cero: estructura, catálogo, checkout, medios de pago y envíos, lista para vender.
3. **Optimización de lo que ya tenés**
   Reviso tu página actual, marco dónde se pierde la venta y lo arreglo bloque por bloque.
4. **Copy y creativos**
   Los textos que venden y las imágenes que los acompañan, generadas y editadas por mí.

---

## PROCESO (única sección numerada)

1. **Charla** · Me contás el producto, a quién le vendés y qué te está pasando hoy.
2. **Investigación** · Miro tu competencia, tus reseñas y lo que dicen tus clientes. De ahí sale el ángulo.
3. **Copy** · Escribo la página entera antes de diseñar nada. Si el texto no vende, el diseño no lo salva.
4. **Diseño e imágenes** · Identidad visual del producto y las imágenes que hacen falta.
5. **Programación** · Bloque por bloque, en tu tienda. Vos vas viendo cada uno.
6. **Publicación y medición** · Sale al aire y miramos qué pasa. Lo que no funciona, se cambia.

---

## HERRAMIENTAS

**Título:** Con qué está hecho

| Beneficio | Herramienta |
|---|---|
| Tu tienda, tu control | Shopify |
| Bloques a medida | Liquid |
| Sin apps que la frenen | HTML y CSS |
| Interacciones propias | JavaScript |
| Imágenes que no existían | IA generativa |
| Cobros al toque | Mercado Pago |
| Todo medido | Analytics |
| Tráfico que compra | Meta Ads |

---

## LO QUE DOMINO (constelación)

- **Construcción:** Shopify (700), Liquid (700), HTML y CSS (700), JavaScript (700), Dawn (600), Responsive (700)
- **Conversión:** Estructura de landing (700), Bundles y precios (700), Prueba social (600), Barra fija y popups (600), Tests (500)
- **Contenido:** Copy en español argentino (700), Advertorials (700), Imágenes con IA (600), Edición de video (600)
- **Tráfico:** Meta Ads (500), Analytics (500), Píxeles y eventos (500)

JavaScript va en 700: tenés 40.5 horas certificadas más la carrera full stack, y es lo que
usás todos los días. `[[Ajustá el resto con honestidad]]`

---

## RECORRIDO

Tabla tipo legajo, dos bloques. Año en mono al margen, título, institución, y acordeón que
abre el detalle.

**Título:** Recorrido

### Formación

| Año | Título | Institución | Detalle |
|---|---|---|---|
| 2026 | IA y automatización de flujos de trabajo | Universidad Nacional de Córdoba | Automatizar procesos de trabajo con inteligencia artificial. 20 horas. Mayo 2026. |
| 2024 | **Carrera de Desarrollo Full Stack** | Coderhouse | 64 semanas. Terminada dentro del **top 10 de la camada**. Noviembre 2024. |
| 2024 | Ciberseguridad | Coderhouse, certificado por Delta Protect | 30 horas, 8 semanas. Mayo 2024. |
| 2023 | JavaScript | Coderhouse, certificado por PedidosYa | 40.5 horas, 8 semanas. Octubre 2023. |
| 2022 | Desarrollo Web | Coderhouse | 38 horas, 10 semanas. Noviembre 2022. |
| 2022 | Seguridad Informática | Educ.ar, Ministerio de Educación | Curso virtual, 10 horas. |
| 2022 | Programación visual de imágenes: Processing | Educ.ar, Ministerio de Educación | Curso virtual, 12 horas. |
| 2022 | Reparación y mantenimiento de PC | Educ.ar, Ministerio de Educación | Curso virtual, 12 horas. |
| 2021 | Fundamentos de la codificación | Grasshopper, Google | Agosto 2021. El primer curso, el que arrancó todo. |
| 2021 | Bachiller con orientación en Idiomas | IPEM N°43 Hipólito Yrigoyen | Secundario completo, 2015-2021. |

La fila de Full Stack va destacada: es la credencial principal y el top 10 es verificable.

### Trayectoria

| Año | Rol | Dónde | Detalle |
|---|---|---|---|
| 2025-hoy | Desarrollo de ecommerce | Freelance | Páginas de producto y tiendas Shopify para marcas que venden en Argentina. Copy, diseño, código y medición. |
| 2024-hoy | Coordinación y producción | Role Media | Gestión de proyectos, coordinación con clientes, edición de video y postproducción. |

`[[Ajustá el año de arranque del freelance si no es 2025]]`

---

## RESULTADOS

**Eyebrow:** `DATOS REALES`
**Título:** Resultados

`[[Solo si tenés números verificables. Si no los tenés, esta sección se saca: es preferible
tener 12 secciones ciertas que 13 con una inventada.]]`

Datos verificables que ya tenés, por si querés usar la sección con lo que hay:

```
4       páginas de producto publicadas
64      semanas de formación full stack
TOP 10  de la camada
```

---

## TESTIMONIOS

Mientras no haya:

> Las primeras marcas ya están vendiendo con estas páginas. Cuando tenga sus palabras por
> escrito, van a aparecer acá tal cual las digan.

---

## CONTACTO

**Eyebrow:** `PRESUPUESTO`
**Título:** Contame qué querés vender.
**Bajada:** Respondo el mismo día. Si me pasás el link de tu producto, te digo qué haría antes
de cobrarte nada.

Campos y select: ver DESIGN.md sección 12.

**Columna derecha:**

```
ESCRIBIME DIRECTO
WhatsApp  +54 9 351 512 2108
Email     bmurgarcia@gmail.com

CÓMO TRABAJO
Presupuesto cerrado, sin sorpresas.
Te muestro cada bloque antes de seguir.
La página queda tuya, en tu tienda.
```

---

## FOOTER

```
© 2026 · BENJAMIN GARCIA   ·   CÓRDOBA, AR   ·   [hora local]   ·   SESIÓN [uptime]
Compuesto en Clash Display, Switzer y JetBrains Mono. Corriendo en Next.js. Córdoba, 2026.
                                                                    ↑ VOLVER ARRIBA
```

---

## SEO

```ts
title: "Benjamin Garcia · Páginas de producto que venden | Córdoba, Argentina"
description: "Desarrollador de ecommerce en Córdoba. Diseño, escribo y programo páginas de producto para Shopify pensadas para vender en Argentina."
url: "https://[[dominio]]"
locale: "es_AR"
```

Keywords: landing page Shopify, página de producto, ecommerce Córdoba, Shopify Argentina,
diseño de landing, optimización de conversión, copywriting ecommerce, tienda online Argentina.

Falta: imagen Open Graph de 1200×630 en `public/og.png`.
