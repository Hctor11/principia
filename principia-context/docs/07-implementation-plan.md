# Plan de implementación

## Incremento actual — base de Principia

Implementado. Evidencia, comandos y limitaciones en docs08; la fase 4 sigue fuera de alcance.
1. Inspeccionar implementación actual y comprobar el flujo de Derivadas; reusar capacidades verificadas en vez de repetir un spike sin necesidad.
2. Aplicar Principia, shell y registro; montar Derivadas en su ruta propia.
3. Construir catálogo, búsqueda/filtros, estados vacíos, 404 y navegación; aplicar la dirección oscura de `docs/05-design-and-ux.md` a ambas páginas.
4. Validar aislamiento y regresiones, documentar extensión y cerrar entrega. No construir nuevas calculadoras.

Las fases siguientes guían Derivadas si le faltan capacidades. No son un requisito de rehacerla ni de implementar órdenes 2–3 para entregar el hub.

## Fase 0 — descubrir y comprobar
Inspeccionar repo, versiones y lockfile. Si no existe código, crear Next.js/TypeScript con el gestor elegido explícitamente; este paquete no requiere ejecutar un scaffold sobre un repositorio existente.

Spike corto en adaptador con polinomio, producto, ln, cociente cancelable y constante:
- Parseo no destructivo conserva restricciones antes de canonicalizar.
- Derivación respecto a x y detección de operadores no resueltos.
- `explain('D', { variable: 'x' })` está disponible en la versión instalada y su resultado corresponde al cálculo.
- Mapeo numérico de MathJSON, sin eval, y preservación del dominio.
- Worker arranca/carga el motor en build de producción y se puede terminar.
- MathLive funciona como Web Component cliente sin errores de SSR/hidratación; Mafs admite el rendering necesario.

Salida: versiones/API comprobadas, mini pruebas reproducibles y decisiones actualizadas. Si faltan pasos, degradarlos de forma explícita. Si no se puede preservar el dominio o derivar correctamente, resolver ese bloqueo antes de construir el flujo.

## Fase 1 — sección vertical funcional
Una pantalla con MathLive, Derivar, resultado exacto, gráficas f/f', controles x y tangente. Estado reducer, snapshot/revisión, errores de entrada, timeout/cancelación. Ejemplo inicial x^3-4x^2+2x.

Primero probar constantes, polinomios y cocientes/huecos; después activar las demás familias verificadas. No anunciar soporte porque el parser simplemente acepte el token.

Salida: primer flujo completo utilizable, tests P0, typecheck/lint/build y recorrido navegador. La interfaz cumple estructura refinada básica; pulir detalles después de la corrección.

## Fase 2 — casos difíciles y explicación
ln/sqrt/tan, composición, mensajes locales de dominio, muestreo discontinuo, resultado parcial si fallan pasos/gráfica, copia con fallback y ejemplos probados. Pasos reales y extensiones limitadas de AST si el motor las requiere.

Salida: matriz de éxito/parcial/error validada. Documentar familias rechazadas y limitaciones conocidas, especialmente análisis conservador de raíces en cero.

## Fase 3 — UX y optimización medida
Diseño responsive, contraste, teclado virtual, lector de pantalla, reduced-motion, layout estable y optimización de cargas/render según perfil real. Assets locales y revisión de dependencias/licencias.

Salida: QA visual, mediciones reproducibles y controles accesibles equivalentes al drag. No agregar memoización/cachés sin un problema medido.

## Fase 4 — órdenes 2–3
Habilitar solo tras confirmar resultado y pasos por orden. Conservar f' para tangente a f; etiquetar orden solicitado. Añadir fixtures de x^3 (f''=6x, f'''=6) y casos parciales si no hay capacidad de gráfica/pasos.

## Definición de terminado
- Flujo principal y recuperaciones funcionan en build de producción.
- Soporte publicado coincide con whitelist y pruebas.
- Ningún hueco se borra al simplificar; ningún caso fallido devuelve éxito ficticio.
- No existen carreras entre entrada, resultado, gráfica e inspección.
- Verificaciones realmente ejecutadas y pendientes quedan reportadas.
- Documentos reflejan implementación, no la intención inicial.

No es necesario terminar las cuatro fases en una sola tarea. El incremento inmediato es la base de Principia y conservación de Derivadas existente, con cierre verificable.
