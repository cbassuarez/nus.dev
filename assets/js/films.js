export function mountFilms() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width: 700px)'),controller=new AbortController(),clean=[];
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 for (const frame of document.querySelectorAll('[data-film]')) {
  const video=frame.querySelector('video'),button=frame.querySelector('[data-film-toggle]'),error=frame.querySelector('[data-film-error]');
  let wanted=false,visible=false;
  const preferred=()=>narrow.matches&&video.dataset.srcMobile?video.dataset.srcMobile:video.dataset.src;
  const format=()=>{
   if(!video.paused)return;
   const poster=narrow.matches&&video.dataset.posterMobile?video.dataset.posterMobile:video.dataset.posterDesktop;
   if(poster)video.poster=poster;
   // Do not fetch either video until Play; changing size prepares the next play.
   if(video.getAttribute('src')&&video.getAttribute('src')!==preferred()){
    wanted=false;video.removeAttribute('src');video.load();
   }
  };
  const label=()=>{button.textContent=video.ended?'Replay ↻':video.paused?(button.dataset.playLabel||'Play recording ↗'):'Pause Ⅱ';button.setAttribute('aria-pressed',String(!video.paused));};
  const play=async()=>{if(controller.signal.aborted)return;format();wanted=true;if(!video.getAttribute('src'))video.src=preferred();if(video.ended)video.currentTime=0;try{await video.play();if(controller.signal.aborted)video.pause();else error.hidden=true;}catch{wanted=false;error.hidden=false;label();}};
  on(button,'click',()=>{wanted=video.paused;if(wanted){if(narrow.matches)frame.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});play();}else video.pause();});
  on(video,'play',label);on(video,'pause',label);on(video,'ended',()=>{wanted=false;label();});on(video,'error',()=>{wanted=false;error.hidden=false;label();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)video.pause();else if(wanted&&!document.hidden)play();},{threshold:.2});observer.observe(frame);
  on(document,'visibilitychange',()=>{if(document.hidden)video.pause();else if(wanted&&visible)play();});
  on(reduced,'change',()=>{if(reduced.matches){wanted=false;video.pause();}});
  on(narrow,'change',()=>{format();label();});
  format();label();clean.push(()=>{observer.disconnect();video.pause();});
 }
 return ()=>{controller.abort();clean.forEach(fn=>fn());};
}
