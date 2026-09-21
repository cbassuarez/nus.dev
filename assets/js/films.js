export function mountFilms() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),controller=new AbortController(),clean=[];
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 for (const frame of document.querySelectorAll('[data-film]')) {
  const video=frame.querySelector('video'),button=frame.querySelector('[data-film-toggle]'),error=frame.querySelector('[data-film-error]');
  let wanted=false,visible=false;
  const label=()=>{button.textContent=video.paused?'Play recording ↗':'Pause recording Ⅱ';button.setAttribute('aria-pressed',String(!video.paused));};
  const play=async()=>{if(controller.signal.aborted)return;if(!video.src)video.src=video.dataset.src;try{await video.play();if(controller.signal.aborted)video.pause();else error.hidden=true;}catch{label();}};
  on(button,'click',()=>{wanted=video.paused;if(wanted)play();else video.pause();});
  on(video,'play',label);on(video,'pause',label);on(video,'error',()=>{wanted=false;error.hidden=false;label();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)video.pause();else if(wanted&&!document.hidden)play();},{threshold:.2});observer.observe(frame);
  on(document,'visibilitychange',()=>{if(document.hidden)video.pause();else if(wanted&&visible)play();});
  on(reduced,'change',()=>{if(reduced.matches){wanted=false;video.pause();}});
  label();clean.push(()=>{observer.disconnect();video.pause();});
 }
 return ()=>{controller.abort();clean.forEach(fn=>fn());};
}
