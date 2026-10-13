export const categoryLabels = {
  calculus: 'Cálculo', 'linear-algebra': 'Álgebra lineal', statistics: 'Estadística',
  'discrete-math': 'Matemática discreta', 'software-engineering': 'Ingeniería de software',
} as const;
export type CalculatorCategory = keyof typeof categoryLabels;
export type CalculatorDefinition = {
  id: string; slug: string; title: string; description: string;
  category: CalculatorCategory; tags: readonly string[];
} & ({ status: 'available'; href: `/calculators/${string}` } | { status: 'planned'; href?: never });
export function validateRegistry(entries: readonly CalculatorDefinition[]) {
  const ids = new Set<string>(), slugs = new Set<string>();
  for (const entry of entries) {
    if (!entry.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || ids.has(entry.id) || slugs.has(entry.slug)) throw new Error('ID o slug inválido/duplicado');
    if (!(entry.category in categoryLabels) || !entry.title.trim() || !entry.description.trim()) throw new Error('Metadata inválida');
    if (entry.status === 'available' ? entry.href !== `/calculators/${entry.slug}` : entry.href !== undefined) throw new Error('Ruta incompatible con disponibilidad');
    ids.add(entry.id); slugs.add(entry.slug);
  }
  return entries;
}
export const calculators = validateRegistry([{
  id: 'derivatives', slug: 'derivatives', title: 'Derivadas',
  description: 'Calcula una derivada exacta y explora su pendiente en la gráfica.',
  category: 'calculus', tags: ['derivación', 'funciones', 'pendiente', 'tangente'],
  status: 'available', href: '/calculators/derivatives',
}] satisfies readonly CalculatorDefinition[]);
export function availableCategories(entries: readonly CalculatorDefinition[]) {
  return [...new Set(entries.filter(entry => entry.status === 'available').map(entry => entry.category))];
}
export function normalizeCategory(category: string, entries: readonly CalculatorDefinition[]) {
  return availableCategories(entries).find(value => value === category) ?? 'all';
}
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
export function searchCalculators(entries: readonly CalculatorDefinition[], query: string, category: string) {
  const effective = normalizeCategory(category, entries), text = normalize(query);
  return entries.filter((entry): entry is CalculatorDefinition & { status: 'available'; href: `/calculators/${string}` } =>
    entry.status === 'available' && (effective === 'all' || entry.category === effective)
    && normalize([entry.title, entry.description, ...entry.tags].join(' ')).includes(text));
}
