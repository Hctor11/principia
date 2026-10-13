import { ComputeEngine, type Expression } from '@cortex-js/compute-engine';
import { adapt, range, type Ast, type Guard, type Model } from './domain.ts';
export function calculate(input: string): Model {
    if (!input.trim())
        throw new Error('Escribe una función de x para derivar.');
    if (input.length > 2000)
        throw new Error('La entrada supera 2.000 caracteres.');
    if (/\\log\b/.test(input))
        throw new Error('Usa ln para el logaritmo natural.');
    const ce = new ComputeEngine();
    const expression = ce.parse(input, { form: 'raw' });
    if (!expression || !expression.isValid)
        throw new Error('Revisa la expresión; hay una parte incompleta.');
    const guards: Guard[] = [];
    const tangentGuards: Guard[] = [];
    const original = adapt(expression.json, guards, tangentGuards);
    const toJson = (ast: Ast): Expression['json'] => typeof ast === 'object' ? [ast.op, ...ast.args.map(toJson)] : ast;
    for (const guard of guards) {
        const simplified = ce.box(toJson(guard.ast)).simplify();
        const [lo, hi] = range(guard.ast, -Infinity, Infinity);
        if ((guard.relation === 'nonzero' && simplified.json === 0) ||
            (guard.relation === 'positive' && hi <= 0) ||
            (guard.relation === 'nonnegative' && hi < 0))
            throw new Error('La expresión no está definida en el dominio real.');
        if (Number.isFinite(lo) && lo === hi &&
            ((guard.relation === 'nonzero' && lo === 0) || (guard.relation === 'positive' && lo <= 0)))
            throw new Error('La expresión no está definida en el dominio real.');
    }
    const result = ce.box(['D', expression.json, 'x']).evaluate();
    if (/"(?:D|NaN|ComplexInfinity|PositiveInfinity|NegativeInfinity|ImaginaryUnit)"/.test(JSON.stringify(result.json)) || !result.isValid)
        throw new Error('El motor no pudo resolver esta derivada.');
    const derivativeGuards: Guard[] = [];
    let derivative: Model['derivative'] = null;
    try {
        derivative = adapt(result.json, derivativeGuards);
    }
    catch { /* Numeric support can fail independently. */ }
    let steps: Model['steps'] = [];
    try {
        const explanation = expression.explain('D', { variable: 'x' });
        if (JSON.stringify(explanation.result) === JSON.stringify(result.json))
            steps = explanation.steps.slice(0, 100).map(s => ({ ruleId: s.id, rule: s.description ?? s.id ?? 'Paso del motor', latex: s.value.latex }));
    }
    catch { /* Formula remains available. */ }
    return { original, derivative, derivativeGuards, guards, tangentGuards, latex: result.latex, input, steps };
}
