# Añadir una calculadora a Principia

Guía de extensión; no ordena implementar otra herramienta ahora.

## 1. Definir el módulo
Elegir una necesidad real, una operación principal y un nombre. Documentar input, unidades, exactitud, límites, output y casos inválidos. Proponer id/slug estables y categoría. Describir al menos un éxito conocido, un límite, un error recuperable y una limitación de precisión.

Ideas posibles, sin compromiso de implementación: bases numéricas, combinatoria/probabilidad, estadística descriptiva o álgebra lineal. Elegir según necesidad del usuario; no asumir que todo su programa académico debe construirse de una vez.

## 2. Implementar feature aislada
```text
features/<tool>/
  ui/
  domain/
  application/       # Solo si necesita coordinación adicional
  infrastructure/   # Solo si integra motores/servicios
app/calculators/<slug>/page.tsx
```

Reusar CalculatorShell, controles, tokens, foco y patrones de errores. La nueva calculadora conserva sus propios tipos y estado; no importa DerivativeCalculator, su reducer ni su worker. Crear únicamente carpetas/archivos que la complejidad real necesite.

No todas necesitan MathLive, gráfica o worker. Una conversión simple puede ser una función pura; un cálculo pesado necesita límites y cancelación. Compartir un helper numérico cuando dos módulos tengan el mismo requisito demostrado, con pruebas de su política de precisión.

## 3. Política específica
Ejemplo hipotético de bases numéricas: especificar bases permitidas, signo, separadores, enteros/fracciones y precisión. Si soporta enteros grandes, definir si usa BigInt y cómo serializa; no reutilizar number si pierde exactitud. Este ejemplo ilustra por qué el AST/CAS de Derivadas no debe ser el motor universal.

Ejemplo hipotético de estadística: definir tamaño máximo de datos, separador decimal, valores ausentes/no finitos, varianza poblacional frente a muestral y precisión. No anunciar soporte sin decidir estas ambigüedades.

## 4. Ruta y registro
Crear ruta explícita y metadata `Título | Principia`, usando el shell compartido. Verificar acceso directo y refresh. Añadir entrada de registro con id/slug únicos, descripción concreta, categoría, tags y href correspondiente.

La disponibilidad se publica en el mismo cambio que implementación y pruebas. Un módulo incompleto queda fuera de disponibles; si necesita documentación de roadmap, status planned no tiene href. No habilitar enlace para una ruta vacía.

## 5. Verificación y cierre
- Resultados de referencia independientes, casos límite y errores con mensajes/recuperación reales.
- Ruta, enlaces del catálogo, búsqueda/filtros y 404.
- Teclado, móvil, fórmula/datos largos, loading y error cuando apliquen.
- Limpieza de recursos al salir si hay trabajo asíncrono.
- Home y otros módulos no reciben imports/estado pesado de la nueva herramienta.
- Regresiones críticas de Derivadas siguen pasando.

Actualizar catálogo, documentación de soporte y decisiones. Reportar checks ejecutados y pendientes. Evitar anunciar exactitud o cobertura universal: cada calculadora publica su política real.

## Archivos reales de esta base

- Crear `features/<tool>/` con UI, estado y funciones propios; la estructura interna depende del problema.
- Crear `app/calculators/<slug>/page.tsx`, `layout.tsx` con metadata y `components/CalculatorShell.tsx`, y `error.tsx` si necesita recuperación localizada. Consultar las APIs instaladas de Next; el boundary actual recibe `retry`.
- Añadir la entrada a `features/catalog/registry.ts`. `available` exige `href: /calculators/<slug>`; `planned` no admite href. La validación rechaza IDs/slugs duplicados y rutas inconsistentes. `tests/catalog.test.ts` confirma además que cada enlace disponible tiene un archivo de página real.
- Añadir resultados independientes y límites a pruebas Node; incluir su archivo en `pnpm test`. Verificar directa/refresh, teclado, móvil y cancelación si aplica. Repetir `tests/hub-browser.mjs` para comprobar que home no carga el nuevo motor, y las regresiones de Derivadas en `tests/browser.mjs`.
- Ejecutar `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build --webpack`. Actualizar docs08 con evidencia real. No registrar disponibilidad hasta tener implementación y aceptación.

No hay directorio `src/` ni `docs/` en la raíz: el contexto vive en `principia-context/docs/`. La política actual de Derivadas usa exactitud simbólica para la fórmula y `number` para gráfica/inspección; otra calculadora debe decidir su propia precisión y unidades.
