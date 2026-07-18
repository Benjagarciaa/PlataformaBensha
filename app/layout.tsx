import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { content } from "@/content/data";
import { TrazoProvider } from "@/lib/trazo";
import { LenisProvider } from "@/components/chrome/LenisProvider";
import { Grilla } from "@/components/chrome/Grilla";
import { Grano } from "@/components/chrome/Grano";
import { Nav } from "@/components/chrome/Nav";
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
});

const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/* ============================================================
   Metadata
   ============================================================ */

export const metadata: Metadata = {
  metadataBase: new URL(content.seo.url),
  title: content.seo.title,
  description: content.seo.description,
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
};

export const viewport: Viewport = {
  themeColor: "#0A1524",
  colorScheme: "dark",
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

        <TrazoProvider>
          <LenisProvider>
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