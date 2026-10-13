import Link from 'next/link';
export default function SiteHeader() {
  return <><a className='skip-link' href='#main-content'>Saltar al contenido</a><header>
    <Link href='/' className='brand'>Principia</Link>
    <nav aria-label='Navegación principal'><Link href='/' className='catalog-link'>Catálogo</Link></nav>
  </header></>;
}
