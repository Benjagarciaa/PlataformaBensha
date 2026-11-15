/**
 * Reglas del modo estatico de Trabajos: sin anillo 3D, una grilla HTML de
 * tarjetas y la misma ficha como modal. Aplica con reduced-motion (por CSS,
 * antes de hidratar), cuando el JS decide que no hay 3D (ahorro de datos, sin
 * WebGL acelerado) y sin JS (via <noscript>, ahi la grilla queda sin ficha).
 * Una sola fuente para los tres casos, igual que en el hero.
 */

const reglas = (s: string) =>
  `${s} .trabajos-pista{height:auto!important}` +
  `${s} .trabajos-3d{display:none!important}` +
  `${s} .trabajos-grilla{display:block!important}`;

export const CSS_ESTATICO =
  reglas('.trabajos[data-modo="estatico"]') +
  `@media (prefers-reduced-motion: reduce){${reglas(".trabajos")}}`;

export const CSS_SIN_JS = reglas(".trabajos");

/**
 * Mientras la ficha esta abierta la pagina de atras no scrollea. El dialogo
 * lleva data-lenis-prevent, asi Lenis no toma la rueda que cae adentro.
 */
export const CSS_FICHA =
  "html:has(dialog.trabajos-ficha[open]){overflow:hidden}" +
  "dialog.trabajos-ficha::backdrop{background:transparent}" +
  "@keyframes trabajos-entra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
  ".trabajos-entra{animation:trabajos-entra .42s cubic-bezier(0.16,1,0.3,1) both}";
