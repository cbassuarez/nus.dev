export function mountFilms() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width: 700px)'),controller=new AbortController(),clean=[];
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 for (const frame of document.querySelectorAll('[data-film]')) {
  const video=frame.querySelector('video'),button=frame.querySelector('[data-film-toggle]'),error=frame.querySelector('[data-film-error]');
  const autoplay=frame.hasAttribute('data-film-autoplay');
  video.autoplay=autoplay&&!reduced.matches;
  if(autoplay)video.muted=true;
  button.hidden=false;
  let wanted=video.autoplay,visible=false,attempt=0;
  const pause=()=>{attempt++;video.pause();};
  const preferred=()=>narrow.matches&&video.dataset.srcMobile?video.dataset.srcMobile:video.dataset.src;
  const format=()=>{
   if(!video.paused)return;
   const poster=narrow.matches&&video.dataset.posterMobile?video.dataset.posterMobile:video.dataset.posterDesktop;
   if(poster)video.poster=poster;
   // Manual films wait for Play; autoplay films wait until they are visible.
   if(video.getAttribute('src')&&video.getAttribute('src')!==preferred()){
    wanted=false;video.removeAttribute('src');video.load();
   }
  };
  const label=()=>{button.textContent=video.ended?'Replay ↻':video.paused?(button.dataset.playLabel||'Play recording ↗'):'Pause Ⅱ';button.setAttribute('aria-pressed',String(!video.paused));button.setAttribute('aria-label',video.ended?'Replay demo':video.paused?'Play demo':'Pause demo');};
  const play=async()=>{if(controller.signal.aborted)return;format();wanted=true;const request=++attempt;if(!video.getAttribute('src'))video.src=preferred();if(video.ended)video.currentTime=0;try{await video.play();if(controller.signal.aborted||request!==attempt||!wanted)video.pause();else error.hidden=true;}catch{if(request!==attempt||controller.signal.aborted)return;wanted=false;error.hidden=false;label();}};
  on(button,'click',()=>{wanted=video.paused;if(wanted){if(narrow.matches&&!autoplay)frame.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});play();}else pause();});
  on(video,'play',label);on(video,'pause',label);on(video,'ended',()=>{wanted=false;label();});on(video,'error',()=>{wanted=false;error.hidden=false;label();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)pause();else if(wanted&&!document.hidden)play();},{threshold:.2});observer.observe(frame);
  on(document,'visibilitychange',()=>{if(document.hidden)pause();else if(wanted&&visible)play();});
  on(reduced,'change',()=>{if(reduced.matches){wanted=false;video.autoplay=false;pause();}});
  on(narrow,'change',()=>{format();label();});
  format();label();clean.push(()=>{wanted=false;observer.disconnect();pause();});
 }
 return ()=>{controller.abort();clean.forEach(fn=>fn());};
}
