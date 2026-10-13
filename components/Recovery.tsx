import Link from 'next/link';
import type { ReactNode } from 'react';
export default function Recovery({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className='recovery'><h1>{title}</h1><div className='secondary'>{children}</div><div className='recovery-actions'>{action}<Link className='catalog-link' href='/'>Volver al catálogo</Link></div></section>;
}
