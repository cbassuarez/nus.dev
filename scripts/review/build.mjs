import {applyFacts} from '../benchmarks/facts.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {page,SITE,rel,assetVersion} from '../layout.mjs';
import {render} from '../markdown.mjs';
import {REVIEW,money,allowance,validateBudget} from './data.mjs';
import {REVIEW_PAGES} from './manifest.mjs';
import {reviewShell,escape as e} from './layout.mjs';
import {releaseRecord,recordSummary,releasePackages,allocation,architecture,measurements,ledger,source,freshness,releaseEvidence,walkthrough} from './components.mjs';
import {distributionNotice,distributionStatus} from '../../assets/js/review-releases.js';
const ROOT=fileURLToPath(new URL('../..',import.meta.url));
const read=p=>readFileSync(join(ROOT,p),'utf8');
function prose(slug) {
  const md=applyFacts(read(`content/review/${slug}.md`)).replace(/\{\{budget:([a-z]+)\}\}/g,(_,id)=>allowance(id)).replaceAll('{{measurementSource}}',`${SITE.repo}/blob/${REVIEW.measurementRevision}`).replaceAll('{{securitySource}}',`${SITE.repo}/blob/${REVIEW.securityRevision}`).replaceAll('{{source}}',`${SITE.repo}/blob/${REVIEW.evidenceRevision}`).replaceAll('{{reviewedTag}}',REVIEW.reviewedTag).replaceAll('{{request}}',money(REVIEW.request));
  if(/\{\{/.test(md))throw new Error(`Unresolved review content token: ${slug}`);
  return render(md).html;
}
function overview(entry,record) {
  return `<div class="review-hero"><p class="cap review-status" data-review-status>${distributionStatus(record).label}</p><h1>nus</h1><p class="review-hero__line">Terminal, browser and editor.<br><em>One local workspace.</em></p><p>Start a server, open its page beside the shell, edit its files and return to the things you kept. nus brings that task into one native Rust application, with a GPU-rendered interface and Chromium web content. No nus account is required.</p></div>
  <div class="review-actions"><a class="btn btn--signal" href="./try/" data-review-nav>Try one local task</a><a class="source-cta" href="./releases/" data-review-nav>Inspect the release evidence →</a></div>
  <div class="review-callout review-signing" data-review-signing>${distributionNotice(record)}</div>
  <h2>What ships today</h2>${ledger([
    ['Workspace','Shells, pages and files share Spaces, tabs and splits. Tab rows show running, listening, waiting, finished, playing and edited states; Orrery helps arrange the task.'],
    ['Kept','Bookmarks, reading, saved copies, keywords, pinned pages and collections share one record. Kept items lead address and palette results; <code>said:&lt;word&gt;</code> searches saved copies.'],
    ['Find','Search pages, shells and editors. Widen the scope when the current pane has no answer; whole words and patterns are available where the surface supports them.'],
    ['Local profile','“Here” stays with the current channel across updates, reinstalls and moved app copies without sync. Normal uninstall keeps it; complete cleanup removes the channel’s local data.'],
    ['Platforms','macOS / Apple silicon · Windows / x86-64 · Linux / x86-64, Wayland and X11'],
    ['License','Free, MIT licensed; third-party code and assets retain their own licenses']
  ])}<p>These descriptions follow <a href="${SITE.repo}/releases/tag/${REVIEW.reviewedTag}">${REVIEW.reviewedTag}</a>. Download versions can advance separately.</p>
  ${walkthrough(entry.depth,true)}
  <h2>What has been checked</h2><p>The reviewed candidate passed three-platform packaging, packaged browser and keyword regressions, Windows signature and installer lifecycle checks, root CI, compatibility checks and the bounded PTY ring verification. Each result has a named scope and linked run.</p><p><a href="./releases/#reviewed-release" data-review-nav>Read the results and skipped integrations →</a></p>
  <h2>What remains</h2><p>Apple Developer ID distribution and notarization, independent security research and broader hardware validation remain open. Chrome extensions remain unsupported; the CEF proposal is a bounded investigation. Homebrew, winget and the apt repository did not update for the reviewed candidate.</p>
  <h2>What funding unlocks next</h2><p>The ${money(REVIEW.request)} one-time proposal supports those external costs, continued Windows signing, independent research and project infrastructure. Design, implementation and maintenance are the maintainer’s contribution. Existing allocations remain planning reserves until costs and terms are confirmed.</p><p><a href="./funding/" data-review-nav>Review the use of funds →</a> · <a href="./milestones/" data-review-nav>Completed, partial and proposed work →</a></p>
  <h2>Specifications</h2>${ledger([
    ['Application','Native Rust host · wgpu compositor · Chromium Embedded Framework (CEF)'],
    ['Terminal','In-house VT core · PTY shells · Kitty keyboard and image protocols · iTerm2 and Sixel images'],
    ['Browser','Offscreen Chromium · DevTools · reader · containers · site rules; standard Chrome extensions are not supported'],
    ['Editor','Ropey text storage · tree-sitter highlighting · language-server client'],
    ['Data model','Local profile · no required nus account · optional encrypted folder or Git sync'],
    ['Assistant','Optional local or hosted backend; a hosted provider receives selected context when you send']
  ])}`;
}
function tryPage(entry,record) {
  const steps=[
    ['Start with a shell','Open a shell in a disposable project. No nus account, sync setup or assistant is needed. Keep a small text file named notes.txt there, containing the word review.'],
    ['Serve the project','Run <code>python3 -m http.server 4187 --bind 127.0.0.1</code> from that folder. Use a folder with no sensitive files. Python must already be installed.'],
    ['Open its page beside the shell','Press Command–Enter on macOS, or Ctrl–Enter on Windows/Linux, after the server prints its address. You can also open <code>http://127.0.0.1:4187</code> from the address palette. Keep the shell running while you inspect the page.'],
    ['Open the file and Find','Open notes.txt in the editor. Use Command–F on macOS or Ctrl–F on Windows/Linux to find review. Repeat the Find shortcut to widen its scope; in a shell use Ctrl–Shift–F on Windows/Linux. Pages support plain text and case; shell/editor surfaces also support whole words and patterns.'],
    ['Keep the page','Return to the page. Open the Go palette with Command–K on macOS or Ctrl–Shift–K on Windows/Linux, then choose <strong>Keep this page</strong>. Open <strong>Kept</strong> from the palette and select <strong>All</strong> to find an ordinary bookmark. The same record can hold reading, a saved copy, a keyword, a pin and collection membership.'],
    ['Arrange the task','Choose <strong>Orrery</strong> from the Go palette to see the workspace. Return to the shell/page pair or file; try dragging a tab to a new position. The tab row shows whether the server is listening or the file is edited.'],
    ['Finish the exercise','Return to the server’s shell and press Ctrl–C. Close the app, reopen it and check your Kept item. Record your package version, OS, expected result and steps for any bug.']
  ];
  return `<h1>Try nus</h1><p class="lede">One local task, about ten minutes.</p><p>A shell, its page, a file, Find and Kept. The walkthrough below uses the published ${REVIEW.reviewedTag} Mac package. Use a disposable project when evaluating a preview.</p><div class="review-callout" data-review-signing>${distributionNotice(record)}</div>
  <h2>Download</h2>${releasePackages(record)}<p><a href="../../download/">Installation instructions →</a> · <a href="../releases/">Release evidence and package hashes →</a></p>
  <h2>The exercise</h2>${steps.map(([title,text],i)=>`<section class="review-step"><span class="cap">${String(i+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${text}</p></div></section>`).join('')}
  <h2>The published build, captured</h2>${walkthrough(entry.depth)}
  <h2>Your local “Here” profile</h2><p>Updates, reinstalls and moved copies reuse the current channel’s shared local profile without sync. A busy or failed legacy migration stops rather than making a duplicate. Normal uninstall keeps the profile for reinstall.</p><p>For deliberate complete cleanup, close the app and use <code>nus uninstall --everything</code>; review its confirmation before proceeding. Windows’ uninstaller also offers <strong>Remove them too</strong>. Complete cleanup removes that channel’s local profiles, recovery copies, vault keys, logs and owned retained app packages. Projects, other channels and external sync folders are preserved. Removing local data is irreversible.</p><p><a href="${source('docs/RELEASING.md')}">Profile and installation contract ↗</a> · <a href="${SITE.repo}/releases/tag/${REVIEW.reviewedTag}">Preview 17 lifecycle fixes ↗</a></p>
  <h2>Optional: try an assistant</h2><p>Choose a configured backend and inspect the context chips before sending; shell, block and page may start enabled. A hosted backend receives the selected context. Inspect any suggested command before deliberately running it. This step is optional and may require the provider’s own account or installed tools.</p>`;
}
function releasesPage(entry,record) {
  return `<h1>Evidence</h1><p class="lede">What was checked, on which build, with what limits.</p><p>The reviewed candidate is ${REVIEW.reviewedTag}. Its results stay fixed below. The download listing follows published releases independently, so a newer version does not inherit these checks or the historical benchmarks.</p>${releaseEvidence(entry.depth)}
  <h2>Latest available packages</h2>${recordSummary(record)}<p><a data-review-notes href="${SITE.repo}/releases${record.release?'/tag/'+record.release.tag_name:''}">Latest release notes ↗</a></p>${releasePackages(record)}
  <div class="review-actions"><button class="btn btn--quiet" data-check-releases data-feel-semantic="refresh" type="button">Check for newer releases</button><a href="${SITE.repo}/releases">All releases ↗</a></div><p class="small dim" data-release-check-status role="status" aria-live="polite">Showing the published snapshot checked ${e(record.checkedAt||'at build time')}. Downloads remain available without JavaScript.</p>
  <h2>The release path</h2><ol class="review-path">${['Tag a fixed source revision','Build and test with pinned CEF on native runners','Package and check the runtime loader','Run packaged browser and keyword regressions','Sign Windows payloads and installer; verify each signature','Exercise Windows installation, upgrade, reinstall and cleanup','Validate package hashes and publish the complete release','Update distribution integrations where credentials are available'].map(t=>`<li>${t}</li>`).join('')}</ol>
  <p>Signing status comes from published metadata; checksums identify bytes. Functional automation and independent security examination remain separate kinds of evidence.</p><p><a href="${source('docs/RELEASING.md')}">Release contract ↗</a> · <a href="${source('.github/workflows/release.yml')}">Reviewed workflow source ↗</a></p>`;
}
function fundingPage(entry,record) {
  return `<h1>Funding</h1><p class="cap">Proposed one-time request</p><p class="review-total">${money(REVIEW.request)}</p><p class="lede">Finish publisher distribution. Fund independent examination.</p><p>Windows Authenticode signing and automated packaged checks are working in the reviewed candidate. The remaining distribution gap is Apple Developer ID signing and notarization. Broader hardware acceptance, independent security research and the bounded CEF experiment remain open.</p><div class="review-callout" data-review-signing>${distributionNotice(record)}</div>
  <h2>What exists, what the reserve supports</h2>${ledger([
    ['Initial setup','Windows signing, package publication and automated runner checks already have release evidence. Apple publisher distribution is still incomplete.'],
    ['Continued distribution',`${money(REVIEW.budget.filter(x=>['apple','windows'].includes(x.id)).reduce((n,x)=>n+x.amount,0))} remains reserved for two years of Apple and Windows distribution costs. Windows signing is operational; this is a continuation reserve, not a new setup promise.`],
    ['Independent work','Outside security research, reproduction, broader platform testing and one bounded source-built CEF investigation.'],
    ['Cost record','Amounts below are planning ceilings, not current quotes, paid invoices or funds already awarded. Actual charges, prior costs and renewal obligations must be reconciled before funding is agreed.']
  ])}<div class="review-pairs"><section><h2>I contribute</h2><p>Design, implementation, release engineering, documentation, fixes and maintenance.</p></section><section><h2>The grant supports</h2><p>External distribution costs, independent expertise, project identity, compute and test infrastructure.</p></section></div>
  <h2>Use of funds</h2><p>The existing ${money(REVIEW.request)} allocation is retained as a proposal. Confirm provider eligibility, actual charges and live quotes before committing funds. Reserved does not mean spent.</p>${allocation()}
  <h2>An independent research round</h2><p>The bounty reserve is not active. Before invitations, agree scope, authorization, reward limits, duplicates, disclosure handling and payment terms. Researcher payouts and fees share the stated ceiling. Any reassignment of unused funds requires agreement with the funder.</p>
  <h2>Accountability</h2><p>Each funded milestone produces a record: publisher verification, findings and fixes, a platform test matrix, the CEF experiment’s result, and an expense ledger. Record actual spending and future renewals separately from these planning amounts.</p><p>The application stays free and MIT licensed. Sponsorship does not purchase priority features, a support contract or control of the roadmap. No recurring commitment from the funder is assumed.</p><p><a href="../milestones/">Completed, partial and proposed work →</a> · <a href="../releases/">Current release evidence →</a> · <a href="../security/">Security scope →</a></p>`;
}
export function buildReview() {
  validateBudget();
  const record=releaseRecord(JSON.parse(read('assets/releases.json')));
  const special={'':overview,try:tryPage,releases:releasesPage,funding:fundingPage};
  return REVIEW_PAGES.map(entry=>{
    const shell=reviewShell(entry,record.release),r=rel(entry.depth);
    const content=special[entry.slug]?special[entry.slug](entry,record):`<h1>${entry.slug==='limitations'?'Not claimed':entry.title}</h1>${entry.slug==='architecture'?architecture():entry.slug==='performance'?measurements():''}${prose(entry.slug)}`;
    const body=`<div class="review">${shell.rail}<article class="review__main" data-page-transition><div class="review-kicker cap"><span>${entry.number} / ${entry.title}</span><span>Updated ${REVIEW.date}</span></div>${content}${freshness(entry.depth)}<p class="small dim" data-review-live-status role="status" aria-live="polite">Release snapshot checked ${e(record.checkedAt||'at build time')}. <a href="${SITE.repo}/releases">All releases ↗</a></p>${shell.pager}</article></div>`;
    const output=join('review',entry.slug,'index.html');
    mkdirSync(dirname(join(ROOT,output)),{recursive:true});
    writeFileSync(join(ROOT,output),page({title:`${entry.title} / review`,description:entry.blurb,path:entry.path,depth:entry.depth,body,bodyClass:'review-page',indexed:false,chrome:shell,head:`<meta name="referrer" content="no-referrer"><link rel="stylesheet" href="${r}/assets/css/review.css?v=${assetVersion('assets/css/review.css')}">`,module:`import '${r}/assets/js/review.js';`}));
    return output;
  });
}
