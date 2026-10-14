import { loadStore } from './store.js';
import { runFilter, summarise, sourceBreakdown, inStockCoverage, EMPTY } from './filters.js';
import { buildOverviewModel } from './overview-model.js';
self.onmessage = async () => {
  let last = -1;
  try {
    const store=await loadStore(progress=>{
      const step=Math.floor(progress.progress*50);
      if(progress.meta || progress.stage==='meta' || step!==last){last=step;self.postMessage(progress);}
    });
    store.allRows=runFilter(store,EMPTY,{key:'oos',dir:'desc'}).rows;
    store.rowsByListed=runFilter(store,EMPTY,{key:'listed',dir:'desc'}).rows;
    store.allStats=summarise(store,store.allRows);
    store.allSources=sourceBreakdown(store,store.allRows);
    store.overview={
      reportable:store.allRows.filter(i=>store.P.clinical[i]===1 && store.P.nOos[i]>=2 && store.D.matchBand[store.P.matchBand[i]]!=='low' && store.D.review[store.P.review[i]]==='auto'),
      widelyAvailable:inStockCoverage(store,store.allRows),
      reviewCount:store.allRows.reduce((count,i)=>count+(store.D.review[store.P.review[i]]==='needs_review'?1:0),0),
    };
    store.overviewModel=buildOverviewModel(store);
    self.postMessage({part:'base',value:{...store,P:{},keyIndex:new Map(),byIngredient:new Map()}});
    for(const [name,value] of Object.entries(store.P)) {
      if(Array.isArray(value) && value.length>4000) {
        for(let offset=0;offset<value.length;offset+=4000)self.postMessage({part:'column',name,length:value.length,offset,values:value.slice(offset,offset+4000)});
      } else self.postMessage({part:'value',name,value},ArrayBuffer.isView(value)?[value.buffer]:[]);
    }
    for(const name of ['keyIndex','byIngredient']) {
      const entries=Array.from(store[name]);
      for(let offset=0;offset<entries.length;offset+=4000)self.postMessage({part:'map',name,entries:entries.slice(offset,offset+4000)});
    }
    self.postMessage({done:true});
  } catch(error){self.postMessage({error:error.message});}
};
