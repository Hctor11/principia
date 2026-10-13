'use client';
import { useEffect, useRef } from 'react';
import type { MathfieldElement } from 'mathlive';

export default function MathFormula({ latex, label = 'Fórmula matemática' }: { latex: string; label?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const field = useRef<MathfieldElement | null>(null);
  const latest = useRef({ latex, label });

  useEffect(() => {
    latest.current = { latex, label };
    if (field.current) {
      field.current.value = latex;
      field.current.setAttribute('aria-label', label);
    }
  }, [latex, label]);

  useEffect(() => {
    let active = true;
    let cleanup = () => {};
    import('mathlive').then(({ MathfieldElement }) => {
      if (!active || !host.current) return;
      MathfieldElement.fontsDirectory = '/mathlive/fonts';
      MathfieldElement.soundsDirectory = null;
      const element = new MathfieldElement();
      element.readOnly = true;
      element.tabIndex = -1;
      element.value = latest.current.latex;
      element.setAttribute('aria-label', latest.current.label);
      element.mathVirtualKeyboardPolicy = 'manual';
      host.current.replaceChildren(element);
      field.current = element;
      cleanup = () => { element.remove(); field.current = null; };
    }).catch(() => {
      if (active && host.current) host.current.textContent = 'No pudimos mostrar esta fórmula.';
    });
    return () => { active = false; cleanup(); };
  }, []);

  return <div ref={host} className='math-formula' tabIndex={0} role='group' aria-label={label}><span className='formula-loading'>Cargando fórmula…</span></div>;
}
