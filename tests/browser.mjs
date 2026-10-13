import assert from 'node:assert/strict';
import { call, evaluate, wait, click, input, errors, screenshot, close } from './browser-support.mjs';

const choose = async label => {
  await evaluate("document.querySelector('.examples-menu').open=true");
  await click(label);
  await new Promise(resolve => setTimeout(resolve, 80));
};
const derive = async () => {
  await click('Derivar');
  await wait("document.querySelector('[role=status]').textContent.includes('Derivada lista')");
  await wait("Boolean(document.querySelector('.MafsView svg'))");
};
const setX = value => evaluate(`(() => {
  const element = document.querySelector('input[aria-label="Valor de x"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, ${JSON.stringify(String(value))});
  element.dispatchEvent(new Event('input', {bubbles:true}));
})()`);
const viewport = width => call('Emulation.setDeviceMetricsOverride', { width, height:900, deviceScaleFactor:1, mobile:width === 360 });
const confirmNoOverflow = async width => assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), `Page overflow at ${width}`);

try {
  await call('Runtime.enable'); await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', {source: `
    window.NativeWorker=window.Worker;window.workerCount=0;window.lastModel=null;
    window.Worker=class extends window.NativeWorker {
      constructor(...args) {super(...args);window.workerCount++;this.addEventListener('message',event=>{if(event.data.kind==='complete')window.lastModel=event.data.model;});}
    };window.TrackedWorker=window.Worker;
  `});
  await viewport(1440);
  await call('Page.navigate', {url:process.env.DERIVATIVE_TEST_URL || 'http://localhost:3000/calculators/derivatives'});
  await wait("Boolean(document.querySelector('#function-editor'))");
  assert.equal(await evaluate("document.querySelector('h1').textContent"),'Derivadas');
  assert.ok(await evaluate("document.querySelector('.empty-workspace') !== null"));
  await derive();
  assert.match(await evaluate("document.querySelector('.latex-copy code').textContent"),/3x\^2-8x\+2/);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.MafsView')).backgroundColor"),'rgb(32, 32, 32)');
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('dd'),element=>element.textContent)"),['-4','-2']);
  assert.ok(await evaluate("document.querySelector('.MafsView').getBoundingClientRect().top < 500"));
  assert.ok(await evaluate("document.querySelector('.graph-panel').getBoundingClientRect().left < document.querySelector('.result-inspection').getBoundingClientRect().left"));
  assert.equal(await evaluate("document.querySelector('.steps').open"),false);
  const workerCount = await evaluate('window.workerCount');
  await evaluate("document.querySelector('.mafs-movable-point').focus()");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  assert.notEqual(await evaluate("document.querySelector('#inspection-x').value"),'2');
  const point = await evaluate("(()=>{const r=document.querySelector('.mafs-movable-point-hitbox').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  const before = await evaluate("document.querySelector('#inspection-x').value");
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x+25,y:point.y,buttons:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x+25,y:point.y,button:'left',clickCount:1});
  await wait(`document.querySelector('#inspection-x').value !== ${JSON.stringify(before)}`);
  assert.equal(await evaluate('window.workerCount'),workerCount,'Inspecting x must not derive again');
  await click('Restablecer x');

  await evaluate("document.querySelector('.steps').open=true");
  await wait("document.querySelectorAll('.steps math-field').length === window.lastModel.steps.length");
  assert.equal(await evaluate("document.querySelectorAll('.steps code').length"),0);
  assert.match(await evaluate("document.querySelector('.steps').textContent"),/Regla de la suma/);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for (const width of [360,768,1440]) {
    await viewport(width); await new Promise(resolve=>setTimeout(resolve,150));
    await confirmNoOverflow(width);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.primary')).transitionDuration"),'0s');
    if(width < 900) assert.ok(await evaluate("document.querySelector('.result-inspection').getBoundingClientRect().top < document.querySelector('.graph-panel').getBoundingClientRect().top"));
    await screenshot(`/tmp/derivative-redesign-${width}-steps.png`);
    await evaluate("document.querySelector('.steps').open=false");
    await screenshot(`/tmp/derivative-redesign-${width}.png`,false);
    await evaluate("document.querySelector('.steps').open=true");
  }
  await call('Emulation.setEmulatedMedia',{features:[]});

  // Constant: original function and derivative must both have visible horizontal curves.
  await choose('Constante'); await derive();
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('dd'),element=>element.textContent)"),['7','0']);
  assert.equal(await evaluate("document.querySelectorAll('.MafsView polyline').length"),2);
  await choose('1/x'); await derive(); await setX(0);
  await wait("document.querySelector('.inspection').textContent.includes('no está definida')");
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('dd'),element=>element.textContent)"),['—','—']);
  assert.ok(await evaluate("document.querySelectorAll('.MafsView polyline').length >= 4"));
  await choose('Hueco'); await derive(); await setX(1);
  await wait("document.querySelector('.inspection').textContent.includes('no está definida')");
  await choose('√x'); await derive(); await setX(0);
  await wait("document.querySelector('.inspection').textContent.includes('No podemos confirmar')");
  assert.equal(await evaluate("document.querySelector('dd').textContent"),'0');
  await input('\\frac{x}{'); await new Promise(resolve=>setTimeout(resolve,80));
  assert.match(await evaluate("document.body.textContent"),/Resultado anterior/);
  await click('Derivar'); await wait("Boolean(document.querySelector('[role=alert]'))");
  await choose('Polinomio'); await derive();
  await click('Ayuda'); assert.equal(await evaluate("document.querySelector('dialog').open"),true);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await wait("document.querySelector('dialog').open === false");
  await evaluate("document.querySelector('#function-editor').focus()");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.ok(await evaluate("document.activeElement !== document.body"));

  // Deterministic busy-worker timeout and edit cancellation, followed by the real engine.
  await evaluate("window.terminated=0;window.Worker=class {constructor(){setTimeout(()=>this.onmessage?.({data:{kind:'ready'}}),20)}postMessage(){}terminate(){window.terminated++}};");
  await click('Derivar'); await wait("document.querySelector('[role=status]').textContent.includes('Calculando')");
  await screenshot('/tmp/derivative-redesign-loading.png',false);
  await wait("document.querySelector('[role=alert]')?.textContent.includes('3 segundos')");
  assert.equal(await evaluate('window.terminated'),1);
  await evaluate('window.Worker=window.TrackedWorker'); await click('Reintentar');
  await wait("document.querySelector('[role=status]').textContent.includes('Derivada lista')");
  await evaluate("window.Worker=class {constructor(){setTimeout(()=>this.onmessage?.({data:{kind:'ready'}}),20)}postMessage(){}terminate(){window.terminated++}};");
  await click('Derivar'); await input('7'); await new Promise(resolve=>setTimeout(resolve,80));
  assert.match(await evaluate("document.body.textContent"),/Resultado anterior/);
  await evaluate('window.Worker=window.TrackedWorker'); await derive();

  // Partial response uses a valid real model with unavailable graph/steps capabilities.
  await evaluate(`window.Worker=class {
    constructor(){setTimeout(()=>this.onmessage?.({data:{kind:'ready'}}),20)}
    postMessage(request){const model={...window.lastModel,steps:[],derivative:null};setTimeout(()=>this.onmessage?.({data:{kind:'complete',id:request.id,model}}),20)}
    terminate(){}
  };`);
  await derive();
  assert.match(await evaluate("document.querySelector('[role=status]').textContent"),/Los pasos no están disponibles/);
  assert.match(await evaluate("document.querySelector('[role=status]').textContent"),/La gráfica de la derivada no está disponible/);
  await screenshot('/tmp/derivative-redesign-partial.png',false);
  await evaluate('window.Worker=window.TrackedWorker');

  // Long input/result/steps must scroll locally, including mobile and text zoom.
  const longInput = Array.from({length:12},(_,index)=>`\\sin(${index+1}x)`).join('+');
  await input(longInput); await new Promise(resolve=>setTimeout(resolve,80)); await derive();
  await evaluate("document.querySelector('.steps').open=true");
  await wait("document.querySelectorAll('.steps math-field').length === window.lastModel.steps.length");
  for (const width of [360,768,1440]) {await viewport(width);await new Promise(resolve=>setTimeout(resolve,150));await confirmNoOverflow(width);}
  assert.ok(await evaluate("(()=>{const region=document.querySelector('.formula .math-formula');region.scrollLeft=100;return region.scrollLeft>0;})()"),'Long derivative must scroll locally');
  await evaluate("document.querySelector('.steps .math-formula').focus()");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await wait("document.querySelector('.steps .math-formula').scrollLeft > 0");
  await screenshot('/tmp/derivative-redesign-long-formula.png');
  await viewport(360);
  await evaluate("document.body.style.fontSize='30px'"); await confirmNoOverflow(360);
  await evaluate("document.body.style.fontSize=''");
  await input('10^{-8}x'); await new Promise(resolve=>setTimeout(resolve,80)); await derive();
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('dd'),element=>element.textContent)"),['2E-8','1E-8']);
  await wait("document.querySelector('.tangent-result math-field')?.value.includes('10^{-8}')");
  await choose('Polinomio'); await derive();
  await viewport(1440); await evaluate('window.scrollTo(0,0); document.activeElement.blur()'); await new Promise(resolve=>setTimeout(resolve,150)); await screenshot('/tmp/derivative-redesign-final-1440.png',false);
  assert.deepEqual(errors,[]);
  console.log('Production checks passed: cubic, constant, invalid syntax, original holes, numeric/keyboard/drag controls, cancellation, timeout/recovery, partial results, rendered steps, long formulas, reduced motion, 360/768/1440px.');
} finally {close();}
