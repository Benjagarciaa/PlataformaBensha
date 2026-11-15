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
// Números: solo los reales (+200 páginas, +130 marcas, 15 trabajos
// destacados: 11 tiendas y 4 sistemas, y el resultado de Tinte Pro: 25 millones
// facturados en un solo día, confirmado por Benjamín). Nada inventado.
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

// ============================================================
// TRABAJOS · copy y media del carrusel 3D
// ============================================================
//
// Reglas (decision del cliente y de cada marca):
//  - Solo el nombre de la marca: NUNCA links ni URLs a las tiendas.
//  - Atlas: no mencionar el barrio. Baron Mens: no mencionar spray ni aceite.
//  - Sin metricas inventadas. La unica cifra de resultado es la de Tinte Pro,
//    que ya figura en el sitio.
//  - Salguero Admin muestra datos de prueba: va aclarado en la ficha.
//
// Media en public/trabajos/<slug>/:
//   miniatura.webp  960x600, la tarjeta de la grilla y el arranque de la ficha
//   textura.webp    512x320, la textura del plano 3D
//   01.webp ...     galeria de la ficha (escritorio 1440 o celular 780 de ancho)
//   video.mp4       video estrella sin audio, con su poster.webp
// Nada de esto se pide hasta que la seccion esta cerca de la pantalla, y la
// galeria y el video solo cuando se abre la ficha.

export type TipoTrabajo = "tienda" | "sistema";

export type ImagenTrabajo = {
  src: string;
  ancho: number;
  alto: number;
  alt: string;
};

export type VideoTrabajo = {
  src: string;
  poster: string;
  ancho: number;
  alto: number;
  /** que se ve, para lectores de pantalla */
  descripcion: string;
};

export type Trabajo = {
  slug: string;
  /** solo el nombre de la marca */
  marca: string;
  /** que parte del trabajo es, o el producto */
  subtitulo?: string;
  rubro: string;
  tipo: TipoTrabajo;
  etiquetas: string[];
  resumen: string;
  logros: [string, string, string];
  queHice: string[];
  conQue: string;
  /** aclaracion honesta sobre lo que se ve */
  nota?: string;
  /** el caso con resultado verificable */
  destacado?: { valor: string; detalle: string };
  /** la otra mitad del mismo cliente */
  par?: string;
  media: {
    miniatura: string;
    textura: string;
    video: VideoTrabajo | null;
    galeria: ImagenTrabajo[];
  };
};

const ruta = (slug: string, archivo: string) => `/trabajos/${slug}/${archivo}`;

const escritorio = (slug: string, n: number, alt: string, alto = 900): ImagenTrabajo => ({
  src: ruta(slug, `0${n}.webp`),
  ancho: 1440,
  alto,
  alt,
});

const celular = (slug: string, n: number, alt: string): ImagenTrabajo => ({
  src: ruta(slug, `0${n}.webp`),
  ancho: 780,
  alto: 1688,
  alt,
});

const lamina = (slug: string, n: number, alt: string): ImagenTrabajo => ({
  src: ruta(slug, `0${n}.webp`),
  ancho: 1600,
  alto: 1000,
  alt,
});

const video = (slug: string, descripcion: string, movil = false): VideoTrabajo => ({
  src: ruta(slug, "video.mp4"),
  poster: ruta(slug, "poster.webp"),
  ancho: 720,
  alto: movil ? 1558 : 450,
  descripcion,
});

const media = (slug: string, v: VideoTrabajo | null, galeria: ImagenTrabajo[]) => ({
  miniatura: ruta(slug, "miniatura.webp"),
  textura: ruta(slug, "textura.webp"),
  video: v,
  galeria,
});

const items: Trabajo[] = [
  {
    slug: "tinte-pro",
    marca: "Tinte Pro",
    subtitulo: "Shampoo de tinte",
    rubro: "Cosmética capilar · Córdoba",
    tipo: "tienda",
    etiquetas: ["Lanzamiento", "Página de producto", "Combos"],
    destacado: { valor: "25 millones", detalle: "de pesos facturados en un solo día" },
    resumen:
      "Era un lanzamiento y la página tenía que vender desde el primer día. La armé completa para que comprar sea fácil: elegís el tono, la cantidad y el color de cada unidad sin salir de la página, con las cuotas, el envío y la garantía a la vista antes del botón. Validó desde el primer día y el producto sigue vendiéndose hoy.",
    logros: [
      "Cinco tonos para elegir, con la muestra de cada color a la vista.",
      "Combos de una a tres unidades eligiendo el color de cada una.",
      "Cuotas sin interés, envío gratis y garantía de 30 días antes de pagar.",
    ],
    queHice: [
      "Página de producto completa",
      "Selector de cinco tonos",
      "Combos con color por unidad",
      "Cuotas, garantía y sellos de pago seguro",
    ],
    conQue: "Página de producto programada a medida, dentro de la tienda.",
    media: media("tinte-pro", null, [
      lamina("tinte-pro", 1, "La página de producto en un celular, con los tonos, los combos y las cuotas"),
      lamina("tinte-pro", 2, "Selector de cinco tonos y combos de una a tres unidades"),
      lamina("tinte-pro", 3, "Color por unidad y oferta de lanzamiento en tres cuotas sin interés"),
      lamina("tinte-pro", 4, "Botón de compra, pago seguro y garantía de 30 días"),
      celular("tinte-pro", 5, "La página completa en el celular"),
    ]),
  },
  {
    slug: "fdt",
    marca: "FDT",
    rubro: "Ropa de gimnasio",
    tipo: "tienda",
    etiquetas: ["Tienda completa", "Shopify", "Vista 360°"],
    resumen:
      "La tienda la había armado el dueño con una plantilla generada con IA y no funcionaba. La rehice desde cero con sus 12 productos: más compacta, más prolija y con una plantilla por producto. En la compu la compra queda fija a la derecha mientras mirás la prenda, y la portada es un perchero donde tocás una remera y sale.",
    logros: [
      "Portada con un perchero de los 12 productos: tocás una prenda y sale.",
      "La remera estrella gira 360° con el scroll y muestra sus detalles.",
      "Combo Llevá 2 con descuento en la segunda unidad, que se aplica solo.",
    ],
    queHice: [
      "Tienda rehecha desde cero",
      "Una plantilla por producto",
      "Perchero interactivo en la portada",
      "Vista 360° con el scroll",
      "Descuentos automáticos",
    ],
    conQue: "Shopify con diseño y código a medida.",
    media: media("fdt", video("fdt", "El perchero de la portada: la prenda sale y se abre su ficha"), [
      escritorio("fdt", 1, "Ficha que se abre al tocar una prenda del perchero"),
      escritorio("fdt", 2, "Vista 360° de la remera de compresión"),
      escritorio("fdt", 3, "Selector Llevá 2 con color y talle por unidad"),
      celular("fdt", 4, "Portada en el celular"),
      celular("fdt", 5, "Inicio del giro 360° en el celular"),
    ]),
  },
  {
    slug: "descartables-catalogo",
    marca: "Descartables Multipacking",
    subtitulo: "Catálogo público",
    rubro: "Mayorista de descartables · Córdoba",
    tipo: "sistema",
    etiquetas: ["Sistema a medida", "Catálogo", "WhatsApp"],
    par: "descartables-panel",
    resumen:
      "Vendían con una tienda online, pero su forma de trabajar no entraba ahí: no publican precios ni usan carrito, todo se consulta. Pasé los 473 productos y sus fotos a un catálogo propio, con un buscador que entiende aunque escribas mal y fichas con fotos y medidas. Cada ficha tiene un botón que abre WhatsApp con el producto ya escrito.",
    logros: [
      "Buscador con sugerencias y fotos mientras escribís, que tolera errores.",
      "Botón de WhatsApp en cada ficha con el mensaje ya armado.",
      "Las 898 fotos de la tienda anterior quedaron a salvo y el catálogo se importó solo.",
    ],
    queHice: [
      "Catálogo de consulta sin carrito",
      "Buscador y categorías en tres niveles",
      "Fichas con galería y ficha técnica",
      "Migración desde Tienda Nube",
      "Alta en Google y Bing",
    ],
    conQue: "Sistema propio hecho a medida, con base de datos y fotos en la nube.",
    media: media(
      "descartables-catalogo",
      video("descartables-catalogo", "Búsqueda con sugerencias, ficha del producto y botón de WhatsApp", true),
      [
        escritorio("descartables-catalogo", 1, "Buscador con sugerencias y fotos mientras se escribe"),
        escritorio("descartables-catalogo", 2, "Ficha de producto con galería y ficha técnica"),
        escritorio("descartables-catalogo", 3, "Accesos por rubro en la portada"),
        celular("descartables-catalogo", 4, "Portada en el celular"),
        celular("descartables-catalogo", 5, "Ficha en el celular con el botón de WhatsApp"),
      ]
    ),
  },
  {
    slug: "solvex",
    marca: "Solvex",
    rubro: "Bienestar y postura",
    tipo: "tienda",
    etiquetas: ["Migración", "Shopify", "Identidad"],
    resumen:
      "Su tienda estaba en Tienda Nube. La pasé a Shopify y la mejoré entera: portada de 11 bloques, catálogo, contacto y una página para el almohadón y otra para la crema. Armé la identidad nueva, del logo a los colores, y regeneré las imágenes con IA con los textos en voseo. Su forma de atacar el dolor y sus animaciones después sirvieron de base para otra marca.",
    logros: [
      "Antes y después que movés con el dedo para ver cómo cambia la postura.",
      "Al agregar el almohadón se abre el carrito con la crema de regalo.",
      "Descuentos por cantidad que se aplican solos, sin cupones.",
    ],
    queHice: [
      "Migración desde Tienda Nube",
      "Identidad: logo, colores y tipografías",
      "Portada, catálogo y contacto",
      "Páginas del almohadón y la crema",
      "Imágenes regeneradas con IA",
    ],
    conQue: "Shopify con diseño y código a medida, con animaciones que siguen el scroll.",
    media: media("solvex", video("solvex", "Antes y después: la línea se arrastra de un lado al otro"), [
      escritorio("solvex", 1, "Antes y después con la línea que se mueve", 851),
      escritorio("solvex", 2, "Carrito lateral con la crema de regalo"),
      escritorio("solvex", 3, "Portada de la tienda"),
      celular("solvex", 4, "Página del almohadón en el celular"),
      celular("solvex", 5, "Página de la crema en el celular"),
    ]),
  },
  {
    slug: "salguero-admin",
    marca: "Salguero Gourmet",
    subtitulo: "Panel de gestión",
    rubro: "Catering · Córdoba",
    tipo: "sistema",
    etiquetas: ["Sistema a medida", "Finanzas", "Uso diario"],
    par: "salguero-landing",
    nota: "Las pantallas muestran datos de prueba: ningún dato real de clientes.",
    resumen:
      "Un catering vive de eventos, señas y saldos, y entre tanto movimiento es fácil perder de vista cuánto se gana de verdad. Le armé a la dueña un panel que usa desde la compu y el celular: carga un evento en segundos, registra la seña y el saldo, y el panel le calcula solo la ganancia real del mes, cuánto le queda del monotributo y qué precios quedaron por debajo del margen.",
    logros: [
      "La ganancia real del mes, calculada sola con el margen de cada evento.",
      "Medidor del monotributo con lo facturado y lo cobrado después.",
      "Un ojo en la barra oculta todos los montos para mostrar la pantalla sin exponer la plata.",
    ],
    queHice: [
      "Clientes y eventos con seña y saldo",
      "Finanzas y comparativa anual",
      "Precios con regla de margen",
      "Gastos por categoría",
      "Buscador y modo privacidad",
    ],
    conQue: "Sistema propio hecho a medida, con acceso privado y base de datos en la nube.",
    media: media(
      "salguero-admin",
      video("salguero-admin", "Modo privacidad: un toque en el ojo oculta y muestra los montos"),
      [
        escritorio("salguero-admin", 1, "Evento con sus cobros, margen y cotización"),
        escritorio("salguero-admin", 2, "Precios con costo total y aviso de margen"),
        escritorio("salguero-admin", 3, "Modo privacidad con los montos ocultos"),
        celular("salguero-admin", 4, "Ganancia del mes y monotributo en el celular"),
        celular("salguero-admin", 5, "Detalle de un evento en el celular"),
      ]
    ),
  },
  {
    slug: "azter",
    marca: "AZTER",
    rubro: "Streetwear · Buenos Aires",
    tipo: "tienda",
    etiquetas: ["Identidad", "Shopify", "Editorial"],
    resumen:
      "Una marca de streetwear nueva, en blanco y negro. Armé la identidad completa, del logo con la estrella a las tipografías, y una tienda editorial con una página por producto que se recorre como una revista. El carrito ya trae el color y el talle elegidos, y el envío se cotiza en vivo al pagar.",
    logros: [
      "Identidad completa: logo con la estrella, colores y tipografías.",
      "Una página por producto, con un recorrido editorial que se revela al bajar.",
      "Envío cotizado en vivo, a domicilio o a punto de retiro, gratis desde $100.000.",
    ],
    queHice: [
      "Identidad de marca",
      "Tienda en Shopify",
      "Cuatro páginas de producto",
      "Carrito con color y talle",
      "Envíos cotizados en el checkout",
    ],
    conQue: "Shopify con diseño a medida y la cotización de envíos en el checkout.",
    media: media("azter", video("azter", "Recorrido editorial por la página de la gorra Atenas"), [
      escritorio("azter", 1, "Página de la gorra Atenas"),
      escritorio("azter", 2, "Las cuatro piezas de la colección"),
      escritorio("azter", 3, "Página de la remera Star"),
      celular("azter", 4, "Portada en el celular"),
      celular("azter", 5, "Gorra Atenas en el celular"),
    ]),
  },
  {
    slug: "capileka",
    marca: "Capileka",
    subtitulo: "Suero para el cuero cabelludo",
    rubro: "Cosmética capilar",
    tipo: "tienda",
    etiquetas: ["Página de producto", "Ilustración con IA"],
    resumen:
      "Lo que hace un suero para el cuero cabelludo pasa por dentro, y eso no se muestra con una foto. Armé un dibujo del cuero cabelludo por dentro con los cuatro puntos donde actúa el producto, y pestañas para recorrerlos uno por uno. La ilustración la generé con inteligencia artificial: cero sesión de fotos.",
    logros: [
      "Los cuatro puntos donde actúa el producto, marcados sobre la ilustración.",
      "Pestañas para recorrerlos uno por uno, sin bajar de más.",
      "Ilustración generada con IA, sin sesión de fotos.",
    ],
    queHice: [
      "Bloque explicativo de la página",
      "Ilustración con IA",
      "Identidad visual",
      "Barra de anuncios",
    ],
    conQue: "Página de producto programada a medida, con ilustración hecha con IA.",
    media: media("capileka", null, [
      lamina("capileka", 1, "La página en un celular junto a la ilustración y las pestañas"),
      lamina("capileka", 2, "Ilustración del cuero cabelludo por dentro con los puntos donde actúa"),
      lamina("capileka", 3, "Pestañas para recorrer cada punto"),
      celular("capileka", 4, "El bloque completo en el celular"),
    ]),
  },
  {
    slug: "descartables-panel",
    marca: "Descartables Multipacking",
    subtitulo: "Panel de carga",
    rubro: "Mayorista de descartables · Córdoba",
    tipo: "sistema",
    etiquetas: ["Sistema a medida", "Desde el celular"],
    par: "descartables-catalogo",
    resumen:
      "La dueña no es técnica y carga todo desde el celular. Le armé un panel a su medida: crear un producto con sus fotos lleva un minuto, las categorías se ordenan como un árbol y el mensaje de WhatsApp del catálogo se edita con vista previa. El inicio le avisa qué productos quedaron sin foto, sin categoría o sin ficha.",
    logros: [
      "Fotos desde la galería o la cámara, achicadas antes de subir.",
      "Avance de lo que falta revisar: sin foto, sin categoría o sin ficha.",
      "Categorías en árbol de hasta tres niveles, con sus acciones a mano.",
    ],
    queHice: [
      "Panel de carga pensado para el celular",
      "Productos, fotos y fichas técnicas",
      "Categorías en árbol",
      "Datos del negocio y mensaje de WhatsApp",
      "Respaldo semanal automático",
    ],
    conQue: "Sistema propio hecho a medida, en el mismo proyecto que el catálogo.",
    media: media(
      "descartables-panel",
      video("descartables-panel", "Carga de un producto desde el celular, con categoría, ficha y fotos", true),
      [
        escritorio("descartables-panel", 1, "Inicio del panel con conteos y pendientes"),
        escritorio("descartables-panel", 2, "Categorías en árbol con sus acciones"),
        celular("descartables-panel", 3, "Inicio del panel en el celular"),
        celular("descartables-panel", 4, "Mensaje de WhatsApp con vista previa"),
        celular("descartables-panel", 5, "Ficha de producto con sus fotos en el celular"),
      ]
    ),
  },
  {
    slug: "bustani",
    marca: "Bustani",
    rubro: "Bienestar en pareja",
    tipo: "tienda",
    etiquetas: ["Migración", "Shopify", "Encuestas"],
    resumen:
      "Pasé la tienda de Tienda Nube a Shopify y la armé completa: portada, catálogo, contacto, carrito lateral y las páginas de seis productos. Rearmé las variantes y los descuentos para que el kit sume los regalos solo, y sumé dos encuestas tipo quiz que reciben a la gente que llega de los anuncios y la llevan al producto.",
    logros: [
      "Portada sin banner: los productos recortados flotan sobre una escena animada.",
      "El kit suma los regalos solo y se paga en 6 cuotas sin interés.",
      "Dos encuestas tipo quiz como puerta de entrada desde los anuncios.",
    ],
    queHice: [
      "Migración desde Tienda Nube",
      "Portada, catálogo y contacto",
      "Páginas de seis productos",
      "Carrito lateral",
      "Encuestas tipo quiz",
    ],
    conQue: "Shopify con diseño a medida y animaciones en código.",
    media: media("bustani", video("bustani", "Portada animada con el almohadón y los regalos"), [
      escritorio("bustani", 1, "Página del almohadón"),
      escritorio("bustani", 2, "Encuesta tipo quiz"),
      escritorio("bustani", 3, "Catálogo de la tienda"),
      celular("bustani", 4, "Portada en el celular"),
      celular("bustani", 5, "Encuesta en el celular"),
    ]),
  },
  {
    slug: "lava-plus",
    marca: "LAVA+",
    rubro: "Limpieza del hogar",
    tipo: "tienda",
    etiquetas: ["Página de producto", "Shopify", "Interactiva"],
    resumen:
      "Un detergente premium tiene que convencerte de que lava mejor antes de que lo pruebes. Armé la portada y la página del producto desde el manual de marca, sin referencias, con juegos que se hacen con el dedo: frotás la remera y la mancha se va. Las imágenes las generé con IA, con antes y después en telas.",
    logros: [
      "Frotás la mancha con el mouse o el dedo y la remera queda limpia.",
      "Escena fija donde la mancha pierde mientras bajás.",
      "Envío gratis y 3 cuotas sin interés siempre a la vista.",
    ],
    queHice: [
      "Portada y página de producto",
      "Juegos interactivos",
      "Imágenes generadas con IA",
      "Diseño desde el manual de marca",
    ],
    conQue: "Shopify con diseño a medida y animaciones que siguen el scroll.",
    media: media("lava-plus", video("lava-plus", "Frotás la remera y la mancha desaparece"), [
      escritorio("lava-plus", 1, "Página del producto"),
      escritorio("lava-plus", 2, "Antes y después de la mancha", 695),
      escritorio("lava-plus", 3, "Los tres usos del producto", 832),
      celular("lava-plus", 4, "Portada en el celular"),
      celular("lava-plus", 5, "Remera limpia después de frotar, en el celular"),
    ]),
  },
  {
    slug: "salguero-landing",
    marca: "Salguero Gourmet",
    subtitulo: "Sitio web",
    rubro: "Catering · Córdoba",
    tipo: "sistema",
    etiquetas: ["Sitio a medida", "Animación", "Presupuestos"],
    par: "salguero-admin",
    resumen:
      "Un catering no vende con carrito: vende cuando le piden presupuesto. Armé una sola página con un único objetivo, que te escriban por WhatsApp. Arranca con una caja de catering que se abre mientras bajás, los productos salen y se rotulan uno por uno, y al final un cotizador arma el pedido y lo manda listo.",
    logros: [
      "Caja que se abre con el scroll y muestra el pedido armado.",
      "Cotizador que arma el mensaje de WhatsApp con el pedido.",
      "Versión quieta para quien prefiere menos movimiento o tiene poca señal.",
    ],
    queHice: [
      "Sitio de una sola página",
      "Escena animada con el scroll",
      "Servicios, galería y preguntas frecuentes",
      "Cotizador por WhatsApp",
    ],
    conQue: "Sitio propio hecho a medida, con la animación dibujada cuadro por cuadro.",
    media: media("salguero-landing", video("salguero-landing", "La caja de catering se abre con el scroll"), [
      escritorio("salguero-landing", 1, "Primer pantallazo con la caja cerrada"),
      escritorio("salguero-landing", 2, "Banda para empresas"),
      escritorio("salguero-landing", 3, "Cotizador que arma el pedido"),
      celular("salguero-landing", 4, "La caja abriéndose en el celular"),
      celular("salguero-landing", 5, "Servicios en el celular"),
    ]),
  },
  {
    slug: "chau-pelo",
    marca: "Chau Pelo",
    rubro: "Mascotas y lavado",
    tipo: "tienda",
    etiquetas: ["Página de producto", "Shopify", "Imágenes con IA"],
    resumen:
      "La marca ya vendía afuera con otro nombre y llegó a la Argentina con un pote nuevo. Armé la portada y la página del producto, y rehice todas las imágenes con IA para que mostraran el pote nuevo. Sumé un juego donde frotás la foto y le sacás los pelos a la ropa, y ofertas en packs de uno, dos y tres potes.",
    logros: [
      "Todas las imágenes rehechas con IA para el pote nuevo.",
      "Juego de frotar la foto para sacarle los pelos a la ropa.",
      "Packs de uno, dos y tres potes con carrito lateral.",
    ],
    queHice: [
      "Portada y página de producto",
      "Imágenes rehechas con IA",
      "Paleta verde, crema y amarillo",
      "Packs y carrito lateral",
    ],
    conQue: "Shopify con diseño a medida.",
    media: media("chau-pelo", video("chau-pelo", "Frotás la foto y se van los pelos"), [
      escritorio("chau-pelo", 1, "Página del producto"),
      escritorio("chau-pelo", 2, "Juego de frotar la foto, ya sin pelos"),
      escritorio("chau-pelo", 3, "Packs de uno, dos y tres potes"),
      celular("chau-pelo", 4, "Portada en el celular"),
      celular("chau-pelo", 5, "Página del producto en el celular"),
    ]),
  },
  {
    slug: "baron-mens",
    marca: "Baron Mens",
    rubro: "Cuidado de la barba",
    tipo: "tienda",
    etiquetas: ["Página de producto", "Shopify", "Adaptación"],
    resumen:
      "Las vitaminas para barba ya vendían afuera con otra marca del mismo dueño. Las adapté al mercado argentino: paleta dorada como el pote, imágenes y pote traducidos al voseo, y una página que toma la forma de atacar el dolor y las animaciones que ya funcionaban en Solvex.",
    logros: [
      "Diagnóstico de la barba por fases sobre un rostro ilustrado.",
      "Ilustración del folículo que muestra qué pasa por dentro.",
      "Todo traducido al voseo, del pote a las imágenes.",
    ],
    queHice: [
      "Portada y página de las vitaminas",
      "Adaptación al mercado argentino",
      "Ilustraciones animadas",
      "Imágenes traducidas",
    ],
    conQue: "Shopify con diseño a medida.",
    media: media("baron-mens", video("baron-mens", "Ilustración del folículo y diagnóstico de la barba por fases"), [
      escritorio("baron-mens", 1, "Página de las vitaminas"),
      escritorio("baron-mens", 2, "Diagnóstico de la barba por fases", 886),
      escritorio("baron-mens", 3, "Tratamientos de uno, dos y tres meses", 829),
      celular("baron-mens", 4, "Portada en el celular"),
      celular("baron-mens", 5, "Página de las vitaminas en el celular"),
    ]),
  },
  {
    slug: "fosters",
    marca: "FOSTERS",
    rubro: "Ropa · Bolivia",
    tipo: "tienda",
    etiquetas: ["Marca nueva", "Shopify", "Pedidos por WhatsApp"],
    resumen:
      "Un short de lino en cuatro colores para vender en Bolivia, sin una referencia de la que partir. Armé el logo, la portada y la página del producto con precios en bolivianos y el habla de allá. Como allá se paga por QR o contra entrega, no hay checkout: el botón abre un formulario que termina en WhatsApp con el pedido armado.",
    logros: [
      "Portada camaleón: el fondo cambia con el color del short.",
      "Formulario que manda el pedido listo por WhatsApp.",
      "Un día con el short que pasa de la mañana a la noche mientras bajás.",
    ],
    queHice: [
      "Logo y favicon",
      "Portada y página de producto",
      "Adaptación al mercado boliviano",
      "Pedidos por WhatsApp",
    ],
    conQue: "Shopify con diseño a medida y pedidos por WhatsApp.",
    media: media("fosters", video("fosters", "Un día con el short de lino, de la mañana a la noche"), [
      escritorio("fosters", 1, "Página del short de lino"),
      escritorio("fosters", 2, "Formulario de pedido que termina en WhatsApp"),
      escritorio("fosters", 3, "Escena de un día con el short", 899),
      celular("fosters", 4, "Portada en el celular"),
      celular("fosters", 5, "Cuatro colores, cuatro planes, en el celular"),
    ]),
  },
  {
    slug: "atlas",
    marca: "Atlas",
    rubro: "Accesorios de gimnasio",
    tipo: "tienda",
    etiquetas: ["Migración", "Shopify", "Identidad"],
    resumen:
      "Vendían straps y muñequeras en Tienda Nube. Pasé la tienda a Shopify con los mismos productos, combos, reseñas y precios, y la rediseñé entera: el logo rehecho limpio, una paleta nueva en rojo y negro, imágenes de producto nuevas con medidas y una portada corta que te lleva al producto según lo que entrenás.",
    logros: [
      "Selector «¿Qué entrenás hoy?» que te recomienda straps o muñequeras.",
      "Imágenes de producto rehechas con IA, con medidas y en voseo.",
      "Las imágenes las cambia el cliente desde Shopify, sin tocar código.",
    ],
    queHice: [
      "Migración desde Tienda Nube",
      "Logo y paleta nueva",
      "Portada a medida",
      "Pie de página y carrito lateral",
      "Imágenes de producto con IA",
    ],
    conQue: "Shopify con diseño y código a medida.",
    media: media("atlas", video("atlas", "Selector «¿Qué entrenás hoy?» que cambia entre straps y muñequeras"), [
      escritorio("atlas", 1, "Página de los straps"),
      escritorio("atlas", 2, "Página de las muñequeras"),
      escritorio("atlas", 3, "Combos con descuento al llevar más", 828),
      celular("atlas", 4, "Portada en el celular"),
      celular("atlas", 5, "Página de los straps en el celular"),
    ]),
  },
];

export const trabajos = {
  eyebrow: "TRABAJOS REALES",
  titulo: "Abrilos y mirá cómo funcionan.",
  intro:
    "Tiendas que venden y sistemas para manejarlas. Cada uno es un trabajo real, con el nombre de su marca: tocá uno y mirá cómo funciona por dentro.",
  pie: "Acá muestro quince. Detrás hay más de doscientas páginas, pero la mayoría quedan bajo acuerdo con cada cliente.",

  carrusel: {
    region: "Carrusel de trabajos",
    roledescription: "carrusel",
    ayuda: "Arrastrá o bajá para girar · Tocá una para abrirla",
    ayudaMovil: "Deslizá para girar · Tocá para abrir",
    anterior: "Girar al trabajo anterior",
    siguiente: "Girar al trabajo siguiente",
    abrir: "Abrir la ficha de",
    destacado: "MEJOR CASO",
  },

  tipos: { tienda: "Tienda", sistema: "Sistema" } satisfies Record<TipoTrabajo, string>,

  ficha: {
    dialogo: "Ficha del trabajo",
    cerrar: "Cerrar la ficha",
    anterior: "Trabajo anterior",
    siguiente: "Trabajo siguiente",
    de: "de",
    logros: "Qué se resolvió",
    queHice: "Qué hice",
    conQue: "Con qué",
    etiquetas: "Etiquetas",
    galeria: "Galería",
    verMedia: "Ver",
    videoMiniatura: "Video",
    pausar: "Pausar el video",
    reproducir: "Reproducir el video",
    mediaAnterior: "Imagen anterior",
    mediaSiguiente: "Imagen siguiente",
    verPar: "Ver la otra parte",
    arrastrar: "Deslizá hacia abajo para cerrar",
  },

  items,
};

export type TextosTrabajos = typeof trabajos;
