import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AXES} from '../scripts/benchmarks/scales.mjs';
import {comparisonChart} from '../scripts/benchmarks/chart.mjs';
import {renderComparisons,validateComparison} from '../scripts/benchmarks/comparisons.mjs';
import {HOME,F,tokens,applyFacts} from '../scripts/benchmarks/facts.mjs';
const browser=JSON.parse(readFileSync(new URL('../assets/benchmarks/browser.json',import.meta.url)));
test('fixed domains preserve headroom and list overflowing observations',()=>{
 const chart=value=>comparisonChart({id:'x',title:'Test',subtitle:'',axis:AXES.file_open,series:[{label:'NUS',value,observations:[{run:1,value}]}]});
 assert.match(chart(20),/width:10%/);assert.match(chart(20),/Scale zero to 200/);
 assert.match(chart(250),/Outside the fixed plot domain/);assert.match(chart(250),/250/);
 assert.match(chart(250),/>›<\/span>/);
 const deterministic=comparisonChart({id:'size',title:'Size',subtitle:'',axis:AXES.installed,series:[{label:'App',value:9999}]});
 assert.match(deterministic,/Outside the fixed plot domain/);
});
test('incomplete, duplicate or invalid browser runs cannot publish',()=>{
 const d=structuredClone(browser);d.status='failed';assert.throws(()=>validateComparison(d,['NUS','Zen']),/Incomplete/);
 const duplicate=structuredClone(browser);duplicate.attempts[2].trial=duplicate.attempts[1].trial;assert.throws(()=>validateComparison(duplicate,['NUS','Zen']));
 const invalid=structuredClone(browser);invalid.attempts[0].result.score.mean=NaN;assert.throws(()=>renderComparisons(HOME,invalid),/Invalid/);
 const hidden=structuredClone(browser);hidden.attempts[0].result.visible='hidden';assert.throws(()=>renderComparisons(HOME,hidden),/Invalid/);
});
test('comparison report preserves the full stack matrix and measurement boundaries',()=>{
 const html=renderComparisons(HOME,browser);
 for(const b of ['Arc','Zen'])for(const t of ['Ghostty','Kitty','WezTerm'])assert.ok(html.includes(`VS Code + ${b} + ${t}`));
 assert.match(html,/Arc has no clean-profile runtime result/);
 assert.match(html,/p95 · 20 independent opens/);assert.match(html,/Maximum · 5 independent opens/);
 assert.match(html,/not ten independent app launches/);assert.match(html,/dependent increments/);
 assert.ok(!html.includes('/Users/'));assert.ok(!html.includes('<script'));
});
test('homepage p95 and maximum are derived from observations and shared site-wide',()=>{
 const v=F.file10.observations.map(o=>o.value).sort((a,b)=>a-b);assert.equal(F.file10.value,v[Math.ceil(v.length*.95)-1]);
 assert.equal(F.file100.value,Math.max(...F.file100.observations.map(o=>o.value)));
 for(const path of ['index.html','docs/measurements/index.html','review/performance/index.html']){
  const text=readFileSync(new URL('../'+path,import.meta.url),'utf8');assert.ok(text.includes(tokens['file10.p95']));assert.ok(text.includes(tokens['file100.max']));assert.ok(!text.includes('{{figure:'));
 }
 assert.throws(()=>applyFacts('{{figure:missing}}'),/Unknown/);
});
test('workspace figures require matching binaries, complete oracles and sample-derived medians',()=>{
 const workspace=JSON.parse(readFileSync(new URL('../assets/benchmarks/workspace.json',import.meta.url)));
 const values=workspace.attempts.filter(r=>r.product==='NUS').map(r=>r.rss_mib).sort((a,b)=>a-b);
 assert.ok(renderComparisons(HOME,browser,workspace).includes(new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(values[2])));
 const bad=structuredClone(workspace);bad.attempts[0].rss_mib+=1;assert.throws(()=>renderComparisons(HOME,browser,bad),/Invalid workspace/);
 const missing=structuredClone(workspace);missing.attempts[0].oracles.terminal=false;assert.throws(()=>renderComparisons(HOME,browser,missing),/Invalid workspace/);
 const mixed=structuredClone(workspace);mixed.apps.NUS.binary_sha256='0'.repeat(64);assert.throws(()=>renderComparisons(HOME,browser,mixed),/Mixed runtime/);
});
test('Arc follow-up retains its distinct sampling unit and requires the same workload and binary',()=>{
 const arc=JSON.parse(readFileSync(new URL('../assets/benchmarks/arc-browser.json',import.meta.url)));
 const html=renderComparisons(HOME,browser,null,arc);
 assert.match(html,/5 repetitions \/ one session/);assert.match(html,/comparison__bar--followup/);
 assert.match(html,/one process/);assert.ok(!html.includes('Arc has no clean-profile runtime result'));
 assert.match(html,/no confidence interval or claim of a profile-matched speedup/);
 const session=structuredClone(arc);session.session_reused=false;assert.throws(()=>renderComparisons(HOME,browser,null,session),/session policy/);
 const binary=structuredClone(arc);binary.apps.Arc.binary_sha256='0'.repeat(64);assert.throws(()=>renderComparisons(HOME,browser,null,binary),/binary mismatch/);
 const workload=structuredClone(arc);workload.source_revision='0'.repeat(40);assert.throws(()=>renderComparisons(HOME,browser,null,workload),/workloads/);
 const missing=structuredClone(arc);missing.attempts.pop();assert.throws(()=>renderComparisons(HOME,browser,null,missing),/sample count/);
});
test('Arc stack follow-up requires every terminal and never conceals shared-session accounting',()=>{
 const arc=JSON.parse(readFileSync(new URL('../assets/benchmarks/arc-workspace.json',import.meta.url)));
 const workspace=JSON.parse(readFileSync(new URL('../assets/benchmarks/workspace.json',import.meta.url)));
 const html=renderComparisons(HOME,browser,workspace,null,arc);
 assert.equal((html.match(/comparison__bar--followup/g)||[]).length,3);
 assert.match(html,/after the browser benchmark/);assert.match(html,/Arc session retained/);
 const invalid=structuredClone(arc);invalid.attempts[0].oracles.editor_bytes=0;assert.throws(()=>renderComparisons(HOME,browser,workspace,null,invalid),/Invalid workspace/);
 const missing=structuredClone(arc);missing.attempts.pop();assert.throws(()=>renderComparisons(HOME,browser,workspace,null,missing),/sample count/);
});
