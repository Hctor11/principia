/** Preserve significant digits, including small slopes; normalize -0 only for display. */
export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const magnitude = Math.abs(value);
  return new Intl.NumberFormat('es', {
    maximumSignificantDigits: 6,
    notation: magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e6) ? 'scientific' : 'standard',
  }).format(Object.is(value, -0) ? 0 : value);
}

/** JavaScript's 2e-8 must become 2×10⁻⁸, never the LaTeX expression 2e−8. */
export function formatLatexNumber(value: number): string {
  if (!Number.isFinite(value)) throw new Error('No se puede mostrar un valor no finito.');
  const text = String(Number(value.toPrecision(6)));
  const [coefficient, exponent] = text.split('e');
  return exponent === undefined ? text : `${coefficient}\\times10^{${Number(exponent)}}`;
}
