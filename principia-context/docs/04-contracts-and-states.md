# Contratos y estados

Estado implementado: `features/derivative/domain.ts` define Model/NumericAst/Guard y `state.ts` el reducer local. El worker usa ready/complete/error, ID y revisión cliente. Solo orden 1; los contratos ampliados de abajo son propuestas futuras, no tipos exportados por la aplicación. Estado del catálogo es local en Catalog; no comparte este reducer.


Los contratos siguientes son de Derivadas. El registro y estados del catálogo de Principia están en `docs/09-hub-foundation.md`. No convertir `CalculationRequest` en un contrato de todos los módulos: otra calculadora puede tener entradas y resultados distintos.

Contratos propuestos para implementar, no interfaces copiadas de la biblioteca. Todos los DTO deben ser JSON serializables y validados en runtime. `unknown` en una frontera se valida antes de convertirse en un tipo de dominio.

## Resultado y capacidades independientes
```ts
type DerivativeOrder = 1 | 2 | 3;
type CalculationRequest = {
  requestId: string;
  inputRevision: number;
  latex: string;
  variable: 'x';
  order: DerivativeOrder;
};

type NumericAst =
  | { kind: 'constant'; value: number }
  | { kind: 'variable' }
  | { kind: 'unary'; op: 'neg' | 'sin' | 'cos' | 'tan' | 'exp' | 'ln' | 'sqrt'; arg: NumericAst }
  | { kind: 'binary'; op: 'add' | 'sub' | 'mul' | 'div' | 'pow'; left: NumericAst; right: NumericAst };

type DomainGuard = {
  expression: NumericAst;
  relation: 'nonzero' | 'positive' | 'nonnegative';
  source: 'original' | 'first-derivative' | 'selected-derivative';
};

type Available<T> =
  | { status: 'available'; value: T }
  | { status: 'unavailable'; reason: string };

type DerivationStep = {
  id: string;
  ruleId: string;
  beforeLatex: string;
  afterLatex: string;
  description: string;
};

type GraphModel = {
  original: NumericAst;
  firstDerivative: Available<NumericAst>;
  selectedDerivative: Available<NumericAst>;
  guards: DomainGuard[];
  restrictionsLatex: string[];
  domainCoverage: 'exact' | 'known-restrictions';
};

type CalculationResult = {
  resultId: string;
  inputRevision: number;
  inputLatex: string;
  originalLatex: string;
  variable: 'x';
  order: DerivativeOrder;
  derivativeLatex: string;
  firstDerivativeLatex: Available<string>;
  graph: Available<GraphModel>;
  steps: Available<{ items: DerivationStep[]; truncated: boolean }>;
  restrictionsLatex: string[];
  domainCoverage: 'exact' | 'known-restrictions';
  warnings: { code: string; message: string }[];
  engineVersion: string;
};

type ErrorCode =
  | 'EMPTY_INPUT' | 'INVALID_SYNTAX' | 'INVALID_EXPRESSION'
  | 'UNSUPPORTED_SYMBOL' | 'UNSUPPORTED_OPERATOR' | 'AMBIGUOUS_INPUT'
  | 'COMPLEXITY_LIMIT' | 'DERIVATIVE_UNRESOLVED' | 'TIMEOUT'
  | 'ENGINE_FAILURE' | 'WORKER_FAILURE' | 'INVALID_MESSAGE';

type CalculationError = {
  code: ErrorCode;
  message: string;
  recovery: 'edit' | 'retry' | 'example';
};

type CalculationOutcome =
  | { status: 'success'; result: CalculationResult }
  | { status: 'partial'; result: CalculationResult }
  | { status: 'error'; error: CalculationError };

type WorkerMessage =
  | { kind: 'ready'; protocolVersion: 1 }
  | { kind: 'complete'; requestId: string; inputRevision: number; outcome: CalculationOutcome };

type NumericValue =
  | { status: 'finite'; value: number }
  | { status: 'unavailable'; reason: 'outside-domain' | 'non-finite' | 'uncertain' };

type PointInspection = {
  resultId: string;
  x: number;
  functionValue: NumericValue;
  firstDerivativeValue: NumericValue;
  selectedDerivativeValue: NumericValue;
  tangent:
    | { status: 'available'; slope: number; intercept: number }
    | { status: 'unavailable'; reason: string };
};
```

Invariantes: success exige fórmula resuelta y las capacidades activas solicitadas disponibles, sin truncamiento/degradación relevante. Partial exige fórmula resuelta, pero una capacidad falló o quedó incompleta. Error no incluye un resultado nuevo. Un resultado anterior se guarda por separado con su expresión y etiqueta temporal.

En fase inicial el único orden activo es 1. No exponer botones 2–3 por el hecho de que el tipo los contemple. Si falla la primera derivada requerida para una sesión de orden superior, se permite resultado parcial del orden solicitado sin tangente.

## Estado de sesión
Usar unión discriminada para la fase de cálculo; separar el borrador y la inspección gráfica de alta frecuencia.

| Estado | Evento | Próximo estado / efecto |
| --- | --- | --- |
| idle | Editar | editing, aumenta revisión |
| editing | Derivar válido | computing, snapshot nuevo |
| editing | Derivar vacío/inválido local | error, foco al editor |
| computing | Editar | editing, cancela solicitud; conserva último resultado etiquetado |
| computing | Derivar de nuevo | computing, reemplaza solicitud anterior |
| computing | Respuesta vigente completa | success |
| computing | Respuesta vigente degradada | partial |
| computing | Error/timeout vigente | error |
| Cualquier estado | Respuesta obsoleta | Sin cambio |
| success/partial/error | Editar | editing; resultado anterior visible como anterior |
| success/partial | Mover x | Misma fase; cambia PointInspection |
| error | Reintentar | computing del snapshot válido actual |
| Cualquier estado | Limpiar | idle; cancela trabajo y elimina resultados |
| Cualquier estado | Cargar ejemplo | editing con nuevo borrador; no calcula sin indicar ese comportamiento |

`lastSuccessfulResult` puede vivir en el reducer, separado de la unión de fase. `isResultCurrent` se deriva comparando revisión y opciones; no mantener una bandera paralela desincronizable.

Resultados anteriores durante edición/cálculo se etiquetan “Resultado de [expresión anterior] — pendiente de actualizar”. No mostrar pendiente de una expresión nueva sobre curvas anteriores. Invalidar inspecciones y muestreo cuando cambie resultId.

## Recuperación y mensajes
| Caso | Mensaje sugerido | Acción |
| --- | --- | --- |
| Vacío | Escribe una función de x para derivar. | Foco al editor |
| Sintaxis inválida | Revisa la expresión; hay una parte incompleta. | Conservar entrada; marcar ubicación si es fiable |
| Símbolo extra | Esta versión admite únicamente x. | Señalar símbolo |
| log ambiguo | Usa ln para el logaritmo natural. | Mostrar ejemplo |
| Operador no soportado | Esta función aún no está disponible. | Ejemplo compatible |
| Complejidad | La expresión supera el límite de esta versión. | Sugerir reducir expresión |
| Timeout | El cálculo tardó más de lo permitido. | Reintentar o simplificar |
| Pasos fallidos | La derivada está lista; los pasos no están disponibles. | Mantener resultado |
| Dominio local | La función no está definida en este valor de x. | Cambiar x |
| Pendiente incierta | No podemos confirmar una pendiente finita aquí. | Conservar punto válido, ocultar tangente |
| Gráfica fallida | El resultado está listo; no pudimos dibujar la gráfica. | Reintentar gráfica |
| Worker fallido | No pudimos iniciar el cálculo. | Reiniciar worker/reintentar |
| Copia bloqueada | No pudimos copiar. Selecciona la fórmula para copiarla. | Selección manual |

Los rechazos de entrada no se reportan como crash. No exponer stack traces o detalles internos en UI. Logs de desarrollo con code/requestId/duración; no expresiones del usuario en telemetría remota.
