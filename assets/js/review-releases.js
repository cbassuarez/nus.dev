/* Shared by the static build and live review pages: one verified release model. */
import {publishedReleases,latestPackageFor,TARGETS,signingLabel} from './releases.js?v=swup-1';
const REPO='https://github.com/cbassuarez/nus';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function revisionFor(release) {
  try {
    const m=JSON.parse((release?.body||'').match(/<!-- nus-release:(.*?) -->/s)?.[1]||'{}');
    return m.version===release.tag_name && /^[a-f0-9]{40}$/.test(m.revision||'')?m.revision:null;
  } catch {return null;}
}
export function reviewReleaseRecord(releases,checkedAt=null) {
  const release=publishedReleases(releases)[0]||null;
  if(!release)return {release:null,revision:null,packages:[],checkedAt};
  const channel=release.prerelease?'preview':'stable';
  return {release,revision:revisionFor(release),checkedAt,packages:TARGETS.map(([id,os,arch])=>{
    const selected=latestPackageFor(releases,channel,id);
    return {id,os,arch,pkg:selected?.pkg||null,release:selected?.release||null,revision:revisionFor(selected?.release)};
  })};
}
export function distributionStatus(record) {
  const desktop=record.packages.filter(x=>x.id.startsWith('macos')||x.id.startsWith('windows'));
  if(desktop.some(x=>['unsigned','ad-hoc'].includes(x.pkg?.signing)))return {
    label:'Unsigned preview · seeking distribution funding',
    text:'The previews are unsigned for trusted distribution.',
    detail:'Windows has no Authenticode signature; macOS uses an ad-hoc signature and is not Apple-notarized. Funding would pay for verified publisher signing and notarization, alongside independent security research and packaged-platform testing.'
  };
  if(desktop.length===2 && desktop.every(x=>['notarized','authenticode'].includes(x.pkg?.signing)))return {
    label:'Publisher-signed packages · funding independent review',text:'Publisher-signed packages are available.',
    detail:'See each package’s signing record below. Funding supports independent security research, packaged-platform testing and continued distribution; signing establishes publisher identity, not a guarantee of safety.'
  };
  return {label:'Preview distribution · signing status unverified',text:'Check each package’s signing record before downloading.',detail:'Funding supports verified publisher distribution, independent security research and packaged-platform testing. An unverified signing record must not be read as signed.'};
}
export function distributionNotice(record) {
  const state=distributionStatus(record);
  // The exact labels remain visible even if only one platform changes signing.
  const labels=record.packages.filter(x=>x.pkg).map(x=>`${x.os}: ${signingLabel(x.pkg.signing)}`).join(' · ');
  const unsigned=record.packages.filter(x=>['unsigned','ad-hoc'].includes(x.pkg?.signing)).map(x=>x.os);
  let detail=state.detail;
  if(unsigned.length && unsigned.length<2) detail=`${unsigned.join(' and ')} still lacks verified publisher distribution. Funding supports signing, independent security research and packaged-platform testing. Signing establishes publisher identity, not a guarantee of safety.`;
  return `<p><strong>${state.text}</strong> ${escape(detail)}</p><p class="small dim">${escape(labels||'No package signing record is available.')}</p>`;
}
export function packageCards(record) {
  if(!record.release)return '<p class="review-callout">No verified package is available in this snapshot. <a href="https://github.com/cbassuarez/nus/releases">Inspect Releases ↗</a></p>';
  return `<div class="review-packages">${record.packages.map(({id,os,arch,pkg,release,revision})=>`<section class="review-package" id="package-${id}"><div class="review-package__top"><div><p class="cap">${escape(arch)}</p><h3>${os}</h3></div><span class="review-package__size">${pkg?`${(pkg.size/1048576).toFixed(1)} <small>MiB</small>`:'—'}</span></div>${pkg?`<p><a href="${REPO}/releases/tag/${escape(release.tag_name)}">${escape(release.tag_name)}</a>${revision?` · <a href="${REPO}/commit/${revision}">Source ${revision.slice(0,7)}</a>`:''}</p><p class="review-package__state">${escape(signingLabel(pkg.signing))}</p><p class="small dim">Compressed download · ${pkg.size.toLocaleString('en-US')} bytes</p><p><a class="btn btn--quiet" href="${escape(pkg.url)}">Download ${os} ↗</a></p><details data-feel-disclosure="ordinary"><summary>SHA-256 checksum</summary><code class="review-hash" id="hash-${id}">${pkg.hash}</code><button type="button" class="review-copy" data-copy-hash="hash-${id}" data-feel-semantic="copy" hidden>Copy checksum</button></details>`:'<p>Not published for this channel.</p>'}</section>`).join('')}</div>`;
}
export function releaseSummary(record) {
  const {release,revision,packages}=record;
  const rows=[
    ['Latest published release',release?`<a href="${REPO}/releases/tag/${escape(release.tag_name)}">${escape(release.tag_name)}</a>`:'No verified release in the snapshot'],
    ['Source revision',revision?`<a class="review-hash" href="${REPO}/commit/${revision}">${revision}</a>`:'Not verified'],
    ['Available packages',escape(packages.filter(x=>x.pkg).map(x=>`${x.os} / ${x.arch} (${x.release.tag_name})`).join(' · ')||'None verified')]
  ];
  return `<dl class="review-ledger">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
