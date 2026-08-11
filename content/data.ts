// ============================================================================
// PLANO · Contenido central del portfolio
// TODO el texto visible del sitio vive acá. Los componentes no hardcodean copy.
//
// Regla dura: nada de guiones largos ni medios en texto visible.
// Usar coma, punto o dos puntos. Rangos con guion común: 2024-2026.
//
// PENDIENTE: buscá [[ ]] en este archivo. Eso se ve literal en pantalla.
// ============================================================================

export const content = {
  identity: {
    name: "Benjamín García",
    firstName: "BENJAMÍN",
    lastName: "GARCÍA",
    role: "Desarrollador de ecommerce, especialista en páginas que venden",
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
    title: {
      before: "Más de 200 páginas de producto,",
      accent: "programadas",
      after: "una por una.",
    },
    subtitle:
      "Ayudo a marcas de Argentina y del exterior a vender más con páginas de producto hechas a medida. Todo dentro de tu tienda, sin plantillas ni costos mensuales que te aten. Una sola persona a cargo de todo: texto, diseño, imágenes y programación.",
    ctaPrimary: "Pedí tu presupuesto",
    ctaSecondary: "Ver proyectos",

    cifras: [
      { n: 200, prefix: "+", label: "PÁGINAS EN PRODUCCIÓN" },
      { n: 130, prefix: "+", label: "MARCAS Y PRODUCTOS" },
    ],

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

    wireframe: [
      { id: "hero", label: "INICIO" },
      { id: "problema", label: "PROBLEMA" },
      { id: "mecanismo", label: "CÓMO FUNCIONA" },
      { id: "prueba", label: "OPINIONES" },
      { id: "bundles", label: "COMBOS" },
      { id: "garantia", label: "GARANTÍA" },
      { id: "faq", label: "PREGUNTAS" },
    ],
    wireframeCaption: "ASÍ SE ESTRUCTURA UNA PÁGINA QUE VENDE",
    wireframeCta: "BOTÓN FIJO",
  },

  // ── SOBRE MÍ ──────────────────────────────────────────────────────────
  sobreMi: {
    title: "Doscientas páginas después.",
    paragraphs: [
      "Soy Benjamín, desarrollador de ecommerce en Córdoba. En los últimos años hice más de 200 páginas de producto para más de 130 marcas, en Argentina y en el exterior. La mayoría de mis clientes prueban varias marcas a la vez: lanzan, miden y vuelven a lanzar. En cada intento, la página la armo yo.",
      "Ese volumen es la diferencia. Cuando una página se cae en pleno lanzamiento, cuando el botón de pagar falla en un celular viejo o de un día para el otro deja de vender sin explicación, ya lo viví muchas veces y sé exactamente dónde mirar.",
      "Detrás hay formación de verdad: hice la Tecnicatura en Programación de la UTN en la mitad del tiempo previsto y terminé la carrera de desarrollo web primero de mi camada. No lo cuento por el diploma, sino porque es lo que me permite programar tu tienda a medida, con código propio, sin depender de plantillas ni de apps que la frenen.",
      "Y conozco el mercado argentino, que cambia todo: precios en pesos, cuotas, Mercado Pago, la forma de comprar y de hablar de acá. Una página traducida del inglés se nota, y se nota en las ventas.",
    ],
    fichaLabel: "FICHA TÉCNICA",
    ficha: [
      { k: "BASE", v: "Córdoba, AR" },
      { k: "PÁGINAS", v: "+200 construidas" },
      { k: "MARCAS", v: "+130 · AR y exterior" },
      { k: "FORMACIÓN", v: "Tecnicatura UTN" },
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
    bloqueLabel: "BLOQUE",
    deslizaLabel: "DESLIZÁ →",
    intro:
      "Una página de venta no es una página larga con fotos lindas. Es una secuencia. Cada bloque está donde está porque responde la objeción que aparece justo antes.",
    outro:
      "Ese orden no es un molde. Cambia según el producto, el precio y quién compra. Pero la lógica es siempre la misma: cada bloque se gana el derecho a que sigas bajando.",
    blocks: [
      {
        id: "hero",
        n: "01",
        name: "Hero y promesa",
        note: "Tenés menos de 3 segundos para enganchar. Va el problema en las palabras del cliente, no el nombre del producto.",
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
        note: "Cómo funciona el producto, explicado simple. Sin esto, el producto es una promesa sin respaldo.",
      },
      {
        id: "prueba",
        n: "04",
        name: "Opiniones de clientes",
        note: "Van justo acá porque la desconfianza aparece cuando la promesa suena demasiado buena.",
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
        name: "Combos y precio",
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
        note: "Las dudas que quedaron sin responder. Cada una es una venta que se estaba por perder.",
      },
      {
        id: "cierre",
        n: "09",
        name: "Cierre y botón fijo",
        note: "La barra que te sigue mientras bajás. El botón no se puede perder de vista nunca.",
      },
    ],
  },

  // ── PROYECTOS ─────────────────────────────────────────────────────────
  // Las capturas van en public/proyectos/ y se referencian como
  // "/proyectos/archivo.webp" (sin "public" adelante).
  // Con `captura: null` se dibuja un marco achurado y la sección funciona igual.
  proyectos: {
    eyebrow: "PÁGINAS EN PRODUCCIÓN",
    title: "Proyectos",
    intro:
      "El primero facturó 25 millones de pesos en un solo día. Los otros muestran lo que hago más allá del código: escribir los textos, crear la identidad visual y generar las imágenes. Hay ecommerce y también negocios de servicios, como un catering de Córdoba. Cuando una marca lanza, la página tiene que estar lista ayer.",
    bloquesLabel: "BLOQUES CONSTRUIDOS",
    verLabel: "VER LA PÁGINA",
    sinCaptura: "CAPTURA PENDIENTE",
    pie: "Acá muestro cuatro. Detrás hay más de doscientas, pero la mayoría quedan bajo acuerdo con cada cliente.",
    destacadoStat: { valor: "25 millones", detalle: "facturado en un solo día" },
    items: [
      {
        id: "tinte-pro",
        marca: "Shampoo de tinte",
        producto: "Lanzamiento de ecommerce",
        rubro: "ECOMMERCE · CÓRDOBA",
        descripcion:
          "Página de producto completa para un lanzamiento: selector de cinco tonos, combos de una a tres unidades eligiendo el color de cada una, cuotas sin interés, garantía de 30 días y sellos de pago seguro. Validó desde el primer día y el producto sigue vendiéndose hoy.",
        bloques: [
          "Selector de tonos",
          "Combos",
          "Color por unidad",
          "Cuotas",
          "Garantía",
          "Opiniones",
        ],
        captura: "/proyectos/tinte-pro.webp",
        url: null,
      },
      {
        id: "salguero",
        marca: "Salguero Gourmet",
        producto: "Catering gourmet para eventos",
        rubro: "GASTRONOMÍA · CÓRDOBA",
        descripcion:
          "No todo es venta de productos. Sitio completo para un catering de Córdoba con 15 años de trayectoria: servicios, galería, reseñas con puntaje 5.0 en Google, sección para empresas y un cotizador que arma el presupuesto y lo manda por WhatsApp. Está en vivo y podés entrar.",
        bloques: [
          "Cotizador",
          "Reseñas 5.0",
          "Galería",
          "Para empresas",
        ],
        captura: "/proyectos/salguero.webp",
        url: "https://salguerogourmet.vercel.app",
      },
      {
        id: "capileka",
        marca: "Capileka",
        producto: "Suero para el cuero cabelludo",
        rubro: "COSMÉTICA",
        descripcion:
          "Un dibujo del cuero cabelludo por dentro que muestra cómo funciona: los cuatro puntos donde actúa el producto marcados sobre la ilustración, con pestañas para recorrerlos uno por uno. La ilustración la generé con inteligencia artificial: cero sesión de fotos.",
        bloques: [
          "Dibujo explicativo",
          "Pestañas",
          "Ilustración con IA",
          "Identidad visual",
          "Barra de anuncios",
        ],
        captura: "/proyectos/capileka.webp",
        url: null,
      },
      {
        id: "elare",
        marca: "Elaré",
        producto: "Extracto de ajo envejecido sin olor",
        rubro: "SUPLEMENTOS",
        descripcion:
          "Una página con forma de nota de revista: titular grande, bajada en itálica, la ficha de la profesional que revisa el contenido e imágenes hechas para ilustrar el problema. Se lee como un artículo, no como una publicidad.",
        bloques: [
          "Nota de revista",
          "Diseño editorial",
          "Revisión profesional",
          "Imágenes IA",
          "Ficha técnica",
        ],
        captura: "/proyectos/elare.webp",
        url: null,
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
          "La página completa: textos, diseño, imágenes, programación y medición. Bloque por bloque adentro de tu tienda, sin apps que la hagan lenta.",
      },
      {
        id: "tienda",
        tag: "DESDE CERO",
        name: "Tienda o sitio completo",
        description:
          "Shopify o Tienda Nube para vender productos, o un sitio completo para tu negocio de servicios: estructura, catálogo o cotizador, reseñas, medios de pago y contacto. Listo para funcionar.",
      },
      {
        id: "blindaje",
        tag: "PROTECCIÓN",
        name: "Blindaje de la página",
        description:
          "Sin click derecho, sin poder seleccionar el texto ni arrastrar las imágenes, y con las herramientas para copiar el código bloqueadas. Que tu competencia no te clone la página en una tarde.",
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

  // ── PROCESO (única sección numerada del sitio) ────────────────────────
  proceso: {
    title: "Cómo trabajamos",
    intro:
      "Seis pasos, siempre en el mismo orden. El orden importa: no se puede diseñar una página antes de saber qué va a decir.",
    pasos: [
      {
        n: "01",
        titulo: "Charla",
        detalle:
          "Me contás qué vendés, a quién, y qué te está pasando hoy.",
      },
      {
        n: "02",
        titulo: "Investigación",
        detalle:
          "Miro tu competencia, tus reseñas y lo que dicen tus clientes. De ahí sale el enfoque, la manera de contarlo.",
      },
      {
        n: "03",
        titulo: "Textos",
        detalle:
          "Escribo la página entera antes de diseñar nada. Si el texto no vende, el diseño no lo salva.",
      },
      {
        n: "04",
        titulo: "Diseño e imágenes",
        detalle:
          "La identidad visual y las imágenes que hagan falta, generadas y editadas por mí.",
      },
      {
        n: "05",
        titulo: "Programación",
        detalle:
          "Bloque por bloque, adentro de tu tienda. Vas viendo cada uno antes de que siga el siguiente.",
      },
      {
        n: "06",
        titulo: "Publicación",
        detalle:
          "Sale al aire y miramos qué pasa. Lo que no funciona, se cambia.",
      },
    ],
  },

  // ── HERRAMIENTAS ──────────────────────────────────────────────────────
  herramientas: {
    title: "Con qué está hecho",
    intro:
      "Arriba, lo que gana tu negocio. Abajo en chico, la herramienta que lo hace posible.",
    nota: "DESLIZÁ PARA VER TODO →",
    modulos: [
      { benefit: "Tu tienda, tu control", tool: "SHOPIFY" },
      { benefit: "También en Tienda Nube", tool: "TIENDA NUBE" },
      { benefit: "Bloques a medida", tool: "LIQUID" },
      { benefit: "Sin apps que la hagan lenta", tool: "HTML Y CSS" },
      { benefit: "Animaciones propias", tool: "JAVASCRIPT" },
      { benefit: "Que no te copien", tool: "BLINDAJE" },
      { benefit: "Imágenes que no existían", tool: "IA GENERATIVA" },
      { benefit: "Cobros al toque", tool: "MERCADO PAGO" },
      { benefit: "Todo medido", tool: "ANALYTICS" },
      { benefit: "Tráfico que compra", tool: "META ADS" },
    ],
  },

  // ── RECORRIDO ─────────────────────────────────────────────────────────
  recorrido: {
    title: "Recorrido",
    intro:
      "Empecé a programar en 2021. En 2022 ya tenía la tecnicatura de la UTN, hecha en un año y cuatro meses. En 2024 terminé la carrera de desarrollo web, primero de mi camada. Después vinieron las doscientas páginas.",
    grupos: [
      {
        id: "formacion",
        label: "FORMACIÓN",
        items: [
          {
            id: "unc-ia",
            anio: "2026",
            titulo: "IA y automatización de flujos de trabajo",
            institucion: "Universidad Nacional de Córdoba",
            detalle:
              "Veinte horas sobre automatizar procesos de trabajo con inteligencia artificial. Es lo que hoy uso para generar imágenes de producto y acelerar la parte repetitiva de cada página.",
          },
          {
            id: "fullstack",
            anio: "2024",
            titulo: "Carrera de Desarrollo Full Stack",
            institucion: "Coderhouse",
            detalle:
              "Sesenta y cuatro semanas de cursada, terminada en el primer puesto de la camada. La academia me dio becas y cursos como reconocimiento por el resultado.",
            destacado: true,
            sello: "1° DE LA CAMADA",
          },
          {
            id: "ciberseguridad",
            anio: "2024",
            titulo: "Ciberseguridad",
            institucion: "Coderhouse, certificado por Delta Protect",
            detalle:
              "Treinta horas. Es lo que respalda el servicio de blindaje: saber cómo se copia y se roba una página es lo que me permite hacerla difícil de copiar.",
          },
          {
            id: "javascript",
            anio: "2023",
            titulo: "JavaScript",
            institucion: "Coderhouse, certificado por PedidosYa",
            detalle:
              "Cuarenta horas y media. Todas las animaciones, los combos, las barras fijas y las ventanas emergentes que armo salen de acá.",
          },
          {
            id: "utn",
            anio: "2022",
            titulo: "Tecnicatura en Programación",
            institucion: "Universidad Tecnológica Nacional",
            detalle:
              "La carrera dura tres años. La terminé en un año y cuatro meses, cursando y trabajando al mismo tiempo. Es la formación más completa que tengo y la que sostiene todo lo demás.",
            destacado: true,
            sello: "3 AÑOS EN 16 MESES",
          },
          {
            id: "desarrollo-web",
            anio: "2022",
            titulo: "Desarrollo Web",
            institucion: "Coderhouse",
            detalle:
              "Treinta y ocho horas de HTML y CSS. El primer curso pago, el que confirmó que iba en serio.",
          },
          {
            id: "seguridad",
            anio: "2022",
            titulo: "Seguridad Informática",
            institucion: "Educ.ar, Ministerio de Educación",
            detalle: "Curso virtual de diez horas.",
          },
          {
            id: "processing",
            anio: "2022",
            titulo: "Programación visual de imágenes",
            institucion: "Educ.ar, Ministerio de Educación",
            detalle:
              "Introducción a Processing, doce horas. La primera vez que programé algo que se veía en pantalla.",
          },
          {
            id: "grasshopper",
            anio: "2021",
            titulo: "Fundamentos de la codificación",
            institucion: "Grasshopper, Google",
            detalle:
              "El primero de todos, en agosto de 2021. Gratis, desde el celular, y el que arrancó todo esto.",
          },
        ],
      },
      {
        id: "trayectoria",
        label: "TRAYECTORIA",
        items: [
          {
            id: "freelance",
            anio: "2022-HOY",
            titulo: "Desarrollo web y ecommerce",
            institucion: "Freelance",
            detalle:
              "Más de 200 páginas de producto para más de 130 marcas y productos, en Argentina y el exterior. Shopify y Tienda Nube. Textos, diseño, imágenes, código y medición.",
          },
          {
            id: "role-media",
            anio: "2024-HOY",
            titulo: "Coordinación y producción",
            institucion: "Role Media",
            detalle:
              "Gestión de proyectos, coordinación con clientes, edición de video y postproducción. De ahí salen los videos y las piezas que acompañan cada página.",
          },
        ],
      },
    ],
  },

  // ── TESTIMONIOS ───────────────────────────────────────────────────────
  // Con `items` vacío la sección NO se renderiza. Cargá el primero y aparece.
  testimonios: {
    title: "Lo que dicen",
    // El tipo va explícito: sin esto, un array vacío se infiere como never[]
    // y TypeScript no deja leer .quote ni .autor adentro del componente.
    items: [] as { quote: string; autor: string; rol: string }[],
  },

  // Cuando tengas el primero, reemplazá la línea de arriba por esto:
  //
  //   items: [
  //     {
  //       quote: "La cita, tal cual la dijo. Sin retocar.",
  //       autor: "Lautaro Cardozo",
  //       rol: "TINTE PRO · ECOMMERCE",
  //     },
  //   ],

  // ── CONTACTO ──────────────────────────────────────────────────────────
  contacto: {
    eyebrow: "PRESUPUESTO",
    title: "Contame qué querés vender.",
    intro:
      "Respondo el mismo día. Si me pasás el link de tu tienda o tu negocio, te digo qué haría antes de cobrarte nada.",
    campos: {
      nombre: "Nombre",
      email: "Email",
      tipo: "Qué necesitás",
      proyecto: "Contame de tu producto o marca",
      link: "Link de tu tienda (opcional)",
    },
    placeholders: {
      nombre: "Tu nombre",
      email: "nombre@tumarca.com",
      proyecto: "Qué vendés, a quién, y qué te está pasando hoy con tu página.",
      link: "tutienda.com",
    },
    wa: {
      saludo: "Hola Benjamín, soy",
      intro: "Te escribo desde tu portfolio para pedir un presupuesto.",
      labelTipo: "Qué necesito:",
      labelEmail: "Email:",
      labelProducto: "Sobre mi producto o marca:",
      labelLink: "Link:",
      cierre: "Quedo atento. Gracias.",
    },
    opciones: [
      { id: "pagina", name: "Página de producto", hint: "LA MÁS PEDIDA" },
      { id: "tienda", name: "Tienda o sitio completo", hint: "SHOPIFY O TIENDA NUBE" },
      { id: "optimizacion", name: "Optimización", hint: "SOBRE LO QUE YA TENÉS" },
      { id: "blindaje", name: "Blindaje", hint: "QUE NO TE COPIEN" },
      { id: "copy", name: "Textos e imágenes", hint: "PARA TU PÁGINA Y TUS ANUNCIOS" },
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
      { label: "Recorrido", href: "#recorrido" },
    ],
    status: "AGENDA ABIERTA",
  },

  // ── RIEL DE PROFUNDIDAD ───────────────────────────────────────────────
  riel: {
    label: "AVANCE EN LA PÁGINA",
    aria: "Navegación por secciones e indicador de avance",
  },

  // Los ids tienen que existir como id de una <Section> y respetar el orden
  // en que aparecen en app/page.tsx. "testimonios" NO va: mientras el array
  // esté vacío la sección no se renderiza y el waypoint apuntaría a la nada.
  waypoints: [
    { id: "inicio", label: "INICIO" },
    { id: "sobre-mi", label: "SOBRE MÍ" },
    { id: "anatomia", label: "ANATOMÍA" },
    { id: "proyectos", label: "PROYECTOS" },
    { id: "servicios", label: "SERVICIOS" },
    { id: "proceso", label: "PROCESO" },
    { id: "herramientas", label: "HERRAMIENTAS" },
    { id: "recorrido", label: "RECORRIDO" },
    { id: "contacto", label: "CONTACTO" },
  ],

  // ── SEO ───────────────────────────────────────────────────────────────
  // OJO: cambiar `url` por el dominio real antes de publicar.
  seo: {
    title: "Benjamín García · +200 páginas de producto para ecommerce | Córdoba",
    description:
      "Desarrollador de ecommerce en Córdoba. Más de 200 páginas de producto programadas para Shopify y Tienda Nube, para más de 130 marcas y productos en Argentina y el exterior.",
    url: "https://plataformabensha.vercel.app",
    locale: "es_AR",
  },
};