// ============================================================================
// PLANO · Contenido central del portfolio
// TODO el texto visible del sitio vive acá. Los componentes no hardcodean copy.
//
// Regla dura: nada de guiones largos ni medios en texto visible.
// Usar coma, punto o dos puntos. Rangos con guion común: 2024-2026.
// ============================================================================

export const content = {
  identity: {
    name: "Benjamin Garcia",
    firstName: "BENJAMIN",
    lastName: "GARCIA",
    role: "Desarrollador de ecommerce y especialista en conversión",
    location: "Córdoba, Argentina",
    locationShort: "CBA · AR",
    email: "bmurgarcia@gmail.com",
    phoneDisplay: "+54 9 351 512 2108",
    whatsappNumber: "5493515122108",
    github: null,
    instagram: null,
  },

  // ── HERO ──────────────────────────────────────────────────────────────
  hero: {
    // Partido en tres para no depender de un split por string.
    // "accent" se pinta en celeste y nunca se corta de línea.
    title: {
      before: "Más de 200 páginas de producto,",
      accent: "programadas",
      after: "una por una.",
    },
    subtitle:
      "130 marcas en Argentina y el exterior. Liquid y JavaScript adentro de tu tema, no un page builder con abono mensual. El copy, el diseño, las imágenes y el código los hago yo.",
    ctaPrimary: "Pedí tu presupuesto",
    ctaSecondary: "Ver proyectos",

    // Mobile: dos números monumentales que cuentan desde cero.
    cifras: [
      { n: 200, prefix: "+", label: "PÁGINAS EN PRODUCCIÓN" },
      { n: 130, prefix: "+", label: "MARCAS EN AR Y EXTERIOR" },
    ],

    // Desktop: el cajetín al pie de la lámina.
    rotulo: {
      label: "FICHA",
      rev: "REV. 2026",
      cells: [
        { k: "PÁGINAS", v: "+200" },
        { k: "MARCAS", v: "+130" },
        { k: "MERCADO", v: "AR · EXT" },
      ],
      platforms: "SHOPIFY · TIENDA NUBE · LIQUID · JAVASCRIPT",
      estadoValor: "AGENDA ABIERTA",
      respuestaValor: "RESPUESTA EN 24 H",
    },

    // Bloques del wireframe del hero (PlanoCanvas).
    wireframe: [
      { id: "hero", label: "HERO" },
      { id: "problema", label: "PROBLEMA" },
      { id: "mecanismo", label: "MECANISMO" },
      { id: "prueba", label: "PRUEBA SOCIAL" },
      { id: "bundles", label: "BUNDLES" },
      { id: "garantia", label: "GARANTÍA" },
      { id: "faq", label: "FAQ" },
    ],
    wireframeCaption: "ASÍ SE ESTRUCTURA UNA PÁGINA QUE VENDE",
  },

  // ── SOBRE MÍ ──────────────────────────────────────────────────────────
  sobreMi: {
    title: "Doscientas páginas después.",
    paragraphs: [
      "Soy Benjamin, desarrollador de ecommerce en Córdoba. Hice más de 200 páginas de producto para unas 130 marcas, en Argentina y afuera. Muchas siguen vendiendo hoy, todos los días.",
      "Ese volumen es la diferencia. Cuando una página se cae en un lanzamiento, cuando el checkout falla en móviles viejos, cuando la conversión se desploma un martes sin motivo aparente: ya lo vi, y sé dónde mirar. No es teoría de curso.",
      "Me formé como desarrollador full stack y terminé la carrera entre los diez mejores de mi camada. Por eso trabajo en Liquid y JavaScript adentro de tu tema, en lugar de depender de un page builder con abono mensual que te limita a lo que trae la plantilla.",
      "Y trabajo para el mercado argentino, que cambia todo: precio en pesos, cuotas, Mercado Pago, cómo se habla acá. Una página traducida del inglés se nota, y se nota en la conversión.",
    ],
    fichaLabel: "FICHA TÉCNICA",
    ficha: [
      { k: "BASE", v: "Córdoba, AR" },
      { k: "PÁGINAS", v: "+200 construidas" },
      { k: "MARCAS", v: "+130 · AR y exterior" },
      { k: "FORMACIÓN", v: "Full Stack · top 10" },
      { k: "PLATAFORMAS", v: "Shopify · Tienda Nube" },
      { k: "DISPONIBLE", v: "Nuevos proyectos" },
    ],
  },

  // ── ANATOMÍA (sección firma) ──────────────────────────────────────────
  // Los `id` deben coincidir con el switch de <Contenido> en Anatomia.tsx.
  anatomia: {
    eyebrow: "LO QUE APRENDÍ EN 200 PÁGINAS",
    title: "Anatomía de una página que vende.",
    planoLabel: "BLOQUE ACTIVO",
    deslizaLabel: "DESLIZÁ →",
    intro:
      "Una landing no es una página larga con fotos lindas. Es una secuencia. Cada bloque está donde está porque responde la objeción que aparece justo antes.",
    outro:
      "Ese orden no es un molde. Cambia según el producto, el precio y quién compra. Pero la lógica es siempre la misma: cada bloque se gana el derecho a que sigas bajando.",
    blocks: [
      {
        id: "hero",
        n: "01",
        name: "Hero y promesa",
        note: "Tenés menos de 3 segundos. Acá va el problema en las palabras del cliente, no el nombre del producto.",
      },
      {
        id: "problema",
        n: "02",
        name: "El problema",
        note: "Antes de vender hay que nombrar lo que le pasa. Si se siente identificado, sigue bajando.",
      },
      {
        id: "mecanismo",
        n: "03",
        name: "Cómo funciona",
        note: "El mecanismo, explicado simple. Sin esto, el producto es una promesa sin respaldo.",
      },
      {
        id: "prueba",
        n: "04",
        name: "Prueba social",
        note: "Va justo acá porque la desconfianza aparece cuando la promesa suena demasiado buena.",
      },
      {
        id: "antes-despues",
        n: "05",
        name: "Antes y después",
        note: "Lo visual convence donde el texto ya no alcanza.",
      },
      {
        id: "bundles",
        n: "06",
        name: "Bundles y precio",
        note: "El precio se muestra recién cuando el valor ya está construido. Tres opciones, la del medio destacada.",
      },
      {
        id: "garantia",
        n: "07",
        name: "Garantía",
        note: "Saca el riesgo de encima justo cuando está por decidir.",
      },
      {
        id: "faq",
        n: "08",
        name: "Preguntas frecuentes",
        note: "Las objeciones que quedaron. Cada pregunta es una venta que se estaba por perder.",
      },
      {
        id: "cierre",
        n: "09",
        name: "Cierre y CTA fijo",
        note: "La barra que sigue al scroll. El botón no se puede perder de vista nunca.",
      },
    ],
  },

  // ── SERVICIOS ─────────────────────────────────────────────────────────
  servicios: {
    title: "Qué hago",
    hoverTick: "· CONSULTAR",
    items: [
      {
        id: "pagina",
        tag: "EL SERVICIO PRINCIPAL",
        name: "Página de producto que vende",
        description:
          "La página completa: copy, diseño, imágenes, código y medición. Bloque por bloque adentro de tu tienda, sin apps que la frenen.",
      },
      {
        id: "tienda",
        tag: "DESDE CERO",
        name: "Tienda completa",
        description:
          "Shopify o Tienda Nube: estructura, catálogo, checkout, medios de pago y envíos, lista para vender.",
      },
      {
        id: "blindaje",
        tag: "PROTECCIÓN",
        name: "Blindaje de la página",
        description:
          "Sin click derecho, sin selección de texto, sin arrastrar imágenes y con los atajos de inspección bloqueados. Que tu competencia no te clone la página en una tarde.",
      },
      {
        id: "optimizacion",
        tag: "SOBRE LO QUE YA TENÉS",
        name: "Optimización y rediseño",
        description:
          "Reviso tu página actual, marco dónde se pierde la venta y lo arreglo bloque por bloque. Sin rehacer todo si no hace falta.",
      },
    ],
  },

  // ── CONTACTO ──────────────────────────────────────────────────────────
  contacto: {
    eyebrow: "PRESUPUESTO",
    title: "Contame qué querés vender.",
    intro:
      "Respondo el mismo día. Si me pasás el link de tu producto, te digo qué haría antes de cobrarte nada.",
    campos: {
      nombre: "Nombre",
      email: "Email",
      tipo: "Qué necesitás",
      proyecto: "Contame de tu producto o marca",
      link: "Link de tu tienda (opcional)",
    },
    opciones: [
      { id: "pagina", name: "Página de producto", hint: "LA MÁS PEDIDA" },
      { id: "tienda", name: "Tienda completa", hint: "SHOPIFY O TIENDA NUBE" },
      { id: "optimizacion", name: "Optimización", hint: "SOBRE LO QUE YA TENÉS" },
      { id: "blindaje", name: "Blindaje", hint: "QUE NO TE COPIEN" },
      { id: "copy", name: "Copy y creativos", hint: "TEXTOS E IMÁGENES" },
      { id: "otro", name: "Otra cosa", hint: "CONTAME QUÉ NECESITÁS" },
    ],
    errores: {
      nombre: "Poné tu nombre así sé con quién hablo.",
      emailVacio: "Necesito un email para responderte.",
      emailInvalido: "Ese email no parece válido.",
      tipo: "Elegí qué necesitás.",
      proyecto: "Contame algo del producto, aunque sean dos líneas.",
    },
    medidorLabel: "COMPLETÁ PARA ENVIAR",
    medidorListo: "LISTO PARA ENVIAR",
    cta: "Enviar por WhatsApp",
    ctaNota: "SE ABRE WHATSAPP CON EL MENSAJE ARMADO",
    directoLabel: "ESCRIBIME DIRECTO",
    comoLabel: "CÓMO TRABAJO",
    como: [
      "Presupuesto cerrado, sin sorpresas.",
      "Te muestro cada bloque antes de seguir.",
      "La página queda tuya, en tu tienda.",
    ],
  },

  // ── FOOTER ────────────────────────────────────────────────────────────
  footer: {
    year: "2026",
    clockLabel: "CÓRDOBA",
    backToTop: "↑ VOLVER ARRIBA",
    colofon:
      "Compuesto en Clash Display, Switzer y JetBrains Mono. Corriendo en Next.js. Córdoba, 2026.",
  },

  // ── NAV ───────────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: "Proyectos", href: "#proyectos" },
      { label: "Servicios", href: "#servicios" },
      { label: "Presupuesto", href: "#contacto" },
    ],
    status: "DISPONIBLE",
  },

  // ── SEO ───────────────────────────────────────────────────────────────
  // OJO: cambiar `url` por el dominio real antes de deployar.
  seo: {
    title: "Benjamin Garcia · +200 páginas de producto para ecommerce | Córdoba",
    description:
      "Desarrollador de ecommerce en Córdoba. Más de 200 páginas de producto programadas para Shopify y Tienda Nube, para 130 marcas en Argentina y el exterior.",
    url: "https://benjamingarcia.dev",
    locale: "es_AR",
  },
};