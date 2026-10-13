import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { calculators, availableCategories, normalizeCategory, searchCalculators, validateRegistry, type CalculatorDefinition } from '../features/catalog/registry.ts';
const derivative = calculators[0];
const planned: CalculatorDefinition = { ...derivative, id: 'future', slug: 'future', category: 'statistics', status: 'planned', href: undefined };
test('registry links point to explicit implemented pages', () => {
  for (const entry of calculators) if (entry.status === 'available') assert.ok(existsSync(`app${entry.href}/page.tsx`));
});
test('search title, description and tags without accents or case', () => {
  for (const query of ['DERIVADAS', 'exacta', ' DERIVACION ', 'tangente', '', '   ']) assert.equal(searchCalculators(calculators, query, 'all').length, 1);
  assert.equal(searchCalculators(calculators, 'integrales', 'all').length, 0);
  assert.equal(searchCalculators(calculators, 'x^2', 'all').length, 0);
});
test('filters include only available categories; invalid categories become neutral', () => {
  const entries = [derivative, planned];
  assert.deepEqual(availableCategories(entries), ['calculus']);
  assert.equal(normalizeCategory('statistics', entries), 'all');
  assert.equal(normalizeCategory('unknown', entries), 'all');
  assert.equal(searchCalculators(entries, 'derivadas', 'calculus').length, 1);
  assert.equal(searchCalculators(entries, 'missing', 'calculus').length, 0);
  assert.equal(searchCalculators(entries, '', 'unknown').length, 1);
});
test('planned and empty catalogs never expose available links', () => {
  assert.deepEqual(searchCalculators([planned], '', 'all'), []);
  assert.deepEqual(searchCalculators([], '', 'all'), []);
  assert.doesNotThrow(() => validateRegistry([planned]));
});
test('registry rejects duplicated IDs/slugs and inconsistent links', () => {
  assert.throws(() => validateRegistry([derivative, derivative]));
  assert.throws(() => validateRegistry([derivative, { ...derivative, id: 'other' }]));
  assert.throws(() => validateRegistry([{ ...derivative, status: 'available', href: '/calculators/missing' }]));
  assert.throws(() => validateRegistry([{ ...planned, href: '/calculators/future' } as unknown as CalculatorDefinition]));
});
