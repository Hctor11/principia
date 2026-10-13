'use client';
import 'mafs/core.css';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Mafs, Coordinates, Polyline, MovablePoint, Line, Point } from 'mafs';
import { sample, valueAt, validGuard, type Model } from './domain';
import MathFormula from './MathFormula';
import { formatValue as fmt, formatLatexNumber as latexNumber } from './format';

export default function Graph({ model, result, steps }: { model: Model; result: ReactNode; steps: ReactNode }) {
  const [x, setX] = useState(2);
  const [draft, setDraft] = useState('2');
  const [showF, setShowF] = useState(true);
  const [showD, setShowD] = useState(true);
  const host = useRef<HTMLElement>(null);
  const curves = useMemo(() => ({
    f: sample(model.original, model.guards),
    d: model.derivative !== null ? sample(model.derivative, [...model.guards, ...model.derivativeGuards]) : [],
  }), [model]);
  // Include the initial inspected point (e.g. the constant 7), without resampling on drag.
  const yRange = useMemo<[number, number]>(() => {
    const values = [valueAt(model.original, model.guards, 2), model.derivative !== null ? valueAt(model.derivative, [...model.guards, ...model.derivativeGuards], 2) : NaN];
    const finite = values.filter(v => Number.isFinite(v) && Math.abs(v) <= 10000);
    return [Math.min(-6, ...finite.map(v => v - 2)), Math.max(6, ...finite.map(v => v + 2))];
  }, [model]);
  useEffect(() => {
    const point = host.current?.querySelector('.mafs-movable-point');
    point?.setAttribute('aria-label', 'Mover x sobre el eje horizontal. Usa las flechas o el campo numérico.');
  }, []);

  const y = valueAt(model.original, model.guards, x);
  const slope = model.derivative !== null ? valueAt(model.derivative, [...model.guards, ...model.derivativeGuards], x) : NaN;
  const tangent = Number.isFinite(y) && Number.isFinite(slope) && model.tangentGuards.every(g => validGuard(g, x));
  const move = (value: number) => { if (Number.isFinite(value)) { setX(value); setDraft(String(value)); } };
  const outside = Math.abs(x) > 5 || (Number.isFinite(y) && (y < yRange[0] || y > yRange[1]));

  return <div className='workspace'>
    <section ref={host} className='graph-panel' aria-label='Gráfica de la función y su derivada'>
      <div className='graph-toolbar'><div className='legend'>
        <label><input type='checkbox' checked={showF} onChange={event => setShowF(event.target.checked)}/><span className='curve-key function-key'/> f(x)<span className='sr-only'>, curva continua</span></label>
        <label><input type='checkbox' checked={showD} onChange={event => setShowD(event.target.checked)}/><span className='curve-key derivative-key'/> f′(x)<span className='sr-only'>, curva discontinua</span></label>
        <span className='tangent-key'><span className='curve-key'/>Tangente</span>
      </div><span className='graph-range'>x ∈ [−5, 5]</span></div>
      <Mafs height={420} preserveAspectRatio={false} viewBox={{ x: [-5, 5], y: yRange }} pan={false} zoom={false}>
        <Coordinates.Cartesian/>
        {showF && curves.f.map((points, index) => <Polyline key={`f${index}`} points={points} color='#F3EFE6' weight={2}/>)}
        {showD && curves.d.map((points, index) => <Polyline key={`d${index}`} points={points} color='#D3AD72' weight={2} svgPolylineProps={{ strokeDasharray: '7 5' }}/>)}
        {tangent && <Line.PointSlope point={[x, y]} slope={slope} color='#96938E' style='dashed'/>}
        {Number.isFinite(y) && <Point x={x} y={y} color='#F3EFE6'/>}
        {Number.isFinite(slope) && <Point x={x} y={slope} color='#D3AD72'/>}
        <MovablePoint point={[x, 0]} onMove={point => move(point[0])} constrain={point => [point[0], 0]} color='#F3EFE6'/>
      </Mafs>
      <p className='graph-hint'>Arrastra el punto del eje x. También puedes usar las flechas o el control numérico.</p>
    </section>
    <aside className='result-inspection' aria-label='Resultado e inspección'>
      {result}
      <section className='inspection' aria-label='Inspección del punto'>
        <div className='inspection-heading'><h2>Explora un punto</h2><button className='text-button' onClick={() => move(2)}>Restablecer x</button></div>
        <div className='point-controls'><label htmlFor='inspection-x'>x</label><input id='inspection-x' aria-label='Valor de x' type='number' step='0.1' value={draft}
          onChange={event => { setDraft(event.target.value); if (event.target.value.trim() && Number.isFinite(Number(event.target.value))) setX(Number(event.target.value)); }} onBlur={() => setDraft(String(x))}/>
          <input aria-label='Seleccionar x' type='range' min='-5' max='5' step='0.01' value={Math.max(-5, Math.min(5, x))} onChange={event => move(Number(event.target.value))}/>
        </div>
        <dl><div><dt>f({fmt(x)})</dt><dd>{fmt(y)}</dd></div><div><dt>f′({fmt(x)}) <span>Pendiente</span></dt><dd>{fmt(slope)}</dd></div></dl>
        <div className='tangent-result'><h3>Recta tangente</h3>
          {tangent ? <MathFormula latex={`y=${latexNumber(y)}+\\left(${latexNumber(slope)}\\right)\\left(x-\\left(${latexNumber(x)}\\right)\\right)`} label='Ecuación de la recta tangente'/> :
            <p className='point-notice'>{!Number.isFinite(y) ? 'La función no está definida o no puede evaluarse en este valor de x.' : 'No podemos confirmar una pendiente finita aquí.'}</p>}
        </div>
        {outside && <p className='point-notice'>Punto fuera de la vista actual.</p>}
        {model.guards.length > 0 && <p className='domain-hint'>El dominio original tiene restricciones. Se conservan incluso al simplificar.</p>}
      </section>
    </aside>
    {steps}
  </div>;
}
