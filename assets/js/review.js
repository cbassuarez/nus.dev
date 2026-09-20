/* Review Room progressive enhancements. The packet remains complete without JavaScript. */
import {API, publishedReleases} from "./releases.js";
import {feel} from "./feel.js";

function wireCopy(root) {
  for (const button of root.querySelectorAll("[data-copy-hash]")) {
    button.hidden=false;
    button.addEventListener("click",async()=>{
      const value=root.getElementById(button.dataset.copyHash)?.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
        button.textContent="Copied";
        feel.emit("review.copy.success",{target:button});
      } catch {
        button.textContent="Select the checksum to copy";
        feel.emit("review.copy.error",{target:button});
      }
    });
  }
}

function wireDisclosures(root) {
  root.addEventListener("toggle",event=>{
    const el=event.target instanceof Element ? event.target.closest("[data-feel-disclosure]") : null;
    if(!el) return;
    if(!el.open) {
      feel.emit("review.disclosure.close",{target:el});
      return;
    }
    const kind=el.dataset.feelDisclosure;
    if(kind==="architecture") feel.emit("review.inspect",{target:el});
    else if(kind==="funding") feel.emit("review.funding.open",{target:el});
    else feel.emit("review.disclosure.open",{target:el});
  },true);
}

function wireReleaseCheck(root) {
  const check=root.querySelector("[data-check-releases]");
  if(!check) return;
  check.addEventListener("click",async()=>{
    const output=root.querySelector("[data-release-check-status]");
    check.disabled=true;
    output.textContent="Checking published releases…";
    feel.emit("review.refresh.start",{target:check});
    try {
      const response=await fetch(API,{headers:{Accept:"application/vnd.github+json"},signal:AbortSignal.timeout(12000),referrerPolicy:"no-referrer"});
      if(!response.ok) throw new Error("GitHub returned "+response.status);
      const releases=publishedReleases(await response.json());
      const current=releases.find(r=>r.tag_name===check.dataset.checkReleases);
      const latest=releases[0];
      output.textContent=!current
        ? "This packet’s release is not in the current listing. Inspect GitHub Releases before downloading."
        : latest?.tag_name===current.tag_name
          ? "This packet matches the newest published release."
          : "A newer release is listed: "+latest.tag_name+". This packet remains pinned to "+current.tag_name+"; use GitHub Releases to inspect newer evidence.";
      feel.emit("review.refresh.ready",{target:check});
    } catch {
      output.textContent="GitHub could not be reached. The dated release snapshot below has not been changed.";
      feel.emit("review.refresh.error",{target:check});
    } finally {
      check.disabled=false;
    }
  });
}

function wireHeaderHeight(root) {
  const header=root.querySelector(".reviewhead");
  if(header && "ResizeObserver" in window) {
    new ResizeObserver(()=>document.documentElement.style.setProperty("--review-head",header.getBoundingClientRect().height+"px")).observe(header);
  }
}

function enter() {
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.add("review-enter")));
}

export function mountReview(root=document) {
  wireCopy(root);
  wireDisclosures(root);
  wireReleaseCheck(root);
  wireHeaderHeight(root);
  enter();
}

mountReview();
