import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {page,SITE,rel,assetVersion} from '../layout.mjs';
import {render} from '../markdown.mjs';
import {REVIEW,money,allowance,validateBudget} from './data.mjs';
import {REVIEW_PAGES,reviewHref} from './manifest.mjs';
import {reviewShell,escape as e} from './layout.mjs';
import {releaseRecord,recordSummary,releasePackages,film,allocation,architecture,measurements,ledger,source} from './components.mjs';
import {distributionNotice,distributionStatus} from '../../assets/js/review-releases.js';
const ROOT=fileURLToPath(new URL('../..',import.meta.url));
const read=p=>readFileSync(join(ROOT,p),'utf8');
function prose(slug) {
  const md=read(`content/review/${slug}.md`).replace(/\{\{budget:([a-z]+)\}\}/g,(_,id)=>allowance(id)).replaceAll('{{measurementSource}}',`${SITE.repo}/blob/${REVIEW.measurementRevision}`).replaceAll('{{source}}',`${SITE.repo}/blob/${REVIEW.evidenceRevision}`).replaceAll('{{request}}',money(REVIEW.request));
  if(/\{\{/.test(md))throw new Error(`Unresolved review content token: ${slug}`);
  return render(md).html;
}
function overview(entry,record) {
  return `<div class="review-hero"><p class="cap review-status" data-review-status>${distributionStatus(record).label}</p><h1>nus</h1><p class="review-hero__line">Terminal, browser and editor.<br><em>One local workspace.</em></p><p>nus is a native, MIT-licensed application built in Rust, with a GPU-rendered interface and Chromium web content. Shells, pages and files share Spaces, tabs and splits. No nus account is required.</p></div>
  <div class="review-callout review-signing"><div data-review-signing>${distributionNotice(record)}</div><p><a href="./funding/" data-review-nav>Read the ${money(REVIEW.request)} one-time proposal →</a></p></div>
  <h2>Specifications</h2>${ledger([
    ['Application','Native Rust host · wgpu compositor · Chromium Embedded Framework (CEF)'],
    ['Terminal','In-house VT core · PTY shells · Kitty keyboard and image protocols · iTerm2 and Sixel images'],
    ['Browser','Offscreen Chromium · DevTools · reader · containers · site rules; standard Chrome extensions are not supported'],
    ['Editor','Ropey text storage · tree-sitter highlighting · language-server client'],
    ['Platforms','macOS / Apple silicon · Windows 11 / x86-64 · Linux / x86-64, Wayland and X11'],
    ['Data model','Local profile · no required nus account · optional encrypted folder or Git sync'],
    ['Assistant','Optional local or hosted backend; a hosted provider receives the context selected when you send'],
    ['License','MIT; third-party code and assets retain their own licenses']
  ])}
  <div class="review-actions"><a class="btn btn--signal" href="./try/" data-review-nav>Try the preview</a><a class="source-cta" href="${SITE.repo}">Inspect the source ↗</a></div>
  <h2>The latest release</h2><p>Downloads update automatically from published release records. Each package retains its own version, source and checksum. Performance measurements and earlier audits keep their original dates and scope.</p>${recordSummary(record)}
  <h2>From a command to its page</h2><p>A local server belongs beside the shell that started it. nus makes that relationship part of the workspace: open its page, inspect its port and process, and edit the project without switching window models.</p>${film(entry.depth)}
  <h2>What funding changes</h2><p>The software and preview builds already exist. The ${money(REVIEW.request)} proposal funds external costs: publisher signing, independent security research, clean-machine validation and a bounded CEF investigation. The maintainer contributes design, implementation and maintenance.</p><p>Signing establishes publisher identity; it does not establish that software is safe. The proposal treats distribution, security review and browser research as separate deliverables, with an expense and outcome record.</p>
  <div class="review-index">${[['try','Try the build','Packages, signing labels and a short exercise.'],['architecture','Inspect the implementation','Components, process boundaries and source links.'],['security','Examine the security record','Trust model, recorded fixes and proposed independent review.'],['performance','Check measured behavior','Methods, reference hardware and unmet targets.'],['funding','Review the use of funds','An itemized $5,000 request with spending ceilings.'],['milestones','Follow the deliverables','Distribution, review, validation and closeout.']].map(([slug,title,desc])=>`<a href="./${slug}/" data-review-nav><strong>${title}</strong><span>${desc}</span><b aria-hidden="true">→</b></a>`).join('')}</div>`;
}
function tryPage(entry,record) {
  const steps=[['Open a shell','Use your existing shell and ordinary commands. There is no nus account to create.'],['Start something local','Use a project you trust, or run python -m http.server in a disposable folder containing no sensitive files. Stop it after testing.'],['Open its page','Open localhost in the browser pane beside its shell. Inspect the process and port relationship.'],['Open a file','Try the local editor. Language tooling depends on the selected language and available runtime; note what the package actually launches.'],['Ask deliberately','Choose a configured backend. Inspect the context chips before sending: shell, block and page may start enabled. A hosted backend receives the selected content.'],['Review a suggested command','Use a harmless command, inspect it and explicitly run it. Multiline answers and web-influenced answers have additional handling; this is not automatic execution.'],['Close the assistant','Continue using the terminal and browser. Record the OS, package version and steps for any reproducible bug.']];
  return `<h1>Try nus</h1><p class="lede">Download a preview and follow one local task.</p><div class="review-callout" data-review-signing>${distributionNotice(record)}</div><p>Downloads update automatically. Use a disposable project while evaluating an early build.</p>${releasePackages(record)}<p><a href="../releases/">Source revision, checksums and release notes →</a> · <a href="../../download/">Installation instructions →</a></p>
  <h2>A working recording.</h2>${film(entry.depth)}<p class="small dim">This existing recording shows the shell building the site. The sequence below is a separate reviewer exercise, not a claim about what the film depicts.</p>
  <h2>A short reviewer exercise.</h2>${steps.map(([title,text],i)=>`<section class="review-step"><span class="cap">${String(i+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${text}</p></div></section>`).join('')}`;
}
function releasesPage(entry,record) {
  const {release,checkedAt}=record;
  const releaseURL=release?`${SITE.repo}/releases/tag/${release.tag_name}`:`${SITE.repo}/releases`;
  const aux=release?.assets?.filter(a=>['SHA256SUMS.txt','release.json'].includes(a.name)&&a.state==='uploaded'&&a.browser_download_url===`${SITE.repo}/releases/download/${release.tag_name}/${a.name}`)||[];
  return `<h1>Releases</h1><p class="lede">A package, and the record behind it.</p><p>This page automatically checks published releases and updates downloads, versions, signing labels and checksums together. Each platform shows its newest available package in the latest release’s channel. Historical benchmarks stay attached to the build that was measured.</p>${recordSummary(record)}
  <p><a data-review-notes href="${releaseURL}">Release notes ↗</a></p>${releasePackages(record)}
  <div class="review-actions"><button class="btn btn--quiet" data-check-releases data-feel-semantic="refresh" type="button">Check for newer releases</button><a href="${SITE.repo}/releases">All releases ↗</a></div><p class="small dim" data-release-check-status role="status" aria-live="polite">Showing the published snapshot checked ${e(checkedAt||'at build time')}. Downloads remain available without JavaScript.</p>
  <h2>The release path.</h2><ol class="review-path">${['Tag','Native runner','Pinned CEF','Tests','Package','Sign where configured','Verify loader','Hash','Publish'].map(t=>`<li>${t}</li>`).join('')}</ol>
  <p>A successful build and loader check are not a complete native GUI acceptance test. Signing status comes from published metadata; checksums identify bytes, not their safety.</p><p><a href="${source('docs/RELEASING.md')}">Release contract ↗</a> · <a href="${source('.github/workflows/release.yml')}">Workflow source ↗</a></p>`;
}
function fundingPage(entry,record) {
  return `<h1>Funding</h1><p class="cap">Proposed one-time request</p><p class="review-total">${money(REVIEW.request)}</p><p class="lede">Fund trusted distribution and independent examination of a working application.</p><div class="review-callout" data-review-signing>${distributionNotice(record)}</div><p>The first distribution milestone is verified publisher identity, production signing and clean-system installation checks.</p><p>Of the ${money(REVIEW.request)} request, ${money(REVIEW.budget.filter(x=>['apple','windows'].includes(x.id)).reduce((n,x)=>n+x.amount,0))} is reserved for two years of Apple and Windows distribution costs. The remaining allocations support independent research, browser-build investigation and project infrastructure. These are planning reserves, not verified purchase quotes.</p><div class="review-pairs"><section><h2>I contribute</h2><p>Design, implementation, release engineering, documentation, fixes and maintenance.</p></section><section><h2>The grant buys</h2><p>Independent security research, signing, project identity, compute and test infrastructure.</p></section></div><h2>Use of funds.</h2><p>These are spending ceilings. Provider eligibility and live quotes are checked before purchase; money reserved is not money already spent.</p>${allocation()}
  <h2>A research pool, not a promise of safety.</h2><p>The bounty reserve is not active. Before invitations go out, define scope, authorization, reward limits, duplicates, disclosure handling and payment terms. Third-party payouts and any reassignment of unused funds are subject to agreement with the funder. No testing of other people’s systems is authorized by this page.</p>
  <h2>How the work is accountable.</h2><p>Each milestone produces a public record: the signed package and verification result, findings and their disposition, a platform test matrix, the CEF experiment’s result, and an expense ledger. Unused research funding is reassigned only by agreement.</p><h2>What does not change.</h2><p>The application stays free and MIT licensed. Sponsorship does not purchase priority features, a support contract or control of the roadmap. No recurring commitment from the funder is assumed.</p><div class="review-callout"><p>The reserve has a ceiling. The claims have boundaries. The work will have an expense and outcome record.</p></div><p><a href="../milestones/">Deliverables and closeout →</a> · <a href="../security/">Security scope →</a></p>`;
}
export function buildReview() {
  validateBudget();
  const record=releaseRecord(JSON.parse(read('assets/releases.json')));
  const special={'':overview,try:tryPage,releases:releasesPage,funding:fundingPage};
  return REVIEW_PAGES.map(entry=>{
    const shell=reviewShell(entry,record.release),r=rel(entry.depth);
    const content=special[entry.slug]?special[entry.slug](entry,record):`<h1>${entry.slug==='limitations'?'Not claimed':entry.title}</h1>${entry.slug==='architecture'?architecture():entry.slug==='performance'?measurements():''}${prose(entry.slug)}`;
    const body=`<div class="review">${shell.rail}<article class="review__main"><div class="review-kicker cap"><span>${entry.number} / ${entry.title}</span><span>${REVIEW.date}</span></div>${content}<p class="small dim" data-review-live-status role="status" aria-live="polite">Release snapshot checked ${e(record.checkedAt||'at build time')}. <a href="${SITE.repo}/releases">All releases ↗</a></p>${shell.pager}</article></div>`;
    const output=join('review',entry.slug,'index.html');
    mkdirSync(dirname(join(ROOT,output)),{recursive:true});
    writeFileSync(join(ROOT,output),page({title:`${entry.title} / review`,description:entry.blurb,path:entry.path,depth:entry.depth,body,bodyClass:'review-page',indexed:false,chrome:shell,head:`<meta name="referrer" content="no-referrer"><link rel="stylesheet" href="${r}/assets/css/review.css?v=${assetVersion('assets/css/review.css')}">`,module:`import '${r}/assets/js/review.js';`}));
    return output;
  });
}
