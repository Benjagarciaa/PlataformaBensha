// ============================================================================
// Contenido central del portfolio
// TODO el texto visible del sitio vive acá. Los componentes no escriben copy.
//
// Voz: voseo, frases cortas, desde el negocio del cliente. El protagonista es
// su negocio; Benjamín aparece como respaldo (Sobre mí, Cómo trabajamos).
// Sin tecnicismos: si se nombra una tecnología, se dice qué cambia en su día.
//
// Regla dura: nada de guiones largos ni medios en texto visible.
// Usar coma, punto o dos puntos. Rangos con guion común: 2024-2026.
//
// Números: solo los reales (+200 páginas, +130 marcas, 13 trabajos
// destacados: 9 tiendas y 4 sistemas). Nada inventado.
// ============================================================================

export const content = {
  identity: {
    name: "Benjamín García",
    firstName: "BENJAMÍN",
    lastName: "GARCÍA",
    role: "Tiendas que venden y sistemas para manejarlas",
    location: "Córdoba, Argentina",
    locationShort: "CBA · AR",
    email: "bmurgarcia@gmail.com",
    phoneDisplay: "+54 9 351 512 2108",
    whatsappNumber: "5493515122108",
  },

  // ── HERO 3D "del caos al sistema" ─────────────────────────────────────
  // El texto cambia con el scroll: primero el dolor, después el negocio
  // ordenado. Al final la cámara entra en la pantalla de la notebook.
  hero: {
    caos: {
      kicker: "Tu negocio hoy",
      titular: "Pedidos por WhatsApp, precios en una planilla, todo en tu cabeza.",
      bajada: "Así, cada venta nueva es más trabajo.",
    },
    sistema: {
      kicker: "Tu negocio, ordenado",
      titular: {
        before: "Una web",
        accent: "que vende",
        after: "y un panel que manejás vos.",
      },
      bajada:
        "Los pedidos llegan ordenados, el stock se actualiza solo y manejás todo desde el celular. Sin plantillas que te limiten ni abonos que te aten.",
      ctaPrimary: "Ordená tu negocio",
      ctaSecondary: "Ver proyectos",
    },
    indicador: "Bajá y mirá cómo se ordena",
    cifras: [
      { valor: "+200", label: "PÁGINAS HECHAS" },
      { valor: "+130", label: "MARCAS" },
      { valor: "13", label: "TRABAJOS DESTACADOS" },
    ],
    cajetin: {
      titulo: "DEL CAOS AL SISTEMA",
      ensamble: "ENSAMBLE",
    },
  },

  // ── LO QUE TE RESUELVO ────────────────────────────────────────────────
  resuelvo: {
    eyebrow: "LO QUE TE RESUELVO",
    titulo: "Lo que te resuelvo",
    intro:
      "Casi nadie busca una web porque sí. La busca por lo que le saca tiempo y plata todos los días.",
    solucionLabel: "CÓMO SE RESUELVE",
    items: [
      {
        id: "mano",
        visual: "chats",
        dolor: "Cargás todo a mano.",
        detalle:
          "El pedido entra por WhatsApp, lo pasás a la planilla, después al stock y después a la tienda.",
        solucion:
          "Cargás una sola vez, en un panel, y se actualiza solo en todos lados. Los pedidos llegan en fila y con su estado.",
      },
      {
        id: "dependencia",
        visual: "planilla",
        dolor: "Para cambiar un precio, dependés de otro.",
        detalle:
          "Una plataforma que te cobra todos los meses o alguien que tarda días en contestar.",
        solucion:
          "Un panel propio y simple: cambiás precios, stock y fotos vos, al momento, desde el celular. Y queda tuyo, sin abonos obligatorios.",
      },
      {
        id: "vidriera",
        visual: "tienda",
        dolor: "Tu tienda es linda, pero no vende.",
        detalle: "La gente entra, mira y se va. Y nadie te dice por qué.",
        solucion:
          "Se ordena como la recorre alguien que está por comprar: qué ve primero, qué le da confianza, dónde duda. Linda y clara, para que el carrito se llene.",
      },
      {
        id: "a-ciegas",
        visual: "diagnostico",
        dolor: "No sabés qué te falta para vender más.",
        detalle: "¿Las fotos? ¿El precio? ¿Que tarda en cargar? Probás cosas a ciegas.",
        solucion:
          "Una revisión completa de tu tienda, con prioridades: qué cambiar primero para que venda más, empezando por lo que más rinde.",
      },
    ],
    // Lo que se lee adentro de cada escena (ilustraciones, no capturas)
    chats: {
      mensajes: [
        "¿Tenés en talle M?",
        "Pasame precio",
        "¿Envían a Rosario?",
        "Quiero 2, ¿cómo pago?",
        "¿Sigue disponible?",
        "Ya transferí",
      ],
      panelTitulo: "Pedidos de hoy",
      contadorLabel: "pedidos",
      nuevo: "Pedido nuevo",
      filas: [
        { cliente: "Lucía R.", detalle: "Remera M x2", estado: "Pagado" },
        { cliente: "Martín G.", detalle: "Buzo L", estado: "A enviar" },
        { cliente: "Flor M.", detalle: "Gorra negra", estado: "Pagado" },
        { cliente: "Nico S.", detalle: "Remera S", estado: "Enviado" },
        { cliente: "Caro D.", detalle: "Combo x3", estado: "Pagado" },
        { cliente: "Agus P.", detalle: "Buzo M", estado: "A enviar" },
      ],
    },
    planilla: {
      celdas: ["precio??", "#REF!", "stock 3?", "VIEJO", "copia (2)", "=SUMA(", "ver", "$$"],
      panelTitulo: "Tus productos",
      columnas: ["Producto", "Precio", "Stock"],
      productos: [
        { nombre: "Gorra negra", precio: "$18.500", stock: "24" },
        { nombre: "Remera lino", precio: "$27.900", stock: "12" },
        { nombre: "Buzo frisa", precio: "$46.000", stock: "8" },
      ],
      precioNuevo: "$19.900",
      guardado: "Guardado",
    },
    tienda: {
      marca: "Tu tienda",
      precio: "$32.900",
      cuotas: "6 cuotas sin interés",
      cta: "Agregar al carrito",
      confianza: ["Envío gratis", "Cambios fáciles", "Pago seguro"],
      carrito: "Carrito",
    },
    diagnostico: {
      titulo: "Revisión de tu tienda",
      items: ["Velocidad de carga", "Fotos de producto", "Carrito", "Ofertas y combos", "Orden de la información"],
      medidor: "LISTA PARA VENDER",
    },
  },

  // ── PROYECTOS ─────────────────────────────────────────────────────────
  // Esta sección se reemplaza después por el carrusel 3D de trabajos.
  // Las capturas van en public/proyectos/ como "/proyectos/archivo.webp".
  // Con `captura: null` se dibuja un marco achurado y funciona igual.
  proyectos: {
    eyebrow: "TODO ESTO ESTÁ ANDANDO",
    title: "Proyectos",
    intro:
      "13 trabajos destacados, 9 tiendas y 4 sistemas, todos en uso hoy. Acá van cuatro, con lo que cambió en cada negocio.",
    bloquesLabel: "QUÉ SE HIZO",
    sinCaptura: "CAPTURA PENDIENTE",
    altCaptura: "Captura del trabajo para",
    pie: "Detrás hay más de 200 páginas para más de 130 marcas. Muchas quedan bajo acuerdo con cada cliente.",
    items: [
      {
        id: "tinte-pro",
        marca: "Shampoo con tinte",
        producto: "Lanzamiento de una marca nueva",
        rubro: "TIENDA · CÓRDOBA",
        descripcion:
          "La página de producto de un lanzamiento: el cliente elige entre cinco tonos, arma combos de una a tres unidades con un color distinto en cada una y paga en cuotas sin interés. Salió a vender desde el primer día.",
        bloques: ["Selector de tonos", "Combos", "Color por unidad", "Cuotas", "Garantía", "Opiniones"],
        captura: "/proyectos/tinte-pro.webp",
      },
      {
        id: "salguero",
        marca: "Salguero Gourmet",
        producto: "Catering para eventos",
        rubro: "SITIO WEB · CÓRDOBA",
        descripcion:
          "Un catering que necesitaba que lo encuentren y le pidan presupuesto sin vueltas. Servicios, fotos y reseñas a la vista, y un cotizador que arma el pedido y lo manda por WhatsApp.",
        bloques: ["Cotizador", "Reseñas", "Galería", "Para empresas"],
        captura: "/proyectos/salguero.webp",
      },
      {
        id: "salguero-admin",
        marca: "Salguero Gourmet",
        producto: "Panel de gestión a medida",
        rubro: "SISTEMA · CÓRDOBA",
        descripcion:
          "El mismo catering, puertas adentro. Clientes, eventos con seña y saldo, gastos, la ganancia real del mes y un medidor del monotributo, en un panel hecho a su medida.",
        bloques: ["Clientes", "Eventos", "Cobros", "Finanzas", "Monotributo"],
        captura: "/proyectos/salguero-admin.webp",
      },
      {
        id: "capileka",
        marca: "Capileka",
        producto: "Suero para el cuero cabelludo",
        rubro: "COSMÉTICA",
        descripcion:
          "Para que se entienda cómo actúa el producto: un dibujo del cuero cabelludo por dentro, con los cuatro puntos donde trabaja, para recorrer uno por uno. La ilustración salió de IA, sin sesión de fotos.",
        bloques: ["Dibujo explicativo", "Pestañas", "Ilustración con IA", "Identidad visual"],
        captura: "/proyectos/capileka.webp",
      },
    ],
  },

  // ── QUÉ MIRO EN UNA TIENDA (criterio de producto) ─────────────────────
  // Los `id` de capas tienen que coincidir con los dibujos de Criterio.tsx.
  criterio: {
    eyebrow: "CRITERIO DE PRODUCTO",
    titulo: "Qué miro cuando armo o reviso una tienda",
    intro:
      "Una tienda que vende se arma en capas. Cada una tiene un trabajo, y si una falla, la venta se pierde aunque el resto esté perfecto.",
    respaldo: "Diseño de producto y conversión, aplicado tienda por tienda.",
    capaLabel: "POR QUÉ VENDE",
    medidorLabel: "CAMINO A LA COMPRA",
    cierre: "Todo junto, eso es una tienda que vende.",
    aria: "Una página de producto que se separa en capas, una por cada cosa que ayuda a vender",
    capas: [
      {
        id: "promesa",
        nombre: "Primer pantallazo y promesa",
        nota: "En segundos se decide si se queda. Arriba va qué es, para quién es y por qué le conviene, dicho como lo diría tu cliente.",
      },
      {
        id: "fotos",
        nombre: "Fotos de producto",
        nota: "La foto vende antes que el texto. Producto real, en uso, con medidas y detalles. Si no hay fotos, se generan con IA, sin sesión.",
      },
      {
        id: "prueba",
        nombre: "Prueba social",
        nota: "Opiniones, fotos de clientes y ventas reales, justo donde aparece la duda. Nadie quiere ser el primero en comprar.",
      },
      {
        id: "oferta",
        nombre: "Oferta y precio",
        nota: "El precio aparece cuando el valor ya quedó claro. Combos de una, dos o tres unidades, con la opción del medio destacada.",
      },
      {
        id: "carrito",
        nombre: "Carrito y upsell",
        nota: "El carrito se abre al costado sin sacarte de la página y sugiere el complemento justo. Cada compra suma un poco más, sin insistir.",
      },
      {
        id: "confianza",
        nombre: "Confianza",
        nota: "Envíos, cuotas, cambios y pago seguro, a la vista y cerca del botón. Contesta el último «¿y si...?» antes de pagar.",
      },
      {
        id: "velocidad",
        nombre: "Velocidad",
        nota: "Es la base de todo. Si la página tarda, la gente se va antes de ver la primera foto. Imágenes livianas y nada que sobre.",
      },
    ],
    maqueta: {
      marca: "TU MARCA",
      cta: "Comprar ahora",
      combos: ["x1", "x2", "x3"],
      upsell: "Sumá el complemento",
      confianza: ["Envío", "Cuotas", "Seguro"],
    },
  },

  // ── SERVICIOS ─────────────────────────────────────────────────────────
  // Los `id` coinciden con las opciones del cotizador (preselección).
  servicios: {
    eyebrow: "SERVICIOS",
    titulo: "Formas de sacarte trabajo de encima",
    intro: "Elegí la que se parece a lo que te pasa. Se afina en la primera charla.",
    cta: "Consultar por esto",
    items: [
      {
        id: "tienda",
        escena: "carrito",
        nombre: "Tiendas y landings que venden",
        claves: ["Shopify", "Tiendanube", "A medida", "Landings"],
        texto:
          "Tu tienda lista para vender desde el primer día, ordenada para que la gente encuentre, entienda y compre. En Shopify, en Tiendanube o hecha a medida: lo que más le convenga a tu negocio.",
      },
      {
        id: "sistema",
        escena: "panel",
        nombre: "Sistemas y paneles a medida",
        claves: ["Catálogos con panel", "Clientes", "Cobros", "Finanzas"],
        texto:
          "Cuando lo enlatado no alcanza, un sistema que sigue tu forma de trabajar: el catálogo que actualizás desde el celular, tus clientes y pedidos en un solo lugar, los cobros y la plata del mes a la vista.",
      },
      {
        id: "optimizacion",
        escena: "velocidad",
        nombre: "Optimización de tu tienda",
        claves: ["Orden", "Velocidad", "Carrito", "Upsell", "Fotos"],
        texto:
          "Si ya tenés tienda, no hace falta tirarla. Se encuentra dónde se pierde la venta y se arregla: el orden de la información, lo que tarda en cargar, el carrito, las ofertas y las fotos.",
      },
      {
        id: "proteccion",
        escena: "escudo",
        nombre: "Protección de tu tienda",
        claves: ["Anticopia", "Accesos", "Seguridad"],
        texto:
          "Que tu competencia no te copie la página en una tarde y que nadie entre donde no debe. Ninguna web es imposible de copiar, pero sí se puede lograr que no valga la pena.",
      },
    ],
    escenas: {
      carrito: { label: "Carrito", total: "3 productos" },
      panel: { label: "Clientes", filas: ["Ana B.", "Diego F.", "Sol V.", "Iván T."] },
      velocidad: { lento: "LENTA", rapido: "AL INSTANTE" },
      escudo: { label: "PROTEGIDA" },
    },
  },

  // ── CÓMO TRABAJAMOS (única sección numerada: el orden es información) ──
  proceso: {
    eyebrow: "CÓMO TRABAJAMOS",
    titulo: "Cómo trabajamos",
    intro: "Sabés qué vas a recibir, cuánto sale y cuándo, antes de poner un peso.",
    pasos: [
      {
        n: "01",
        icono: "chat",
        titulo: "Charla y diagnóstico",
        nota: "SIN COSTO",
        detalle:
          "Me contás cómo vendés hoy y qué te frena. Miro tu tienda o tu forma de trabajar y te digo qué haría. Esta parte no se cobra.",
      },
      {
        n: "02",
        icono: "firma",
        titulo: "Propuesta por escrito",
        nota: "ANTES DE ARRANCAR",
        detalle:
          "Antes de empezar tenés por escrito qué incluye, cuánto sale y en qué plazos. Sin letra chica y sin sorpresas a mitad de camino.",
      },
      {
        n: "03",
        icono: "bloques",
        titulo: "Avances por etapas",
        nota: "LO VES ANDANDO",
        detalle:
          "Se trabaja en etapas cortas y en cada una ves algo funcionando, no una promesa. Si algo no te cierra, se corrige en el momento.",
      },
      {
        n: "04",
        icono: "check",
        titulo: "Entrega y capacitación",
        nota: "QUEDA EN TUS MANOS",
        detalle:
          "Te enseño a usarlo y queda todo andando, para que el día a día no dependa de nadie.",
      },
    ],
    cierre: {
      titulo: "Sin abonos obligatorios.",
      texto: "Lo que te hago queda tuyo. Si un sistema necesita mantenimiento, se acuerda aparte.",
    },
  },

  // ── SOBRE MÍ ──────────────────────────────────────────────────────────
  sobreMi: {
    eyebrow: "SOBRE MÍ",
    frase: "Hablás directo con quien diseña y programa tu tienda.",
    parrafos: [
      "Soy Benjamín García, de Córdoba. Desde 2022 hice más de 200 páginas para más de 130 marcas, en Argentina y afuera: tiendas, landings de producto y sistemas para manejar el negocio.",
      "Estudié programación y diseño de producto. Por eso no alcanza con que funcione: pienso cómo la usa tu cliente y qué lo lleva a comprar. Y conozco cómo se compra acá: cuotas, transferencia, Mercado Pago y envíos a todo el país.",
    ],
    datos: [
      { n: 200, prefijo: "+", label: "páginas hechas" },
      { n: 130, prefijo: "+", label: "marcas" },
      { n: 13, prefijo: "", label: "trabajos destacados" },
    ],
    formacionTitulo: "Formación",
    formacionIntro: "Lo que respalda cada decisión.",
    formacion: [
      {
        id: "unc-ia",
        anio: "2026",
        titulo: "IA y automatización de flujos de trabajo",
        institucion: "Universidad Nacional de Córdoba",
        nota: "Para automatizar lo repetitivo y generar imágenes de producto.",
      },
      {
        id: "uxui",
        anio: "2024",
        titulo: "Diseño UX/UI Avanzado",
        institucion: "Coderhouse, certificado por PedidosYa",
        nota: "Por esto se diseña producto, no solo se programa.",
        destacado: true,
        sello: "DISEÑO DE PRODUCTO",
      },
      {
        id: "fullstack",
        anio: "2024",
        titulo: "Carrera de Desarrollo Full Stack",
        institucion: "Coderhouse",
        nota: "Primero de la camada. La beca se usó para el curso de JavaScript.",
        sello: "1° DE LA CAMADA",
      },
      {
        id: "ciberseguridad",
        anio: "2024",
        titulo: "Ciberseguridad",
        institucion: "Coderhouse, certificado por Delta Protect",
        nota: "Lo que respalda la protección de tu tienda.",
      },
      {
        id: "utn",
        anio: "2022",
        titulo: "Tecnicatura en Programación",
        institucion: "Universidad Tecnológica Nacional",
        nota: "La base técnica de todo lo demás.",
      },
      {
        id: "seguridad",
        anio: "2022",
        titulo: "Seguridad Informática",
        institucion: "educ.ar, Ministerio de Educación",
        nota: "Donde empezó el interés por la seguridad.",
      },
    ],
    herramientasTitulo: "Con qué se hace, y qué cambia en tu día",
    herramientas: [
      { nombre: "Shopify y Tiendanube", para: "Vendés con una plataforma conocida y la manejás vos." },
      { nombre: "Sistemas propios", para: "Paneles y catálogos que cargan al instante y son tuyos." },
      { nombre: "IA generativa", para: "Fotos e ilustraciones de producto sin sesión de fotos." },
      { nombre: "Mercado Pago", para: "Cobros en cuotas, como compra la gente acá." },
      { nombre: "Mapas de calor", para: "Se ve por dónde se va la gente antes de cambiar nada." },
    ],
    recorridoTitulo: "Recorrido",
    recorrido: [
      { anio: "2022-HOY", titulo: "Desarrollo web y ecommerce", lugar: "Freelance, Argentina y exterior" },
      { anio: "2024-HOY", titulo: "Coordinación y producción", lugar: "Role Media" },
    ],
  },

  // ── TESTIMONIOS ───────────────────────────────────────────────────────
  // Con `items` vacío la sección NO se renderiza. No se inventan: cargá el
  // primero real (con permiso) y aparece sola.
  testimonios: {
    title: "Lo que dicen",
    // El tipo va explícito: sin esto, un array vacío se infiere como never[].
    items: [] as { quote: string; autor: string; rol: string }[],
  },

  // ── CONTACTO ──────────────────────────────────────────────────────────
  contacto: {
    eyebrow: "LA PRIMERA CHARLA NO SE COBRA",
    title: "Contame qué necesita tu negocio.",
    intro:
      "Si me pasás el link de tu tienda, la respuesta viene con lo que cambiaría primero, antes de cobrarte nada.",
    respuesta: "RESPONDO EN EL DÍA",
    campos: {
      nombre: "Nombre",
      email: "Email",
      tipo: "Qué necesitás",
      proyecto: "Contame de tu negocio",
      link: "Link de tu tienda o tu web (opcional)",
    },
    placeholders: {
      nombre: "Tu nombre",
      email: "nombre@tunegocio.com",
      proyecto: "Qué vendés, cómo lo manejás hoy y qué te gustaría resolver.",
      link: "tutienda.com",
    },
    wa: {
      saludo: "Hola Benjamín, soy",
      intro: "Te escribo desde tu web para pedir un presupuesto.",
      labelTipo: "Qué necesito:",
      labelEmail: "Email:",
      labelProducto: "Sobre mi negocio:",
      labelLink: "Link:",
      cierre: "Quedo atento. Gracias.",
    },
    opciones: [
      { id: "tienda", name: "Tienda o landing", hint: "SHOPIFY, TIENDANUBE O A MEDIDA" },
      { id: "sistema", name: "Sistema o panel", hint: "CATÁLOGOS, CLIENTES, COBROS" },
      { id: "optimizacion", name: "Mejorar mi tienda", hint: "SOBRE LO QUE YA TENÉS" },
      { id: "proteccion", name: "Proteger mi tienda", hint: "QUE NO TE LA COPIEN" },
      { id: "otro", name: "Otra cosa", hint: "CONTAME QUÉ NECESITÁS" },
    ],
    errores: {
      nombre: "Poné tu nombre así sé con quién hablo.",
      emailVacio: "Necesito un email para responderte.",
      emailInvalido: "Ese email no parece válido.",
      tipo: "Elegí qué necesitás.",
      proyecto: "Contame algo de tu negocio, aunque sean dos líneas.",
      linkInvalido: "Revisá el link, algo como tutienda.com",
    },
    medidorLabel: "COMPLETÁ PARA ENVIAR",
    medidorListo: "LISTO PARA ENVIAR",
    cta: "Enviar por WhatsApp",
    ctaNota: "SE ABRE WHATSAPP CON EL MENSAJE ARMADO",
    exito: {
      titulo: "Listo, se abrió WhatsApp.",
      texto: "Mandá el mensaje y la respuesta llega en el día. Si no se abrió, usá el número de al lado.",
      otra: "Escribir otro",
    },
    directoLabel: "ESCRIBIME DIRECTO",
    comoLabel: "CÓMO TRABAJO",
    como: [
      "La primera charla no se cobra.",
      "Presupuesto por escrito antes de arrancar.",
      "Sin abonos obligatorios: lo que se hace queda tuyo.",
    ],
  },

  // ── FOOTER ────────────────────────────────────────────────────────────
  footer: {
    year: "2026",
    backToTop: "↑ VOLVER ARRIBA",
    colofon:
      "Tiendas que venden y sistemas para manejarlas. Diseñado y programado en Córdoba, para todo el país y el exterior.",
  },

  // ── NAV ───────────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: "Proyectos", href: "#proyectos" },
      { label: "Servicios", href: "#servicios" },
      { label: "Cómo trabajamos", href: "#proceso" },
      { label: "Sobre mí", href: "#sobre-mi" },
    ],
    status: "TOMANDO PROYECTOS",
    aria: "Secciones principales",
  },

  // ── RIEL DE AVANCE ────────────────────────────────────────────────────
  riel: {
    aria: "Avance en la página y acceso a cada sección",
  },

  // Los ids tienen que existir como id de una sección y respetar el orden de
  // app/page.tsx. "testimonios" NO va: mientras esté vacío no se renderiza.
  waypoints: [
    { id: "inicio", label: "INICIO" },
    { id: "resuelvo", label: "LO QUE RESUELVO" },
    { id: "proyectos", label: "PROYECTOS" },
    { id: "criterio", label: "QUÉ MIRO" },
    { id: "servicios", label: "SERVICIOS" },
    { id: "proceso", label: "CÓMO TRABAJAMOS" },
    { id: "sobre-mi", label: "SOBRE MÍ" },
    { id: "contacto", label: "CONTACTO" },
  ],

  // ── SEO ───────────────────────────────────────────────────────────────
  // OJO: cambiar `url` por el dominio real antes de publicar.
  seo: {
    title: "Benjamín García · Tiendas online que venden y sistemas a medida | Córdoba",
    description:
      "Tiendas online que venden y sistemas para manejar tu negocio: Shopify, Tiendanube o a medida, con un panel que manejás vos. Más de 200 páginas para más de 130 marcas, desde Córdoba.",
    keywords: [
      "tienda online Córdoba",
      "Shopify Argentina",
      "Tiendanube",
      "sistema a medida",
      "panel de autogestión",
      "optimización de tienda online",
      "landing de producto",
      "desarrollo ecommerce",
    ],
    url: "https://plataformabensha.vercel.app",
    locale: "es_AR",
    // Microsoft Clarity: id del proyecto de métricas. Vaciar para desactivarlo.
    clarityId: "y1bswh0bh6",
  },

  // Imagen de vista previa (WhatsApp, LinkedIn): app/opengraph-image.tsx
  og: {
    titular: { before: "Una web", accent: "que vende", after: "y un panel que manejás vos." },
    pie: "SHOPIFY · TIENDANUBE · A MEDIDA",
    lugar: "CÓRDOBA · ARGENTINA",
  },
};
