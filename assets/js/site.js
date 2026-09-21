/* Reusable page setup: every listener and observer has a matching cleanup. */
export function mountSite() {
 const controller=new AbortController(),clean=[];
 const on=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal:controller.signal});
 const root=document.documentElement,signals=[['red','#c8102e'],['blue','#1f5fbf'],['gold','#d9a400'],['green','#2e7d32'],['violet','#6b3fa0'],['teal','#1a7f8a']];
 const get=k=>{try{return localStorage.getItem(k);}catch{return null;}};
 const set=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
 const dark=matchMedia('(prefers-color-scheme: dark)');
 const ink=()=>root.getAttribute('data-theme')?root.getAttribute('data-theme')==='ink':dark.matches;
 const favicon=()=>{const el=document.querySelector('[data-nus-favicon]');if(el)el.href=el.dataset.iconRoot+'nus-'+(ink()?'ink':'paper')+'.svg';};
 const theme=mode=>{if(['paper','ink'].includes(mode))root.setAttribute('data-theme',mode);else root.removeAttribute('data-theme');favicon();window.dispatchEvent(new CustomEvent('nus:theme'));};
 const signal=hex=>{root.style.setProperty('--signal',hex);root.style.setProperty('--on-signal',hex==='#d9a400'?'#141414':'#ffffff');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',hex);};
 const saved=get('nus.signal');if(signals.some(x=>x[1]===saved))signal(saved);
 theme(get('nus.theme'));
 for(const host of document.querySelectorAll('[data-signalpick]')){
  host.replaceChildren();
  for(const [name,hex] of signals){const b=document.createElement('button');b.type='button';b.style.background=hex;b.title='Signal — '+name;b.setAttribute('aria-label','Signal colour '+name);b.setAttribute('aria-pressed',String(hex===(get('nus.signal')||signals[0][1])));b.dataset.cuelumeToggle='toggle';
   on(b,'click',()=>{signal(hex);set('nus.signal',hex);host.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));});host.append(b);
  }
 }
 for(const b of document.querySelectorAll('[data-theme-toggle]')){
  const paint=()=>{const sun=b.querySelector('[data-sun]'),moon=b.querySelector('[data-moon]');if(sun)sun.hidden=!ink();if(moon)moon.hidden=ink();b.setAttribute('aria-label',ink()?'Switch to paper':'Switch to ink');b.title=ink()?'Paper':'Ink';};
  on(b,'click',()=>{const next=ink()?'paper':'ink';theme(next);set('nus.theme',next);paint();});
  on(dark,'change',()=>{if(!root.hasAttribute('data-theme')){favicon();paint();window.dispatchEvent(new CustomEvent('nus:theme'));}});paint();
 }
 const here=location.pathname.replace(/index\.html$/,'').replace(/\/+$/,'')||'/';
 for(const a of document.querySelectorAll('.nav a,.doc__nav a,.review-nav a,.review-mobile a')){
  if(a.getAttribute('href')?.startsWith('#'))continue;
  const u=new URL(a.href);if(u.origin!==location.origin)continue;
  const path=u.pathname.replace(/index\.html$/,'').replace(/\/+$/,'')||'/';
  if(path===here)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 }
 const links=[...document.querySelectorAll('.doc__nav a[href^="#"]')],targets=links.map(a=>document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
 if(targets.length){const visible=new Set(),observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target.id);else visible.delete(e.target.id);}const first=targets.find(t=>visible.has(t.id));links.forEach(a=>{if(first&&a.hash==='#'+first.id)a.dataset.here='';else a.removeAttribute('data-here');});},{rootMargin:'-90px 0px -65% 0px'});targets.forEach(t=>observer.observe(t));clean.push(()=>observer.disconnect());}
 const faces=[['Plex Mono','normal',600,26],['Silkscreen','normal',400,23],['Plex Mono','italic',400,26],['Bungee','normal',400,23],['Rubik Mono','normal',400,20],['Newsreader','italic',500,29]],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const link of document.querySelectorAll('.mark')){const word=link.querySelector('.wordmark');if(!word)continue;let generation=0,timer;
  const settle=()=>{generation++;clearTimeout(timer);word.style.removeProperty('font');word.style.removeProperty('letter-spacing');};
  const start=async()=>{settle();if(reduced.matches)return;const run=generation;await Promise.all(faces.map(([name,style,weight,size])=>document.fonts.load(`${style} ${weight} ${size}px "${name}"`).catch(()=>{})));if(run!==generation||controller.signal.aborted)return;let frame=0;const beat=()=>{if(run!==generation)return;const [name,style,weight,size]=faces[frame++];word.style.font=`${style} ${weight} ${size}px "${name}"`;word.style.letterSpacing='-.06em';if(frame<faces.length)timer=setTimeout(beat,60000/152/4);else settle();};beat();};
  on(link,'pointerenter',start);on(link,'pointerleave',settle);on(link,'focus',start);on(link,'blur',settle);on(reduced,'change',settle);on(document,'visibilitychange',()=>{if(document.hidden)settle();});clean.push(settle);
 }
 return ()=>{controller.abort();clean.forEach(fn=>fn());};
}
