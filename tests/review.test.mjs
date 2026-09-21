import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {REVIEW,validateBudget} from '../scripts/review/data.mjs';
import {REVIEW_PAGES} from '../scripts/review/manifest.mjs';
import {releaseRecord,releasePackages} from '../scripts/review/components.mjs';
import {SITE} from '../scripts/layout.mjs';
import {distributionStatus} from '../assets/js/review-releases.js';
import {signingLabel} from '../assets/js/releases.js';
const ROOT=fileURLToPath(new URL('..',import.meta.url));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const reviewFiles=REVIEW_PAGES.map(p=>`review/${p.slug?p.slug+'/':''}index.html`);
function htmlFiles(dir='') { return readdirSync(join(ROOT,dir),{withFileTypes:true}).flatMap(x=>{
 if(x.name.startsWith('.')||['assets','scripts','tests','content','wasm','review'].includes(x.name))return [];
 const p=join(dir,x.name);return x.isDirectory()?htmlFiles(p):p.endsWith('.html')?[p]:[];
}); }
test('review budget is a positive, unique, balanced one-time request',()=>{
 assert.equal(REVIEW.request,5000);assert.equal(validateBudget(),REVIEW);
 assert.throws(()=>validateBudget({...REVIEW,request:5001}),/balance/);
 assert.throws(()=>validateBudget({...REVIEW,budget:[...REVIEW.budget,REVIEW.budget[0]]}),/Duplicate/);
});
test('all eleven review routes are noindex and retain the deployed project subpath',()=>{
 assert.equal(reviewFiles.length,11);
 for(const file of reviewFiles){const html=read(file);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
  assert.ok(html.includes('<meta name="robots" content="noindex,nofollow,noarchive">'),file);
  assert.ok(html.includes(`href="${SITE.url}/${file.replace(/index\.html$/,'')}"`),file);
  assert.ok(!/https?:\/\/nus\.dev\//.test(html),file);
  assert.ok(!/href="\/(?!\/)/.test(html),`Root-relative link in ${file}`);
  assert.ok(!html.includes('aria-label="Primary"'),file);
  assert.ok(!html.includes('class="foot"'),file);
  assert.ok(!/\{\{/.test(html),file);
 }
 assert.equal(new URL(SITE.url).pathname,'/nus.dev');
 assert.equal(SITE.entryUrl,'https://cbassuarez.github.io/nus.dev');
});
test('public discovery surfaces do not link into the review room',()=>{
 assert.ok(!read('sitemap.xml').includes('/review/'));
 assert.ok(!read('robots.txt').includes('/review'));
 for(const file of htmlFiles()){
  for(const [,href] of read(file).matchAll(/href="([^"]+)"/g)){
   const resolved=new URL(href,`${SITE.url}/${file}`);
   assert.ok(!resolved.pathname.startsWith('/nus.dev/review/'),`${file}: ${href}`);
  }
 }
});
test('review body remains complete without client JavaScript',()=>{
 for(const file of ['review/try/index.html','review/releases/index.html']) {
  const html=read(file);assert.ok(html.includes(REVIEW.releaseTag));
  for(const x of releaseRecord(JSON.parse(read('assets/releases.json'))).packages.filter(x=>x.pkg))assert.ok(html.includes(signingLabel(x.pkg.signing)));
  assert.equal((html.match(/id="hash-/g)||[]).length,3);
  assert.equal((html.match(/>Download (?:macOS|Windows|Linux) ↗<\/a>/g)||[]).length,3);
 }
 const funding=read('review/funding/index.html');
 for(const x of REVIEW.budget)assert.ok(funding.includes(`id="budget-${x.id}"`));
 assert.ok(funding.includes('$5,000'));assert.ok(funding.includes('not active'));
});
test('review release record follows the latest published snapshot with matching source',()=>{
 const snapshot=JSON.parse(read('assets/releases.json')),record=releaseRecord(snapshot);
 assert.equal(record.release.tag_name,REVIEW.releaseTag);
 assert.equal(record.revision,REVIEW.evidenceRevision);
 const absent=releaseRecord({releases:[]});assert.equal(absent.release,null);
 assert.ok(!releasePackages(absent).includes('/releases/download/'));
 const damaged=structuredClone(snapshot);
 const release=damaged.releases.find(x=>x.tag_name===REVIEW.releaseTag);
 release.body='bad metadata';for(const a of release.assets)delete a.digest;
 const unsafe=releaseRecord(damaged);assert.equal(unsafe.revision,null);
 assert.ok(unsafe.packages.every(x=>!x.pkg || x.release.tag_name!==REVIEW.releaseTag));
});
test('no new automatic third-party runtime or video autoplay',()=>{
 for(const file of reviewFiles){const html=read(file);
  assert.ok(!/<script[^>]+src="https?:/i.test(html));
  assert.ok(!/\bautoplay\b/.test(html));
  assert.ok(html.includes('referrer" content="no-referrer'));
 }
 const js=read('assets/js/review.js');
 assert.ok(js.includes('check.addEventListener("click"'));
 assert.ok(js.includes('review.refresh.start'));
 assert.ok(js.includes('review.refresh.ready'));
});


test('overview leads with unsigned distribution and specifications before film',()=>{
 const html=read('review/index.html');
 assert.ok(html.indexOf(distributionStatus(releaseRecord(JSON.parse(read('assets/releases.json')))).label)<html.indexOf('<h1>'));
 assert.ok(html.indexOf('Specifications')<html.indexOf('<video'));
 assert.ok(html.includes('one-time proposal'));
 assert.ok(html.includes('data-review-signing'));
});
test('historical measurements remain pinned when downloads advance',()=>{
 const html=read('review/performance/index.html');
 assert.ok(html.includes('/blob/'+REVIEW.measurementRevision+'/docs/performance/2026-09-20-m4-pro.json'));
 assert.ok(html.includes('September 20 M4 Pro reference run'));
});
