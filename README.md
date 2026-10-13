# Principia

Hub personal de calculadoras para ingeniería y desarrollo de software, en español. El catálogo vive en `/`; Derivadas, la única herramienta disponible, en `/calculators/derivatives`. La entrada MathLive se calcula localmente en un Web Worker con Compute Engine; Mafs representa f, f′ y la tangente. El dominio original se conserva antes de simplificar.

## Desarrollo y verificaciones

Este repositorio utiliza pnpm 12.8.1. No requiere backend.

```sh
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build --webpack
pnpm start
```

Las pruebas usan el runner de Node, verificado con Node 24.21.0. El flag de aislamiento evita un fallo del subproceso del runner en el entorno de trabajo. El build por defecto conserva Turbopack; la verificación aquí usa Webpack porque Turbopack no puede abrir su puerto de procesamiento CSS en este entorno. Google Sans (400/500 normal) y Cal Sans (400 normal) se configuran en `app/fonts.ts` mediante los exports exactos de `next/font/google` en Next 16.3.7. El build descarga y autoaloja esas fuentes; el navegador las recibe del propio sitio. No necesita conexión con Google en runtime. Las fuentes MathLive están en `public/mathlive` con su licencia.

Para el recorrido de navegador, inicia el build de producción en el puerto 3000 y Chrome con depuración remota en 9222:

```sh
google-chrome --headless --remote-debugging-port=9222 --user-data-dir=/tmp/derivative-browser about:blank
node tests/browser.mjs
```

Esta prueba requiere acceso a esos puertos locales y deja capturas de 360, 768 y 1440 px en `/tmp/derivative-redesign-*.png`. Comprueba entrada, worker real, gráfica, selección de x, errores, cancelación y recuperación de timeout; usa un worker simulado únicamente para provocar el timeout de forma determinista.

## Alcance

Números reales y x; operaciones aritméticas, potencias enteras constantes, sin/cos/tan, ln, sqrt y exponenciales e^u. Solo primera derivada. Los pasos proceden del motor, renderizan sus fórmulas con MathLive y traducen los IDs conocidos al español; las demás reglas conservan la descripción del motor. El resultado se identifica como anterior después de editar la entrada. Si la adaptación numérica falla, se conserva la fórmula exacta con aviso.

La vista gráfica es fija en x ∈ [−5, 5], con 1.001 muestras por curva; el rango y inicial incluye el punto inspeccionado x=2 cuando es finito y está dentro del límite de muestreo. Las guardas y cotas de intervalos separan segmentos alrededor de restricciones conocidas, incluso fuera de la malla; el muestreo sigue siendo una aproximación conservadora. No hay zoom/pan, solución completa de dominios, traducción completa de pasos, historial, órdenes superiores ni garantía de rendimiento medida. La tangente en ceros de raíces se oculta de forma conservadora.

Contexto y evidencia: `principia-context/docs/08-decisions-and-sources.md`. Las decisiones propuestas del contexto no equivalen a capacidades verificadas; consulta ese registro para las diferencias reales.

## Rediseño oscuro

Interfaz en español con títulos Cal Sans, editor compacto, ejemplos en menú, gráfica izquierda y resultado/inspección derecha; en móvil, resultado antes de gráfica y pasos al final. La ayuda contiene restricciones y límites. Paleta, ratios de contraste medidos y aceptación están en `principia-context/docs/05-design-and-ux.md`.

`tests/browser.mjs` reutiliza la conexión CDP de `tests/browser-support.mjs`. Además del flujo matemático, comprueba pasos renderizados, fórmulas largas con scroll local por teclado, reduced motion, estados parciales simulados y distribución responsive. Si el servidor de prueba usa otro puerto, configura `DERIVATIVE_TEST_URL`, por ejemplo `DERIVATIVE_TEST_URL=http://localhost:3001/calculators/derivatives node tests/browser.mjs`.

## Base del hub

`components/SiteHeader.tsx`, `CalculatorShell.tsx` y `Recovery.tsx` comparten navegación, presentación y recuperación. El catálogo solo importa metadata y búsqueda en `features/catalog/registry.ts`; los enlaces a módulos usan `prefetch={false}`. MathLive, Mafs (incluido su CSS), Compute Engine y el worker se cargan desde Derivadas. No había rutas antiguas adicionales: `/` ahora muestra el catálogo y no tiene redirección.

La búsqueda ignora acentos y mayúsculas; título, descripción y tags se combinan con la categoría. Solo hay filtros de categorías disponibles. Categorías desconocidas vuelven a Todas. No se muestran herramientas planificadas. El borrador de Derivadas se descarta al salir; el worker activo se termina. El error boundary usa `retry`, según la API instalada de Next 16.3.7.

Pruebas del hub con Chrome CDP y el servidor iniciado:

```sh
PRINCIPIA_TEST_URL=http://localhost:3001 node tests/hub-browser.mjs
DERIVATIVE_TEST_URL=http://localhost:3001/calculators/derivatives node tests/browser.mjs
```

Capturas del catálogo: `/tmp/principia-home-{360,768,1440}.png`. La guía real para añadir una feature, su política de precisión, ruta, metadata y pruebas está en `principia-context/docs/10-adding-a-calculator.md`. No se modifica el shell ni el motor de Derivadas para registrar otra herramienta.

## Tipografía Principia

Google Sans para texto, navegación, breadcrumbs, controles, etiquetas, mensajes y footer; Cal Sans regular para h1/h2/h3, marca y nombres de herramientas. Variables independientes `--font-google-sans` y `--font-cal-sans`, conectadas a `--font-body` y `--font-heading`. Ambas usan swap y fallback Arial/sans-serif. Se desactiva `adjustFontFallback` porque esta versión no contiene métricas de ajuste para ambas familias; no se afirma ausencia de desplazamiento durante swap. Cal Sans usa `font-synthesis: none`. MathLive conserva KaTeX y el código conserva su stack monoespaciado. Los archivos antiguos de fuentes locales permanecen sin imports ni cargas.

Verificación: DevTools `CSS.getPlatformFontsForNode`, incluyendo shadow DOM de MathLive y controles nativos, confirma CalSans-Regular, GoogleSans18pt-Regular, KaTeX_Main/KaTeX_Math y código monoespaciado. Evidencia en `/tmp/principia-rendered-fonts.json`; capturas `/tmp/principia-fonts-*.png`. Se probaron español, títulos largos y errores a 360/1440 px. Esta elección reemplaza la recomendación de títulos serif.
