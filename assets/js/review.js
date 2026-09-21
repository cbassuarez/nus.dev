/* Review Room progressive enhancements. The packet remains complete without JavaScript. */
import {API} from "./releases.js";
import {reviewReleaseRecord,packageCards,releaseSummary,distributionNotice,distributionStatus} from "./review-releases.js";
import {feel} from "./feel.js";

function wireCopy(root) {
  for (const button of root.querySelectorAll("[data-copy-hash]")) {
    if(button.dataset.copyBound) continue;
    button.dataset.copyBound="true";
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
  let loading=false,lastCheck=0,rendered=null;
  const status=text=>{
    for(const el of root.querySelectorAll("[data-release-check-status],[data-review-live-status]"))el.textContent=text;
  };
  const refresh=async(manual=false)=>{
    if(loading)return;
    loading=true;lastCheck=Date.now();
    if(check)check.disabled=true;
    if(manual)feel.emit("review.refresh.start",{target:check});
    try {
      const response=await fetch(API,{cache:"no-store",headers:{Accept:"application/vnd.github+json"},signal:AbortSignal.timeout(12000),referrerPolicy:"no-referrer"});
      if(!response.ok)throw new Error("Release service unavailable");
      const data=await response.json();
      if(!Array.isArray(data))throw new Error("Invalid release listing");
      const record=reviewReleaseRecord(data);
      if(!record.release || !record.packages.some(x=>x.pkg))throw new Error("No verified published package");
      const key=JSON.stringify([record.release.tag_name,record.revision,record.packages]);
      if(key!==rendered){
        for(const el of root.querySelectorAll("[data-review-packages]"))el.innerHTML=packageCards(record);
        for(const el of root.querySelectorAll("[data-review-record]"))el.innerHTML=releaseSummary(record);
        for(const el of root.querySelectorAll("[data-review-signing]"))el.innerHTML=distributionNotice(record);
        for(const el of root.querySelectorAll("[data-review-status]"))el.textContent=distributionStatus(record).label;
        for(const el of root.querySelectorAll("[data-review-version]"))el.textContent=record.release.tag_name;
        for(const el of root.querySelectorAll("[data-review-notes]"))el.href="https://github.com/cbassuarez/nus/releases/tag/"+record.release.tag_name;
        wireCopy(root);rendered=key;
      }
      status("Downloads checked against GitHub Releases just now. Each platform shows its newest verified package; historical measurements are unchanged.");
      if(manual)feel.emit("review.refresh.ready",{target:check});
    } catch {
      status("The live release check is unavailable. Previously displayed packages have been kept; use GitHub Releases to check for a newer version.");
      if(manual)feel.emit("review.refresh.error",{target:check});
    } finally {loading=false;if(check)check.disabled=false;}
  };
  if(check)check.addEventListener("click",()=>refresh(true));
  refresh();
  const recheck=()=>{if(!document.hidden && Date.now()-lastCheck>60000)refresh();};
  document.addEventListener("visibilitychange",recheck);
  window.addEventListener("focus",recheck);
  setInterval(()=>{if(!document.hidden)refresh();},300000);
}

function wireHeaderHeight(root) {
  const header=root.querySelector(".reviewhead");
  if(header && "ResizeObserver" in window) {
    new ResizeObserver(()=>document.documentElement.style.setProperty("--review-head",header.getBoundingClientRect().height+"px")).observe(header);
  }
}

let arrivedByTransition=false;
window.addEventListener("pagereveal",event=>{
  if(event.viewTransition){
    arrivedByTransition=true;
    document.documentElement.classList.remove("review-enter");
  }
});

function enter() {
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!arrivedByTransition) document.documentElement.classList.add("review-enter");
  }));
}

export function mountReview(root=document) {
  wireCopy(root);
  wireDisclosures(root);
  wireReleaseCheck(root);
  wireHeaderHeight(root);
  enter();
}

mountReview();
