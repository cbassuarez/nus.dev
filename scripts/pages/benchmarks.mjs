import {renderComparisons} from '../benchmarks/comparisons.mjs';
import {HOME} from '../benchmarks/facts.mjs';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateProof} from '../benchmarks/proof.mjs';
import {renderReport} from '../benchmarks/report.mjs';
import {assetVersion} from '../layout.mjs';
const catalog=JSON.parse(readFileSync(new URL('../../assets/benchmarks/catalog.json',import.meta.url),'utf8'));
const proof=JSON.parse(readFileSync(new URL('../../assets/benchmarks/ring-proof.json',import.meta.url),'utf8'));
const sourceHash=createHash('sha256').update(readFileSync(new URL('../../assets/benchmarks/ring.rs',import.meta.url))).digest('hex');
validateProof(proof,sourceHash);
const optional=name=>{const url=new URL('../../assets/benchmarks/'+name+'.json',import.meta.url);return existsSync(url)?JSON.parse(readFileSync(url)):null};
export default {title:'Benchmarks',path:'/benchmarks/',depth:1,
 description:'NUS performance measurements with raw observations, reproducible methods, and explicit evidence boundaries.',
 head:`<link rel="stylesheet" href="../assets/css/benchmarks.css?v=${assetVersion('assets/css/benchmarks.css')}">`,
 body:renderReport(catalog,proof,renderComparisons(HOME,JSON.parse(readFileSync(new URL('../../assets/benchmarks/browser.json',import.meta.url))),optional('workspace'),optional('arc-browser'),optional('arc-workspace')))};
