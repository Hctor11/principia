import type { Model } from './domain.ts';
export type State = {
    input: string;
    revision: number;
    phase: 'editing' | 'computing' | 'success' | 'partial' | 'error';
    request: string | null;
    result: {
        id: string;
        model: Model;
        revision: number;
    } | null;
    error: string;
};
export type Action = {
    type: 'edit';
    input: string;
} | {
    type: 'start';
    id: string;
} | {
    type: 'result';
    id: string;
    model: Model;
} | {
    type: 'error';
    id: string;
    message: string;
} | {
    type: 'clear';
};
export const initialState: State = { input: 'x^3-4x^2+2x', revision: 0, phase: 'editing', request: null, result: null, error: '' };
export function reducer(s: State, a: Action): State {
    if (a.type === 'clear')
        return { ...initialState, input: '', revision: s.revision + 1 };
    if (a.type === 'edit')
        return { ...s, input: a.input, revision: s.revision + 1, phase: 'editing', request: null, error: '' };
    if (a.type === 'start')
        return { ...s, phase: 'computing', request: a.id, error: '' };
    if (a.id !== s.request)
        return s;
    if (a.type === 'result')
        return { ...s, phase: a.model.derivative !== null && a.model.steps.length ? 'success' : 'partial', result: { id: a.id, model: a.model, revision: s.revision }, request: null };
    return { ...s, phase: 'error', error: a.message, request: null };
}
