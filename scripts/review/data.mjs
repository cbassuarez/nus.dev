import {readFileSync} from 'node:fs';
import {reviewReleaseRecord} from '../../assets/js/review-releases.js';
const latest=reviewReleaseRecord(JSON.parse(readFileSync(new URL('../../assets/releases.json',import.meta.url),'utf8')).releases);
// Proposal amounts are spending ceilings, not purchase quotes or an active bounty.
export const REVIEW = {
  date: '2026-09-21',
  edition: '2026.09',
  request: 5000,
  releaseTag: latest.release?.tag_name || null,
  evidenceRevision: latest.revision || '1c58b5a51185a65b60141f9f45c6b6af151fb9e8',
  measurementRevision: '1c58b5a51185a65b60141f9f45c6b6af151fb9e8',
  budget: [
    {id:'bounties', label:'Independent security research / bounties', amount:1800, basis:'Capped reserve', purpose:'An invited round of adversarial research on browser, assistant, shell, local-control and private-session boundaries. Researcher payouts and any payment fees share this ceiling. This is proposed funding, not an active public bounty or guaranteed audit.'},
    {id:'cef', label:'Source-built CEF investigation', amount:900, basis:'Compute and storage allowance', purpose:'One initial platform and a pinned CEF/Chromium version: source checkout, clean build, limited rebuilds, a small extension-compatibility test set and a published maintenance assessment. Partial and negative results are valid outputs.'},
    {id:'automated', label:'Automated security analysis', amount:500, basis:'Metered usage ceiling', purpose:'Model/API and sandbox compute for adversarial review, reproducing suspected issues, reviewing fixes and adding regression tests. Maintainer validation remains necessary; this does not buy a security certification.'},
    {id:'windows', label:'Windows signing / two-year reserve', amount:593, basis:'Provisional signing allowance', purpose:'Reserve for individual code-signing validation and cloud-backed signing. Confirm provider eligibility, current certificate and service prices, renewal terms and required signing volume before purchase.'},
    {id:'validation', label:'Cross-platform validation', amount:300, basis:'Test-infrastructure allowance', purpose:'Clean-machine and virtualized checks of installation, permissions, browser behavior and packaged-runtime regressions on supported platforms. Existing hardware and free CI are used first.'},
    {id:'domain', label:'Project domain / three years', amount:270, basis:'Maintainer quote: $90/year wholesale', purpose:'Three years of the intended nus.dev identity. Registration availability, retail markup and renewal price must be checked at checkout. The site currently remains at cbassuarez.com/nus.dev via cbassuarez.github.io/nus.dev.'},
    {id:'apple', label:'Apple distribution / two years', amount:198, basis:'Planning basis: $99/year', purpose:'Apple Developer Program membership for Developer ID distribution and notarization. Enrollment and successful signing are separate from a completed native build.'},
    {id:'contingency', label:'Bounded contingency', amount:439, basis:'Restricted reserve', purpose:'Documented overruns in these same categories, not an unrelated feature budget. Reallocation of unused bounty or research funds would be agreed with the funder and recorded.'}
  ]
};
export const money = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(n);
export function validateBudget(data = REVIEW) {
  if (!Number.isSafeInteger(data.request) || data.request <= 0) throw new Error('Invalid requested amount');
  if (new Set(data.budget.map(x=>x.id)).size !== data.budget.length) throw new Error('Duplicate budget ID');
  if (data.budget.some(x=>!Number.isSafeInteger(x.amount)||x.amount<=0)) throw new Error('Invalid allocation');
  if (data.budget.reduce((n,x)=>n+x.amount,0) !== data.request) throw new Error('Budget does not balance');
  return data;
}
validateBudget();
export const allowance = id => money(REVIEW.budget.find(x=>x.id===id)?.amount ?? (()=>{throw new Error(`Unknown budget: ${id}`)})());
