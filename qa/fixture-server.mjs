/** Local production-bundle fault fixture. Never part of a deployment. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist');
const scenario=process.env.KPAD_TEST_SCENARIO || 'retry';
const failures=scenario==='retry'?new Map([['/app/products.json',2],['/app/listings.json',2]]):new Map();
let corruptMeta=scenario==='corrupt';
let slowProducts=scenario==='slow';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml'};
createServer(async(request,response)=>{
  response.setHeader('Cache-Control','no-store');
  const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if((failures.get(path)||0)>0){failures.set(path,failures.get(path)-1);response.writeHead(503,{'Content-Type':'application/json'});response.end('{"error":"intentional local test fault"}');return;}
  if(path==='/app/products.json' && slowProducts){slowProducts=false;await new Promise(resolve=>setTimeout(resolve,3000));}
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
  try{const body=await readFile(file);if(path==='/app/meta.json' && corruptMeta){body[100]^=1;corruptMeta=false;}response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});response.end(body);}
  catch{response.writeHead(404);response.end();}
}).listen(4174,'127.0.0.1',()=>console.log(`Local production fixture: http://127.0.0.1:4174 · scenario ${scenario}`));
