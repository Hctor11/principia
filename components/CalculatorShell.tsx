import Link from 'next/link';
import type { ReactNode } from 'react';
export default function CalculatorShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <><nav className='breadcrumb' aria-label='Breadcrumb'><Link href='/'>Principia</Link><span aria-hidden='true'>/</span><span aria-current='page'>{title}</span></nav>
    <div className='intro module-intro'><h1>{title}</h1><p>{description}</p></div>{children}</>;
}
