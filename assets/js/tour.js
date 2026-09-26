/* The panels tour: the numbered sections, one slide at a time, advancing on
   their own. Without this module they are simply sections, one after another.
   Rotation pauses while the tour is hovered, focused, off screen or in a
   hidden tab; any explicit choice (a tab, an arrow, a swipe) stops it, and
   under reduced motion it only starts when asked. */
export const DURATION=9000;

export function mountTour(root=document.querySelector('[data-tour]')){
 if(!root)return;
 const tabs=[...root.querySelectorAll('[data-tour-tab]')],slides=[...root.querySelectorAll('[data-tour-slide]')];
 const list=root.querySelector('[data-tour-tabs]'),stage=root.querySelector('[data-tour-slides]'),play=root.querySelector('[data-tour-play]'),count=root.querySelector('[data-tour-count]');
 if(!slides.length||tabs.length!==slides.length)return;
 const controller=new AbortController(),on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:controller.signal});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width: 901px)'),pad=i=>String(i+1).padStart(2,'0');
 let index=0,playing=!reduced.matches,hovered=false,focused=false,visible=false,elapsed=0,last=0,frame=0;

 root.classList.add('tour--live');
 root.setAttribute('aria-roledescription','carousel');
 list.setAttribute('role','tablist');
 tabs.forEach((tab,i)=>{tab.id||=`tour-tab-${slides[i].id}`;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',slides[i].id);});
 slides.forEach((slide,i)=>{slide.setAttribute('role','tabpanel');slide.setAttribute('aria-roledescription','slide');slide.setAttribute('aria-labelledby',tabs[i].id);});
 root.querySelectorAll('[data-tour-controls]').forEach(el=>{el.hidden=false;});

 const bar=i=>tabs[i].querySelector('[data-tour-progress]');
 // Side by side, the stage keeps the tallest slide's height so nothing below it moves;
 // stacked on a phone, it follows each slide so a short one leaves no gap.
 const fit=()=>{stage.style.height=`${wide.matches?Math.max(...slides.map(slide=>slide.offsetHeight)):slides[index].offsetHeight}px`;};
 // Land with the tab strip just under the sticky masthead.
 const land=()=>{const top=root.querySelector('.tour__bar').getBoundingClientRect().top,head=document.querySelector('.masthead')?.getBoundingClientRect().bottom||0;window.scrollTo({top:Math.max(0,scrollY+top-head-16),behavior:'instant'});};
 const reveal=()=>{
  // Scroll the tab strip, never the page, to keep the current tab in view.
  const tab=tabs[index],left=tab.offsetLeft,right=left+tab.offsetWidth;
  if(left<list.scrollLeft||right>list.scrollLeft+list.clientWidth)list.scrollTo({left:Math.max(0,left-24),behavior:reduced.matches?'auto':'smooth'});
 };
 const paint=()=>{
  root.classList.toggle('is-playing',playing);
  play.setAttribute('aria-label',playing?'Pause the tour':'Play the tour');
  play.querySelector('[data-tour-playing]').hidden=!playing;
  play.querySelector('[data-tour-paused]').hidden=playing;
  stage.setAttribute('aria-live',playing?'off':'polite');
 };
 const show=(next,{focus=false}={})=>{
  index=(next+slides.length)%slides.length;elapsed=0;last=0;
  slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.classList.toggle('is-before',i<index);slide.inert=i!==index;});
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;bar(i).style.setProperty('--p','0');});
  if(count)count.textContent=`${pad(index)} / ${pad(slides.length-1)}`;
  fit();reveal();
  if(focus)tabs[index].focus();
 };
 const paused=()=>!playing||hovered||focused||!visible||document.hidden;
 const tick=now=>{
  frame=0;
  if(paused()){last=0;return;}
  if(last)elapsed+=now-last;
  last=now;
  bar(index).style.setProperty('--p',Math.min(1,elapsed/DURATION).toFixed(4));
  if(elapsed>=DURATION)show(index+1);
  frame=requestAnimationFrame(tick);
 };
 const run=()=>{if(!frame&&!paused())frame=requestAnimationFrame(tick);};
 const stop=()=>{playing=false;paint();};
 const choose=(i,options)=>{stop();show(i,options);};

 tabs.forEach((tab,i)=>on(tab,'click',event=>{event.preventDefault();choose(i);}));
 on(list,'keydown',event=>{
  const to={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:slides.length-1}[event.key];
  if(to===undefined)return;
  event.preventDefault();choose(to,{focus:true});
 });
 on(root.querySelector('[data-tour-prev]'),'click',()=>choose(index-1));
 on(root.querySelector('[data-tour-next]'),'click',()=>choose(index+1));
 // Pressing play means play now, even with the pointer or focus still on the tour.
 on(play,'click',()=>{playing=!playing;hovered=focused=false;paint();run();});

 // A horizontal swipe turns the slide; a vertical one still scrolls the page.
 let x=0,y=0,tracking=false,swiped=false;
 on(stage,'pointerdown',event=>{if(event.pointerType==='mouse')return;x=event.clientX;y=event.clientY;tracking=true;swiped=false;});
 on(stage,'pointerup',event=>{
  if(!tracking)return;tracking=false;
  const dx=event.clientX-x,dy=event.clientY-y;
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;choose(index+(dx<0?1:-1));}
 });
 on(stage,'pointercancel',()=>{tracking=false;});
 on(stage,'click',event=>{if(swiped){event.preventDefault();event.stopPropagation();swiped=false;}},{capture:true});

 on(root,'pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;}});
 on(root,'pointerleave',event=>{if(event.pointerType==='mouse'){hovered=false;run();}});
 // Keyboard focus holds the slide; a mouse click is already a choice of its own.
 on(root,'focusin',event=>{focused=event.target.matches(':focus-visible');});
 on(root,'focusout',event=>{if(!root.contains(event.relatedTarget)){focused=false;run();}});
 on(document,'visibilitychange',run);
 on(reduced,'change',()=>{if(reduced.matches)stop();});
 on(wide,'change',fit);
 const seen=new IntersectionObserver(([entry])=>{visible=entry.intersectionRatio>=.35;run();},{threshold:[0,.35,.6]});
 seen.observe(root);
 const resized=new ResizeObserver(()=>fit());
 slides.forEach(slide=>resized.observe(slide));

 // A link to one section (/panels/#history) opens the tour on it, and holds there.
 const fromHash=()=>{try{return slides.findIndex(slide=>slide.id===decodeURIComponent(location.hash.slice(1)));}catch{return -1;}};
 const target=fromHash();
 if(target>=0)playing=false;
 paint();show(Math.max(0,target));
 if(target>=0)land();
 on(window,'hashchange',()=>{const i=fromHash();if(i>=0){choose(i);land();}});

 return ()=>{controller.abort();cancelAnimationFrame(frame);seen.disconnect();resized.disconnect();};
}
