import {F,HOME,rounded,range} from '../benchmarks/facts.mjs';
import {SITE, rel} from '../layout.mjs';
import {REVIEW, EVIDENCE, money} from './data.mjs';
import {escape as e} from './layout.mjs';
import {reviewReleaseRecord,packageCards,releaseSummary} from '../../assets/js/review-releases.js';

export const source = (path,rev=REVIEW.evidenceRevision) => `${SITE.repo}/blob/${rev}/${path}`;
export function releaseRecord(snapshot) { return reviewReleaseRecord(snapshot.releases,snapshot.checked_at||null); }
export function ledger(rows) {
  return `<dl class="review-ledger">${rows.map(([key,value])=>`<div><dt>${e(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}
export function recordSummary(record) {return `<div data-review-record>${releaseSummary(record)}</div>`;}
export function releasePackages(record) {return `<div data-review-packages>${packageCards(record)}</div>`;}
export function freshness(depth) {
  return `<details class="review-freshness"><summary>Dates and scope of this packet</summary>${ledger([
    ['Narrative updated',REVIEW.date],
    ['Reviewed candidate',`<a href="${SITE.repo}/releases/tag/${REVIEW.reviewedTag}">${REVIEW.reviewedTag}</a> · <a href="${SITE.repo}/commit/${REVIEW.evidenceRevision}">${REVIEW.evidenceRevision.slice(0,7)}</a> · results checked ${EVIDENCE.checked_at}`],
    ['Security review',`${REVIEW.securityDate} · historical maintainer-led audit; independent review remains proposed`],
    ['Runtime measurements',`${HOME.recorded_at.slice(0,10)} · M4 Pro fixture; measurements retain their original build identities`]
  ])}<p>Downloads refresh independently. The reviewed candidate, captures, audit and measurements keep their own dates and source records.</p><a href="${rel(depth)}/assets/review/release-evidence.json">Release evidence record ↗</a></details>`;
}
export function releaseEvidence(depth) {
  const table=rows=>`<div class="tablewrap"><table><thead><tr><th>Check</th><th>Result</th><th>Scope and evidence</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${e(x.name)}</td><td><span class="review-result">${e(x.result)}</span></td><td>${e(x.scope)} <a href="${e(x.url)}">Evidence ↗</a></td></tr>`).join('')}</tbody></table></div>`;
  const base=`${SITE.repo}/releases/download/${EVIDENCE.tag}`;
  return `<section id="reviewed-release"><h2>The reviewed candidate</h2><p>Results checked ${EVIDENCE.checked_at} for <a href="${SITE.repo}/releases/tag/${EVIDENCE.tag}">${EVIDENCE.tag}</a>, source <a class="review-inline-hash" href="${SITE.repo}/commit/${EVIDENCE.revision}">${EVIDENCE.revision}</a>. This record stays fixed when the download listing advances.</p><p><a href="${base}/release.json">Published release manifest ↗</a> · <a href="${base}/SHA256SUMS.txt">Package hashes ↗</a> · <a href="${rel(depth)}/assets/review/release-evidence.json">Review evidence JSON ↗</a></p>${table(EVIDENCE.checks)}<h2>Distribution integrations</h2><p>A green job can exit successfully without updating an integration. The logs for this candidate distinguish that outcome.</p>${table(EVIDENCE.integrations)}<div class="review-callout"><p>${e(EVIDENCE.limits)}</p></div></section>`;
}
export function walkthrough(depth,compact=false) {
  const captures=[['split','A shell and its page','A real local Python server opens beside the shell that started it.'],['find','The file and Find','The project notes open in the editor; the shared Find bar searches for “review”.'],['kept','Return through Kept','The local page appears in the unified Kept library.'],['workspace','See the whole task','Orrery shows the shell/page pair, the file and Kept together.']];
  const r=rel(depth);
  return `<section class="review-tour" aria-label="Published-build walkthrough"><p class="cap">${REVIEW.reviewedTag} / macOS / ${REVIEW.date}</p>${(compact?captures.slice(0,1):captures).map(([name,title,text],i)=>`<figure><a href="${r}/assets/review/${name}.png" aria-label="Open full-size capture: ${title}"><img src="${r}/assets/review/${name}.png" alt="${e(title)} in nus ${REVIEW.reviewedTag}" width="2560" height="1700" loading="lazy"></a><figcaption><b>${String(i+1).padStart(2,'0')} / ${title}</b><span>${text}</span></figcaption></figure>`).join('')}<p class="small dim">Native captures of the published Apple-silicon package, hash-checked before capture. Scripted task, disposable profile, onboarding skipped, reduced motion, Chromium software-paint upload; these stills do not validate default accelerated rendering, measure speed or certify other platforms. <a href="${r}/assets/review/walkthrough.json">Capture provenance ↗</a></p></section>`;
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
  [rounded(F.file10.value),'ms','10 MiB file open','p95 · 20 opens','Open request → first content-frame submission.','Warm/uncontrolled filesystem caches; not disk-cold.'],
  [rounded(F.file100.value),'ms','100 MiB file open','Observed maximum · 5 opens','Open request → first content-frame submission.','An observed maximum, not a worst-case guarantee.'],
  [range(F.tabs),'MiB','Each further idle browser tab','After initialization · five trials','Additional whole-process-tree RSS in this fixture.','Not the first browser tab; RSS can double-count shared pages.'],
  [range(F.windows),'MiB','Each further empty window','Five four-window trials','Change in parent-process RSS.','Not total GPU allocation or private physical footprint.']
 ];
 return `<div class="review-measurements">${rows.map(([v,u,t,s,scope,limit])=>`<section class="review-measurement"><p class="cap">${t}</p><div class="review-measurement__value">${v} <small>${u}</small></div><p>${s}</p>${ledger([['Scope',e(scope)],['Machine','Apple M4 Pro · 48 GiB RAM'],['Boundary',e(limit)]])}<a href="../../benchmarks/">Method ↗</a> · <a href="../../assets/benchmarks/homepage.json">Raw report ↗</a></section>`).join('')}</div>`;
}
