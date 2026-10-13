import MathFormula from './MathFormula';
import type { Model } from './domain';

const ruleCopy: Record<string, string> = {
  'derivative.sum-rule': 'Regla de la suma',
  'derivative.product-rule': 'Regla del producto',
  'derivative.quotient-rule': 'Regla del cociente',
  'derivative.chain-rule': 'Regla de la cadena',
  'derivative.power-rule': 'Regla de la potencia',
  'derivative.constant-multiple-rule': 'Regla del factor constante',
  'derivative.known-derivative': 'Derivada conocida',
  'derivative.simplify': 'Simplificar el resultado',
};

export default function Steps({ model }: { model: Model }) {
  return <details className='steps'>
    <summary>Ver pasos <span>{model.steps.length ? `${model.steps.length} pasos` : 'No disponibles'}</span></summary>
    {model.steps.length ? <ol>{model.steps.map((step, index) => <li key={index}>
      <div className='step-heading'><span className='step-number'>{String(index + 1).padStart(2, '0')}</span>
        <h3>{(step.ruleId && ruleCopy[step.ruleId]) || step.rule}</h3>
      </div>
      <MathFormula latex={step.latex} label={`Paso ${index + 1}`}/>
    </li>)}</ol> : <p className='secondary'>La derivada está lista; no hay pasos verificados para esta expresión.</p>}
  </details>;
}
