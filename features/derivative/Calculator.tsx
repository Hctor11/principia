'use client';
import { Component, useEffect, useReducer, useRef, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import MathEditor from './MathEditor';
import { isModel } from './domain';
import { initialState, reducer } from './state';
import MathFormula from './MathFormula';
import Steps from './Steps';
const Graph = dynamic(() => import('./Graph'), { ssr: false, loading: () => <p>Cargando gráfica…</p> });
class GraphBoundary extends Component<{ children: ReactNode; result: ReactNode; steps: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className='workspace'>
      <section className='graph-panel graph-failure' role='alert'><p>La derivada está lista; no pudimos dibujar la gráfica.</p><button className='utility-button' onClick={() => this.setState({ failed: false })}>Reintentar gráfica</button></section>
      <aside className='result-inspection'>{this.props.result}</aside>{this.props.steps}
    </div> : this.props.children;
  }
}
export default function Calculator() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const help = useRef<HTMLDialogElement>(null);
    const cancel = useRef<() => void>(() => { });
    useEffect(() => () => cancel.current(), []);
    const edit = (input: string) => { cancel.current(); dispatch({ type: 'edit', input }); };
    const calculate = () => {
        cancel.current();
        const id = crypto.randomUUID();
        dispatch({ type: 'start', id });
        if (!state.input.trim() || state.input.length > 2000) {
            dispatch({ type: 'error', id, message: 'Escribe una función de x de hasta 2.000 caracteres.' });
            return;
        }
        let worker: Worker;
        try {
            worker = new Worker(new URL('./math.worker.ts', import.meta.url));
        }
        catch {
            dispatch({ type: 'error', id, message: 'No pudimos iniciar el cálculo. Reintenta.' });
            return;
        }
        let active = true;
        let timer: ReturnType<typeof setTimeout>;
        const stop = () => { active = false; clearTimeout(timer); worker.terminate(); };
        cancel.current = stop;
        const fail = (message: string) => { if (!active)
            return; stop(); dispatch({ type: 'error', id, message }); };
        timer = setTimeout(() => fail('No pudimos iniciar el motor en 10 segundos. Reintenta.'), 10000);
        worker.onerror = () => fail('El worker falló. Puedes reintentar.');
        worker.onmessageerror = () => fail('No pudimos leer el resultado. Reintenta.');
        worker.onmessage = (event: MessageEvent<unknown>) => {
            if (!active)
                return;
            const d = event.data;
            if (typeof d !== 'object' || d === null || !('kind' in d)) {
                fail('Respuesta del motor inválida.');
                return;
            }
            if (d.kind === 'ready') {
                clearTimeout(timer);
                timer = setTimeout(() => fail('El cálculo tardó más de 3 segundos. Simplifica o reintenta.'), 3000);
                worker.postMessage({ id, input: state.input });
                return;
            }
            if (!('id' in d) || d.id !== id)
                return;
            if (d.kind === 'complete' && 'model' in d && isModel(d.model)) {
                stop();
                dispatch({ type: 'result', id, model: d.model });
            }
            else if (d.kind === 'error' && 'message' in d && typeof d.message === 'string')
                fail(d.message);
            else
                fail('Respuesta del motor inválida.');
        };
    };
    const result = state.result;
    const examples = [
      ['Polinomio', 'x^3-4x^2+2x'], ['1/x', '\\frac{1}{x}'],
      ['Hueco', '\\frac{x^2-1}{x-1}'], ['ln(x)', '\\ln(x)'], ['√x', '\\sqrt{x}'], ['Constante', '7'],
    ];
    const resultContent = result && <section className='result-panel' aria-label='Primera derivada'>
      <h2>Primera derivada</h2>
      {result.revision !== state.revision && <p className='notice'>Resultado anterior — pendiente de actualizar.</p>}
      <div className='formula'><span>f′(x) =</span><MathFormula latex={result.model.latex} label='Primera derivada exacta'/></div>
      <details className='original-expression'><summary>Función calculada</summary><MathFormula latex={`f(x)=${result.model.input}`} label='Función calculada'/></details>
      <details className='latex-copy'><summary>Copiar LaTeX</summary><p className='secondary'>Selecciona la fórmula para copiarla.</p><code tabIndex={0}>{result.model.latex}</code></details>
    </section>;
    const steps = result && <Steps model={result.model}/>;
    return <div className='derivative-tool'>
      <div className='tool-actions'>
        <nav aria-label='Herramientas'>
          <details className='examples-menu'>
            <summary>Ejemplos <span aria-hidden='true'>⌄</span></summary>
            <div className='examples-list'>{examples.map(([label, input]) => <button key={label} onClick={event => {
              edit(input); event.currentTarget.closest('details')?.removeAttribute('open');
              requestAnimationFrame(() => document.getElementById('function-editor')?.focus());
            }}>{label}<span aria-hidden='true'>↗</span></button>)}</div>
          </details>
          <button className='text-button' onClick={() => help.current?.showModal()}>Ayuda</button>
        </nav>
      </div>
      <section className='input-panel' aria-label='Calcular una derivada'>
        <div className='calculation-row'>
          <label htmlFor='function-editor' className='input-prefix'><span className='sr-only'>Función de x, </span>f(x) =</label>
          <MathEditor value={state.input} onChange={edit} onSubmit={calculate}/>
          <button className='primary' onClick={calculate}>{state.phase === 'computing' ? 'Volver a derivar' : 'Derivar'}<span aria-hidden='true'>↗</span></button>
        </div>
        <div className='input-meta'><p id='input-help'>Solo x · radianes · Enter para derivar</p><button className='text-button' onClick={() => { cancel.current(); dispatch({ type: 'clear' }); }}>Limpiar</button></div>
        <div className='calculation-status' role='status' aria-live='polite'>
          {state.phase === 'computing' && <p><span className='status-dot'/>Calculando… Puedes seguir editando.</p>}
          {(state.phase === 'success' || state.phase === 'partial') && <p>Derivada lista.{!result?.model.steps.length && ' Los pasos no están disponibles.'}{result?.model.derivative === null && ' La gráfica de la derivada no está disponible.'}</p>}
        </div>
        {state.error && <div role='alert' className='error'><p>{state.error}</p><button className='text-button' onClick={calculate}>Reintentar</button></div>}
      </section>
      {result ? <GraphBoundary key={result.id} result={resultContent} steps={steps}>
        <Graph model={result.model} result={resultContent} steps={steps}/>
      </GraphBoundary> : <div className='workspace empty-workspace'>
        <section className='empty-graph' aria-label='Gráfica pendiente'><div><h2>{state.phase === 'computing' ? 'Preparando tu gráfica…' : 'Explora el cambio.'}</h2><p>Escribe una función y pulsa Derivar.<br/>Aquí verás la función, su derivada y la tangente.</p></div></section>
        <aside className='result-inspection'><h2>Primera derivada</h2><p className='empty-formula'>f′(x) = <span>—</span></p><p className='secondary'>El resultado aparecerá después de calcular.</p></aside>
      </div>}
      <dialog ref={help} aria-labelledby='help-title' className='help-dialog'>
        <div className='help-heading'><h2 id='help-title'>Cómo usar Derivadas</h2><button className='text-button' onClick={() => help.current?.close()}>Cerrar</button></div>
        <p>Escribe una función de x y pulsa Derivar o Enter. Los ejemplos cambian la entrada; el cálculo empieza cuando lo confirmas.</p>
        <p>Para explorar la pendiente, arrastra el punto del eje x, usa las flechas al enfocarlo, mueve el deslizador o escribe x. La tangente siempre usa la primera derivada.</p>
        <h3>Funciones admitidas</h3><p>Números reales, x, operaciones aritméticas, potencias enteras, sin, cos, tan, ln, sqrt y e elevado a una expresión. La trigonometría usa radianes.</p>
        <h3>Dominio y gráfica</h3><p>La gráfica es una aproximación con 1.001 muestras por curva y vista fija en x ∈ [−5, 5]. Se separan segmentos donde no podemos confirmar continuidad. Los huecos del dominio original se conservan al simplificar.</p>
        <p>No resolvemos el dominio completo. En los ceros de una raíz, la tangente puede ocultarse porque no podemos confirmar una pendiente finita. Valores no finitos no se dibujan.</p>
        <h3>Resultados y recuperación</h3><p>Al editar verás el resultado anterior identificado hasta volver a calcular. La fórmula se conserva si faltan pasos o gráfica. Un cálculo que excede el límite se cancela y puedes reintentar.</p>
        <p>Los pasos son del motor matemático. Las reglas conocidas se muestran en español; las demás conservan su descripción original.</p>
      </dialog>
    </div>;
}
