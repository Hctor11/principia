import {writeFileSync} from 'node:fs';
export const pages=await (await fetch('http://127.0.0.1:9222/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map();const errors=[];
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);if(d.error)p.reject(d.error);else p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);});
export const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout '+method));},15000);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});ws.send(JSON.stringify({id,method,params}));});
export const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
export const wait=async expression=>{for(let i=0;i<120;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timed out: '+expression);};
export const click=label=>evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.replace(/↗/g,'').trim()===${JSON.stringify(label)}).click()`);
export const input=latex=>evaluate(`(()=>{const e=document.querySelector('math-field');e.value=${JSON.stringify(latex)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);

export { errors };
export const close = () => ws.close();
export async function screenshot(path, full = true) {
 const layout = await call("Page.getLayoutMetrics");
 const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, ...(full ? {clip:{x:0,y:0,width:layout.cssContentSize.width,height:layout.cssContentSize.height,scale:1}} : {}) });
 writeFileSync(path, Buffer.from(shot.data,"base64"));
}
