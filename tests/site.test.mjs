import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname, join} from 'node:path';
import {siteServer} from '../scripts/serve.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
function pages(dir=root){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
 if(entry.name.startsWith('.')||['assets','content','scripts','tests','wasm'].includes(entry.name))return [];
 const path=join(dir,entry.name);return entry.isDirectory()?pages(path):path.endsWith('.html')?[path]:[];
});}
test('every generated page has valid local links and media',()=>{
 const checked=pages();assert.ok(checked.length>=11);
 for(const page of checked){
  const html=readFileSync(page,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,page);
  for(const [,href] of html.matchAll(/(?:href|src|poster|data-src)="([^"]+)"/g)){
   if(/^[a-z]+:|^\/\//i.test(href))continue;
   const [file,fragment]=href.split('#');
   let target=file.startsWith('/')?resolve(root,'.'+file):resolve(dirname(page),decodeURIComponent(file.split('?')[0]||'.'));
   if(!file)target=page;
   assert.ok(existsSync(target),`${page}: ${href}`);
   if(statSync(target).isDirectory())target=join(target,'index.html');
   assert.ok(existsSync(target),`${page}: ${href}`);
   if(fragment&&target.endsWith('.html'))assert.ok(readFileSync(target,'utf8').includes(`id="${decodeURIComponent(fragment)}"`),`${page}: ${href}`);
  }
 }
});
test('preview server streams seekable video and rejects invalid ranges',async t=>{
 const server=siteServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>server.close());const origin=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(origin+'/assets/films/memphis.mp4',{headers:{Range:'bytes=0-31'}});
 assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'video/mp4');
 assert.equal((await response.arrayBuffer()).byteLength,32);
 const head=await fetch(origin+'/assets/films/memphis.mp4',{method:'HEAD'});
 assert.equal(head.status,200);assert.ok(Number(head.headers.get('content-length'))>32);
 const invalid=await fetch(origin+'/assets/films/memphis.mp4',{headers:{Range:'bytes=999999999-'}});
 assert.equal(invalid.status,416);
 const malformed=await fetch(origin+'/%ZZ');assert.equal(malformed.status,404);
});
