# Arquitectura

## Forma general
Un único frontend modular para Principia. Next.js mantiene shell, metadata y catálogo en servidor con una isla cliente ligera para búsqueda/filtros; cada calculadora tiene ruta e isla cliente propias. El cálculo simbólico de Derivadas vive en un Web Worker. No hay API de cálculo ni base de datos en el MVP. Si el repo usa otro router, aplicar estas responsabilidades sin migrarlo automáticamente.

Registro central de metadata serializable, sin imports de componentes o motores. La home no inicia workers ni importa librerías de Derivadas. Shell y catálogo se describen en `docs/09-hub-foundation.md`; los contratos matemáticos de este documento pertenecen a Derivadas.

| Capa | Responsabilidad | Dependencias permitidas |
| --- | --- | --- |
| UI | Editor, resultado, controles y estados accesibles | Application, contratos, adaptadores visuales |
| Application | Reducer, solicitudes, cancelación, revisiones, coordinación | Domain, puerto de worker |
| Domain | Tipos, AST numérico, validación, dominio, muestreo | TypeScript y Math; sin React/DOM/CAS |
| Infrastructure | Adaptador del motor, worker, MathLive y Mafs | Bibliotecas externas y contratos |

El código de dominio no importa infraestructura. Evita que `BoxedExpression`, nodos de MathLive o tipos internos de Mafs se filtren a los componentes del producto.

## Organización implementada

```text
app/{layout.tsx,page.tsx,globals.css,not-found.tsx}
app/calculators/derivatives/{layout.tsx,page.tsx,loading.tsx,error.tsx}
components/{SiteHeader,CalculatorShell,Recovery}.tsx
features/catalog/{registry.ts,Catalog.tsx}
features/derivative/{Calculator,MathEditor,MathFormula,Graph,Steps}.tsx
features/derivative/{engine,domain,format,state,math.worker}.ts
tests/{math.test.ts,catalog.test.ts,browser.mjs,hub-browser.mjs,browser-support.mjs}
principia-context/docs/
```

La separación de responsabilidades es lógica, sin carpetas vacías por capa. `registry.ts` solo contiene metadata y funciones puras. El CSS Mafs se importa desde Graph, no desde el layout global. `CalculatorShell` vive en el layout del módulo y permanece visible ante errores de la página.

## Flujo de cálculo
Flujo de Derivadas, no un contrato universal de todas las calculadoras.
1. Editor produce LaTeX y nueva `inputRevision`; la entrada en borrador no sustituye el resultado confirmado.
2. Derivar envía un snapshot inmutable con requestId, revisión, variable y orden.
3. Worker verifica longitud, parsea sin canonicalización destructiva, inspecciona árbol y símbolos, valida complejidad y política.
4. Extrae restricciones del AST original. Después deriva y simplifica en un contexto simbólico limpio.
5. Adapta expresiones originales y derivadas a AST numérico limitado; los errores de esa adaptación degradan la gráfica, no el resultado simbólico.
6. Devuelve solo DTO serializables. Se validan en el cliente; se aplican únicamente al requestId/revisión vigente.
7. La gráfica evalúa el AST admitido y restricciones; mover x no parsea ni deriva otra vez.

## Aislamiento y ciclo del worker
- Un worker activo por instancia de Derivadas; un trabajo simbólico a la vez. Solicitud nueva cancela la anterior y recrea el worker si sigue ocupado. Volver al catálogo o cambiar de módulo termina los recursos de la instancia.
- Timer en el hilo principal: al vencer, `terminate()`, rechazar la solicitud, limpiar timers/listeners y permitir reintento con worker nuevo.
- No confiar en un mensaje de cancelación mientras el worker ejecuta código síncrono. AbortSignal por sí solo no interrumpe el motor.
- Separar tiempo de arranque del worker del tiempo de cálculo; ambos deben tener límites y estados propios.
- Implementar `error`, `messageerror`, desmontaje y limpieza en Strict Mode. No crear workers durante SSR/render.
- No transferir clases, closures o instancias del motor; usar arrays/objetos/números/string. No hacer `assign('x', x0)` sobre la instancia usada para derivación.
- Si la integración worker/motor falla, documentar el bloqueo. No mover automáticamente todo el cálculo pesado al hilo principal.

## Evaluación y gráficas
Evaluador puro de una whitelist pequeña de AST serializable. Es un intérprete numérico de operaciones elementales, no un motor simbólico. Toda operación comprueba valores reales, finitos y dominio antes de producir un punto.

Muestreo fijo de 1.001 puntos por curva, con cotas conservadoras por intervalo. No hay refinamiento adaptativo ni navegación de vista. No remuestrear curvas al cambiar únicamente x. Cortar segmentos al cruzar restricciones conocidas o cuando el refinamiento no puede establecer continuidad con confianza. El muestreo es una aproximación visual, no una prueba de continuidad o de dominio completo.

Encapsular Mafs: comprobar cómo representar segmentos separados y huecos. No asumir que `Plot.OfX` resuelve automáticamente todas las discontinuidades. Si una evaluación/sampling es costosa, mover ese trabajo al worker mediante trabajo separado con `resultId` y `viewportRevision`.

## Estado y rendimiento
- Reducer local para sesión de cálculo; estado local de alta frecuencia para x/vista/leyenda. Evitar rerender del editor y pasos en cada frame de arrastre.
- `requestAnimationFrame` puede agrupar actualizaciones visuales; texto accesible no se anuncia 60 veces por segundo.
- Cargar editor, gráfica y motor según uso desde fronteras cliente. Verificar build de producción e hidratación; no copiar APIs de imports dinámicos sin revisar la versión de Next.js.
- Reusar evaluación y muestreo del resultado vigente. Caché simbólica opcional posterior, LRU de máximo 20 entradas, clave con entrada original normalizada sin perder restricciones + orden + versión/política del motor.
- Localizar fuentes y assets de MathLive; una vez cargados, el cálculo no necesita red. Esto no promete una PWA ni recarga offline.

## Límites implementados
Aplicados en engine/domain y ciclo de Calculator; ajustar solo con pruebas.

| Límite | Implementación |
| --- | --- |
| Entrada LaTeX | 2.000 caracteres antes de parsear |
| AST | 500 nodos, profundidad 32 |
| Orden | Solo 1; órdenes superiores fuera de alcance |
| Magnitud de exponentes enteros | 100 |
| Arranque del worker | 10 s |
| Trabajo simbólico | 3 s desde confirmación de arranque |
| Pasos visibles | 100; señalar truncamiento |
| Muestras por curva/vista | 1.001; aproximación con vista fija |

Metas, no garantías: p95 del cálculo sencillo <500 ms con worker listo; feedback de controles <100 ms; arrastre cercano a 60 fps en equipo de referencia. Registrar navegador, build, dispositivo, función y metodología; no prometer esos valores sin medir.
