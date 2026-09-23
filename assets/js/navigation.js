/* One Swup instance for the site. No fetched page scripts are re-executed. */
import '../vendor/swup/4.10.0/Swup.umd.js';
import '../vendor/swup-head-plugin/2.3.1/index.umd.js';
import {mountSite} from './site.js?v=benchmarks-1';
import {mountFeel} from './feel.js?v=swup-1';
import {mountFilms} from './films.js?v=swup-1';
import {mountOrbit} from './orbit.js?v=swup-1';
import {mountDownloads} from './releases.js?v=swup-1';
import {mountReview} from './review.js?v=swup-1';

let cleanups=[];
function unmount(){
 for(const clean of cleanups.splice(0))clean?.();
 document.querySelectorAll('video').forEach(video=>video.pause());
}
function mount(){
 cleanups.push(mountSite(),mountFilms());
 mountFeel();
 const orbit=mountOrbit(document.querySelector('[data-orbit]'));if(orbit)cleanups.push(()=>orbit.destroy());
 if(document.querySelector('[data-downloads]'))cleanups.push(mountDownloads());
 if(document.body.classList.contains('review-page'))cleanups.push(mountReview());
}
const siteRoot=new URL('../../',import.meta.url).pathname;
const swup=new window.Swup({
 containers:['#site-header','#main','#site-footer'],
 animationSelector:'[data-page-transition]',
 native:false,
 timeout:10000,
 cache:false,
 plugins:[new window.SwupHeadPlugin({awaitAssets:true})],
 ignoreVisit:(url,{el}={})=>{
  const to=new URL(url,location.href);
  return el?.closest('[data-no-swup]') || to.origin!==location.origin || !to.pathname.startsWith(siteRoot) || /\.(?:zip|gz|mp4|png|svg|json|pdf)$/i.test(to.pathname);
 }
});
swup.hooks.before('content:replace',visit=>{
 unmount();
 document.body.className=visit.to.document?.body.className||'';
});
swup.hooks.on('page:view',visit=>{
 mount();
 const hash=visit.to.hash;
 let target;try{target=hash?document.getElementById(decodeURIComponent(hash.slice(1))):null;}catch{}
 target ||= document.querySelector('#main h1')||document.querySelector('#main');
 if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
 document.querySelector('#page-announcer').textContent=document.title;
});
mount();
// Exposes the real lifecycle to the browser regression harness, not a second router.
window.nusNavigation=swup;
