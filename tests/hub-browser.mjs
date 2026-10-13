import assert from 'node:assert/strict';
import { call, evaluate, wait, click, screenshot, close } from './browser-support.mjs';
const base = process.env.PRINCIPIA_TEST_URL || 'http://localhost:3000';
const navigate = async path => { await call('Page.navigate', {url:base + path}); await wait("document.readyState === 'complete'"); };
const link = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const setQuery = value => evaluate(`(()=>{const e=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
try {
  await call('Runtime.enable'); await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', {source:`window.workerStarts=0;window.workerStops=0;window.NativeWorker=window.Worker;window.Worker=class extends window.NativeWorker{constructor(...a){super(...a);window.workerStarts++;}terminate(){window.workerStops++;super.terminate();}};`});
  await navigate('/'); await wait("Boolean(document.querySelector('.catalog-row'))");
  assert.equal(await evaluate('document.title'), 'Principia — Calculadoras para ingeniería');
  const before = await evaluate("performance.getEntriesByType('resource').map(e=>e.name)");
  const row = await evaluate("(()=>{const r=document.querySelector('.catalog-row').getBoundingClientRect();return {x:r.x+20,y:r.y+20};})()");
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',...row}); await new Promise(r=>setTimeout(r,600));
  assert.equal(await evaluate('window.workerStarts'),0);
  assert.equal(await evaluate("Boolean(customElements.get('math-field'))"),false);
  const after = await evaluate("performance.getEntriesByType('resource').map(e=>e.name)");
  assert.deepEqual(after.filter(url=>!before.includes(url)&&url.includes('/_next/')),[],'Hover must not prefetch module');
  for(const url of after.filter(url=>url.includes('/_next/')&&url.endsWith('.js'))) {
    const source = await (await fetch(url)).text();
    assert.ok(!/MathfieldElement|ComputeEngine|mafs-movable-point|math\.worker/.test(source),`Math dependency loaded by home: ${url}`);
  }
  await setQuery('DERIVACION'); await wait("Boolean(document.querySelector('.catalog-row'))");
  await setQuery('no existe'); await wait("Boolean(document.querySelector('.catalog-empty'))");
  await click('Limpiar búsqueda y filtros'); await wait("Boolean(document.querySelector('.catalog-row'))");
  await evaluate("(()=>{const e=document.querySelector('select');e.value='calculus';e.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await wait("Boolean(Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Limpiar'))");
  await setQuery('no existe'); await wait("Boolean(document.querySelector('.catalog-empty'))"); await click('Limpiar');
  await evaluate("(()=>{const e=document.querySelector('select');e.append(new Option('Invalid','invalid'));e.value='invalid';e.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await wait("document.querySelector('select').value === 'all'");
  await setQuery('  '); await wait("Boolean(document.querySelector('.catalog-row'))"); await click('Limpiar');
  for(const width of [360,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===360});
    await new Promise(r=>setTimeout(r,100));
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    await screenshot(`/tmp/principia-home-${width}.png`);
  }
  await evaluate("document.querySelector('.catalog-row').focus()");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await wait("Boolean(document.querySelector('#function-editor'))");
  assert.equal(await evaluate('location.pathname'),'/calculators/derivatives');
  assert.equal(await evaluate('document.title'),'Derivadas | Principia');
  await link('.breadcrumb a'); await wait("Boolean(document.querySelector('.catalog-row'))");
  await navigate('/calculators/derivatives'); await wait("Boolean(document.querySelector('#function-editor'))");
  await call('Page.reload'); await wait("Boolean(document.querySelector('#function-editor'))");
  // Simulate a worker that accepts work but never completes: navigation must terminate it.
  await evaluate(`window.Worker=class { constructor(){window.workerStarts++;setTimeout(()=>this.onmessage?.({data:{kind:'ready'}}),20);}postMessage(){}terminate(){window.workerStops++;}};`);
  await click('Derivar'); await wait("document.querySelector('[role=status]').textContent.includes('Calculando')");
  await link('header .brand'); await wait("Boolean(document.querySelector('.catalog-row'))");
  assert.equal(await evaluate('window.workerStops'),1);
  await link('.catalog-row'); await wait("Boolean(document.querySelector('#function-editor'))");
  assert.ok(await evaluate("Boolean(document.querySelector('.empty-workspace'))"));
  // A synchronous MathLive setter failure during React's value-sync effect exercises the route boundary.
  await evaluate(`(()=>{const proto=customElements.get('math-field').prototype;window.originalValueDescriptor=Object.getOwnPropertyDescriptor(proto,'value');Object.defineProperty(proto,'value',{...window.originalValueDescriptor,set(){throw new Error('Injected editor failure');}});document.querySelector('.examples-menu').open=true;})()`);
  await click('Constante'); await wait("document.body.textContent.includes('No pudimos abrir Derivadas')");
  assert.ok(await evaluate("Boolean(document.querySelector('header .brand'))"));
  await evaluate("Object.defineProperty(customElements.get('math-field').prototype,'value',window.originalValueDescriptor)");
  await click('Reintentar módulo'); await wait("Boolean(document.querySelector('#function-editor'))");
  await screenshot('/tmp/principia-derivatives-1440.png');
  for(const path of ['/unknown','/calculators/unknown','/derivatives']) {
    const response = await fetch(base+path); assert.equal(response.status,404);
    await navigate(path); await wait("document.body.textContent.includes('Página no encontrada')");
    await link('.recovery a'); await wait("Boolean(document.querySelector('.catalog-row'))");
  }
  console.log('Principia production checks passed: isolated home bundles and hover, search/filters/invalid category/clear, keyboard links, 360/768/1440px, direct route and refresh, worker cancellation on exit, module error and retry, real 404s.');
} finally { close(); }
