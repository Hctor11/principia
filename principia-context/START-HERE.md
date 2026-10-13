# Prompt para Codex — base de Principia

Quiero transformar este proyecto en **Principia**, un hub personal de calculadoras para mi ingeniería y mi trabajo como desarrollador de software. Derivadas será la primera herramienta. Las demás las implementaré con el tiempo: ahora quiero la base lista, sin desarrollar más calculadoras.

Lee `AGENTS.md` y los documentos de `docs/`, especialmente `docs/09-hub-foundation.md` y `docs/10-adding-a-calculator.md`. Inspecciona el repositorio y conserva stack, lockfile, arquitectura matemática y comportamientos comprobados. No crees otro proyecto ni reescribas el motor por este cambio.

Implementa:

1. **Identidad:** Principia en header, título del navegador, metadata y textos del producto. Derivadas es el nombre del módulo. No renombres indiscriminadamente símbolos matemáticos o tipos internos.
2. **Inicio:** `/` será un catálogo conciso con título Principia, descripción corta y acceso real a Derivadas. Usa filas editoriales y separadores, sin estadísticas ficticias ni un hero que retrase el acceso.
3. **Navegación:** monta Derivadas en `/calculators/derivatives`, con acceso directo, refresh funcional, enlace al catálogo y breadcrumb Principia / Derivadas. Revisa las rutas antiguas conocidas antes de decidir redirecciones; `/` debe mostrar el catálogo.
4. **Registro:** metadata tipada con id, slug, título, descripción, categoría, tags y estado. Disponible tiene ruta real; planificada no tiene href y aparece separada solo si se decide mostrarla. No inventes calculadoras terminadas.
5. **Catálogo funcional:** búsqueda por título/descripción/tags y filtros por categorías disponibles, con resultados vacíos y acción Limpiar. No muestres filtros vacíos ni controles que no hacen nada. La búsqueda no calcula expresiones.
6. **Separación:** shell y primitivas compartidos; estado, validación, motor y errores dentro de cada feature. El catálogo importa solo metadata y no carga MathLive, Mafs, Compute Engine ni workers. Cada módulo se carga al entrar; desactiva prefetch costoso si el router lo dispara desde el catálogo.
7. **Recuperación:** 404 clara, error boundary del módulo, limpieza de workers al salir y navegación utilizable ante error.
8. **Diseño:** dirección oscura y sobria inspirada en la captura de V7: carbón, texto cálido, Cal Sans regular para títulos, Google Sans para texto y controles, bordes discretos y fórmulas renderizadas. Sigue `docs/05-design-and-ux.md`; ambas páginas deben sentirse parte de Principia.

Documenta cómo añadir una segunda calculadora sin cambiar el shell: feature aislada, política de entradas/precisión, ruta explícita, metadata y pruebas. No construyas plugin framework, formulario universal, backend, login, monorepo ni estado global por anticipación.

Valida home → Derivadas → home, acceso directo y refresh del módulo, búsqueda vacía, categoría inválida, enlaces disponibles, rutas desconocidas, móvil y teclado. Confirma que salir durante cálculo cancela trabajo y que el catálogo no ejecuta el motor. Mantén regresiones de constante, polinomio, entrada inválida y 1/x en cero. Ejecuta checks existentes y build de producción. Captura screenshots si hay navegador; no afirmes verificación visual si no pudiste hacerla.

Implementa la base, no te detengas en una propuesta. Al terminar informa cambios, verificaciones ejecutadas y limitaciones. Actualiza el contexto para reflejar el repositorio final.
