import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import { installAdaptiveFavicon } from '../src/lib/favicon.ts';

test('favicon replaces the browser icon on theme changes and cleans up its listener',()=>{
 const originalDocument=globalThis.document,originalWindow=globalThis.window;
 let current;let replacements=0;
 const createIcon=()=>({href:'',rel:'',type:'',sizes:{value:''},dataset:{},replaceWith(next){assert.equal(this,current);current=next;replacements++;}});
 current=createIcon();current.href='/favicon.svg';
 const preference=Object.assign(new EventTarget(),{matches:false});
 try {
  globalThis.document={querySelector:()=>current,createElement:()=>createIcon()};
  globalThis.window={matchMedia:()=>preference};
  const cleanup=installAdaptiveFavicon();
  assert.equal(current.href,'/brand/praesto/praesto-b-favicon-light-32.png?v=praesto-3');
  assert.equal(current.type,'image/png');assert.equal(current.sizes.value,'32x32');
  preference.matches=true;preference.dispatchEvent(new Event('change'));
  assert.equal(current.href,'/brand/praesto/praesto-b-favicon-dark-32.png?v=praesto-3');
  preference.matches=false;preference.dispatchEvent(new Event('change'));
  assert.equal(current.href,'/brand/praesto/praesto-b-favicon-light-32.png?v=praesto-3');assert.equal(replacements,3);
  cleanup();preference.matches=true;preference.dispatchEvent(new Event('change'));assert.equal(replacements,3);
 }finally{if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;}
});
test('publication declares exactly one browser favicon so cached alternatives cannot win',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.equal([...html.matchAll(/rel="icon"/g)].length,1);
 assert.ok(html.includes('data-adaptive-favicon'));
});
