import { calculate } from './engine';
self.postMessage({ kind: 'ready' });
self.onmessage = (event: MessageEvent<unknown>) => {
    const data = event.data;
    if (typeof data !== 'object' || data === null || !('id' in data) || typeof data.id !== 'string' || !('input' in data) || typeof data.input !== 'string')
        return;
    try {
        self.postMessage({ kind: 'complete', id: data.id, model: calculate(data.input) });
    }
    catch (error) {
        self.postMessage({ kind: 'error', id: data.id, message: error instanceof Error ? error.message : 'No pudimos calcular la derivada. Reintenta.' });
    }
};
