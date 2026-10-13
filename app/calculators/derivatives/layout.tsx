import CalculatorShell from '@/components/CalculatorShell';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = { title: 'Derivadas', description: 'Calcula una derivada exacta y explora su pendiente, dominio y tangente.' };
export default function Layout({ children }: { children: ReactNode }) {
  return <CalculatorShell title='Derivadas' description='Calcula la derivada y explora su pendiente.'>{children}</CalculatorShell>;
}
