import {F,HOME,rounded,range} from '../benchmarks/facts.mjs';
import {SITE, rel} from '../layout.mjs';
import {REVIEW, money} from './data.mjs';
import {escape as e} from './layout.mjs';
import {reviewReleaseRecord,packageCards,releaseSummary} from '../../assets/js/review-releases.js';

export const source = (path,rev=REVIEW.evidenceRevision) => `${SITE.repo}/blob/${rev}/${path}`;
export function releaseRecord(snapshot) { return reviewReleaseRecord(snapshot.releases,snapshot.checked_at||null); }
export function ledger(rows) {
  return `<dl class="review-ledger">${rows.map(([key,value])=>`<div><dt>${e(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}
export function recordSummary(record) {return `<div data-review-record>${releaseSummary(record)}</div>`;}
export function releasePackages(record) {return `<div data-review-packages>${packageCards(record)}</div>`;}
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
  [rounded(F.file10.value),'ms','10 MiB file open','p95 · 20 opens','Open request → first content-frame submission.','Warm/uncontrolled filesystem caches; not disk-cold.'],
  [rounded(F.file100.value),'ms','100 MiB file open','Observed maximum · 5 opens','Open request → first content-frame submission.','An observed maximum, not a worst-case guarantee.'],
  [range(F.tabs),'MiB','Each further idle browser tab','After initialization · five trials','Additional whole-process-tree RSS in this fixture.','Not the first browser tab; RSS can double-count shared pages.'],
  [range(F.windows),'MiB','Each further empty window','Five four-window trials','Change in parent-process RSS.','Not total GPU allocation or private physical footprint.']
 ];
 return `<div class="review-measurements">${rows.map(([v,u,t,s,scope,limit])=>`<section class="review-measurement"><p class="cap">${t}</p><div class="review-measurement__value">${v} <small>${u}</small></div><p>${s}</p>${ledger([['Scope',e(scope)],['Machine','Apple M4 Pro · 48 GiB RAM'],['Boundary',e(limit)]])}<a href="../../benchmarks/">Method ↗</a> · <a href="../../assets/benchmarks/homepage.json">Raw report ↗</a></section>`).join('')}</div>`;
}
