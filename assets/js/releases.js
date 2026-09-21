export const API = 'https://api.github.com/repos/cbassuarez/nus/releases?per_page=30';
const REPO = 'https://github.com/cbassuarez/nus';
export const TARGETS = [
  ['macos-arm64', 'macOS', 'Apple silicon', 'zip'],
  ['windows-x86_64', 'Windows', 'Intel / AMD 64-bit', 'zip'],
  ['linux-x86_64', 'Linux', 'Intel / AMD 64-bit', 'tar.gz']
];
export function publishedReleases(input) {
  return (Array.isArray(input) ? input : []).filter(r => r && !r.draft &&
    /^v\d+\.\d+\.\d+(?:-preview\.\d+)?$/.test(r.tag_name) &&
    r.prerelease === r.tag_name.includes('-preview.') && Number.isFinite(Date.parse(r.published_at)) && Array.isArray(r.assets)
  ).sort((a,b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}
export function latestFor(releases, channel) {
  return publishedReleases(releases).find(r => r.prerelease === (channel === 'preview'));
}
export function latestPackageFor(releases, channel, target) {
  for (const release of publishedReleases(releases)) {
    if (release.prerelease !== (channel === 'preview')) continue;
    const pkg = packageFor(release, target);
    if (pkg) return {release, pkg};
  }
  return null;
}
export function packageFor(release, target) {
  const platform = TARGETS.find(t => t[0] === target);
  if (!platform || !publishedReleases([release]).length) return null;
  const name = `nus-${release.tag_name.slice(1)}-${target}.${platform[3]}`;
  const url = `${REPO}/releases/download/${release.tag_name}/${name}`;
  const asset = release.assets.find(a => a.name === name && a.state === 'uploaded' && a.size > 0 && a.browser_download_url === url);
  if (!asset) return null;
  let meta;
  try {
    const m = JSON.parse((release.body || '').match(/<!-- nus-release:(.*?) -->/s)?.[1] || '{}');
    if (m.version === release.tag_name) meta = m.assets?.find(a => a.target === target && a.name === name && a.size === asset.size);
  } catch { /* Missing metadata must never imply a signed package. */ }
  const hash = asset.digest?.startsWith('sha256:') ? asset.digest.slice(7) : meta?.sha256;
  if (!/^[a-f0-9]{64}$/.test(hash || '')) return null;
  if (meta?.sha256 && meta.sha256 !== hash) return null;
  const signing = meta?.signing || 'unverified';
  if (!release.prerelease && ((target.startsWith('macos') && signing !== 'notarized') || (target.startsWith('windows') && signing !== 'authenticode'))) return null;
  return {name, url, size:asset.size, hash, signing};
}
export const signingLabel = value => ({notarized:'Developer ID signed · Apple notarized', authenticode:'Signed for Windows', unsigned:'Unsigned preview', 'ad-hoc':'Ad-hoc signed · not notarized', unverified:'Signing not verified', checksum:'SHA-256 checksum provided'})[value] || 'Signing not verified';

export async function mountDownloads(root = document.querySelector('[data-downloads]')) {
  if (!root) return;
  const q = s => root.querySelector(s);
  const target = q('[data-target]');
  const platform = navigator.userAgentData?.platform || navigator.platform;
  target.value = /Win/i.test(platform) ? 'windows-x86_64' : /Linux/i.test(platform) ? 'linux-x86_64' : 'macos-arm64';
  let releases = [], source = '', loading = false, lastCheck = 0;
  const render = () => {
    const channel = q('[name=channel]:checked').value;
    const selected = latestPackageFor(releases, channel, target.value);
    const release = selected?.release, pkg = selected?.pkg;
    q('[data-version]').textContent = release?.tag_name || 'Awaiting first release';
    q('[data-date]').textContent = release ? new Date(release.published_at).toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'}) : '—';
    q('[data-status]').textContent = loading ? 'Checking published releases…' : pkg ? source || 'Ready to download from GitHub.' : `No ${channel} package is published for this machine yet. ${source}`;
    q('[data-signing]').textContent = pkg ? signingLabel(pkg.signing) : 'Shown with each published package';
    const link = q('[data-download]');
    link.hidden = !pkg;
    if (pkg) { link.href = pkg.url; link.textContent = `Download for ${TARGETS.find(t=>t[0]===target.value)[1]} · ${(pkg.size/1048576).toFixed(0)} MB`; }
    else link.removeAttribute('href');
    q('[data-hash-section]').hidden = !pkg;
    q('[data-hash]').textContent = pkg?.hash || '';
    q('[data-copy]').textContent = 'Copy SHA-256';
    q('[data-notes]').href = release ? `${REPO}/releases/tag/${release.tag_name}` : `${REPO}/releases`;
    for (const note of root.querySelectorAll('[data-install]')) note.hidden = !target.value.startsWith(note.dataset.install);
    const tbody = q('[data-packages]');
    tbody.replaceChildren(...TARGETS.map(([id,os,arch]) => {
      const row = document.createElement('tr'), available = latestPackageFor(releases,channel,id), p = available?.pkg;
      for (const value of [os, arch, available?.release.tag_name || '—', p ? signingLabel(p.signing) : 'Not published']) { const td=document.createElement('td'); td.textContent=value; row.append(td); }
      const td=document.createElement('td');
      if (p) { const a=document.createElement('a'); a.href=p.url; a.textContent=`Download (${(p.size/1048576).toFixed(0)} MB)`; a.setAttribute('aria-label',`Download ${os} ${arch}`); td.append(a); } else td.textContent='—';
      row.append(td); return row;
    }));
  };
  const refresh = async () => {
    if(loading)return;
    loading=true; lastCheck=Date.now(); render(); q('[data-retry]').disabled=true;
    try {
      const response=await fetch(API,{cache:'no-store',headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(12000)});
      if (!response.ok) throw new Error('Release service unavailable');
      const data=await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected release response');
      releases=publishedReleases(data); source='';
    } catch {
      try { const response=await fetch('../assets/releases.json',{cache:'no-store'}); if (!response.ok) throw new Error(); const cached=await response.json(); releases=publishedReleases(cached.releases); source=cached.checked_at ? `Last checked ${new Date(cached.checked_at).toLocaleDateString()}.` : 'GitHub could not be reached. Try again or visit Releases.'; }
      catch { source='GitHub could not be reached. Try again or visit Releases.'; }
    } finally { loading=false; q('[data-retry]').disabled=false; render(); }
  };
  root.addEventListener('change', render);
  q('[data-retry]').addEventListener('click',refresh);
  q('[data-copy]').addEventListener('click',async () => { try { await navigator.clipboard.writeText(q('[data-hash]').textContent); q('[data-copy]').textContent='Copied'; } catch { q('[data-copy]').textContent='Select the hash to copy'; } });
  await refresh();
  const recheck=()=>{if(!document.hidden && Date.now()-lastCheck>60000)refresh();};
  document.addEventListener('visibilitychange',recheck);
  window.addEventListener('focus',recheck);
  setInterval(()=>{if(!document.hidden)refresh();},300000);
}
