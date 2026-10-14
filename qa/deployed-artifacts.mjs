/** Public deployment artifact verification, independent of UI smoke checks. */
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin=new URL(process.argv[2]??'https://praesto-inky.vercel.app');
assert.equal(origin.protocol,'https:');
const files=['index.html','app/meta.json','app/products.json','app/listings.json','favicon.svg','favicon.ico','apple-touch-icon.png','robots.txt','about.html','brand/praesto/praesto-b-favicon-light.svg','brand/praesto/praesto-b-favicon-dark.svg',...(await readdir('dist/assets')).map(file=>'assets/'+file)];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const results=[];
for(let offset=0;offset<files.length;offset+=4) results.push(...await Promise.all(files.slice(offset,offset+4).map(async file=>{const local=await readFile('dist/'+file);const response=await fetch(new URL(file,origin));assert.ok(response.ok,`${file}: ${response.status}`);const remote=Buffer.from(await response.arrayBuffer());assert.equal(hash(remote),hash(local),`${file}: deployed bytes differ`);return {file,status:response.status,bytes:remote.length,sha256:hash(remote),robotsHeader:response.headers.get('x-robots-tag')};})));
const result={origin:origin.origin,verified:results.length,checks:results};
await writeFile('docs/revamp/evidence/overview-overhaul/release/artifacts.json',JSON.stringify(result,null,2));
console.log(`${result.verified} deployed artifacts match the tested production build exactly.`);
