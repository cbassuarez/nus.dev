import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('the panels tour has one slide per numbered section, each with a tab and a picture',()=>{
 const html=read('panels/index.html');
 const slides=[...html.matchAll(/<article class="tour__slide" id="([^"]+)" data-tour-slide>/g)].map(m=>m[1]);
 assert.deepEqual(slides,['browser','workspace','editor','kept','home','history','hatch']);
 const tabs=[...html.matchAll(/<a class="tour__tab" href="#([^"]+)" data-tour-tab data-no-swup>/g)].map(m=>m[1]);
 assert.deepEqual(tabs,slides);
 for(const id of slides){
  const slide=html.split(`id="${id}" data-tour-slide>`)[1].split('</article>')[0];
  assert.match(slide,/<figure class="tour__shot[^"]*">/,id);
  assert.match(slide,/<figcaption>[^<]+<\/figcaption>/,id);
  assert.match(slide,/<h2>/,id);
 }
 // Controls wait for the script, so without it the page reads as plain sections.
 assert.equal((html.match(/data-tour-controls hidden/g)||[]).length,2);
 assert.ok(!html.includes('aria-roledescription="carousel"'));
});

test('the tour is mounted by the page runtime and does not rotate under reduced motion unless asked',()=>{
 assert.match(read('assets/js/navigation.js'),/cleanups\.push\(mountTour\(\)\)/);
 const tour=read('assets/js/tour.js');
 assert.match(tour,/playing=!reduced\.matches/);
 assert.match(tour,/controller\.abort\(\);cancelAnimationFrame\(frame\)/);
});
