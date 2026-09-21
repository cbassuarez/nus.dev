import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Swup production bundles and licenses match pinned integrity manifests',()=>{
 for(const dir of ['swup/4.10.0','swup-head-plugin/2.3.1']){
  const manifest=JSON.parse(read('assets/vendor/'+dir+'/manifest.json'));
  assert.equal(manifest.license,'MIT');assert.ok(manifest.hashes.LICENSE);
  for(const [file,hash] of Object.entries(manifest.hashes))assert.equal(createHash('sha256').update(read('assets/vendor/'+dir+'/'+file)).digest('hex'),hash);
 }
});
test('public and review routes share replaceable containers and a single page runtime',()=>{
 for(const route of ['index.html','panels/index.html','download/index.html','about/index.html','docs/index.html','review/index.html','review/funding/index.html']){
  const html=read(route);
  for(const id of ['site-header','main','site-footer','page-announcer'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,route+': '+id);
  assert.ok(html.includes('data-page-transition'));assert.ok(html.includes('/assets/js/navigation.js'));
  assert.ok(!html.includes('src="https://unpkg.com'));
 }
});
test('page animation has no native view transition or document opacity fade',()=>{
 const css=read('assets/css/review.css');assert.ok(!css.includes('@view-transition'));assert.ok(!css.includes('::view-transition'));
 const nav=read('assets/js/navigation.js');assert.ok(nav.includes('native:false'));assert.ok(nav.includes("before('content:replace'"));
 const rules=read('assets/css/site.css').split('/* Swup owns page changes.')[1];
 assert.ok(rules.includes('prefers-reduced-motion'));assert.ok(rules.includes('clip-path'));assert.ok(!/opacity:\s*(?:0|\.)/.test(rules));
});
