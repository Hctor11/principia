# Diseño e interacción

## Dirección
Principia combina catálogo y herramientas mediante una composición editorial oscura, inspirada en la captura de V7: carbón, texto cálido, títulos Cal Sans regulares, controles sobrios y tipografía matemática legible. La jerarquía nace de alineación, espaciado y contraste. Evitar tarjetas decorativas y animaciones que compitan con el cálculo.

Tokens implementados:
- Fondo #202020; superficie funcional #262626; texto #F3EFE6; texto secundario #B2AFA8; borde #454545. Ámbar #D3AD72, tangente #96938E; contraste sobre fondo/superficie: texto mínimo 6,91:1, curvas mínimo 7,2:1.
- Función clara con trazo continuo; derivada ámbar con trazo discontinuo; tangente gris con contraste comprobado. Color, trazos y etiquetas identifican curvas. Acción primaria clara con texto oscuro.
- Títulos h1/h2/h3, marca Principia y nombres de calculadoras: Cal Sans 400 normal. Texto y UI (párrafos, descripciones, navegación, breadcrumbs, botones, inputs, selectores, etiquetas, mensajes y footer): Google Sans 400 y 500 normal. Esta decisión reemplaza Instrument Serif, Geist e Inter en esos roles. Fórmulas: fuentes propias del renderizador; código: monoespaciada. No afirmar que son las fuentes exactas de V7.
- Espaciado 4/8/12/16/24/32/48 px; separadores 1 px; radios discretos solo en controles/superficies necesarias. Contenido de 1200–1280 px con gutters responsivos.
- Cuerpo de 15 px; ayudas secundarias 12–14 px; búsqueda 15 px. Cifras tabulares para inspección de pendiente.

## Composición
Header compartido con marca Principia enlazada al catálogo. Home: título Principia, una frase sobre calculadoras para ingeniería y lista editorial de herramientas; búsqueda/filtros discretos y funcionales. Sin hero alto, estadísticas inventadas ni categorías vacías. Con una herramienta real, mostrar una herramienta real.

Módulo: breadcrumb Principia / Derivadas, título corto, editor compacto `f(x)=` y acción Derivar. La derivada se muestra sin otra tarjeta anidada. Pasos bajo Ver pasos, inicialmente colapsados; las expresiones se renderizan matemáticamente, no como LaTeX crudo. Ejemplos en menú o acciones secundarias. El catálogo y la calculadora comparten tokens, no el mismo layout de contenido.

Desktop del módulo: gráfica a la izquierda aproximadamente dos tercios, resultado/inspección a la derecha con separador sutil. Móvil: entrada, resultado, gráfica, pasos. Breakpoint según contenido. Medir 360/768/1440 px sin overflow de página; a 1440×900, input y parte útil del gráfico visibles sin scroll. Catálogo: filas legibles con enlaces reales; planned, si se muestra, separado y sin enlace.

No usar un placeholder como sustituto de etiqueta. La fórmula inicial puede ser un ejemplo explícitamente identificado; nunca presentarla como resultado de una entrada aún no calculada.

## Comportamientos esenciales
- Derivación explícita con botón o Enter cuando el editor está en contexto correcto; respetar IME, teclado virtual y comandos internos de MathLive.
- Validación de longitud inmediata; sintaxis final al derivar. Evitar pintar errores agresivos mientras el usuario escribe una expresión incompleta.
- Cargar ejemplo modifica el borrador de forma visible. Confirmar el cálculo mediante Derivar.
- Loading anunciado; deshabilitar únicamente acciones incompatibles. Permitir seguir editando y cancelar solicitud vigente.
- Mover x mediante punto, slider y campo numérico. Campo numérico acepta estados de edición temporales, rechaza valores no finitos y muestra el valor confirmado.
- Si x cae fuera del dominio, conservar x escrito y explicar el problema; no moverlo silenciosamente a un punto distinto.
- Mostrar f(x0), f'(x0) y tangente cuando están disponibles. Campo x acepta puntos fuera de la vista y avisa; acción Restablecer x retorna a 2. No hay Centrar ni zoom/pan.
- Leyenda permite mostrar/ocultar curvas sin recalcular. Restablecer vista no cambia la función.
- Ejes, curva y tangente deben distinguirse por contraste, grosor y etiquetas. No depender de movimiento ni color para explicar la relación.
- Para orden superior, etiqueta inequívoca de la curva adicional y explicación de que la tangente a f sigue usando f'.

## Accesibilidad
Objetivo WCAG 2.2 AA, sujeto a verificación del producto final. Foco visible, orden lógico, controles con nombres accesibles, blancos táctiles recomendados de 44 px, contraste de texto y elementos significativos medido.

Editor con etiqueta y ayuda vinculada; resultados anunciados mediante región polite una vez por cálculo. Errores urgentes de envío pueden usar alert; no repetir anuncios al arrastrar. Ofrecer descripción textual del gráfico y datos del punto, ya que una curva no basta para lector de pantalla. Probar la salida accesible real del renderizador matemático, no asumirla por usar LaTeX.

Comprobar teclado virtual en móvil: no tapa botón/resultado, scroll permite verlo, foco no queda atrapado. Limpiar listeners del Web Component al desmontar y evitar resetear selección por cada render.

## Movimiento
Transiciones de feedback de 150–200 ms en opacidad/pequeños desplazamientos. Interacción tangente/punto sigue directamente x; no aplicar springs o interpolación que hagan divergir pendiente y posición.

Respetar `prefers-reduced-motion`; cambio de resultado puede ser inmediato. Fórmulas y curvas no deben pasar por estados interpolados matemáticamente falsos. Evitar que loading, errores o teclado produzcan grandes saltos de layout.

## Revisión visual
Revisar fórmulas largas, cocientes anidados, constantes 0, mensaje de error de varias líneas, éxito sin pasos, gráfica vacía por dominio y límite de muestras. Scroll horizontal local de una fórmula puede ser necesario, con acceso de teclado y sin desbordar la página.

## Estados del hub
Búsqueda sin resultados incluye Limpiar. Error de módulo ofrece reintento y vuelta al catálogo; el header permanece útil. Categorías sin herramientas disponibles se ocultan. Una idea planificada no recibe acción Abrir. Ver docs/09-hub-foundation.md.

## Implementación y evidencia de tipografía

Configuración única en `app/fonts.ts`: Next 16.3.7 incluye `Google_Sans` y `Cal_Sans` en sus declaraciones instaladas. Se usan esos exports exactos; no Google Sans Flex ni Product Sans. `next/font/google` descarga archivos durante build y los autoaloja. `display: swap`, fallback Arial/sans-serif y `adjustFontFallback: false` porque no hay métricas del fallback para estas familias en el paquete instalado. El build final no emite esos avisos.

Root layout aplica `--font-google-sans` y `--font-cal-sans`. CSS conecta tokens `--font-body` y `--font-heading`, sin autorreferencias. Controles nativos heredan font; no hay CSS Modules ni estilos inline que reasignen las fuentes. Cal Sans solo 400 normal y síntesis desactivada. No se usa selector universal para fuentes; regiones matemáticas y código conservan su tipografía. Se permite quebrar títulos largos para evitar overflow; no se cambian colores, rutas, motor ni composición.

Chrome DevTools `CSS.getPlatformFontsForNode` confirma glifos de Cal Sans / CalSans-Regular y Google Sans 18pt / GoogleSans18pt-Regular (nombre interno de la familia exacta); también dentro de controles nativos. En shadow DOM de fórmulas: KaTeX_Main-Regular y KaTeX_Math-Italic; código monoespaciado confirmado por glifos reales. Prueba española con áéíóúüñ, ¿? y ¡!, títulos largos y errores a 360/1440 px, sin overflow. Capturas en `/tmp/principia-fonts-*.png` y reporte `/tmp/principia-rendered-fonts.json`. No se midió CLS ni se hizo auditoría en dispositivo físico.
