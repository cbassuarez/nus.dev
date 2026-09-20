import {SITE, rel} from '../layout.mjs';
import {REVIEW, money} from './data.mjs';
import {escape as e} from './layout.mjs';
import {publishedReleases, packageFor, TARGETS, signingLabel} from '../../assets/js/releases.js';

export const source = (path,rev=REVIEW.evidenceRevision) => `${SITE.repo}/blob/${rev}/${path}`;
export function releaseRecord(snapshot) {
  const release=publishedReleases(snapshot.releases).find(r=>r.tag_name===REVIEW.releaseTag);
  if(!release) return {release:null,revision:null,packages:[],checkedAt:snapshot.checked_at||null};
  let meta;
  try { meta=JSON.parse((release.body||'').match(/<!-- nus-release:(.*?) -->/s)?.[1]||'{}'); } catch { meta={}; }
  const revision=meta.version===release.tag_name && /^[a-f0-9]{40}$/.test(meta.revision||'') ? meta.revision : null;
  return {release,revision,checkedAt:snapshot.checked_at||null,packages:TARGETS.map(([id,os,arch])=>({id,os,arch,pkg:packageFor(release,id)}))};
}
export function ledger(rows) {
  return `<dl class="review-ledger">${rows.map(([key,value])=>`<div><dt>${e(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}
export function recordSummary(record) {
  const {release,revision,packages}=record;
  return ledger([
    ['Review candidate',release?`<a href="${SITE.repo}/releases/tag/${e(release.tag_name)}">${e(release.tag_name)}</a>`:'No verified candidate in the snapshot'],
    ['Source revision',revision?`<a class="review-hash" href="${SITE.repo}/commit/${revision}">${revision}</a>`:'Not verified'],
    ['Published packages',e(packages.filter(x=>x.pkg).map(x=>`${x.os} / ${x.arch}`).join(' · ')||'None verified')],
    ['License','MIT; dependencies retain their own licenses'],
    ['Requested funding',`${money(REVIEW.request)} · proposed, not awarded`]
  ]);
}
export function releasePackages(record) {
  const {release,packages}=record;
  if(!release)return '<p class="review-callout">The selected release is absent from the snapshot. No download links have been invented. <a href="https://github.com/cbassuarez/nus/releases">Inspect Releases ↗</a></p>';
  return `<div class="review-packages">${packages.map(({id,os,arch,pkg})=>`<section class="review-package" id="package-${id}"><div class="review-package__top"><div><p class="cap">${e(arch)}</p><h3>${os}</h3></div><span class="review-package__size">${pkg?`${(pkg.size/1048576).toFixed(1)} <small>MiB</small>`:'—'}</span></div>${pkg?`<p class="review-package__state">${e(signingLabel(pkg.signing))}</p><p class="small dim">Compressed download · ${pkg.size.toLocaleString('en-US')} bytes</p><p><a class="btn btn--quiet" href="${e(pkg.url)}">Download ${os} ↗</a></p><details data-feel-disclosure="ordinary"><summary>SHA-256 checksum</summary><code class="review-hash" id="hash-${id}">${pkg.hash}</code><button type="button" class="review-copy" data-copy-hash="hash-${id}" data-feel-semantic="copy" hidden>Copy checksum</button></details>`:'<p>Not published for this candidate.</p>'}</section>`).join('')}</div>`;
}
export function film(depth) {
  const r=rel(depth);
  return `<figure class="review-film"><video controls playsinline preload="none" width="1320" height="870" poster="${r}/assets/films/shell.png" aria-describedby="film-caption"><source src="${r}/assets/films/shell.mp4" type="video/mp4"><p><a href="${r}/assets/films/shell.mp4">Open the recording</a></p></video><figcaption id="film-caption"><b>The shell / macOS</b><span>The app building this site. Scripted pacing, not a performance measurement.</span><a href="${r}/about/#pictures">How this was recorded ↗</a></figcaption></figure>`;
}
export function allocation() {
  return `<div class="review-allocation">${REVIEW.budget.map(x=>`<details id="budget-${x.id}" data-feel-disclosure="funding"><summary><span>${e(x.label)}</span><b>${money(x.amount)}</b><small>${(100*x.amount/REVIEW.request).toFixed(2)}%</small></summary><div class="review-allocation__detail"><div class="review-allocation__bar" style="width:${100*x.amount/REVIEW.request}%" aria-hidden="true"></div><p class="cap">${e(x.basis)}</p><p>${e(x.purpose)}</p></div></details>`).join('')}<div class="review-allocation__total"><span>Total request</span><strong>${money(REVIEW.request)}</strong><span>100%</span></div></div>`;
}
export function architecture() {
  const nodes=[
    ['terminal','Terminal / PTY','Local process','The VT core reads shell output; the host owns its pane. Other programs and their output are not automatically trusted.','crates/vt/src/lib.rs'],
    ['browser','Browser / CEF','Untrusted web','CEF renders web content offscreen. Browser processes and native bridges remain a security boundary, not a guarantee supplied by Rust.','spikes/composite/src/browser.rs'],
    ['editor','Editor / LSP','Local files + server','An editor pane and language-server client connect to local project tools. A language server is separate executable software.','crates/lsp/src/lib.rs'],
    ['assistant','Assistant','Selected context → backend','A deliberate question sends selected context to the chosen backend, which may be local or hosted. An answer is not authority to run a command.','spikes/composite/src/ask.rs']
  ];
  return `<section class="review-map" aria-labelledby="map-title"><h2 id="map-title">What talks to what.</h2><p class="small dim">A conceptual map. Open a surface for its boundary and implementation.</p><div class="review-map__host"><span class="cap">Local host</span><strong>nus</strong><span>Compositor · windows · state · rules</span></div><div class="review-map__nodes">${nodes.map(([id,title,kind,text,path])=>`<details id="surface-${id}" data-feel-disclosure="architecture"><summary><span class="cap">${kind}</span><b>${title}</b></summary><p>${text}</p><a href="${source(path)}">Source ↗</a></details>`).join('')}</div><p class="small dim">Web access and a hosted model cross network boundaries. Selecting a local backend changes that path; the diagram is not a claim that every feature is offline.</p></section>`;
}
export function measurements() {
 const rows=[
  ['28.9','ms','10 MiB file open','p95 · 20 opens','Open request → first content-frame submission.','Warm/uncontrolled filesystem caches; not disk-cold.'],
  ['63.0','ms','100 MiB file open','Observed maximum · 5 opens','Open request → first content-frame submission.','An observed maximum, not a worst-case guarantee.'],
  ['101–102','MiB','Each further idle browser tab','After initialization','Additional whole-process-tree RSS in this fixture.','Not the first browser tab; RSS can double-count shared pages.'],
  ['1.5–19','MiB','Each further empty window','Four-window run','Change in parent-process RSS.','Not total GPU allocation or private physical footprint.']
 ];
 return `<div class="review-measurements">${rows.map(([v,u,t,s,scope,limit])=>`<section class="review-measurement"><p class="cap">${t}</p><div class="review-measurement__value">${v} <small>${u}</small></div><p>${s}</p>${ledger([['Scope',e(scope)],['Machine','Apple M4 Pro · 48 GiB RAM'],['Boundary',e(limit)]])}<a href="${source('docs/PERFORMANCE_BUDGETS.md')}">Method ↗</a> · <a href="${source('docs/performance/2026-09-20-m4-pro.json')}">Raw report ↗</a></section>`).join('')}</div>`;
}
