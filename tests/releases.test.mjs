import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedReleases,latestFor,latestPackageFor,packageFor,TARGETS} from '../assets/js/releases.js';
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
test('platform previews keep earlier verified downloads available',()=>{
 const earlier=fixture();
 const newer={...fixture('v0.0.1-preview.2'),published_at:'2026-09-21T12:00:00Z',assets:[]};
 assert.equal(latestFor([earlier,newer],'preview'),newer);
 assert.equal(latestPackageFor([earlier,newer],'preview','macos-arm64').release,earlier);
 assert.equal(latestPackageFor([earlier,newer],'stable','macos-arm64'),null);
 assert.equal(latestPackageFor([earlier,newer],'preview','linux-x86_64'),null);
});
test('Intel Macs are not a target',()=>{
 assert.ok(!TARGETS.some(t=>t[0]==='macos-x86_64'));
 assert.equal(packageFor(fixture(),'macos-x86_64'),null);
});


test('conflicting API and manifest hashes never create a download button',()=>{
 const r=fixture();r.assets[0].digest='sha256:'+'b'.repeat(64);
 assert.equal(packageFor(r,'macos-arm64'),null);
});

test('withdrawn releases disappear and maintenance patches never downgrade the recommended line',()=>{
 const current=fixture('v0.8.0'), patch=fixture('v0.7.40');
 patch.published_at='2026-09-23T12:00:00Z';
 assert.equal(latestFor([patch,current],'stable'),current);
 assert.equal(latestPackageFor([patch,current],'stable','macos-arm64').release,current);
 const manifest=JSON.parse(current.body.match(/<!-- nus-release:(.*?) -->/s)[1]);
 manifest.state='withdrawn';current.body=`<!-- nus-release:${JSON.stringify(manifest)} -->`;
 assert.equal(packageFor(current,'macos-arm64'),null);
 assert.equal(latestFor([patch,current],'stable'),patch);
 assert.equal(latestFor([fixture('v0.8.0-preview.9'),fixture('v0.8.0-preview.10')],'preview').tag_name,'v0.8.0-preview.10');
});
