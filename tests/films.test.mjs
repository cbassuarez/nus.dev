import test from 'node:test';
import assert from 'node:assert/strict';
import {mountFilms} from '../assets/js/films.js';

class Element extends EventTarget {
 constructor(dataset={}){super();this.dataset=dataset;this.attrs={};this.hidden=true;this.paused=true;this.ended=false;this.currentTime=0;}
 getAttribute(k){return this.attrs[k]??null;}
 setAttribute(k,v){this.attrs[k]=v;}
 removeAttribute(k){delete this.attrs[k];}
 set src(v){this.attrs.src=v;}
 get src(){return this.attrs.src;}
 async play(){this.paused=false;this.ended=false;this.dispatchEvent(new Event('play'));}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
 load(){this.currentTime=0;}
}
function fixture(mobile=false){
 const video=new Element({src:'desktop.mp4',srcMobile:'mobile.mp4',posterDesktop:'desktop.png',posterMobile:'mobile.png'}),button=new Element({playLabel:'Play demo'}),error=new Element();
 const frame={scrollIntoView(options){this.scrollOptions=options;},querySelector:s=>s==='video'?video:s==='[data-film-toggle]'?button:error};
 const document=new Element();document.querySelectorAll=()=>[frame];document.hidden=false;
 const narrow=new Element(),reduced=new Element();narrow.matches=mobile;reduced.matches=false;
 globalThis.document=document;globalThis.matchMedia=q=>q.includes('700px')?narrow:reduced;
 let observer;globalThis.IntersectionObserver=class {constructor(fn){this.fn=fn;observer=this;}observe(){}disconnect(){this.disconnected=true;}};
 const cleanup=mountFilms();
 return {frame,video,button,error,document,narrow,reduced,cleanup,intersect:visible=>observer.fn([{isIntersecting:visible}]),observer};
}
test('hero loads on explicit play, selects phone composition, and replays on demand',async()=>{
 const f=fixture(true);assert.equal(f.video.src,undefined);assert.equal(f.video.poster,'mobile.png');
 f.intersect(true);assert.equal(f.video.src,undefined);
 f.button.dispatchEvent(new Event('click'));await Promise.resolve();assert.equal(f.video.src,'mobile.mp4');assert.equal(f.video.paused,false);assert.equal(f.frame.scrollOptions.block,'center');
 f.video.ended=true;f.video.paused=true;f.video.currentTime=12;f.video.dispatchEvent(new Event('ended'));assert.equal(f.button.textContent,'Replay ↻');
 f.intersect(false);f.intersect(true);assert.equal(f.video.paused,true);
 f.button.dispatchEvent(new Event('click'));await Promise.resolve();assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);f.cleanup();
});
test('visibility pauses, reduced motion cancels resume, cleanup removes listeners',async()=>{
 const f=fixture();f.intersect(true);f.button.dispatchEvent(new Event('click'));await Promise.resolve();
 f.intersect(false);assert.equal(f.video.paused,true);f.intersect(true);await Promise.resolve();assert.equal(f.video.paused,false);
 f.reduced.matches=true;f.reduced.dispatchEvent(new Event('change'));assert.equal(f.video.paused,true);
 f.intersect(false);f.intersect(true);assert.equal(f.video.paused,true);
 f.cleanup();assert.equal(f.observer.disconnected,true);f.button.dispatchEvent(new Event('click'));assert.equal(f.video.paused,true);
});
test('paused viewport change prepares alternate source without downloading it',async()=>{
 const f=fixture();f.button.dispatchEvent(new Event('click'));await Promise.resolve();f.button.dispatchEvent(new Event('click'));
 f.narrow.matches=true;f.narrow.dispatchEvent(new Event('change'));assert.equal(f.video.src,undefined);assert.equal(f.video.poster,'mobile.png');
 f.button.dispatchEvent(new Event('click'));await Promise.resolve();assert.equal(f.video.src,'mobile.mp4');f.intersect(false);f.intersect(true);assert.equal(f.video.paused,false);f.cleanup();
});
