import test from 'node:test';
import assert from 'node:assert/strict';
import {pharmacyEvidence,productPattern,stockPatternPoints} from '../src/lib/stock-patterns.ts';
const shops=[
 {bit:0,name:'Available',publishes_oos:true},
 {bit:1,name:'Unavailable',publishes_oos:true},
 {bit:2,name:'Listing only',publishes_oos:false},
 {bit:3,name:'Conflicting',publishes_oos:true},
 {bit:4,name:'Absent',publishes_oos:true},
 {bit:5,name:'Unrated',publishes_oos:true},
];
const store={shops,P:{listedMask:[47,47,4,2,1],inMask:[13,13,4,0,1],oosMask:[10,10,0,2,0],name:['A','B','C','D','E']}};
test('comparison separates conflicting, unknown and missing evidence without promoting listing-only feeds',()=>{
 const groups=pharmacyEvidence(store,0);
 assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([state,sources])=>[state,sources.map(s=>s.name)])),{in:['Available'],out:['Unavailable'],unknown:['Listing only','Unrated'],unlisted:['Absent'],conflict:['Conflicting']});
 assert.equal(Object.values(groups).flat().length,6);
 assert.equal(new Set(Object.values(groups).flat().map(s=>s.bit)).size,6);
});
test('comparison preserves both memberships for disagreeing source listings',()=>{
 assert.deepEqual(productPattern(store,0),{index:0,inStock:2,out:2,kind:'mixed'});
 assert.deepEqual(productPattern(store,2),{index:2,inStock:0,out:0,kind:'unknown'});
 assert.equal(productPattern(store,3).kind,'out');
 assert.equal(productPattern(store,4).kind,'in');
});
test('pattern circle counts partition the chosen products and keep names for inspection',()=>{
 const points=stockPatternPoints(store,[0,1,2,3,4]);
 assert.equal(points.reduce((sum,p)=>sum+p.count,0),5);
 assert.deepEqual(points.find(p=>p.inStock===2&&p.out===2),{inStock:2,out:2,count:2,kind:'mixed',names:['A','B']});
 assert.deepEqual(stockPatternPoints(store,[]),[]);
});
