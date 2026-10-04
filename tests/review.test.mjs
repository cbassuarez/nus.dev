import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {REVIEW,EVIDENCE,validateBudget} from '../scripts/review/data.mjs';
import {REVIEW_PAGES} from '../scripts/review/manifest.mjs';
import {releaseRecord,releasePackages,releaseEvidence} from '../scripts/review/components.mjs';
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
test('downloads follow the latest published snapshot while review evidence remains pinned',()=>{
 const snapshot=JSON.parse(read('assets/releases.json')),record=releaseRecord(snapshot);
 assert.equal(record.release.tag_name,REVIEW.releaseTag);
 assert.equal(REVIEW.evidenceRevision,EVIDENCE.revision);
 assert.equal(REVIEW.reviewedTag,EVIDENCE.tag);
 const fixed=releaseEvidence(2);
 assert.ok(fixed.includes(EVIDENCE.tag));
 assert.ok(fixed.includes(EVIDENCE.revision));
 assert.ok(fixed.includes('Skipped'));
 assert.ok(!fixed.includes('v99.0.0-preview.1'));
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


test('overview leads with current distribution and a short primary review path',()=>{
 const html=read('review/index.html');
 assert.ok(html.indexOf(distributionStatus(releaseRecord(JSON.parse(read('assets/releases.json')))).label)<html.indexOf('<h1>'));
 assert.ok(html.includes('What ships today'));
 assert.ok(html.includes('What has been checked'));
 assert.deepEqual(REVIEW_PAGES.filter(x=>x.primary).map(x=>x.slug),['','try','releases','funding']);
 assert.ok(html.includes('one-time proposal'));
 assert.ok(html.includes('data-review-signing'));
});
test('review records separate narrative, release, security and measurement dates',()=>{
 for(const file of reviewFiles){const html=read(file);
  assert.ok(html.includes('Dates and scope of this packet'),file);
  assert.ok(html.includes(REVIEW.date),file);
  assert.ok(html.includes(REVIEW.securityDate),file);
  assert.ok(html.includes(REVIEW.evidenceRevision.slice(0,7)),file);
 }
 assert.ok(read('review/security/index.html').includes(`/blob/${REVIEW.securityRevision}/docs/RELEASE_AUDIT_2026-09-20.md`));
 assert.ok(read('review/milestones/index.html').includes('Distribution baseline · partial'));
 assert.ok(read('review/try/index.html').includes('nus uninstall --everything'));
});
test('published walkthrough identifies its exact package and preserves native PNG bytes',()=>{
 const take=JSON.parse(read('assets/review/walkthrough.json'));
 assert.equal(take.tag,EVIDENCE.tag);assert.equal(take.revision,EVIDENCE.revision);
 assert.match(take.method,/software-paint/);
 assert.deepEqual(take.capture_pixels,[2560,1700]);
 const release=releaseRecord(JSON.parse(read('assets/releases.json'))).packages.find(x=>x.id==='macos-arm64');
 // When downloads move on, provenance still belongs to the captured package.
 if(release.release.tag_name===take.tag)assert.equal(take.archive_sha256,release.pkg.hash);
 for(const x of take.captures){
  const bytes=readFileSync(join(ROOT,'assets/review',x.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),x.sha256);
  assert.equal(x.sha256,x.master_sha256);
  assert.equal(bytes.readUInt32BE(16),2560);assert.equal(bytes.readUInt32BE(20),1700);
 }
 for(const name of ['split','find','kept','workspace'])assert.ok(read('review/try/index.html').includes(`/assets/review/${name}.png`));
});
test('historical measurements remain pinned when downloads advance',()=>{
 const html=read('review/performance/index.html');
 assert.ok(html.includes('/blob/'+REVIEW.measurementRevision+'/docs/performance/2026-09-20-m4-pro.json'));
 assert.ok(html.includes('September 20 source report'));
 assert.ok(html.includes('../../assets/benchmarks/homepage.json'));
 assert.ok(html.includes('September 23 M4 Pro measurements'));
});
