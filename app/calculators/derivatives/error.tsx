'use client';
import Recovery from '@/components/Recovery';
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <Recovery title='No pudimos abrir Derivadas' action={<button className='utility-button' onClick={retry}>Reintentar módulo</button>}><p>Ocurrió un error en la herramienta. Puedes reintentar o volver al catálogo.</p></Recovery>;
}
