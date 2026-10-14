/** Move parsing, integrity checks and column preparation off the UI thread. */
import { loadStore as loadDirect } from './store.js';
export function loadStore(onStage,signal) {
  if(typeof Worker==='undefined')return loadDirect(onStage);
  return new Promise((resolve,reject)=>{
    let assembled;
    const worker=new Worker(new URL('./store.worker.js',import.meta.url),{type:'module'});
    const cleanup=()=>{worker.terminate();signal?.removeEventListener('abort',abort);};
    const abort=()=>{cleanup();reject(new Error('Catalogue loading cancelled'));};
    signal?.addEventListener('abort',abort,{once:true});
    if(signal?.aborted){abort();return;}
    worker.onmessage=({data})=>{
      if(data.stage)onStage?.(data);
      else if(data.error){cleanup();reject(new Error(data.error));}
      else if(data.part==='base')assembled=data.value;
      else if(data.part==='value')assembled.P[data.name]=data.value;
      else if(data.part==='column'){
        const target=assembled.P[data.name] ?? (assembled.P[data.name]=new Array(data.length));
        for(let i=0;i<data.values.length;i++)target[data.offset+i]=data.values[i];
      } else if(data.part==='map')for(const [key,value] of data.entries)assembled[data.name].set(key,value);
      else if(data.done){cleanup();resolve(assembled);}
    };
    worker.onerror=()=>{cleanup();reject(new Error('Catalogue processing failed'));};
    worker.postMessage({load:true});
  });
}
