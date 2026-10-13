# Decisiones, versiones y evidencia

Actualizado: 2026-10-03, America/El_Salvador. Este registro describe el repositorio implementado; las metas futuras del resto del contexto no implican capacidades disponibles.

## Stack conservado

Node 24.21.0, pnpm 12.8.1, Next 16.3.7, React/React DOM 19.2.8, TypeScript 5.9.3, MathLive 0.110.0, Compute Engine 0.141.0, Mafs 0.21.0. Se conserva el lockfile y el motor; no se crea otro proyecto. Fuentes Google Sans y Cal Sans autoalojadas por next/font/google; assets MathLive en `public/mathlive`.

Fuentes de API consultadas: documentación instalada `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/03-api-reference/03-file-conventions/error.md`, `not-found.md`, `01-app/03-api-reference/02-components/link.md`, y tipos/código de los paquetes matemáticos instalados. Next 16.3.7 ofrece `retry` al boundary; se usa esa API en vez de asumir una versión anterior. `prefetch={false}` desactiva precarga del enlace a Derivadas.

## Matemáticas comprobadas y conservadas

- MathLive `MathfieldElement` creado en efecto cliente; `value` produce LaTeX y se sincroniza sin recrear el editor. Listeners y nodo se limpian al salir. Import dinámico; SSR no ejecuta la biblioteca.
- Compute Engine: `ce.parse(input, { form: 'raw' })` conserva AST original. Se extraen guardas antes de derivar/simplificar. No se usa la antigua suposición `canonical: false`.
- Primera derivada: `ce.box(['D', expression.json, 'x']).evaluate()`; pasos reales `expression.explain('D', { variable: 'x' })`, contrastados con el resultado. Reglas conocidas en español; fallback conserva explicación del motor.
- `domain.ts` contiene AST numérico whitelist, validación runtime y evaluador sin eval. MathJSON `Rational` se adapta a división; `InvisibleOperator`, constantes e/Pi, exponentes negativos y Sec de derivadas de tan tienen adaptaciones comprobadas. El dominio original conserva huecos en `x/x`, `0/x` y factores cancelados.
- Worker construido con `new Worker(new URL('./math.worker.ts', import.meta.url))`; arranque máximo 10 s y cálculo 3 s. Editar, limpiar, reemplazar solicitud o desmontar termina worker y timer. ID/revisión descartan respuestas antiguas.
- Mafs dibuja segmentos calculados con 1.001 muestras por curva y cotas conservadoras de intervalos. Vista fija x ∈ [−5,5]; inspección numérica, teclado y arrastre no vuelven a derivar. Error de gráfica preserva fórmula. sqrt en cero conserva punto sin prometer tangente finita.

## Base Principia implementada

| Decisión | Resultado |
| --- | --- |
| Identidad | Principia en shell, metadata y home; Derivadas es nombre del módulo |
| Rutas | `/` catálogo; `/calculators/derivatives` herramienta; desconocidas 404 real |
| Compatibilidad | Solo existía `/`; no se inventan rutas antiguas ni redirecciones |
| Registro | `features/catalog/registry.ts`, unión available con href / planned sin href; IDs/slugs únicos |
| Disponibles | Solo Derivadas; no se muestran planned ni categorías vacías |
| Búsqueda | Texto por título/descripción/tags, normalizado sin acentos/mayúsculas; filtro conjunto; Limpiar |
| Categoría desconocida | Controlador vuelve a Todas; filtros locales, sin query params ni persistencia |
| Shell | `SiteHeader`, `CalculatorShell`, `Recovery`; no lógica matemática compartida |
| Carga | Home no importa motor/editor/gráfica; Mafs CSS se mueve a Graph; enlaces sin prefetch |
| Recuperación | Boundary del módulo con retry, shell visible, 404 y enlace al catálogo; salir cancela cálculo |
| Sesión | Volver a Derivadas comienza sesión nueva; no restaura borrador |
| Extensión | Ruta explícita, feature aislada, política y pruebas; guía docs10 sin framework de plugins |

## Verificación reproducible

`pnpm test`: 44 pruebas Node (39 matemáticas/estado/formato, 5 catálogo). Incluyen constante, polinomio, entradas inválidas, 1/x en cero, huecos, raíces, polos, pasos/resultados, AST inválido, solicitudes antiguas, precisión visual de pendientes pequeñas, rutas reales del registro, search/tag/acentos, categorías inválidas, duplicados, planned y catálogo vacío sintéticos.

`pnpm typecheck`, `pnpm lint`, `pnpm build --webpack`: checks de la entrega. Build produce home, módulo y not-found estáticos. El sandbox impide el subproceso TypeScript `--showConfig`; se ejecuta build fuera de esa restricción. Webpack se usa porque Turbopack no permite abrir su puerto de procesamiento CSS dentro de este entorno; no se migró el stack ni se cambió el script de build por defecto.

`tests/hub-browser.mjs` contra build de producción y Chrome CDP: home → Derivadas → home, directa y refresh, título de navegador, búsqueda normalizada/vacía/sin coincidencias, filtros conjuntos/categoría inválida/Limpiar, enlace por Enter, anchos 360/768/1440, 404 HTTP real y regreso. Cuenta workers y revisa contenido de scripts descargados y red al hover: home no ejecuta ni carga MathLive/Compute Engine/Mafs/worker, sin prefetch. Simula worker pendiente y confirma terminate al salir. Inyecta fallo del setter MathLive durante efecto React y comprueba error de ruta, header utilizable y retry exitoso. La simulación solo induce fallos; no sustituye el motor real en regresiones.

`tests/browser.mjs` verifica el motor real en la ruta del módulo: constante/polinomio/error/1-x y huecos, drag/teclado/campo, pasos y fórmulas renderizados, fórmulas largas con scroll local, reduced motion, estados parciales, timeout y recuperación, 360/768/1440 px. Workers simulados solo para fallos/timeout deterministas.

Capturas: `/tmp/principia-home-{360,768,1440}.png`, `/tmp/principia-derivatives-1440.png`, `/tmp/derivative-redesign-*.png`. Consultar los scripts para pasos exactos y README para puertos/variables de entorno.

## Limitaciones reales

Solo primera derivada y whitelist publicada; sin nuevas calculadoras. Muestreo visual aproximado, sin solución completa del dominio ni zoom/pan. Pasos no siempre traducidos. No se mide p95, memoria o rendimiento en dispositivos físicos; no se afirma auditoría completa de lector de pantalla/WCAG ni teclado virtual en teléfono real. No hay persistencia, backend, cuentas ni modo offline garantizado. El runner Node emite un aviso MODULE_TYPELESS_PACKAGE_JSON sin fallar; no se cambia el formato del proyecto por ese aviso.

## Referencias primarias adicionales

- [MathLive: integración](https://mathlive.io/mathfield/guides/integration/)
- [Compute Engine: cálculo](https://mathlive.io/compute-engine/reference/calculus/)
- [Compute Engine: explicaciones](https://mathlive.io/compute-engine/guides/simplify/)
- [Mafs: puntos móviles](https://mafs.dev/guides/interaction/movable-points)
- [MDN: Worker.terminate](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate)

Las referencias complementan la evidencia de paquetes y pruebas instalados, no sustituyen la aceptación del repositorio.

## Cambio de tipografía Principia

Google Sans 400/500 normal para interfaz; Cal Sans 400 normal para títulos y marca. Exports comprobados en `node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts`, guía instalada `01-app/03-api-reference/02-components/font.md`. Configuración central `app/fonts.ts`; root layout y tokens en globals.css. No fue necesario fallback local ni sustituir familias. No se duplica la configuración en componentes. `adjustFontFallback: false` evita pedir métricas que esta versión no contiene; swap mantiene fallback explícito.

DevTools confirmó glifos reales de ambas familias, controles nativos, español, fórmulas KaTeX y código monoespaciado. Catálogo/módulo, títulos largos y error comprobados a 360/1440 px. Evidencia `/tmp/principia-rendered-fonts.json`; capturas `/tmp/principia-fonts-*.png`. Cal Sans no sintetiza negrita/cursiva. Se conserva layout y cálculo. Diseño docs05 actualizado; recomendación serif reemplazada.

Checks de este cambio: 44 pruebas Node, `pnpm typecheck`, `pnpm lint`, `pnpm build --webpack`, recorrido de Derivadas y recorrido de hub en producción pasaron. La validación de fuentes usó el build final; no se presentaron fuentes fallback como resultado terminado.
