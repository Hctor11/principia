import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { calculate } from '../features/derivative/engine.ts';
import { sample, valueAt, validGuard, isModel, adapt, evaluate } from '../features/derivative/domain.ts';
const fixtures = JSON.parse(readFileSync(new URL('../principia-context/docs/fixtures/math-cases.json', import.meta.url), 'utf8'));
for (const fixture of fixtures.cases.filter((c: {
    order: number;
}) => c.order === 1))
    test(fixture.id, () => {
        const m = calculate(fixture.inputLatex);
        assert.ok(isModel(m));
        assert.notEqual(m.derivative, null);
        if (m.derivative === null)
            throw new Error("Missing numeric derivative");
        for (const p of fixture.samples) {
            assert.ok(Math.abs(valueAt(m.original, m.guards, p.x) - p.f) < 1e-8);
            assert.ok(Math.abs(valueAt(m.derivative, [...m.guards, ...m.derivativeGuards], p.x) - p.d1) < 1e-8);
        }
        for (const x of fixture.excludedPoints) {
            assert.ok(Number.isNaN(valueAt(m.original, m.guards, x)));
            for (const line of sample(m.original, m.guards))
                assert.ok(!line.some((p, i) => i > 0 && line[i - 1][0] < x && p[0] > x));
        }
    });
for (const fixture of fixtures.rejections)
    test('reject ' + fixture.id, () => assert.throws(() => calculate(fixture.inputLatex)));
test('sqrt at zero retains original point without tangent', () => { const m = calculate('\\sqrt{x}'); assert.equal(valueAt(m.original, m.guards, 0), 0); assert.ok(!m.tangentGuards.every(g => validGuard(g, 0))); });
test('off-grid rational hole is not bridged', () => { const m = calculate('\\frac{x}{x-0.12345}'); for (const line of sample(m.original, m.guards))
    assert.ok(!line.some((p, i) => i > 0 && line[i - 1][0] < 0.12345 && p[0] > 0.12345)); });
test('tan poles are not bridged', () => { const m = calculate('\\tan(x)'); for (const line of sample(m.original, m.guards))
    for (const x of [-Math.PI / 2, Math.PI / 2])
        assert.ok(!line.some((p, i) => i > 0 && line[i - 1][0] < x && p[0] > x)); });
test('malformed worker model rejected', () => { assert.equal(isModel({ original: 0 }), false); });
import { initialState, reducer } from '../features/derivative/state.ts';
test('same revision requests discard stale results', () => { const m = calculate('7'); let s = reducer(initialState, { type: 'start', id: 'A' }); s = reducer(s, { type: 'start', id: 'B' }); assert.equal(reducer(s, { type: 'result', id: 'A', model: m }), s); assert.equal(reducer(s, { type: 'result', id: 'B', model: m }).result?.id, 'B'); });
test('editing invalidates active result and preserves previous expression', () => { const m = calculate('7'); let s = reducer(initialState, { type: 'start', id: 'A' }); s = reducer(s, { type: 'result', id: 'A', model: m }); s = reducer(s, { type: 'start', id: 'B' }); s = reducer(s, { type: 'edit', input: 'x' }); assert.equal(s.result?.model.input, '7'); assert.notEqual(s.result?.revision, s.revision); assert.equal(reducer(s, { type: 'result', id: 'B', model: m }), s); assert.equal(reducer(s, { type: 'clear' }).result, null); });

test('identically zero denominator is rejected before cancellation',()=>assert.throws(()=>calculate('\\frac{1}{x-x}')));
test('provably impossible real logarithm is rejected',()=>assert.throws(()=>calculate('\\ln(-x^2-1)')));
test('sqrt of square keeps signs and suppresses cusp tangent',()=>{const m=calculate('\\sqrt{x^2}');assert.ok(m.derivative!==null);assert.equal(valueAt(m.original,m.guards,-2),2);assert.equal(valueAt(m.derivative,[...m.guards,...m.derivativeGuards],-2),-1);assert.ok(!m.tangentGuards.every(g=>validGuard(g,0)));});

import {formatValue,formatLatexNumber} from '../features/derivative/format.ts';
import {ComputeEngine} from '@cortex-js/compute-engine';
test('tiny slopes are displayed without rounding to zero',()=>{assert.equal(formatValue(2e-8),'2E-8');assert.equal(formatValue(-0),'0');assert.equal(formatValue(NaN),'—');});
test('scientific tangent numbers render with the correct mathematical meaning',()=>{const ce=new ComputeEngine();for(const value of [2e-8,-3e-9,4e21]){const expression=ce.parse(formatLatexNumber(value),{form:'raw'});const ast=adapt(expression.json);assert.equal(evaluate(ast,0),value);}assert.throws(()=>formatLatexNumber(Infinity));});

test('exact rational derivative coefficients retain numeric inspection',()=>{for(const [input,slope] of [['10^{-8}x',1e-8],['\\frac{x}{3}',1/3]] as const){const model=calculate(input);assert.ok(model.derivative!==null);assert.equal(valueAt(model.derivative,[...model.guards,...model.derivativeGuards],2),slope);}});
