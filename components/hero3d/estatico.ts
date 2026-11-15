/**
 * Reglas del modo estatico del hero 3D: sin canvas, el sistema armado en SVG y
 * el texto en su estado final. Aplica con reduced-motion (por CSS, antes de
 * hidratar), cuando el JS decide que no hay 3D (ahorro de datos, sin WebGL) y
 * sin JS (via <noscript>). Una sola fuente para los tres casos.
 */

const reglas = (s: string) =>
  `${s}{height:auto}` +
  `${s} .hero3d-pin{position:relative;height:auto;min-height:100svh}` +
  `${s} .hero3d-solo-animado{display:none!important}` +
  // el titular del caos queda para lectores de pantalla: sigue siendo el h1
  `${s} .hero3d-caos{position:absolute!important;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}` +
  `${s} .hero3d-sistema{opacity:1!important;transform:none!important}` +
  `${s} .hero3d-contenido{min-height:100svh}` +
  `${s} .hero3d-svg{display:block}`;

export const CSS_ESTATICO =
  reglas('.hero3d[data-modo="estatico"]') +
  `@media (prefers-reduced-motion: reduce){${reglas(".hero3d")}}`;

export const CSS_SIN_JS = reglas(".hero3d");
