import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedReleases,latestFor,latestPackageFor,packageFor,detectTarget,TARGETS} from '../assets/js/releases.js';
function fixture(tag='v0.0.1-preview.1', signing='notarized') {
 const name=`nus-${tag.slice(1)}-macos-arm64.zip`, hash='a'.repeat(64);
 const entry={name,target:'macos-arm64',size:100,sha256:hash,signing};
 return {tag_name:tag,prerelease:tag.includes('-preview.'),draft:false,published_at:'2026-09-20T12:00:00Z',body:`<!-- nus-release:${JSON.stringify({version:tag,assets:[entry]})} -->`,assets:[{name,size:100,state:'uploaded',digest:`sha256:${hash}`,browser_download_url:`https://github.com/cbassuarez/nus/releases/download/${tag}/${name}`}]};
}
// A Windows release as publish-release.py writes it: the ZIP is the record, the installer rides on it.
function windowsFixture(tag='v0.0.2-preview.9', signing='authenticode', {installer=true}={}) {
 const zip=`nus-${tag.slice(1)}-windows-x86_64.zip`, setup=zip.replace(/\.zip$/,'-setup.exe');
 const zipHash='c'.repeat(64), setupHash='d'.repeat(64);
 const entry={name:zip,target:'windows-x86_64',size:200,sha256:zipHash,signing,...(installer?{installer:{name:setup,sha256:setupHash,size:150}}:{})};
 const asset=(name,size,hash)=>({name,size,state:'uploaded',digest:`sha256:${hash}`,browser_download_url:`https://github.com/cbassuarez/nus/releases/download/${tag}/${name}`});
 return {tag_name:tag,prerelease:tag.includes('-preview.'),draft:false,published_at:'2026-09-30T12:00:00Z',body:`<!-- nus-release:${JSON.stringify({version:tag,assets:[entry]})} -->`,assets:[asset(zip,200,zipHash),...(installer?[asset(setup,150,setupHash)]:[])]};
}
test('Windows is offered as the installer, never the ZIP',()=>{
 const r=windowsFixture(); const p=packageFor(r,'windows-x86_64');
 assert.equal(p.name,'nus-0.0.2-preview.9-windows-x86_64-setup.exe');
 assert.equal(p.url,r.assets[1].browser_download_url); assert.equal(p.size,150);
 assert.equal(p.hash,'d'.repeat(64)); assert.equal(p.signing,'authenticode');
 assert.equal(TARGETS.find(t=>t[0]==='windows-x86_64')[3],'installer');
});
test('a Windows release with only its ZIP creates no download button',()=>{
 assert.equal(packageFor(windowsFixture('v0.0.2-preview.9','authenticode',{installer:false}),'windows-x86_64'),null);
});
test('the installer takes its signing and fallback hash from the record it rides on',()=>{
 const r=windowsFixture(); delete r.assets[1].digest;
 assert.equal(packageFor(r,'windows-x86_64').hash,'d'.repeat(64));
 r.assets[1].size=151; assert.equal(packageFor(r,'windows-x86_64'),null);
 assert.equal(packageFor(windowsFixture('v0.0.2-preview.9','unsigned'),'windows-x86_64').signing,'unsigned');
 assert.equal(packageFor(windowsFixture('v0.0.2','unsigned'),'windows-x86_64'),null);
});
test('an older installer stays available when the newest Windows release has none',()=>{
 const older=windowsFixture('v0.0.2-preview.8'), newer={...windowsFixture('v0.0.2-preview.9','authenticode',{installer:false}),published_at:'2026-10-01T12:00:00Z'};
 assert.equal(latestPackageFor([older,newer],'preview','windows-x86_64').release,older);
});
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

test('the visitor\'s own computer is detected; phones, tablets and unknowns are not guessed',()=>{
 const agent=(userAgent,platform,extra={})=>({userAgent,platform,maxTouchPoints:0,...extra});
 assert.equal(detectTarget(agent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.5 Safari/605.1.15','MacIntel')),'macos-arm64');
 assert.equal(detectTarget(agent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0.0.0','Win32')),'windows-x86_64');
 assert.equal(detectTarget(agent('Mozilla/5.0 (X11; Linux x86_64) Firefox/143.0','Linux x86_64')),'linux-x86_64');
 assert.equal(detectTarget(agent('Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0.0.0','',{userAgentData:{platform:'Linux',mobile:false}})),'linux-x86_64');
 assert.equal(detectTarget(agent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0.0.0','Win32',{userAgentData:{platform:'Windows',mobile:false}})),'windows-x86_64');
 for (const phone of [
  agent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) Mobile/15E148 Safari/604.1','iPhone'),
  agent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.5 Safari/605.1.15','MacIntel',{maxTouchPoints:5}),
  agent('Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/140.0.0.0 Mobile Safari/537.36','Linux armv8l'),
  agent('Mozilla/5.0 (X11; CrOS x86_64 16181.61.0) Chrome/140.0.0.0','Linux x86_64'),
  agent('Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0.0.0','Linux x86_64',{userAgentData:{platform:'Android',mobile:true}}),
  agent('','')
 ]) assert.equal(detectTarget(phone),null,phone.userAgent);
 assert.equal(detectTarget(null),null);
});
test('the download page offers one tile per target instead of a dropdown',()=>{
 const html=readFileSync(new URL('../download/index.html',import.meta.url),'utf8');
 assert.ok(!/<select\b/.test(html));
 const values=[...html.matchAll(/<input type="radio" name="platform" value="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(values,TARGETS.map(t=>t[0]));
 assert.equal((html.match(/name="platform" value="[^"]+" checked/g)||[]).length,1);
 assert.equal((html.match(/data-detected hidden/g)||[]).length,TARGETS.length);
});
