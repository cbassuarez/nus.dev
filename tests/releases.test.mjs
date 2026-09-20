import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedReleases,latestFor,packageFor} from '../assets/js/releases.js';
function fixture(tag='v0.0.1-preview.1', signing='notarized') {
 const name=`nus-${tag.slice(1)}-macos-arm64.zip`, hash='a'.repeat(64);
 const entry={name,target:'macos-arm64',size:100,sha256:hash,signing};
 return {tag_name:tag,prerelease:tag.includes('-preview.'),draft:false,published_at:'2026-09-20T12:00:00Z',body:`<!-- nus-release:${JSON.stringify({version:tag,assets:[entry]})} -->`,assets:[{name,size:100,state:'uploaded',digest:`sha256:${hash}`,browser_download_url:`https://github.com/cbassuarez/nus/releases/download/${tag}/${name}`}]};
}
test('channels never confuse a draft, preview and stable release',()=>{
 const preview=fixture(), stable=fixture('v0.0.1');
 assert.equal(latestFor([preview,stable],'stable'),stable);
 assert.equal(latestFor([preview,stable],'preview'),preview);
 assert.equal(publishedReleases([{...preview,draft:true},{...stable,prerelease:true},null]).length,0);
});
test('a real verified package exposes exact URL, size and signature',()=>{
 const r=fixture(); const p=packageFor(r,'macos-arm64');
 assert.equal(p.url,r.assets[0].browser_download_url); assert.equal(p.size,100); assert.equal(p.signing,'notarized');
 assert.equal(packageFor(r,'windows-x86_64'),null);
});
test('missing hash, bad hash and foreign asset URLs never create download buttons',()=>{
 for (const change of [{browser_download_url:'https://example.com/malware.zip'},{digest:'sha256:bad'},{state:'new'},{size:0}]) {
 const r=fixture();Object.assign(r.assets[0],change);assert.equal(packageFor(r,'macos-arm64'),null);
 }
 const r=fixture();delete r.assets[0].digest;r.body='';assert.equal(packageFor(r,'macos-arm64'),null);
});
test('fallback manifest hash is accepted only for this exact package',()=>{
 const r=fixture(); delete r.assets[0].digest;assert.equal(packageFor(r,'macos-arm64').hash,'a'.repeat(64));
 r.assets[0].size=101;assert.equal(packageFor(r,'macos-arm64'),null);
});
test('unsigned stable cannot be offered; unsigned previews are labeled',()=>{
 assert.equal(packageFor(fixture('v0.0.1','ad-hoc'),'macos-arm64'),null);
 assert.equal(packageFor(fixture('v0.0.1-preview.1','ad-hoc'),'macos-arm64').signing,'ad-hoc');
});
test('malformed API responses fail closed',()=>{
 for (const value of [undefined,{},[],{message:'rate limited'}]) assert.deepEqual(publishedReleases(value),[]);
 assert.equal(packageFor(undefined,'macos-arm64'),null);
});
