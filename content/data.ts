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
  hero: {
    // El título va partido en tres para no depender de un split por string.
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
    telemetry: {
      stats: [
        { label: "PÁGINAS EN PRODUCCIÓN", value: "+200" },
        { label: "MARCAS", value: "+130 · AR Y EXTERIOR" },
        { label: "PLATAFORMAS", value: "SHOPIFY · TIENDA NUBE" },
      ],
      clockLabel: "CÓRDOBA",
      statusLabel: "ESTADO",
      statusValue: "TOMANDO PROYECTOS",
    },
    // Los bloques del wireframe. El orden define el dibujo de arriba hacia abajo.
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
  nav: {
    links: [
      { label: "Proyectos", href: "#proyectos" },
      { label: "Servicios", href: "#servicios" },
      { label: "Presupuesto", href: "#contacto" },
    ],
    status: "DISPONIBLE",
  },
  seo: {
    title: "Benjamin Garcia · +200 páginas de producto para ecommerce | Córdoba",
    description:
      "Desarrollador de ecommerce en Córdoba. Más de 200 páginas de producto programadas para Shopify y Tienda Nube, para 130 marcas en Argentina y el exterior.",
    url: "https://[[dominio]]",
    locale: "es_AR",
  },
};