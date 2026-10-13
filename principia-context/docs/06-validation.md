# Validación y regresiones

Verificación implementada: 44 pruebas con el runner de Node, typecheck, ESLint, build Webpack y dos recorridos Chrome CDP (`tests/browser.mjs`, `tests/hub-browser.mjs`). No se instalaron Vitest, Testing Library ni Playwright. Fixtures de orden 2–3 siguen fuera del soporte y no se ejecutan; docs08 separa evidencia y límites.


## Base de Principia
Además de Derivadas, verificar escenarios de `fixtures/catalog-cases.json` y `docs/09-hub-foundation.md`: catálogo, búsqueda, rutas, marca, estados planificados sin enlace y aislamiento.

E2E: `/` → `/calculators/derivatives` → `/`, acceso directo y refresh; ruta desconocida devuelve 404; logo/breadcrumb recuperan navegación. Salir durante cálculo termina worker y descarta respuestas tardías. Un error del módulo no impide abrir catálogo.

Inspeccionar import graph/bundles y Network/Performance en producción: catálogo no carga ni ejecuta motor/editor/gráfica, incluso por prefetch automático. La etiqueta disponible requiere verificar ruta y módulo real. No cambiarla solo para hacer pasar un test del registro.

Este es un plan de pruebas, no un informe de pruebas ejecutadas. `fixtures/math-cases.json` contiene expresiones y expectativas matemáticas; convertir a pruebas usando el adaptador real. No comparar únicamente strings LaTeX: aceptar formas equivalentes usando AST/políticas verificadas y valores de referencia.

## Pirámide útil
- Unitarias: whitelist/complexity, restricciones, evaluador, muestreo y reducer.
- Integración: motor instalado real, parseo no destructivo, derivación/pasos y protocolo worker.
- E2E: experiencia principal, edición durante cálculo, errores recuperables, teclado, móvil y build de producción.

Vitest + Testing Library y Playwright son propuestas si el repo no tiene equivalentes. Reusar herramientas existentes. Scripts esperados después de implementarlos: typecheck, lint, test, test:e2e y build. No documentarlos como disponibles antes de revisar `package.json`.

## Casos matemáticos prioritarios
| Entrada | Resultado equivalente | Caso decisivo |
| --- | --- | --- |
| 7 | 0 | Constante y tangente horizontal |
| x^3-4x^2+2x | 3x^2-8x+2 | x=2: f=-4, f'=-2 |
| x sin(x) | sin(x)+x cos(x) | Producto y pasos |
| sin(x^2) | 2x cos(x^2) | Regla de cadena |
| (x^2+1)/(x+1) | (x^2+2x-1)/(x+1)^2 | Excluir x=-1 |
| 1/x | -1/x^2 | Polo en 0; nunca unir ramas |
| ln(x) | 1/x | No dibujar derivada en x≤0 como parte de esta función |
| sqrt(x) | 1/(2sqrt(x)) | f(0)=0 pero sin tangente finita |
| (x^2-1)/(x-1) | 1 | Hueco original en x=1 |
| x/x; 0/x | 0 | Hueco original en x=0 |
| tan(x) | 1/cos(x)^2 | Polos π/2+kπ |
| sqrt(x^2) | Según soporte verificado | Nunca simplificar a x globalmente |

Para `sqrt(x^2)`, derivada por tramos en 0 puede quedar sin resolver en el motor/whitelist: aceptar rechazo o parcial conforme a la política, nunca una fórmula global equivocada. Las expectativas exactas de fixtures se prueban solo cuando la fase 0 confirma soporte.

## Rechazos y fallos
| Entrada/situación | Expectativa |
| --- | --- |
| Vacío/espacios | EMPTY_INPUT; sin worker de cálculo |
| Fracción incompleta / paréntesis incompleto | INVALID_SYNTAX, conservando entrada |
| y+x | UNSUPPORTED_SYMBOL |
| abs(x), matrices, funciones por tramos | UNSUPPORTED_OPERATOR |
| log(x) sin base | AMBIGUOUS_INPUT |
| x^x | UNSUPPORTED_OPERATOR en política inicial |
| 1/0; 0/0; 0^0 | INVALID_EXPRESSION; no simplificación engañosa |
| sqrt(-1); ln(-1) | INVALID_EXPRESSION en dominio real |
| AST/longitud/exponente excesivo | COMPLEXITY_LIMIT |
| Derivada con D sin resolver | DERIVATIVE_UNRESOLVED |
| exp(1000) en evaluación | Valor no finito; no coordenada infinita |
| Motor lanza excepción | ENGINE_FAILURE y reintento útil |
| Motor se bloquea | TIMEOUT real, worker terminado, siguiente cálculo funciona |
| Pasos fallan, derivada existe | partial, fórmula visible |
| Renderizador gráfico lanza | Error localizado, fórmula y entrada utilizables |
| Worker no carga o mensaje inválido | WORKER_FAILURE / INVALID_MESSAGE |
| Clipboard rechazado | Selección/copia manual; no pierde resultado |

## Concurrencia y ciclo de vida
1. A inicia, B inicia después, A llega tarde: solo B se aplica.
2. Editar durante A cancela A; el resultado anterior no se etiqueta como vigente.
3. Cambiar orden invalida resultado actual; f' y la tangente no se confunden con f''.
4. Limpiar/desmontar cancela timer/worker/listeners; respuestas tardías no cambian estado.
5. Strict Mode montar/desmontar no duplica cálculo ni teclado virtual.
6. Timeout/crash seguido de cálculo correcto usa worker limpio.
7. Cambiar vista dos veces durante muestreo aplica solo la vista vigente.
8. Dos solicitudes con misma revisión no se distinguen solo por revisión: requestId sigue siendo obligatorio.

## Verificación numérica y de dominio
Fixtures incluyen puntos regulares con valores independientes, y puntos excluidos. Diferencias finitas centrales son una segunda señal para funciones suaves y lejos de singularidades; elegir h y tolerancia por escala. No exigir exactitud de coma flotante ni validar dominio con diferencias finitas.

Muestreo: segmentos separados alrededor de 0 para 1/x y de polos de tan; hueco en 1 para cociente cancelado; ln y sqrt no entran al dominio negativo. Pruebas incluyen puntos excluidos que no coincidan con la malla uniforme, para detectar puentes dibujados accidentalmente.

Una restricción desconocida no equivale a dominio completo. Una guarda original es obligatoria aunque la derivada sea constante y evaluable en todo R.

## UX y rendimiento
Probar sin ratón y con controles equivalentes al arrastre. Revisar 360, 768 y 1280 px, zoom de texto 200%, fórmula larga, teclado virtual y reduced-motion. axe puede ayudar, pero no sustituye la revisión manual de foco y fórmulas con lector de pantalla.

Medir build de producción, no solo dev: JS inicial, carga worker, p95 de funciones simples y arrastre. Confirmar que arrastrar no dispara derivación y que teclado/editor siguen respondiendo a una función difícil. Registrar resultados y dispositivo en el documento de decisiones.

## Puerta de aceptación
Para la primera sección: fixtures P0, errores de dominio, races/timeout, accesibilidad básica, typecheck/lint/tests/build y recorrido E2E. Si una herramienta no puede correr, reportar el motivo y la validación alternativa; no declarar aprobación completa.
