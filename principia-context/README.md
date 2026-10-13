# Principia — paquete de contexto

Actualizado: 2026-10-03, America/El_Salvador.

Este paquete prepara a Codex para convertir el proyecto existente en Principia, un hub de calculadoras para ingeniería y desarrollo de software. Derivadas es el primer módulo. No contiene la aplicación ni afirma que herramientas planificadas o todas las funciones matemáticas estén soportadas.

## Instalación del contexto
1. Descomprime el paquete y copia su contenido en la raíz del repositorio de la calculadora, junto a `package.json`.
2. Si ya existe `AGENTS.md`, integra estas instrucciones conservando las reglas relevantes del proyecto. No lo sobrescribas sin revisarlo.
3. Usa `START-HERE.md` como primera instrucción para Codex. No crees otra aplicación si el repositorio ya existe.

## Mapa de lectura
| Archivo | Responsabilidad |
| --- | --- |
| `AGENTS.md` | Reglas operativas que Codex debe aplicar |
| `docs/01-product.md` | Objetivo, alcance y criterios del producto |
| `docs/02-architecture.md` | Módulos, dependencias, ejecución y rendimiento |
| `docs/03-math-policy.md` | Gramática admitida, dominio y precisión |
| `docs/04-contracts-and-states.md` | Contratos, estados y recuperación |
| `docs/05-design-and-ux.md` | Diseño, interacción y accesibilidad |
| `docs/06-validation.md` | Casos exitosos, parciales, fallidos y regresiones |
| `docs/07-implementation-plan.md` | Orden de trabajo y puertas de aceptación |
| `docs/08-decisions-and-sources.md` | Decisiones propuestas, evidencia y preguntas abiertas |
| `docs/09-hub-foundation.md` | Shell, catálogo, registro, rutas y estados del hub |
| `docs/10-adding-a-calculator.md` | Procedimiento para implementar otra herramienta |
| `docs/fixtures/math-cases.json` | Casos matemáticos de referencia para convertir en pruebas |
| `docs/fixtures/catalog-cases.json` | Escenarios del catálogo y navegación |
| `derivative-redesign-prompt.md` | Brief visual actualizado para Principia y Derivadas |

## Principio de cobertura
No es posible anticipar toda entrada matemática. La aplicación define un subconjunto verificable y una salida segura para lo demás. Un caso desconocido debe convertirse en un estado explicable, no en una respuesta aparentemente correcta.

## Jerarquía de decisiones
La instrucción actual del usuario gobierna el alcance. Estos documentos guían la implementación; la realidad del repositorio determina compatibilidad y comandos. Resuelve conflictos explícitamente y actualiza la decisión correspondiente.

## Estado actual
- Contexto y fixtures: creados.
- Base del hub implementada en el repositorio: catálogo, ruta Derivadas, shell, metadata, filtros y recuperación.
- Motor, dominio, worker y UI de Derivadas conservados; consulte docs08 y las pruebas del repositorio.
- Las cifras de rendimiento y límites son objetivos iniciales, no resultados medidos.

## Cambio de alcance
`/` pasa a ser el catálogo; Derivadas vive en `/calculators/derivatives`. Principia es la marca del header, títulos y metadata. Los nombres técnicos internos pueden seguir usando derivative. La estética oscura de `docs/05-design-and-ux.md` reemplaza la propuesta clara inicial.
