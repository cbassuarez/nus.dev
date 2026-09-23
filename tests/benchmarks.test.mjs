import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarize,validateCatalog} from '../scripts/benchmarks/model.mjs';
import {renderReport} from '../scripts/benchmarks/report.mjs';
const catalog=JSON.parse(readFileSync(new URL('../assets/benchmarks/catalog.json',import.meta.url)));
test('median intervals use independent observations and retain extremes',()=>{
 const s=summarize([1,2,3,4,5,6,7,8,9,1000].map(value=>({value})));
 assert.equal(s.median,5.5);assert.equal(s.max,1000);
 assert.deepEqual(s.ci,{low:2,high:9,coverage:0.978515625});
 assert.equal(summarize([1,2,3,4,5].map(value=>({value}))).ci,null);
 assert.equal(summarize([]).median,null);
});
test('invalid observations and false complete status fail closed',()=>{
 for(const value of [-1,Infinity,NaN,true]){const d=structuredClone(catalog);d.records[0].metrics[0].observations[0].value=value;assert.throws(()=>validateCatalog(d),/observation/);}
 const d=structuredClone(catalog);d.records[0].failed_attempts=1;assert.throws(()=>validateCatalog(d),/Incomplete/);
 const duplicate=structuredClone(catalog);duplicate.records[0].metrics[0].observations.push(duplicate.records[0].metrics[0].observations[0]);assert.throws(()=>validateCatalog(duplicate),/duplicate observation/);
});
test('public report is usable without scripts, includes outliers and handles failed/empty runs',()=>{
 const html=renderReport(catalog);assert.ok(html.includes('Every observation'));assert.ok(html.includes('1,616.91'));assert.ok(html.includes('not display scanout'));assert.ok(!html.includes('/Users/'));
 const failed=structuredClone(catalog);failed.records[0].status='failed';assert.ok(renderReport(failed).includes('Incomplete experiment'));
 assert.ok(renderReport({schema:1,records:[]}).includes('No measurements'));
 const missing=structuredClone(catalog);missing.records[0].metrics[1].observations=[];assert.ok(renderReport(missing).includes('No valid observations'));
});
test('text from result descriptors cannot inject markup',()=>{
 const data=structuredClone(catalog);data.records[0].product='<img src=x onerror=alert(1)>';
 assert.ok(renderReport(data).includes('&lt;img'));assert.ok(!renderReport(data).includes('<img src=x'));
});

test('proof publication requires matching source and a rejected semantic mutation', async()=>{
 const {validateProof}=await import('../scripts/benchmarks/proof.mjs');
 const {createHash}=await import('node:crypto');
 const p=JSON.parse(readFileSync(new URL('../assets/benchmarks/ring-proof.json',import.meta.url)));
 const hash=createHash('sha256').update(readFileSync(new URL('../assets/benchmarks/ring.rs',import.meta.url))).digest('hex');
 assert.equal(validateProof(p,hash),p);
 assert.throws(()=>validateProof(p,'0'.repeat(64)),/stale/);
 assert.throws(()=>validateProof({...p,mutation_rejected:false},hash),/Unverified/);
 assert.ok(renderReport(catalog,p).includes('not an attestation of the measured executable'));
});
