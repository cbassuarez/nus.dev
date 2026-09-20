export function mountFilms() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for (const frame of document.querySelectorAll('[data-film]')) {
  const video=frame.querySelector('video'), button=frame.querySelector('[data-film-toggle]'), error=frame.querySelector('[data-film-error]');
  let wanted=false, visible=false;
  const label=()=>{button.textContent=video.paused?'Play recording ↗':'Pause recording Ⅱ';button.setAttribute('aria-pressed',String(!video.paused));};
  const play=async()=>{ if(!video.src) video.src=video.dataset.src; try {await video.play(); error.hidden=true;} catch {label();} };
  button.addEventListener('click',()=>{wanted=video.paused;if(wanted)play();else video.pause();});
  video.addEventListener('play',label);video.addEventListener('pause',label);
  video.addEventListener('error',()=>{wanted=false;error.hidden=false;label();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)video.pause();else if(wanted&&!document.hidden)play();},{threshold:.2}).observe(frame);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(wanted&&visible)play();});
  reduced.addEventListener('change',()=>{if(reduced.matches){wanted=false;video.pause();}});
  // Recordings are deliberately opt-in: no motion or large transfer on arrival.
  label();
 }
}
