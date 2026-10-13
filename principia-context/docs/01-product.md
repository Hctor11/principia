# Producto y alcance

## Resultado que buscamos
Principia reúne herramientas de cálculo para la formación en ingeniería y el trabajo de desarrollo de software. La persona encuentra una herramienta y la abre directamente, con navegación y lenguaje visual consistentes. Derivadas es la primera herramienta; no define el alcance futuro del hub.

Una persona escribe una función y ve su derivada. Al mover x observa el punto `(x, f(x))`, la tangente y el punto `(x, f'(x))` de forma sincronizada. La interacción enseña que la derivada representa la pendiente local.

Usuario inicial: Rivera, estudiante de ingeniería y desarrollador de software; también personas que necesiten estas herramientas. Suposición: UI inicialmente en español. Objetivo adicional: pieza de portfolio frontend con calidad demostrable de diseño y matemática.

## Base del hub para esta entrega
- Principia como marca, shell compartido y catálogo en `/`.
- Derivadas en `/calculators/derivatives`, conservando su flujo existente.
- Registro de metadata sin dependencias de los motores.
- Búsqueda/filtros, estados vacíos, navegación móvil, 404 y recuperación de error del módulo.
- Categorías ampliables y procedimiento para añadir herramientas sin rehacer el shell.
- Una sola calculadora en esta entrega. Las futuras son ideas, no funcionalidades disponibles.

## Alcance inicial de Derivadas
- Una ruta propia con editor matemático, botón Derivar, ejemplos, resultado, gráfica y explicación cuando esté disponible.
- Variable fija `x`, dominio real y trigonometría en radianes.
- Primera derivada: núcleo obligatorio. Orden 2–3: ampliación posterior a validar el núcleo.
- Polinomios, constantes, operaciones aritméticas, cocientes, potencias enteras, sin/cos/tan, exp, ln, sqrt y composiciones dentro de la gramática aprobada.
- Reglas de suma, producto, cociente y cadena proporcionadas por el motor.
- Gráficas de función original y primera derivada, selección de x, pendiente, tangente, leyenda y restablecer vista.
- Errores accionables, timeout, dominio restringido y resultados parciales.
- Copiar fórmula como LaTeX y copiar en formato textual solo si existe un serializador verificado.

No incluir en el MVP: integrales, complejos, matrices, ecuaciones implícitas, parámetros libres, funciones por tramos, cuentas, historial persistente, IA ni backend. `abs`, potencias generales y funciones inversas se reconocen como futuras ampliaciones, no como soporte automático.

Esta exclusión delimita el módulo actual y esta entrega. Principia podrá incorporar después estadística, álgebra, matemática discreta, conversiones o herramientas de ingeniería de software. Cada una necesita requisitos propios. No hay lista de futuras calculadoras confirmada por el usuario.

## Criterios de aceptación del producto
Base: home → Derivadas → home; enlaces directos y recarga del módulo; búsqueda sin resultados recuperable; herramientas futuras sin enlaces falsos; catálogo sin iniciar motor; error del módulo con salida al catálogo. Ver `docs/09-hub-foundation.md`.

Derivadas:
1. `x^3 - 4x^2 + 2x` produce una expresión equivalente a `3x^2 - 8x + 2`; en x=2, f=-4 y pendiente=-2.
2. Arrastrar o escribir x actualiza punto, pendiente y tangente sin volver a derivar.
3. Una constante produce derivada 0 y una recta horizontal, siempre que la función original esté definida.
4. `1/x`, `ln(x)` y `sqrt(x)` muestran límites de dominio sin dibujar puentes engañosos.
5. El resultado sigue disponible si fallan pasos o gráfica, con aviso localizado.
6. Un error conserva la entrada y permite corregir, reintentar o cargar ejemplo.
7. Ningún resultado se etiqueta como actual después de editar su entrada.
8. Editor y controles funcionan por teclado, en pantalla móvil y con movimiento reducido.

## Prioridades
P0 de esta entrega: identidad Principia, catálogo/navegación, aislamiento y regresión del flujo de Derivadas. En Derivadas: resultados correctos, dominio conservado, estados recuperables e interacción accesible.
P1: explicación verificada, acabado visual, orden 2–3, copia y mejores ejemplos.
P2: nuevas calculadoras y familias de funciones, solo con casos y criterios propios. Preparar extensión ahora no implica implementarlas ahora.

## Métricas de evaluación
Medir tiempo hasta obtener el primer resultado, errores recuperados, latencia del arrastre y peso inicial del JS. La telemetría remota no es requisito; registrar estas mediciones localmente durante desarrollo. No almacenar ni transmitir expresiones del usuario por defecto.
