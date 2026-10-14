import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicalFields, validateClinicalRecord, validateClinicalPath } from '../src/lib/clinical.ts';
const record={schema_version:1,ingredient_id:'source-id',ingredient_name:'Amoxicillin / Clavulanate',source:'Local fixture',source_version:'v1',source_url:null,source_updated_at:null,collected_at:null,clinical_reviewed_at:null,pregnancy_scheme:null,jurisdiction:null,local_preview:true,fields:Object.fromEntries(clinicalFields.map(([key])=>[key,null]))};
test('clinical source strings survive exactly, including markup as text',()=>{
  const input={...record,fields:{...record.fields,indications:'Line one\n<b>Source text</b>',additional_labelling:'10a, B'}};
  assert.deepEqual(validateClinicalRecord(input,record.ingredient_name),input);
  assert.equal(input.fields.pregnancy_risk_category,null);
});
test('clinical boundary rejects ambiguous identity, missing fields, unsafe links and invalid dates',()=>{
  for(const input of [{...record,ingredient_name:'Amoxicillin'},{...record,schema_version:2},{...record,fields:{}},{...record,source_url:'javascript:alert(1)'},{...record,source_updated_at:'not a date'}]) assert.throws(()=>validateClinicalRecord(input,record.ingredient_name));
});
test('pregnancy categories require source scheme and jurisdiction',()=>{
  const input={...record,fields:{...record.fields,pregnancy_risk_category:'B'}};
  assert.throws(()=>validateClinicalRecord(input,record.ingredient_name));
  assert.ok(validateClinicalRecord({...input,pregnancy_scheme:'Source scheme',jurisdiction:'Source jurisdiction'},record.ingredient_name));
});
test('reference configuration accepts only unambiguous same-origin paths',()=>{
  assert.equal(validateClinicalPath('/api/clinical-reference'),'/api/clinical-reference');
  for(const value of ['https://vendor.test','//vendor.test','/\\vendor.test','/api?key=value','/api#fragment','/api\n']) assert.equal(validateClinicalPath(value),null);
});
