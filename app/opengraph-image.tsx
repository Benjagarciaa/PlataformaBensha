import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { content } from "@/content/data";

/**
 * Imagen de vista previa para WhatsApp, LinkedIn y demás.
 *
 * Se genera en el build a partir del mismo data.ts que el sitio, así que
 * nunca queda desactualizada respecto del contenido real.
 *
 * OJO con Satori, el motor que la dibuja:
 *  - solo entiende estilos inline y flexbox, nada de Tailwind ni className
 *  - todo div con más de un hijo necesita display: flex explícito
 *  - de fuentes solo acepta .otf, .ttf o .woff. NO lee .woff2, por eso se
 *    carga el .otf de las carpetas de Fontshare y no el woff2 del sitio
 */

export const alt = content.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0A1524";
const SURFACE = "#0F1E31";
const TEXT = "#E8EEF6";
const DIM = "#94A7BF";
const FAINT = "#5A6E88";
const ACCENT = "#4FD4FF";
const HAIRLINE = "rgba(200,224,255,0.14)";

/** Prueba varias rutas y devuelve la primera que exista. */
async function cargarFuente(rutas: string[]) {
  for (const ruta of rutas) {
    try {
      return await readFile(join(process.cwd(), ruta));
    } catch {
      continue;
    }
  }
  return null;
}

function Escuadra({
  pos,
}: {
  pos: "tl" | "tr" | "bl" | "br";
}) {
  const base = {
    position: "absolute" as const,
    width: 26,
    height: 26,
    borderColor: ACCENT,
    borderStyle: "solid" as const,
  };
  const mapa = {
    tl: { top: 28, left: 28, borderWidth: "3px 0 0 3px" },
    tr: { top: 28, right: 28, borderWidth: "3px 3px 0 0" },
    bl: { bottom: 28, left: 28, borderWidth: "0 0 3px 3px" },
    br: { bottom: 28, right: 28, borderWidth: "0 3px 3px 0" },
  };
  return <div style={{ ...base, ...mapa[pos] }} />;
}

export default async function Image() {
  const clash = await cargarFuente([
    "app/fonts/ClashDisplay_Complete/Fonts/OTF/ClashDisplay-Bold.otf",
    "app/fonts/ClashDisplay_Complete/Fonts/TTF/ClashDisplay-Bold.ttf",
    "app/fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Bold.woff",
  ]);

  // Sin esta segunda fuente, Satori dibuja TODO en Clash, incluidas las
  // etiquetas del cajetín, que tienen que verse neutras.
  const switzer = await cargarFuente([
    "app/fonts/Switzer_Complete/Fonts/OTF/Switzer-Medium.otf",
    "app/fonts/Switzer_Complete/Fonts/TTF/Switzer-Medium.ttf",
    "app/fonts/Switzer_Complete/Fonts/WEB/fonts/Switzer-Medium.woff",
  ]);

  const display = clash ? "Clash" : "sans-serif";
  const texto = switzer ? "Switzer" : "sans-serif";

  const fuentes = [];
  if (clash) fuentes.push({ name: "Clash", data: clash, style: "normal" as const, weight: 700 as const });
  if (switzer) fuentes.push({ name: "Switzer", data: switzer, style: "normal" as const, weight: 500 as const });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          padding: 70,
          position: "relative",
          fontFamily: texto,
        }}
      >
        <Escuadra pos="tl" />
        <Escuadra pos="tr" />
        <Escuadra pos="bl" />
        <Escuadra pos="br" />

        {/* fila superior */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: 4,
            color: FAINT,
          }}
        >
          <div style={{ display: "flex" }}>BENJAMIN GARCIA</div>
          <div style={{ display: "flex" }}>CÓRDOBA · ARGENTINA</div>
        </div>

        {/* la tesis */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: display,
              fontSize: 62,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              color: TEXT,
              maxWidth: 880,
            }}
          >
            <span style={{ marginRight: 16 }}>Más de 200 páginas de producto,</span>
            <span style={{ color: ACCENT, marginRight: 16 }}>programadas</span>
            <span>una por una.</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 24,
              lineHeight: 1.5,
              color: DIM,
              maxWidth: 780,
            }}
          >
            Desarrollador de ecommerce y especialista en conversión.
          </div>
        </div>

        {/* el cajetín */}
        <div
          style={{
            display: "flex",
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 26,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {[
              { k: "PÁGINAS", v: "+200" },
              { k: "MARCAS", v: "+130" },
              { k: "MERCADO", v: "AR · EXT" },
            ].map((celda, i) => (
              <div
                key={celda.k}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingLeft: i === 0 ? 0 : 34,
                  paddingRight: 34,
                  borderRight: i < 2 ? `1px solid ${HAIRLINE}` : "none",
                }}
              >
                <div style={{ display: "flex", fontSize: 15, letterSpacing: 3, color: FAINT }}>
                  {celda.k}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 8,
                    fontFamily: display,
                    fontSize: 32,
                    color: TEXT,
                  }}
                >
                  {celda.v}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: SURFACE,
              border: `1px solid ${ACCENT}`,
              padding: "14px 22px",
              fontSize: 17,
              letterSpacing: 3,
              color: ACCENT,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 9,
                height: 9,
                backgroundColor: ACCENT,
                marginRight: 12,
              }}
            />
            SHOPIFY · TIENDA NUBE
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fuentes,
    },
  );
}