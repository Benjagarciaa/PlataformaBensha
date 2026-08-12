import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";
import { content } from "@/content/data";
import { TrazoProvider } from "@/lib/trazo";
import { LenisProvider } from "@/components/chrome/LenisProvider";
import { Grilla } from "@/components/chrome/Grilla";
import { Grano } from "@/components/chrome/Grano";
import { Nav } from "@/components/chrome/Nav";
import { Blindaje } from "@/components/chrome/Blindaje";
import { RielScroll } from "@/components/plano/RielScroll";

/* ============================================================
   Fuentes
   Clash Display y Switzer son locales (Fontshare), JetBrains Mono
   viene de Google. Los nombres de `variable` tienen que coincidir
   con lo que espera @theme inline en globals.css.
   ============================================================ */

const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  // Sin preload: no competir por ancho de banda con el CSS que bloquea el
  // render. Con swap, el texto se ve con la fuente de respaldo al instante.
  preload: false,
});

const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500"],
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
  keywords: [
    "landing page Shopify",
    "página de producto",
    "ecommerce Córdoba",
    "Shopify Argentina",
    "Tienda Nube",
    "diseño de landing",
    "optimización de conversión",
    "copywriting ecommerce",
    "tienda online Argentina",
    "desarrollador ecommerce",
  ],
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
  themeColor: "#0A1524",
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
    "Desarrollo web",
    "Ecommerce",
    "Shopify",
    "Tienda Nube",
    "Páginas de producto",
    "Páginas que venden",
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
        {/* Sin JS, motion deja todo en su estado initial (opacity 0).
            Esto fuerza visibilidad para que la página se lea igual. */}
        <noscript>
          <style>{`[style]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escapar "<" evita que un valor pueda cerrar el <script> e
            // inyectar markup. Los datos aca son estaticos, pero es barato.
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* Microsoft Clarity: mapas de calor y grabaciones. */}
        {content.seo.clarityId ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${content.seo.clarityId}");`}
          </Script>
        ) : null}

        <TrazoProvider>
          <LenisProvider>
            <Blindaje />
            <Grilla />
            <Grano />
            <Nav />
            <RielScroll />
            {children}
          </LenisProvider>
        </TrazoProvider>
      </body>
    </html>
  );
}