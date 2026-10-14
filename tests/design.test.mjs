import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/tokens.css',import.meta.url),'utf8');
const tokens=Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([,key,value])=>[key,value.trim()]));
const color=(name)=>tokens[name].startsWith('var(')?color(tokens[name].slice(4,-1)):tokens[name];
const luminance=(hex)=>{
  const rgb=hex.slice(1).match(/../g).slice(0,3).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{const x=luminance(color(a)),y=luminance(color(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('semantic text and accent pairs meet normal-text AA contrast',()=>{
  const pairs=[['--text-on-inverse','--surface-navigation-active'],['--navigation-active','--surface-navigation-active'],['--in-on-inverse','--surface-inverse'],['--out-on-inverse','--surface-inverse'],['--text-on-inverse','--launcher-surface'],['--ink','--surface'],['--ink-2','--surface'],['--ink-3','--surface-sunk'],['--ink-4','--surface-sunk'],['--accent','--accent-soft'],['--in','--in-soft'],['--out','--out-soft'],['--warn','--warn-soft'],['--teal','--teal-soft'],['--teal-strong','--teal-soft'],['--cobalt','--cobalt-soft'],['--coral','--coral-soft'],['--botanical','--botanical-soft'],['--berry','--berry-soft'],['--text-on-inverse','--surface-inverse'],['--text-muted-on-inverse','--surface-inverse'],['--text-muted-on-inverse','--surface-inverse-selected'],['--text-on-inverse','--surface-inverse-selected']];
  for(const [foreground,background] of pairs){const value=ratio(foreground,background);assert.ok(value>=4.5,`${foreground}/${background}: ${value.toFixed(2)}`);}
  console.log('Contrast pairs:',pairs.map(([a,b])=>`${a}/${b} ${ratio(a,b).toFixed(2)}:1`).join('; '));
});
test('font sources are local, use swap, and preserve license files',async()=>{
  const fonts=await readFile(new URL('../src/fonts.css',import.meta.url),'utf8');
  assert.ok(!fonts.includes('https://'));
  assert.equal((fonts.match(/@font-face/g)||[]).length,8);
  assert.equal((fonts.match(/font-display: swap/g)||[]).length,8);
  for(const family of ['libertinusserif','nunito','jetbrainsmono']) assert.ok((await readFile(new URL(`../static/fonts/${family}-OFL.txt`,import.meta.url),'utf8')).includes('SIL OPEN FONT LICENSE'));
});

test('categorical marks and control boundaries retain non-text contrast on white',()=>{
  for(const name of ['--category-medicine','--category-device','--category-supplement','--category-cosmetic','--category-personal','--category-food','--category-wellness','--category-unknown','--line-strong','--ramp-3']) assert.ok(ratio(name,'--surface')>=3,`${name}: ${ratio(name,'--surface').toFixed(2)}`);
});
