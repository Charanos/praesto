import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY} from '../src/lib/filters.js';
import {catalogueContext,filterAccent} from '../src/lib/catalogue-context.ts';
const dictionaries={type:['medicine','device'],matchBand:['high','medium','low'],therapeutic:['Drugs acting on infections']};
const shops=[{bit:0,name:'Garnet Pharmacy'},{bit:4,name:'Goodlife Pharmacy'}];
test('catalogue headings follow search and source scope without changing filters',()=>{
 const filters={...EMPTY,q:' Vitabiotics  Osteocare Fizz ',clinicalOnly:true,shopsAny:[4]};
 const before=JSON.stringify(filters),context=catalogueContext(filters,dictionaries,shops);
 assert.equal(context.title,'“Vitabiotics Osteocare Fizz”');
 assert.ok(context.description.includes('Listed at Goodlife Pharmacy'));
 assert.ok(context.description.includes('Medicines & devices'));
 assert.equal(JSON.stringify(filters),before);
 assert.equal(catalogueContext({...EMPTY,shopsAny:[0]},dictionaries,shops).title,'Garnet Pharmacy catalogue');
 assert.equal(catalogueContext(EMPTY,dictionaries,shops).title,'Find & compare');
});
test('stock and review headings preserve evidence scope',()=>{
 assert.equal(catalogueContext({...EMPTY,stockIn:[0]},dictionaries,shops).title,'Products reported in stock');
 assert.ok(catalogueContext({...EMPTY,stockOut:[0]},dictionaries,shops).description.includes('At least one selected source reports out of stock'));
 assert.equal(catalogueContext({...EMPTY,review:'needs_review'},dictionaries,shops).title,'Product matches to review');
 assert.equal(catalogueContext({...EMPTY,types:[1]},dictionaries,shops).title,'Medical devices');
});
test('selection accents distinguish query, clinical, price and stock dimensions',()=>{
 assert.equal(new Set(['q','clinicalOnly','price','out:any'].map(key=>filterAccent(key).tone)).size,4);
 assert.equal(filterAccent('in:any').tone,'teal');
 assert.equal(filterAccent('any:4').icon,'pharmacy');
});
