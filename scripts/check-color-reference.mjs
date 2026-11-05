import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { validateColors } from './colors-contract.mjs';
const manifest=JSON.parse(readFileSync('src/tokens/colors.json','utf8')),by=validateColors(manifest);let section='';const counts={ramps:0,semantic:0,scales:0,gradients:0};
const sections=new Set(['Surfaces','Foreground and boundaries','Semantic palettes','Status mappings','Controls','Tables and trees','Finance roles','Categorical series','Chart infrastructure','Candlesticks and depth','Diagrams']);
function resolve(name,mode){const token=by.get(name);assert(token,`Missing documented token ${name}`);const value=token[mode]??token.value;return typeof value==='string'?value:resolve(value.ref,mode)}
const hex=s=>s.match(/#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?/g)||[];
for(const line of readFileSync('docs/color-palette.md','utf8').split(/\r?\n/)){
 if(line.startsWith('## '))section=line.slice(3);if(!line.startsWith('| '))continue;const c=line.slice(1,-1).split('|').map(x=>x.trim());
 if(section==='Primitive ramps'&&c.length===12&&hex(line).length===11){hex(line).forEach((v,i)=>assert.equal(resolve(`--aven-palette-${c[0]}-${[50,100,200,300,400,500,600,700,800,900,950][i]}`,'light'),v));counts.ramps++}
 if(sections.has(section)&&/^`[a-z0-9-]+`$/.test(c[0])&&hex(c[1]||'').length===1&&hex(c[2]||'').length===1){for(const [mode,i] of [['light',1],['dark',2]])assert.equal(resolve('--aven-color-'+c[0].slice(1,-1),mode),hex(c[i])[0],`${c[0]} ${mode}`);counts.semantic++}
 if(section==='Continuous and discrete data scales'&&c.length===4&&hex(c[1]).length){for(const [mode,i] of [['light',1],['dark',2]])hex(c[i]).forEach((v,j)=>assert.equal(resolve(`--aven-scale-${c[0]}-${String(j+1).padStart(2,'0')}`,mode),v));counts.scales++}
 if(section==='Gradient recipes'&&c.length===6&&hex(c[1]).length){for(const [mode,i] of [['light',1],['dark',2]])hex(c[i]).forEach((v,j)=>assert.equal(resolve(`--aven-gradient-${c[0]}-stop-${String(j+1).padStart(2,'0')}`,mode),v));assert.equal(resolve(`--aven-gradient-${c[0]}-fallback`,'light'),hex(c[3])[0]);assert.equal(resolve(`--aven-gradient-${c[0]}-fallback`,'dark'),hex(c[3])[1]);const g=manifest.gradients.find(x=>x.name===c[0]);assert.equal(g.foreground,c[4]);counts.gradients++}
}
assert.deepEqual(counts,{ramps:24,semantic:998,scales:32,gradients:149});console.log('Palette reference matches all documented ramps, semantic rows, scales and gradients.');
