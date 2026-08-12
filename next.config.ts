import type { NextConfig } from "next";

/**
 * Headers de seguridad para el portfolio (Next.js en Vercel).
 *
 * Sobre la CSP:
 *  - El sitio carga Microsoft Clarity (grabacion de sesiones) y fuentes.
 *    Los dominios de Clarity ya estan en script-src y connect-src; si mas
 *    adelante sumas otro tercero (Analytics, mapas, etc.) hay que agregarlo
 *    ahi o dejara de cargar.
 *  - 'unsafe-inline' en script-src es necesario para los scripts inline que
 *    inyecta Next y para el snippet de Clarity. Para endurecer despues se
 *    puede migrar a CSP con nonce.
 *  - Las fuentes se auto-hospedan en build (next/font), por eso font-src
 *    alcanza con 'self'.
 */

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://c.clarity.ms https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.clarity.ms https://c.clarity.ms https://*.clarity.ms",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
