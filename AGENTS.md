<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Reglas del proyecto

## Diseño
`DESIGN.md` es la autoridad final. Paleta, tipografía, radios, z-index, motion y layout
están definidos ahí. Ningún color hardcodeado: todo sale de las variables CSS.

## Contenido
Todo el texto vive en `content/data.ts`. Ningún componente escribe copy adentro.
Sin guiones largos ni medios en texto visible.

## Motion
Un solo requestAnimationFrame global (`TrazoProvider`). Solo se animan `transform` y
`opacity`. Prohibidos los listeners de scroll manuales: se usa `useScroll` de motion,
ScrollTrigger o IntersectionObserver. GSAP solo en Proyectos y Anatomía.

## Alcance
No modificar archivos que no fueron pedidos. Devolver archivos completos, nunca fragmentos.
Si algo en CONTENIDO.md está entre [[ ]], no inventarlo: dejar el placeholder y avisar.