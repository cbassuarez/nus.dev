/* Progressive enhancements only. The application evidence is rendered at build time. */
import {API, publishedReleases} from './releases.js';

export function mountReview(root=document) {
  for (const button of root.querySelectorAll('[data-copy-hash]')) {
    button.hidden=false;
    button.addEventListener('click',async()=>{
      const value=root.getElementById(button.dataset.copyHash)?.textContent.trim();
      try { await navigator.clipboard.writeText(value); button.textContent='Copied'; }
      catch { button.textContent='Select the checksum to copy'; }
    });
  }
  const header=root.querySelector('.reviewhead');
  if(header && 'ResizeObserver' in window) {
    new ResizeObserver(()=>document.documentElement.style.setProperty('--review-head',`${header.getBoundingClientRect().height}px`)).observe(header);
  }
  const check=root.querySelector('[data-check-releases]');
  if(check) check.addEventListener('click',async()=>{
    const output=root.querySelector('[data-release-check-status]');
    check.disabled=true; output.textContent='Checking published releases…';
    try {
      const response=await fetch(API,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(12000),referrerPolicy:'no-referrer'});
      if(!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const releases=publishedReleases(await response.json());
      const current=releases.find(r=>r.tag_name===check.dataset.checkReleases);
      const latest=releases[0];
      output.textContent=!current ? 'This packet’s release is not in the current listing. Inspect GitHub Releases before downloading.' : latest?.tag_name===current.tag_name ? 'This packet matches the newest published release.' : `A newer release is listed: ${latest.tag_name}. This packet remains pinned to ${current.tag_name}; use GitHub Releases to inspect newer evidence.`;
    } catch { output.textContent='GitHub could not be reached. The dated release snapshot below has not been changed.'; }
    finally { check.disabled=false; }
  });
}
mountReview();
