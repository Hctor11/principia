# Política matemática

Implementación actual: primera derivada solamente; entrada MathLive LaTeX sin parser ASCII adicional. Precisión simbólica del motor en la fórmula y IEEE 754 number para gráfica/inspección. Vista fija y 1.001 muestras por curva; no hay solución completa del dominio. Límites y evidencia en docs08.


Esta política pertenece a Derivadas de Principia. No impone x, LaTeX, radianes ni CAS a otras calculadoras. Cada herramienta futura documentará sus entradas, unidades, precisión y restricciones antes de anunciarse disponible.

## Semántica pública
Solo expresiones escalares reales en x. Radianes. `ln` es logaritmo natural. `log` sin base se rechaza por ambiguo y sugiere `ln`. Constantes numéricas, pi y e son admitidas si el adaptador identifica inequívocamente sus nodos; otros símbolos se rechazan, no se sustituyen por 0.

La entrada oficial del cálculo es LaTeX producido por MathLive. Texto pegado pasa por una normalización explícita que se prueba por separado; no asumir que el parser LaTeX entiende cualquier sintaxis ASCII. La ayuda muestra ejemplos y la interpretación antes de calcular. No aceptar ecuaciones `f(x)=...`, asignaciones ni varias expresiones en un único cálculo en el MVP.

## Subconjunto inicial
| Familia | Admitida | Restricciones |
| --- | --- | --- |
| Números y x | Sí | Reales finitos; constantes del motor mapeadas explícitamente |
| Suma/resta/producto/cociente | Sí | Denominador distinto de 0 en el árbol original |
| Potencias | Enteras con exponente constante | Negativas excluyen base 0; rechazar 0^0 |
| sqrt(u) | Sí | u≥0 para f; u>0 como condición conservadora para tangente salvo análisis probado |
| ln(u) | Sí | u>0 |
| exp(u), e^u | Sí | e^u debe normalizarse explícitamente; overflow es fallo numérico local |
| sin/cos/tan | Sí | Radianes; tan excluye polos donde cos(u)=0 |
| Composición | Sí | Cada subexpresión original debe cumplir su restricción |
| abs, piecewise, parámetros, complejos | No inicialmente | Explicar limitación; no afirmar que son matemáticamente inválidos |
| x^x, a^x genérica, exponentes fraccionarios | No inicialmente | Ampliar solo con política de bases y dominio demostrada |

El AST devuelto por el motor debe inspeccionarse: `Error`, símbolos desconocidos, operadores no admitidos y derivadas sin resolver no son éxitos completos. También se valida el resultado derivado para el evaluador numérico; operadores adicionales pueden impedir únicamente su visualización.

## Preservar dominio original
`(x^2-1)/(x-1)` puede simplificarse a x+1, pero la función original sigue indefinida en x=1. `x/x` tiene derivada 0 en su dominio y un hueco en 0. `0/x` conserva igualmente ese hueco.

Capturar AST sin canonicalización antes de simplificar; verificar que la API elegida realmente conserva divisiones y restricciones. Extraer guardas de toda subexpresión original, incluidas ramas multiplicadas por cero. Un denominador constantemente cero o restricción demostrablemente imposible en todo el dominio convierte la entrada en `INVALID_EXPRESSION`, aunque el motor cancele su apariencia.

Para raíces/logaritmos/racionales compuestos, ejecutar guardas por punto y conservar condiciones simbólicas. No anunciar el dominio completo si no se obtuvo una descripción exacta. “Restricciones conocidas” y “No disponible en este punto” son etiquetas distintas de “dominio resuelto”.

## Tangente y orden superior
Tangente: `y = f(x0) + f'(x0)(x-x0)`, solo si función y primera derivada son reales, finitas y existe una vecindad diferenciable validada por la política. Un número obtenido al evaluar una expresión simplificada no demuestra por sí solo diferenciabilidad en un hueco o extremo de dominio.

`sqrt(x)` en 0 tiene valor 0, pero no pendiente finita; mostrar punto sin tangente. La condición u>0 en raíces es conservadora: puede ocultar tangentes válidas como en `sqrt(x^4)` en 0. Etiquetar “No podemos confirmar una pendiente finita aquí”, no afirmar que toda raíz en cero es no diferenciable. Incorporar análisis especial únicamente con pruebas.

Al activar orden 2–3, conservar f' para tangente a f. La curva adicional se etiqueta con su orden; `f''(x0)` no se llama pendiente de f.

## Precisión y honestidad
- Derivación simbólica es exacta dentro de capacidades verificadas; simplificación no exige una única forma textual.
- Evaluación/gráfica usa coma flotante de JavaScript. Redondear solo al presentar; conservar precisión interna. Normalizar -0 únicamente en formato visible.
- No mostrar NaN, Infinity o complejos como coordenadas o pendientes. Overflow/underflow relevantes producen estado numérico explícito, no 0 ficticio.
- Tolerancias de singularidad y de visualización son numéricas y dependientes de escala. No convertir cualquier valor “pequeño” en cero matemático ni declarar un polo exacto a partir de una tolerancia.
- Cerca de polos trigonométricos, omitir segmentos/puntos numéricamente inseguros y explicar aproximación. Nunca dibujar la conexión a través del polo conocido.
- Las diferencias finitas sirven como comprobación secundaria de tests en intervalos regulares. No sustituyen el resultado simbólico ni prueban equivalencia global.
- Pasos deben proceder del motor y corresponder al resultado mostrado. Si faltan/fallan, conservar la derivada y señalar que no hay explicación disponible. No generarlos con IA.

## Evolución
Toda nueva familia exige: interpretación del input, derivada, dominio original y derivado, comportamiento numérico, singularidades, pasos y al menos un éxito y un rechazo. Si cualquiera falta, mantener la familia fuera de la whitelist.
