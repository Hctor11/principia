export type Ast = number | 'x' | {
    op: string;
    args: Ast[];
};
export type Guard = {
    ast: Ast;
    relation: 'positive' | 'nonnegative' | 'nonzero';
};
export type Model = {
    original: Ast;
    derivative: Ast | null;
    derivativeGuards: Guard[];
    guards: Guard[];
    tangentGuards: Guard[];
    latex: string;
    input: string;
    steps: {
        rule: string;
        ruleId?: string;
        latex: string;
    }[];
};
const arities: Record<string, [
    number,
    number
]> = { Add: [2, 500], Multiply: [2, 500], InvisibleOperator: [2, 500], Subtract: [2, 2], Divide: [2, 2], Power: [2, 2], Negate: [1, 1], Sin: [1, 1], Cos: [1, 1], Tan: [1, 1], Exp: [1, 1], Ln: [1, 1], Sqrt: [1, 1] };
export function adapt(value: unknown, guards: Guard[] = [], tangentGuards: Guard[] = []): Ast {
    let count = 0;
    function visit(v: unknown, depth: number): Ast {
        if (++count > 500 || depth > 32)
            throw new Error('La expresión supera el límite de complejidad.');
        if (typeof v === 'number' && Number.isFinite(v))
            return v;
        if (v === 'x')
            return v;
        if (v === 'Pi')
            return Math.PI;
        if (v === 'ExponentialE' || v === 'e')
            return Math.E;
        if (typeof v === 'object' && v !== null && 'num' in v && typeof v.num === 'string' && Number.isFinite(Number(v.num)))
            return Number(v.num);
        if (!Array.isArray(v) || typeof v[0] !== 'string')
            throw new Error('Esta versión admite únicamente números reales y x.');
        const op = v[0];
        // The engine represents exact fractional coefficients as Rational.
        if (op === 'Rational' && v.length === 3 && typeof v[1] === 'number' && typeof v[2] === 'number')
            return visit(['Divide', v[1], v[2]], depth + 1);
        if (op === 'Sec' && v.length === 2)
            return visit(['Divide', 1, ['Cos', v[1]]], depth + 1);
        const bounds = arities[op];
        if (!bounds || v.length - 1 < bounds[0] || v.length - 1 > bounds[1])
            throw new Error('Operador no admitido o expresión incompleta.');
        const args = v.slice(1).map(a => visit(a, depth + 1));
        if (op === 'Power' && typeof args[1] === 'object' && !hasVariable(args[1]))
            args[1] = evaluate(args[1], 0);
        if (op === 'Power' && !(typeof args[1] === 'number' && Number.isInteger(args[1]) && Math.abs(args[1]) <= 100)) {
            if (args[0] === Math.E)
                return { op: 'Exp', args: [args[1]] };
            throw new Error('Solo se admiten potencias enteras constantes y e elevado a una expresión.');
        }
        if (op === 'Power' && args[0] === 0 && args[1] === 0)
            throw new Error('0 elevado a 0 no está admitido.');
        function guard(ast: Ast, relation: Guard['relation']) {
            const g = { ast, relation };
            guards.push(g);
            if (!hasVariable(ast) && !validGuard(g, 0))
                throw new Error('La expresión no está definida en el dominio real.');
        }
        if (op === 'Divide')
            guard(args[1], 'nonzero');
        if (op === 'Power' && typeof args[1] === 'number' && args[1] <= 0)
            guard(args[0], 'nonzero');
        if (op === 'Ln')
            guard(args[0], 'positive');
        if (op === 'Sqrt') {
            guard(args[0], 'nonnegative');
            tangentGuards.push({ ast: args[0], relation: 'positive' });
        }
        if (op === 'Tan')
            guard({ op: 'Cos', args }, 'nonzero');
        return { op: op === 'InvisibleOperator' ? 'Multiply' : op, args };
    }
    return visit(value, 0);
}
export function hasVariable(a: Ast): boolean { return a === 'x' || (typeof a === 'object' && a.args.some(hasVariable)); }
export function evaluate(a: Ast, x: number): number {
    if (typeof a === 'number')
        return a;
    if (a === 'x')
        return x;
    const v = a.args.map(arg => evaluate(arg, x));
    if (!v.every(Number.isFinite))
        return NaN;
    switch (a.op) {
        case 'Add': return v.reduce((a, b) => a + b, 0);
        case 'Multiply': return v.reduce((a, b) => a * b, 1);
        case 'Subtract': return v[0] - v[1];
        case 'Divide': return v[1] === 0 ? NaN : v[0] / v[1];
        case 'Power': return v[0] === 0 && v[1] === 0 ? NaN : Math.pow(v[0], v[1]);
        case 'Negate': return -v[0];
        case 'Sin': return Math.sin(v[0]);
        case 'Cos': return Math.cos(v[0]);
        case 'Tan': return Math.abs(Math.cos(v[0])) < 1e-12 ? NaN : Math.tan(v[0]);
        case 'Exp': {
            const result = Math.exp(v[0]);
            return result === 0 ? NaN : result;
        }
        case 'Ln': return v[0] > 0 ? Math.log(v[0]) : NaN;
        case 'Sqrt': return v[0] >= 0 ? Math.sqrt(v[0]) : NaN;
        default: return NaN;
    }
}
export function validGuard(g: Guard, x: number): boolean {
    const v = evaluate(g.ast, x);
    return Number.isFinite(v) && (g.relation === 'positive' ? v > 0 : g.relation === 'nonnegative' ? v >= 0 : v !== 0 && !(typeof g.ast === 'object' && g.ast.op === 'Cos' && Math.abs(v) < 1e-12));
}
export function valueAt(a: Ast, guards: Guard[], x: number): number { return guards.every(g => validGuard(g, x)) ? evaluate(a, x) : NaN; }
// Conservative interval bounds certify that an entire line segment avoids a guard's zero.
export function range(a: Ast, lo: number, hi: number): [
    number,
    number
] {
    if (typeof a === 'number')
        return [a, a];
    if (a === 'x')
        return [lo, hi];
    const r = a.args.map(v => range(v, lo, hi));
    const [l, h] = r[0];
    const mul = (u: number[], v: number[]): [
        number,
        number
    ] => { const p = [u[0] * v[0], u[0] * v[1], u[1] * v[0], u[1] * v[1]]; return [Math.min(...p), Math.max(...p)]; };
    switch (a.op) {
        case 'Add': return r.reduce<[
            number,
            number
        ]>((u, v) => [u[0] + v[0], u[1] + v[1]], [0, 0]);
        case 'Subtract': return [l - r[1][1], h - r[1][0]];
        case 'Negate': return [-h, -l];
        case 'Multiply': return r.reduce(mul, [1, 1]);
        case 'Divide': return r[1][0] <= 0 && r[1][1] >= 0 ? [-Infinity, Infinity] : mul(r[0], [1 / r[1][1], 1 / r[1][0]]);
        case 'Power': {
            const n = a.args[1];
            if (typeof n !== 'number')
                break;
            if (n < 0 && l <= 0 && h >= 0)
                break;
            const p = [Math.pow(l, n), Math.pow(h, n)];
            if (n > 0 && n % 2 === 0 && l <= 0 && h >= 0)
                p.push(0);
            return [Math.min(...p), Math.max(...p)];
        }
        case 'Exp': return [Math.exp(l), Math.exp(h)];
        case 'Ln': return l > 0 ? [Math.log(l), Math.log(h)] : [-Infinity, Infinity];
        case 'Sqrt': return l >= 0 ? [Math.sqrt(l), Math.sqrt(h)] : [-Infinity, Infinity];
        case 'Cos':
        case 'Sin': {
            const shift = a.op === 'Sin' ? Math.PI / 2 : 0;
            const low = l - shift, high = h - shift;
            if (!Number.isFinite(low + high) || high - low >= 2 * Math.PI)
                return [-1, 1];
            const p = [Math.cos(low), Math.cos(high)];
            for (let k = Math.ceil(low / Math.PI); k <= Math.floor(high / Math.PI); k++)
                p.push(k % 2 === 0 ? 1 : -1);
            return [Math.min(...p), Math.max(...p)];
        }
    }
    return [-Infinity, Infinity];
}
export function sample(a: Ast, guards: Guard[], lo = -5, hi = 5): [
    number,
    number
][][] {
    const segments: [
        number,
        number
    ][][] = [];
    let current: [
        number,
        number
    ][] = [];
    const count = 1000;
    for (let i = 0; i <= count; i++) {
        const x = lo + (hi - lo) * i / count;
        const y = valueAt(a, guards, x);
        const prev = current.at(-1);
        const safe = !prev || guards.every(g => { const [l, h] = range(g.ast, prev[0], x); return Number.isFinite(l + h) && (g.relation === 'nonzero' ? (l > 0 || h < 0) : g.relation === 'positive' ? l > 0 : l >= 0); });
        if (!Number.isFinite(y) || !safe || Math.abs(y) > 10000) {
            if (current.length > 1)
                segments.push(current);
            current = [];
        }
        if (Number.isFinite(y) && Math.abs(y) <= 10000)
            current.push([x, y]);
    }
    if (current.length > 1)
        segments.push(current);
    return segments;
}
export function isModel(v: unknown): v is Model {
    if (typeof v !== 'object' || v === null)
        return false;
    const m = v as Record<string, unknown>;
    try {
        const check = (a: unknown, depth = 0): boolean => typeof a === 'number' ? Number.isFinite(a) : a === 'x' || (depth < 32 && typeof a === 'object' && a !== null && 'op' in a && typeof a.op === 'string' && Boolean(arities[a.op]) && 'args' in a && Array.isArray(a.args) && a.args.length >= arities[a.op][0] && a.args.length <= arities[a.op][1] && a.args.every(v => check(v, depth + 1)));
        const gs = (g: unknown) => Array.isArray(g) && g.length <= 1000 && g.every(v => typeof v === 'object' && v !== null && ['positive', 'nonnegative', 'nonzero'].includes(v.relation) && check(v.ast));
        return check(m.original) && (m.derivative === null || check(m.derivative)) && gs(m.derivativeGuards) && gs(m.guards) && gs(m.tangentGuards) && typeof m.latex === 'string' && typeof m.input === 'string' && Array.isArray(m.steps) && m.steps.length <= 100 && m.steps.every(s => typeof s.rule === 'string' && (s.ruleId === undefined || typeof s.ruleId === 'string') && typeof s.latex === 'string');
    }
    catch {
        return false;
    }
}
