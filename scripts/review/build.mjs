import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {page,SITE,rel,assetVersion} from '../layout.mjs';
import {render} from '../markdown.mjs';
import {REVIEW,money,allowance,validateBudget} from './data.mjs';
import {REVIEW_PAGES,reviewHref} from './manifest.mjs';
import {reviewShell,escape as e} from './layout.mjs';
import {releaseRecord,recordSummary,releasePackages,film,allocation,architecture,measurements,ledger,source} from './components.mjs';
const ROOT=fileURLToPath(new URL('../..',import.meta.url));
const read=p=>readFileSync(join(ROOT,p),'utf8');
function prose(slug) {
  const md=read(`content/review/${slug}.md`).replace(/\{\{budget:([a-z]+)\}\}/g,(_,id)=>allowance(id)).replaceAll('{{source}}',`${SITE.repo}/blob/${REVIEW.evidenceRevision}`).replaceAll('{{request}}',money(REVIEW.request));
  if(/\{\{/.test(md))throw new Error(`Unresolved review content token: ${slug}`);
  return render(md).html;
}
function overview(entry,record) {
  return `<div class="review-hero"><h1>nus</h1><p class="review-hero__line">Here is the thing.<br>Here is how it works.<br><em>Here is what still needs work.</em></p><p>nus is a terminal, browser and editor for local development. This room collects a working release, the system behind it, the limits of the evidence, and a funding proposal.</p><div class="review-actions"><a class="btn btn--signal" href="./try/">Run nus</a><a class="source-cta" href="${SITE.repo}">View source ↗</a></div></div>${recordSummary(record)}${film(entry.depth)}
  <h2>What stays yours.</h2>${ledger([['Profile','A local folder. No nus account.'],['Shell','Your shell, aliases and installed tools. No required hosted runtime.'],['Assistant','A supported backend you choose: local or hosted. The provider’s account and data policies still apply.'],['Sync','Encrypted profile files over a folder or Git remote you select. No nus-operated sync service.'],['Source','MIT code, with dependency licenses retained.']])}
  <h2>Choose a way in.</h2><div class="review-index">${[['try','Run the preview','Download and follow a short test.'],['architecture','Read the system','Surfaces, processes and boundaries.'],['security','Examine the risk','The trust model and reported fixes.'],['performance','Check the numbers','Methods before superlatives.'],['funding','Read the ask','A bounded, itemized proposal.'],['limitations','Read what is not claimed','The edges are part of the record.']].map(([slug,title,desc])=>`<a href="./${slug}/" data-review-nav><strong>${title}</strong><span>${desc}</span><b aria-hidden="true">→</b></a>`).join('')}</div>`;
}
function tryPage(entry,record) {
  const steps=[['Open a shell','Use your existing shell and ordinary commands. There is no nus account to create.'],['Start something local','Use a project you trust, or run python -m http.server in a disposable folder containing no sensitive files. Stop it after testing.'],['Open its page','Open localhost in the browser pane beside its shell. Inspect the process and port relationship.'],['Open a file','Try the local editor. Language tooling depends on the selected language and available runtime; note what the package actually launches.'],['Ask deliberately','Choose a configured backend. Inspect the context chips before sending: shell, block and page may start enabled. A hosted backend receives the selected content.'],['Review a suggested command','Use a harmless command, inspect it and explicitly run it. Multiline answers and web-influenced answers have additional handling; this is not automatic execution.'],['Close the assistant','Continue using the terminal and browser. Record the OS, package version and steps for any reproducible bug.']];
  return `<h1>Try nus</h1><p class="lede">Do the thing rather than read about it.</p><p>These are public previews. Read each signing label before downloading. Use a disposable test project, not confidential work.</p>${releasePackages(record)}<p><a href="../releases/">Source revision, checksums and release notes →</a> · <a href="../../download/">Installation instructions →</a></p>
  <h2>A working recording.</h2>${film(entry.depth)}<p class="small dim">This existing recording shows the shell building the site. The sequence below is a separate reviewer exercise, not a claim about what the film depicts.</p>
  <h2>A short reviewer exercise.</h2>${steps.map(([title,text],i)=>`<section class="review-step"><span class="cap">${String(i+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${text}</p></div></section>`).join('')}`;
}
function releasesPage(entry,record) {
  const {release,checkedAt}=record;
  const releaseURL=release?`${SITE.repo}/releases/tag/${release.tag_name}`:`${SITE.repo}/releases`;
  const aux=release?.assets?.filter(a=>['SHA256SUMS.txt','release.json'].includes(a.name)&&a.state==='uploaded'&&a.browser_download_url===`${SITE.repo}/releases/download/${release.tag_name}/${a.name}`)||[];
  return `<h1>Releases</h1><p class="lede">A package, and the record behind it.</p><p>This packet is pinned to a specific release. Checking for newer releases does not rewrite its source revision or attach old benchmarks to new binaries.</p>${recordSummary(record)}${ledger([['Published',e(release?.published_at||'Not verified')],['Snapshot checked',e(checkedAt||'Not recorded')]])}
  <p><a href="${releaseURL}">Release notes ↗</a>${aux.map(a=>` · <a href="${e(a.browser_download_url)}">${e(a.name)} ↗</a>`).join('')}</p>${releasePackages(record)}
  <div class="review-actions"><button class="btn btn--quiet" data-check-releases="${e(release?.tag_name||REVIEW.releaseTag)}" data-feel-semantic="refresh" type="button">Check for newer releases</button><a href="${SITE.repo}/releases">All releases ↗</a></div><p class="small dim" data-release-check-status role="status" aria-live="polite">The static snapshot is available without JavaScript.</p>
  <h2>The release path.</h2><ol class="review-path">${['Tag','Native runner','Pinned CEF','Tests','Package','Sign where configured','Verify loader','Hash','Publish'].map(t=>`<li>${t}</li>`).join('')}</ol>
  <p>A successful build and loader check are not a complete native GUI acceptance test. Signing status comes from published metadata; checksums identify bytes, not their safety.</p><p><a href="${source('docs/RELEASING.md')}">Release contract ↗</a> · <a href="${source('.github/workflows/release.yml')}">Workflow source ↗</a></p>`;
}
function fundingPage() {
  return `<h1>Funding</h1><p class="cap">Proposed one-time request</p><p class="review-total">${money(REVIEW.request)}</p><p class="lede">I contribute the work. The grant pays for the resources around it.</p><div class="review-pairs"><section><h2>I contribute</h2><p>Design, implementation, release engineering, documentation, fixes and maintenance.</p></section><section><h2>The grant buys</h2><p>Independent security research, signing, project identity, compute and test infrastructure.</p></section></div><h2>Use of funds.</h2><p>These are spending ceilings. Provider eligibility and live quotes are checked before purchase; money reserved is not money already spent.</p>${allocation()}
  <h2>A research pool, not a promise of safety.</h2><p>The bounty reserve is not active. Before invitations go out, define scope, authorization, reward limits, duplicates, disclosure handling and payment terms. Third-party payouts and any reassignment of unused funds are subject to agreement with the funder. No testing of other people’s systems is authorized by this page.</p>
  <h2>What does not change.</h2><p>The application stays free and MIT licensed. Sponsorship does not purchase priority features, a support contract or control of the roadmap. No recurring commitment from the funder is assumed.</p><div class="review-callout"><p>The reserve has a ceiling. The claims have boundaries. The work will have an expense and outcome record.</p></div><p><a href="../milestones/">Deliverables and closeout →</a> · <a href="../security/">Security scope →</a></p>`;
}
export function buildReview() {
  validateBudget();
  const record=releaseRecord(JSON.parse(read('assets/releases.json')));
  const special={'':overview,try:tryPage,releases:releasesPage,funding:fundingPage};
  return REVIEW_PAGES.map(entry=>{
    const shell=reviewShell(entry,record.release),r=rel(entry.depth);
    const content=special[entry.slug]?special[entry.slug](entry,record):`<h1>${entry.slug==='limitations'?'Not claimed':entry.title}</h1>${entry.slug==='architecture'?architecture():entry.slug==='performance'?measurements():''}${prose(entry.slug)}`;
    const body=`<div class="review">${shell.rail}<article class="review__main"><div class="review-kicker cap"><span>${entry.number} / ${entry.title}</span><span>${REVIEW.date}</span></div>${content}${shell.pager}</article></div>`;
    const output=join('review',entry.slug,'index.html');
    mkdirSync(dirname(join(ROOT,output)),{recursive:true});
    writeFileSync(join(ROOT,output),page({title:`${entry.title} / review`,description:entry.blurb,path:entry.path,depth:entry.depth,body,bodyClass:'review-page',indexed:false,chrome:shell,head:`<meta name="referrer" content="no-referrer"><link rel="stylesheet" href="${r}/assets/css/review.css?v=${assetVersion('assets/css/review.css')}">`,module:`import '${r}/assets/js/review.js';`}));
    return output;
  });
}
