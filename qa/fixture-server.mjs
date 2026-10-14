/** Local production-bundle fault fixture. Never part of a deployment. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist');
const failures=new Set(['/app/products.json','/app/listings.json']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml'};
createServer(async(request,response)=>{
  response.setHeader('Cache-Control','no-store');
  const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(failures.delete(path)){response.writeHead(503,{'Content-Type':'application/json'});response.end('{"error":"intentional local test fault"}');return;}
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
  try{const body=await readFile(file);response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});response.end(body);}
  catch{response.writeHead(404);response.end();}
}).listen(4174,'127.0.0.1',()=>console.log('Local production fault fixture: http://127.0.0.1:4174 (first products/listings request fails once)'));
