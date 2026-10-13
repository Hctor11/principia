# Base de Principia

## Objetivo y límites
Principia es un hub personal de calculadoras para ingeniería y desarrollo de software. Esta entrega prepara el catálogo y su extensión; solo Derivadas se implementa o conserva como calculadora. Base implementada en este repositorio; docs08 registra la evidencia de aceptación.

Evitar un framework de plugins, motor universal, formularios generados, cuentas y backend por anticipación. Un registro de metadata, rutas explícitas y features aisladas proporcionan la extensión necesaria.

## Rutas y shell
| Ruta | Propósito | Estado de entrega |
| --- | --- | --- |
| `/` | Catálogo de Principia | Implementado |
| `/calculators/derivatives` | Calculadora Derivadas | Implementado; motor conservado |
| Otras rutas desconocidas | 404 con regreso al catálogo | Implementado |

Root layout: marca, fuentes/tokens y navegación común. CalculatorShell: breadcrumb, título, descripción corta, zona de herramienta y ayuda específica. No duplica el header global ni contiene lógica del motor. Logo Principia enlaza a `/`; el breadcrumb del módulo usa un enlace real al catálogo. Título de navegador propuesto: `Derivadas | Principia` y `Principia — Calculadoras para ingeniería` en home.

Las rutas son explícitas, una por feature, con metadata propia. No usar un catch-all que importe todos los módulos. La home previa de Derivadas se convierte en catálogo; conserva su calculadora en ruta propia. Solo añade redirecciones de rutas antiguas que realmente existan y evitando bucles. No redirigir `/` a Derivadas.

## Registro serializable
```ts
type CalculatorCategory =
  | 'calculus'
  | 'linear-algebra'
  | 'statistics'
  | 'discrete-math'
  | 'software-engineering';

type CalculatorMetadata = {
  id: string;             // Estable; no deriva de la etiqueta traducida
  slug: string;
  title: string;
  description: string;
  category: CalculatorCategory;
  tags: readonly string[];
};

type CalculatorDefinition = CalculatorMetadata & (
  | { status: 'available'; href: `/calculators/${string}` }
  | { status: 'planned'; href?: never }
);
```

Categorías son una propuesta ampliable, no una afirmación del temario exacto del usuario. Puede añadirse otra sin tocar la lógica de Derivadas. Mantener un mapa de etiquetas: Cálculo, Álgebra lineal, Estadística, Matemática discreta e Ingeniería de software. Renderizar filtros solo para categorías con herramientas disponibles.

Ejemplo de Derivadas, únicamente cuando la ruta real esté implementada y verificada:
```ts
const derivatives = {
  id: 'derivatives',
  slug: 'derivatives',
  title: 'Derivadas',
  description: 'Calcula una derivada y explora su pendiente en la gráfica.',
  category: 'calculus',
  tags: ['derivación', 'funciones', 'pendiente'],
  status: 'available',
  href: '/calculators/derivatives',
} satisfies CalculatorDefinition;
```

No almacenar JSX, funciones `import()`, instancias de CAS, componentes o datos de sesión en el registro. IDs/slugs únicos; href coherente con slug; categorías válidas; un available sin ruta real falla validación. Campos estáticos se comprueban en desarrollo/build; si hay futura fuente externa, validar también en runtime.

## Catálogo y búsqueda
Home: nombre Principia, una frase breve y catálogo. Una sola herramienta disponible es suficiente; no rellenar con ejemplos falsos, conteos inflados o widgets vacíos.

Búsqueda de texto por título, descripción y tags; comparación normalizada sin diferencias de mayúsculas ni acentos. No interpretar LaTeX, ejecutar código ni enviar texto al motor. Filtro por categoría real; texto y categoría se aplican conjuntamente. Orden inicial determinista definido por el catálogo, no por popularidad ficticia.

Estado local inicial de búsqueda/filtro; no se requiere historial en URL ni persistencia. Una implementación posterior de query params deberá validarlos y tratar categorías desconocidas como filtro neutral. En la versión local el controlador rechaza una categoría no registrada y vuelve a Todas.

| Situación | UI / recuperación |
| --- | --- |
| Registro válido con herramientas disponibles | Lista enlazada |
| Sin coincidencias | “No encontramos calculadoras”; Limpiar búsqueda/filtros |
| Sin disponibles | “Aún no hay calculadoras disponibles”; no resultados falsos |
| Categoría inválida | Restablecer Todas; no crash |
| Solo planned | Sección opcional “En preparación”, sin enlace o acción Abrir |
| Ruta inexistente | 404 y enlace al catálogo |
| Módulo tarda en cargar | Estado local de carga; header disponible |
| Módulo falla | Error localizado; reintentar o volver al catálogo |

No mostrar herramientas planned como resultados disponibles. Si se expone una sección de preparación, separarla del buscador de disponibles y no asignar fechas. No se requiere crear entries planned ahora: las ideas pueden vivir exclusivamente en documentación.

## Aislamiento, rendimiento y errores
- Catálogo importa solo registro y lógica de búsqueda; no importa archivos barrel que reexporten el módulo matemático.
- Dependencias pesadas se cargan desde la ruta/feature. Si links precargan bundles de herramienta al montar/hover, desactivar ese prefetch cuando contradiga el objetivo de home ligera; verificar en producción con el router instalado.
- Estado de búsqueda pertenece al catálogo; entrada/resultado/worker pertenecen a Derivadas. No compartir reducers de cálculo entre módulos.
- Error boundary de ruta para módulo y, si hace falta, gráfica; el shell global sigue dando acceso al catálogo.
- Salir del módulo termina workers, timers y suscripciones. Remontar usa sesión nueva en esta entrega; no prometer restauración de borrador al volver.
- Entrada desconocida o módulo no implementado termina en 404 real, no pantalla vacía ni “Próximamente” con formulario funcional.
- No hay procesamiento remoto ni almacenamiento de expresiones por el hecho de convertirse en hub.

## Criterios de aceptación
1. Principia aparece en marca y metadata; Derivadas permanece como título de herramienta.
2. Home → Derivadas → home funciona con enlaces; la ruta del módulo funciona por URL directa y refresh.
3. Búsqueda con y sin coincidencias, combinación con categoría y recuperación Limpiar funcionan por teclado/móvil.
4. Entrada disponible abre herramienta real; planned no recibe href. No existen IDs/slugs duplicados ni enlaces muertos del registro.
5. Home no inicia worker ni carga librerías matemáticas por imports transitivos/prefetch; comprobar bundle y red, no solo apariencia.
6. Un fallo en Derivadas mantiene navegación; salir durante cálculo cancela recursos.
7. Añadir otra feature requiere ruta, metadata, implementación/política/pruebas y reutilización del shell; no modificar el cálculo de Derivadas.

## Decisiones del repositorio

Registro y búsqueda en `features/catalog/registry.ts`; UI cliente en `Catalog.tsx`. Solo Derivadas está registrada. No se muestran planned. Categorías locales inválidas se normalizan a Todas. No se sincronizan filtros con URL. Los enlaces del catálogo usan `prefetch={false}`. No existían rutas adicionales a `/`; no se inventaron redirecciones.

Shell global en `app/layout.tsx`; `components/CalculatorShell.tsx` se usa desde el layout explícito de Derivadas. `components/Recovery.tsx` comparte presentación de 404 y error del módulo. La sesión matemática y los timers pertenecen a Calculator; su desmontaje termina el worker.
