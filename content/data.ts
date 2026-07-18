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
    title: {
      before: "Más de 200 páginas de producto,",
      accent: "programadas",
      after: "una por una.",
    },
    subtitle:
      "Trabajo con marcas que testean productos en serie, en Argentina y afuera. Liquid y JavaScript adentro de tu tema, no un page builder con abono mensual. El copy, el diseño, las imágenes y el código los hago yo.",
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
      "Soy Benjamin, desarrollador de ecommerce en Córdoba. Hice más de 200 páginas de producto para más de 130 marcas y productos, en Argentina y afuera. Muchos de mis clientes testean varias marcas a la vez: lanzan, miden y vuelven a lanzar. Yo soy el que arma la página cada vez.",
      "Ese ritmo es la diferencia. Cuando una página se cae en un lanzamiento, cuando el checkout falla en móviles viejos, cuando la conversión se desploma un martes sin motivo aparente: ya lo vi, y sé dónde mirar. No es teoría de curso.",
      "Estudié la Tecnicatura en Programación en la UTN, que dura tres años, y la terminé en un año y cuatro meses. La carrera de Full Stack la terminé primero de mi camada. Esa base es la que me deja escribir Liquid y JavaScript adentro de tu tema, en vez de depender de un page builder con abono mensual que te limita a lo que trae la plantilla.",
      "Y trabajo para el mercado argentino, que cambia todo: precio en pesos, cuotas, Mercado Pago, cómo se habla acá. Una página traducida del inglés se nota, y se nota en la conversión.",
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

  // ── PROYECTOS ─────────────────────────────────────────────────────────
  // Las capturas van en public/proyectos/ y se referencian como
  // "/proyectos/archivo.webp" (sin "public" adelante).
  // Con `captura: null` se dibuja un marco achurado y la sección funciona igual.
  proyectos: {
    eyebrow: "PÁGINAS EN PRODUCCIÓN",
    title: "Proyectos",
    intro:
      "El primero facturó 25 millones de pesos en un solo día. Detrás hay más de doscientas páginas, porque trabajo con gente que testea productos en serie: lanzan, miden, matan lo que no anda y vuelven a lanzar. Cuando un producto pega, la página tiene que estar lista ayer.",
    bloquesLabel: "BLOQUES CONSTRUIDOS",
    verLabel: "VER LA PÁGINA",
    sinCaptura: "CAPTURA PENDIENTE",
    pie: "Más de 200 páginas para más de 130 marcas y productos. La mayoría no las puedo mostrar por acuerdo con el cliente.",
    items: [
      {
        id: "tinte-pro",
        marca: "Tinte Pro",
        producto: "Shampoo de tinte instantáneo · para Lautaro Cardozo",
        rubro: "ECOMMERCE · CÓRDOBA",
        descripcion:
          "Página de producto completa para el lanzamiento: selector de cinco tonos, bundles de una, dos y tres unidades con elección de color por unidad, cuotas sin interés, garantía de 30 días y sellos de pago seguro. Validó el primer día que salió y llegó a facturar 25 millones de pesos en una sola jornada. El producto sigue vendiéndose hoy.",
        bloques: [
          "Selector de tonos",
          "Bundles",
          "Color por unidad",
          "Cuotas",
          "Garantía",
          "Prueba social",
        ],
        captura: "/proyectos/tinte-pro.webp",
        url: null,
      },
      {
        id: "suplemento-femenino",
        marca: "Suplemento probiótico",
        producto: "Bienestar femenino",
        rubro: "SUPLEMENTOS",
        descripcion:
          "Página editorial completa con ángulo de advertorial: hook, historia del problema, mecanismo, testimonios, comparativa de precio y barra fija.",
        bloques: ["Advertorial", "Bundles", "Barra fija"],
        captura: null,
        url: null,
      },
      {
        id: "capsaicina",
        marca: "Suplemento con capsaicina",
        producto: "Control de peso",
        rubro: "SUPLEMENTOS",
        descripcion:
          "Página de producto con identidad visual propia, bundles de tres opciones y checkout directo sin pasar por el carrito.",
        bloques: ["Bundles", "Checkout directo", "Garantía"],
        captura: null,
        url: null,
      },
      {
        id: "serum-cuero",
        marca: "Sérum ayurvédico",
        producto: "Cuero cabelludo",
        rubro: "COSMÉTICA",
        descripcion:
          "Página completa con set de bloques propio e imágenes de producto generadas con IA, sin sesión de fotos.",
        bloques: ["Imágenes IA", "Antes y después", "FAQ"],
        captura: null,
        url: null,
      },
      {
        id: "serum-peptidos",
        marca: "Sérum con péptidos de cobre",
        producto: "Antiedad",
        rubro: "COSMÉTICA",
        descripcion:
          "Identidad visual distinta a la anterior, mismo nivel de detalle. Set de bloques completo y prueba social con reseñas reales.",
        bloques: ["Prueba social", "Bundles", "Garantía"],
        captura: null,
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
          "Me contás el producto, a quién le vendés y qué te está pasando hoy.",
      },
      {
        n: "02",
        titulo: "Investigación",
        detalle:
          "Miro tu competencia, tus reseñas y lo que dicen tus clientes. De ahí sale el ángulo.",
      },
      {
        n: "03",
        titulo: "Copy",
        detalle:
          "Escribo la página entera antes de diseñar nada. Si el texto no vende, el diseño no lo salva.",
      },
      {
        n: "04",
        titulo: "Diseño e imágenes",
        detalle:
          "Identidad visual del producto y las imágenes que hagan falta, generadas y editadas por mí.",
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
      { benefit: "Sin apps que la frenen", tool: "HTML Y CSS" },
      { benefit: "Animaciones propias", tool: "JAVASCRIPT" },
      { benefit: "Que no te copien", tool: "BLINDAJE" },
      { benefit: "Imágenes que no existían", tool: "IA GENERATIVA" },
      { benefit: "Cobros al toque", tool: "MERCADO PAGO" },
      { benefit: "Todo medido", tool: "ANALYTICS" },
      { benefit: "Tráfico que compra", tool: "META ADS" },
    ],
  },

  // ── LO QUE DOMINO ─────────────────────────────────────────────────────
  // w: 700 todos los días · 600 con soltura · 500 me defiendo
  oficio: {
    title: "Lo que domino",
    intro:
      "Sin barras de progreso ni porcentajes: el tamaño de cada palabra dice cuánto la uso de verdad.",
    leyenda: [
      "GRANDE · TODOS LOS DÍAS",
      "MEDIANO · CON SOLTURA",
      "CHICO · ME DEFIENDO",
    ],
    grupos: [
      {
        id: "construccion",
        label: "CONSTRUCCIÓN",
        items: [
          { name: "Shopify", w: 700 },
          { name: "Liquid", w: 700 },
          { name: "HTML y CSS", w: 700 },
          { name: "JavaScript", w: 700 },
          { name: "Responsive", w: 700 },
          { name: "Tienda Nube", w: 600 },
          { name: "React", w: 500 },
        ],
      },
      {
        id: "conversion",
        label: "CONVERSIÓN",
        items: [
          { name: "Estructura de landing", w: 700 },
          { name: "Bundles y precios", w: 700 },
          { name: "Prueba social", w: 700 },
          { name: "Barras fijas y popups", w: 700 },
          { name: "Checkout directo", w: 600 },
          { name: "Tests", w: 500 },
        ],
      },
      {
        id: "contenido",
        label: "CONTENIDO",
        items: [
          { name: "Copy argentino", w: 700 },
          { name: "Advertorials", w: 700 },
          { name: "Imágenes con IA", w: 600 },
          { name: "Edición de video", w: 600 },
          { name: "Fotografía de producto", w: 500 },
        ],
      },
      {
        id: "proteccion",
        label: "PROTECCIÓN Y MEDICIÓN",
        items: [
          { name: "Blindaje anticopia", w: 700 },
          { name: "Ofuscación", w: 600 },
          { name: "Analytics", w: 500 },
          { name: "Píxeles y eventos", w: 500 },
        ],
      },
    ],
  },

  // ── RESULTADOS ────────────────────────────────────────────────────────
  resultados: {
    eyebrow: "DATOS REALES",
    title: "Resultados",
    intro:
      "Números que puedo respaldar. No hay promedios inventados ni porcentajes de folleto: si un dato sale de un solo caso, está dicho que sale de un solo caso.",
    cifras: [
      {
        n: 200,
        prefix: "+",
        label: "PÁGINAS EN PRODUCCIÓN",
        nota: "Suplementos, indumentaria, cosmética y formación. Muchas siguen vendiendo hoy.",
      },
      {
        n: 130,
        prefix: "+",
        label: "MARCAS Y PRODUCTOS",
        nota: "Muchos clientes testean varias marcas por vez. Ese es el ritmo con el que trabajo.",
      },
      {
        n: 25,
        prefix: "",
        label: "MILLONES EN UN DÍA",
        nota: "Lo que facturó Tinte Pro en una sola jornada. Validó el primer día y el producto sigue vendiendo.",
      },
    ],
    cita: "Hay páginas mías sosteniendo tiendas que facturan millones de pesos por día.",
    citaPie: "BENJAMIN GARCIA · CÓRDOBA, 2026",
  },

  // ── RECORRIDO ─────────────────────────────────────────────────────────
  recorrido: {
    title: "Recorrido",
    intro:
      "Empecé a programar en 2021. En 2022 ya tenía la tecnicatura de la UTN, hecha en un año y cuatro meses. En 2024 terminé la carrera de Full Stack primero de camada. Después vinieron las doscientas páginas.",
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
              "Treinta horas. Es lo que respalda el servicio de blindaje: saber cómo se copia y se raspa una página es lo que permite hacerla difícil de copiar.",
          },
          {
            id: "javascript",
            anio: "2023",
            titulo: "JavaScript",
            institucion: "Coderhouse, certificado por PedidosYa",
            detalle:
              "Cuarenta horas y media. Todas las animaciones, los bundles, las barras fijas y los popups que armo salen de acá.",
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
            titulo: "Desarrollo de ecommerce",
            institucion: "Freelance",
            detalle:
              "Más de 200 páginas de producto para más de 130 marcas y productos, en Argentina y el exterior. Shopify y Tienda Nube. Copy, diseño, imágenes, código y medición.",
          },
          {
            id: "role-media",
            anio: "2024-HOY",
            titulo: "Coordinación y producción",
            institucion: "Role Media",
            detalle:
              "Gestión de proyectos, coordinación con clientes, edición de video y postproducción. Es de donde salen los creativos que acompañan a cada página.",
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
      { label: "Recorrido", href: "#recorrido" },
    ],
    status: "AGENDA ABIERTA",
  },

  // ── RIEL DE PROFUNDIDAD ───────────────────────────────────────────────
  riel: {
    label: "PROFUNDIDAD DE SCROLL",
    aria: "Navegación por secciones e indicador de scroll",
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
    { id: "oficio", label: "LO QUE DOMINO" },
    { id: "resultados", label: "RESULTADOS" },
    { id: "recorrido", label: "RECORRIDO" },
    { id: "contacto", label: "CONTACTO" },
  ],

  // ── SEO ───────────────────────────────────────────────────────────────
  // OJO: cambiar `url` por el dominio real antes de publicar.
  seo: {
    title: "Benjamin Garcia · +200 páginas de producto para ecommerce | Córdoba",
    description:
      "Desarrollador de ecommerce en Córdoba. Más de 200 páginas de producto programadas para Shopify y Tienda Nube, para más de 130 marcas y productos en Argentina y el exterior.",
    url: "https://benjamingarcia.dev",
    locale: "es_AR",
  },
};