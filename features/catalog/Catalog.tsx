'use client';
import { useState } from 'react';
import Link from 'next/link';
import { calculators, availableCategories, categoryLabels, normalizeCategory, searchCalculators } from './registry';
export default function Catalog() {
  const [query, setQuery] = useState(''), [category, setCategory] = useState('all');
  const categories = availableCategories(calculators);
  const results = searchCalculators(calculators, query, category);
  const clear = () => { setQuery(''); setCategory('all'); };
  return <section aria-label='Catálogo de calculadoras'>
    <div className='catalog-controls'>
      <label className='search-control'>Buscar calculadoras<input type='search' value={query} onChange={event => setQuery(event.target.value)} placeholder='Título, descripción o tema'/></label>
      {categories.length > 0 && <label>Categoría<select value={category} onChange={event => setCategory(normalizeCategory(event.target.value, calculators))}><option value='all'>Todas</option>{categories.map(value => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>}
      {(query || category !== 'all') && <button className='text-button' onClick={clear}>Limpiar</button>}
    </div>
    <div role='status' className='sr-only'>{results.length === 1 ? 'Una calculadora disponible' : `${results.length} calculadoras disponibles`}</div>
    {results.length ? <ul className='catalog-list'>{results.map(entry => <li key={entry.id}><Link href={entry.href} prefetch={false} className='catalog-row'>
      <span className='catalog-category'>{categoryLabels[entry.category]}</span><div><h2>{entry.title}</h2><p>{entry.description}</p><span className='catalog-tags'>{entry.tags.join(' · ')}</span></div><span className='open-tool'>Abrir <span aria-hidden='true'>↗</span></span>
    </Link></li>)}</ul> : <div className='catalog-empty'><h2>{categories.length ? 'No encontramos calculadoras' : 'Aún no hay calculadoras disponibles'}</h2><p>Prueba con otro término o limpia los filtros.</p><button className='utility-button' onClick={clear}>Limpiar búsqueda y filtros</button></div>}
  </section>;
}
