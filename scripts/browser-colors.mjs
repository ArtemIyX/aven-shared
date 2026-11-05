import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const chrome=process.env.AVEN_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dir=await mkdtemp(path.join(tmpdir(),'aven-color-browser-'));
const styles=path.resolve(process.env.AVEN_CSS_DIR || 'src/styles');
const html=`<!doctype html><link rel="stylesheet" href="${pathToFileURL(path.join(styles,'colors.css'))}"><link rel="stylesheet" href="${pathToFileURL(path.join(styles,'style.css'))}">
<style>:root {--aven-color-accent: #123456} #legacy {--aven-color-text: #123456;--aven-color-text-muted:#345678} #hook {--aven-text-color: #654321} .loss {color:var(--aven-color-finance-loss-text)} .focus:focus {outline:3px solid var(--aven-color-focus-ring)}</style>
<div id="gradient" style="background-color:var(--aven-gradient-accent-solid-fallback);background-image:var(--aven-gradient-accent-solid-image)"></div><div id="default"><span class="aven-text" id="text">text</span><div id="legacy"><span class="aven-text" id="legacy-text">legacy</span><span class="aven-text aven-text--caption" id="caption">caption</span><blockquote class="aven-text aven-text--quote" id="quote">quote</blockquote><span class="aven-text aven-text--caption" id="caption-hook" style="--aven-text-color:#654321">caption hook</span></div><span class="aven-text" id="hook">hook</span></div>
<section data-aven-theme="dark" id="dark"><div data-aven-theme="light" id="light-island"><div data-aven-theme="system" id="system-in-light"></div></div></section>
<section data-aven-theme="dark" id="local-custom" style="--aven-color-gain-text:#123456"><span id="custom-alias"></span></section>
<section data-aven-theme="light" id="light"><div data-aven-theme="dark" id="dark-island"><div data-aven-theme="system" id="system-in-dark"></div></div></section>
<section data-aven-theme="dark" data-aven-contrast="more"><div data-aven-theme="light" id="more"><span id="more-alias"></span></div></section>
<section data-aven-theme="dark" data-aven-output="print" id="print"><svg><path id="mark" stroke="var(--aven-color-series-01-stroke)" d="M0 0L10 10"/></svg></section>
<div id="selected" style="background:var(--aven-color-surface-selected)"><span id="loss" class="loss">−2%</span><button id="focus" class="focus">Focus</button></div>`;
await writeFile(path.join(dir,'fixture.html'),html);
const gallery=process.env.AVEN_GALLERY ? spawn(process.execPath,['node_modules/vite/bin/vite.js','--config','playground/vite.config.ts','--host','127.0.0.1','--port','4179','--strictPort'],{stdio:'ignore'}) : null;
const proc=spawn(chrome,['--headless=new','--disable-gpu','--no-sandbox','--allow-file-access-from-files','--remote-debugging-port=0',`--user-data-dir=${dir}`,pathToFileURL(path.join(dir,'fixture.html')).href],{stdio:'ignore'});
let socket;try {
 let port;for(let i=0;i<100;i++){try{port=(await readFile(path.join(dir,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await new Promise(r=>setTimeout(r,100))}}assert(port,'Chrome debugging port unavailable');
 let pages;for(let i=0;i<100;i++){pages=await(await fetch(`http://127.0.0.1:${port}/json`)).json();pages=pages.filter(p=>p.url.includes('fixture.html'));if(pages[0]?.webSocketDebuggerUrl)break;await new Promise(r=>setTimeout(r,100))}socket=new WebSocket(pages[0].webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});let id=0;const pending=new Map();socket.onmessage=e=>{const x=JSON.parse(e.data);if(x.id&&pending.has(x.id)){const [ok,fail]=pending.get(x.id);pending.delete(x.id);x.error?fail(Error(x.error.message)):ok(x.result)}};function send(method,params={}){return new Promise((ok,fail)=>{const n=++id;pending.set(n,[ok,fail]);socket.send(JSON.stringify({id:n,method,params}))})}async function evaluate(expression){const out=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(out.exceptionDetails)throw Error(JSON.stringify(out.exceptionDetails));return out.result.value}
 for(let i=0;i<100;i++){if(await evaluate("document.readyState === 'complete' && getComputedStyle(document.documentElement).getPropertyValue('--aven-color-text-primary').trim() !== ''"))break;await new Promise(r=>setTimeout(r,100))}
 const value=(id,n)=>evaluate(`getComputedStyle(document.getElementById(${JSON.stringify(id)})).getPropertyValue(${JSON.stringify(n)}).trim()`);
 const check=async(id,n,expected)=>assert.equal(await value(id,n),expected,`${id} ${n}`);
 for(const [entry,property,expected] of [['tokens','--aven-color-text','#182536'],['finance','--aven-color-finance-gain-text','#115E59'],['charts','--aven-color-series-01-stroke','#1D4ED8'],['diagrams','--aven-color-diagram-canvas','#FFFFFF'],['gradients','--aven-gradient-accent-solid-fallback','#1D4ED8'],['colors','--aven-color-finance-gain-text','#115E59'],['base','min-height','100vh'],['style','margin-block-start','0px']]){
  const href=pathToFileURL(path.join(styles,entry+'.css')).href;
  const result=await evaluate(`new Promise((resolve,reject)=>{const frame=document.createElement('iframe');document.body.appendChild(frame);const doc=frame.contentDocument;const el=doc.createElement('div');el.className=${JSON.stringify(entry==='base'?'aven-app':entry==='style'?'aven-text':'')};doc.body.appendChild(el);const link=doc.createElement('link');link.rel='stylesheet';link.onload=()=>{const result=frame.contentWindow.getComputedStyle(el).getPropertyValue(${JSON.stringify(property)}).trim();frame.remove();resolve(result)};link.onerror=()=>reject(new Error('Failed stylesheet '+${JSON.stringify(href)}));link.href=${JSON.stringify(href)};doc.head.appendChild(link)})`);
  if(entry==='base')assert.notEqual(result,'0px','base stylesheet loaded');else assert.equal(result,expected,entry+' standalone stylesheet');
 }
 await check('default','--aven-color-text','#182536');await check('default','--aven-color-text-primary','#182536');await check('default','--aven-color-surface-base','#FFFFFF');await check('default','--aven-color-accent-solid','#1D4ED8');assert.match(await value('gradient','background-image'),/^linear-gradient/);await check('gradient','background-color','rgb(29, 78, 216)');await check('default','--aven-color-accent','#123456');await check('dark','--aven-color-surface','#131E2D');await check('dark','--aven-color-text-primary','#E5EDF7');await check('dark','--aven-color-accent-solid','#93C5FD');await check('light-island','--aven-color-text','#182536');await check('dark-island','--aven-color-finance-gain-text','#99F6E4');await check('custom-alias','--aven-color-finance-gain-text','#123456');await check('dark-island','--aven-color-diagram-canvas','#0B1220');await check('dark-island','color-scheme','dark');
 await check('legacy-text','color','rgb(18, 52, 86)');await check('hook','color','rgb(101, 67, 33)');await check('caption','color','rgb(52, 86, 120)');await check('quote','color','rgb(52, 86, 120)');await check('caption-hook','color','rgb(101, 67, 33)');await check('loss','color','rgb(159, 18, 57)');
 await evaluate("document.getElementById('focus').focus()");assert.notEqual(await value('focus','outline-style'),'none');
 await check('more','--aven-color-text','#0F172A');await check('more','--aven-color-surface-raised','#FFFFFF');await check('more','--aven-color-button-primary-on-solid','#0F172A');await check('more','--aven-gradient-accent-solid-image','none');await check('print','--aven-color-text','#0F172A');await check('print','--aven-color-series-01-stroke','#0F172A');await check('print','--aven-scale-diverging-return-03','#64748B');
 for(const scheme of ['light','dark']){await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:scheme}]});for(const id of ['system-in-light','system-in-dark']){await check(id,'--aven-color-text-primary',scheme==='dark'?'#E5EDF7':'#182536');await check(id,'color-scheme',scheme)}await check('dark','color-scheme','dark');await check('light','color-scheme','light')}
 await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});await check('dark-island','--aven-color-series-01-stroke','CanvasText');await check('dark-island','--aven-color-finance-loss-text','CanvasText');await check('dark-island','--aven-color-edge-default','CanvasText');await check('print','--aven-color-series-01-stroke','CanvasText');await check('dark-island','--aven-color-button-primary-solid','ButtonFace');await check('dark-island','--aven-color-button-primary-on-solid','ButtonText');await check('print','--aven-gradient-accent-solid-image','none');await check('print','--aven-gradient-accent-solid-fallback','Canvas');await check('dark-island','--aven-scale-diverging-return-03','Canvas');assert.notEqual(await value('mark','stroke'), 'none');assert.notEqual(await value('mark','stroke'), await value('print','background-color')); 
 if(gallery){
  await send('Emulation.setEmulatedMedia',{features:[]});let available=false;for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4179/')).ok){available=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert(available,'Playground server unavailable');
  await send('Page.navigate',{url:'http://127.0.0.1:4179/'});for(let i=0;i<100;i++){try{if(await evaluate("!!document.querySelector('.color-gallery select')"))break}catch{}await new Promise(r=>setTimeout(r,100))}
  const folder=path.resolve('gallery-review');await import('node:fs/promises').then(fs=>fs.mkdir(folder,{recursive:true}));
  for(const [name,width,height,theme] of [['light',1200,900,'light'],['dark',1200,900,'dark'],['narrow',390,844,'light']]){
   await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   await evaluate(`(()=>{const s=document.querySelector('.color-gallery select');s.value=${JSON.stringify(theme)};s.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.color-gallery').scrollIntoView()})()`);await new Promise(r=>setTimeout(r,200));
   const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(folder,name+'.png'),Buffer.from(shot.data,'base64'));
   const layout=await evaluate("({scroll:document.documentElement.scrollWidth, client:document.documentElement.clientWidth, theme:document.querySelector('.color-gallery').getAttribute('data-aven-theme')})");assert.equal(layout.theme,theme);assert(layout.scroll<=layout.client+1, name+' horizontal overflow: '+JSON.stringify(layout));
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:1,mobile:false});
  await evaluate("document.querySelector('.color-gallery').scrollIntoView()");
  await evaluate("document.querySelector('.color-gallery .selected').focus()");
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.color-gallery .selected')).outlineStyle"),'none','selected row focus');
  await evaluate("document.querySelector('.color-gallery input[aria-invalid]').focus()");
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.color-gallery input[aria-invalid]')).outlineStyle"),'none','invalid input focus');
  await send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
  await evaluate("document.querySelector('.color-gallery .selected').focus()");
  const focus=await evaluate("({outline:getComputedStyle(document.querySelector('.color-gallery .selected')).outlineColor, background:getComputedStyle(document.querySelector('.color-gallery .selected')).backgroundColor})");assert.notEqual(focus.outline,focus.background,'forced selected focus contrast');
  await send('Emulation.setEmulatedMedia',{features:[]});
  for(const vision of ['deuteranopia','protanopia','achromatopsia']){await send('Emulation.setEmulatedVisionDeficiency',{type:vision});const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(folder,vision+'.png'),Buffer.from(shot.data,'base64'))}
  await send('Emulation.setEmulatedVisionDeficiency',{type:'none'});
  console.log('Gallery screenshots captured for light, dark, narrow and simulated vision deficiencies; no page overflow.');
 }
 console.log('Browser computed-style checks passed, including live system changes, contrast, forced colors and print.');
} finally {socket?.close();proc.kill();gallery?.kill();await new Promise(r=>setTimeout(r,300));if(path.basename(dir).startsWith('aven-color-browser-')&&path.dirname(dir)===tmpdir())await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:200})}
