# Instrucciones para Codex — Principia

## Propósito
Construir Principia, un hub personal de calculadoras para ingeniería y desarrollo de software. Derivadas es el primer módulo. Preparar catálogo, navegación y extensión sencilla; conservar diseño refinado y recuperación ante fallos. La corrección matemática tiene prioridad sobre el acabado visual.

## Antes de cambiar código
1. Lee `README.md`, `docs/01-product.md`, `docs/02-architecture.md` y `docs/03-math-policy.md`.
2. Para estados y contratos, lee `docs/04-contracts-and-states.md`; para interfaz, `docs/05-design-and-ux.md`; para verificación, `docs/06-validation.md`.
3. Inspecciona el repositorio real: `package.json`, lockfile, estructura, configuración, instrucciones existentes y pruebas. Estos archivos describen el destino deseado; no prueban que el código ya exista.
4. Sigue `docs/07-implementation-plan.md`. Registra decisiones y capacidades verificadas en `docs/08-decisions-and-sources.md`.

## Reglas de implementación
- Lee `docs/09-hub-foundation.md` y `docs/10-adding-a-calculator.md` para el catálogo y la extensión del hub.
- Marca visible: Principia. Derivadas es la herramienta; no renombres indiscriminadamente tipos internos como `DerivativeOrder`.
- Catálogo en `/`; primera herramienta en `/calculators/derivatives`. Adapta rutas explícitas al router real sin migrarlo por conveniencia.
- Registro central de metadata, sin imports de componentes o motores matemáticos. El catálogo no carga MathLive, Mafs, Compute Engine ni workers.
- Cada herramienta posee sus entradas, validaciones, resultados y estado. Comparte shell y primitivas; no fuerces un formulario o motor universal.
- Disponible significa implementada y verificada con ruta real. Planificada significa sin href, formulario ficticio ni promesa de fecha.
- No importes una feature desde otra. Extrae helpers compartidos únicamente con reutilización real.
- No implementes nuevas calculadoras en esta tarea. Deja categorías y procedimiento de extensión preparados.
- Salir de una calculadora limpia trabajo pendiente. Un error de Derivadas no bloquea catálogo o navegación.
- Conserva las versiones y convenciones existentes salvo incompatibilidad demostrada. Usa el gestor del lockfile; no mezcles npm/pnpm/yarn ni cambies de framework por conveniencia.
- TypeScript estricto. No uses `any` para ocultar contratos o errores. Valida mensajes del worker en runtime.
- Mantén matemáticas independientes de React, del DOM y del motor concreto. Encapsula Compute Engine y MathLive en adaptadores.
- No implementes un CAS propio. El evaluador numérico limitado del AST sí pertenece al producto y debe probarse.
- No uses `eval`, `new Function` ni interpolación de entrada matemática en JavaScript/HTML. No emplees un compilador del motor sin auditar su comportamiento y compatibilidad con CSP.
- Conserva el árbol original antes de canonicalizar/simplificar. Las restricciones del dominio original no desaparecen al cancelar factores.
- No sustituyas fallos por `0`, una fórmula de ejemplo, pasos inventados o una aproximación presentada como derivada exacta.
- Modela éxitos completos, éxitos parciales, rechazo de entrada, error de cálculo y fallo de infraestructura. Una gráfica fallida no invalida una derivada ya calculada.
- Todo trabajo costoso debe estar acotado y cancelable. Un `Promise.race` no interrumpe un cálculo síncrono: termina el worker cuando expire el límite.
- Descarta respuestas obsoletas por identificador de solicitud y revisión de entrada. No apliques resultados a una función distinta.
- La tangente a `f` siempre usa `f'`, aunque el usuario esté inspeccionando `f''` o `f'''`.
- No importes librerías del navegador en componentes de servidor. Verifica hidratación, React Strict Mode y limpieza de listeners/workers.
- Prefiere estado local y reducer explícito. No agregues Redux, backend, cuentas, base de datos o un monorepo sin necesidad demostrada.
- Acceso por teclado y controles numéricos equivalentes al arrastre. Respeta movimiento reducido. No dependas solo del color.
- Escribe pruebas que puedan detectar un error real: dominio, derivación, concurrencia, discontinuidades y recuperación. Evita snapshots masivos o tests que repitan la implementación.
- Actualiza documentos cuando cambien decisiones, alcance, límites o contratos. Si una biblioteca no cumple, informa la limitación y propone una alternativa acotada.

## Para cerrar una tarea
Reporta qué comportamiento cambió, por qué, verificaciones ejecutadas y limitaciones pendientes. Nunca declares una prueba, compatibilidad o rendimiento como verificado si no lo mediste.

## Hechos, propuestas e incertidumbres
Hecho: el usuario eligió Principia como nombre y amplió el producto a un hub de calculadoras para su ingeniería como desarrollador de software. Las demás herramientas se implementarán con el tiempo.
Implementado: Next.js + TypeScript + MathLive + Compute Engine + Mafs, con cálculo local en worker.
Las versiones comprobadas, APIs y límites reales se registran en docs/08-decisions-and-sources.md. Las futuras ampliaciones requieren pruebas propias.
