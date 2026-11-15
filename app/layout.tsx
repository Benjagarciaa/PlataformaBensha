import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { content } from "@/content/data";
import { TrazoProvider } from "@/lib/trazo";
import { Fondo } from "@/components/chrome/Fondo";
import { Grano } from "@/components/chrome/Grano";
import { Nav } from "@/components/chrome/Nav";
import { Riel } from "@/components/chrome/Riel";
import { Blindaje } from "@/components/chrome/Blindaje";
import { Analitica } from "@/components/chrome/Analitica";

/* ============================================================
   Fuentes
   Clash Display y Switzer son locales (Fontshare), JetBrains Mono
   viene de Google. Los nombres de `variable` tienen que coincidir
   con lo que espera @theme inline en globals.css.
   ============================================================ */

// Solo los pesos que se usan: cada archivo es una descarga más. Clash va solo
// en semibold (todos los titulares) y es la única precargada: es la fuente del
// titular del hero, el LCP. Así llega con el primer pintado y el titular no se
// redibuja con otra fuente un rato después.
const clash = localFont({
  src: [{ path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" }],
  variable: "--font-clash",
  display: "swap",
  preload: true,
});

// Sin preload: no competir por ancho de banda con el CSS que bloquea el
// render. Con swap, el texto se ve con la fuente de respaldo al instante.
const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

/* ============================================================
   Metadata
   ============================================================ */

export const metadata: Metadata = {
  metadataBase: new URL(content.seo.url),
  title: content.seo.title,
  description: content.seo.description,
  // URL canonica: le dice a Google cual es la direccion oficial de la pagina
  // y evita que trate variantes (con o sin barra, parametros) como duplicados.
  alternates: {
    canonical: "/",
  },
  keywords: content.seo.keywords,
  authors: [{ name: content.identity.name }],
  creator: content.identity.name,
  openGraph: {
    type: "website",
    locale: content.seo.locale,
    url: content.seo.url,
    siteName: content.identity.name,
    title: content.seo.title,
    description: content.seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: content.seo.title,
    description: content.seo.description,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "0HeNu7KdC5VJQgEYX2DyUiZBsWpJ4CCLXCU-eJByWpk",
  },
};

export const viewport: Viewport = {
  // Debe coincidir con --bg de globals.css (metadata no puede leer variables CSS).
  themeColor: "#060d18",
  colorScheme: "dark",
};

/* ============================================================
   Datos estructurados (JSON-LD)
   Le dan a Google contexto de quien es, donde y que ofrece.
   ============================================================ */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: content.identity.name,
  description: content.seo.description,
  url: content.seo.url,
  image: `${content.seo.url}/opengraph-image`,
  email: content.identity.email,
  telephone: `+${content.identity.whatsappNumber}`,
  areaServed: "Argentina y el exterior",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Córdoba",
    addressRegion: "Córdoba",
    addressCountry: "AR",
  },
  founder: {
    "@type": "Person",
    name: content.identity.name,
    jobTitle: content.identity.role,
  },
  knowsAbout: [
    "Tiendas online",
    "Ecommerce",
    "Shopify",
    "Tiendanube",
    "Sistemas a medida",
    "Diseño UX/UI",
    "Optimización de conversión",
  ],
};

/* ============================================================
   Layout
   ============================================================ */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${clash.variable} ${switzer.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--text)]">
        {/* Sin JS no hay escenas vivas: todo queda en su versión estática (sin
            data-escenas en <html>). Esto cubre cualquier estilo inline que
            hubiera quedado de una animación. */}
        <noscript>
          <style>{`[data-anim]{opacity:1!important;transform:none!important}header{background:var(--veil)!important;border-color:var(--hairline)!important}`}</style>
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escapar "<" evita que un valor pueda cerrar el <script> e
            // inyectar markup. Los datos aca son estaticos, pero es barato.
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />


        <TrazoProvider>
          <Blindaje />
          <Analitica />
          <Fondo />
          <Grano />
          <Nav />
          <Riel />
          {children}
        </TrazoProvider>
      </body>
    </html>
  );
}