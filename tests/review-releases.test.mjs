import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewReleaseRecord,packageCards,releaseSummary,distributionStatus} from '../assets/js/review-releases.js';
const releases=JSON.parse(readFileSync(new URL('../assets/releases.json',import.meta.url))).releases;
const original=releases[0];
function next(){
 const r=structuredClone(original),tag='v99.0.0-preview.1';
 const m=JSON.parse(r.body.match(/<!-- nus-release:(.*?) -->/s)[1]);
 m.version=tag;m.revision='b'.repeat(40);
 m.assets.forEach(a=>{a.name=a.name.replace(original.tag_name.slice(1),tag.slice(1));a.sha256='c'.repeat(64);});
 r.tag_name=tag;r.prerelease=true;r.published_at='2099-01-01T00:00:00Z';r.body='<!-- nus-release:'+JSON.stringify(m)+' -->';
 r.assets=r.assets.filter(a=>m.assets.some(x=>a.name.replace(original.tag_name.slice(1),tag.slice(1))===x.name));
 r.assets.forEach(a=>{a.name=a.name.replace(original.tag_name.slice(1),tag.slice(1));a.browser_download_url=`https://github.com/cbassuarez/nus/releases/download/${tag}/${a.name}`;a.digest='sha256:'+'c'.repeat(64);});
 return r;
}
test('new release advances URL, version, source and checksum together',()=>{
 const newer=next(),record=reviewReleaseRecord([original,newer]);
 assert.equal(record.release,newer);assert.equal(record.revision,'b'.repeat(40));
 for(const x of record.packages){assert.ok(x.pkg.url.includes(newer.tag_name));assert.equal(x.pkg.hash,'c'.repeat(64));assert.equal(x.revision,'b'.repeat(40));}
 assert.ok(packageCards(record).includes('Source bbbbbbb'));
 assert.ok(releaseSummary(record).includes(newer.tag_name));
});
test('partial release keeps the latest available package and its own provenance per platform',()=>{
 const newer=next();newer.assets=newer.assets.filter(a=>a.name.includes('macos-arm64'));
 const record=reviewReleaseRecord([newer,original]);
 assert.equal(record.packages[0].release,newer);
 assert.equal(record.packages[1].release,original);
 assert.ok(packageCards(record).includes(original.tag_name));
});
test('draft release and malformed asset never replace usable downloads',()=>{
 const newer=next();newer.draft=true;
 assert.equal(reviewReleaseRecord([newer,original]).release,original);
 newer.draft=false;newer.assets.forEach(a=>a.digest='sha256:invalid');
 assert.ok(reviewReleaseRecord([newer,original]).packages.every(x=>x.release===original));
});
test('distribution lead reflects actual signing rather than permanently claiming unsigned',()=>{
 const record=reviewReleaseRecord([original]);
 record.packages.forEach(x=>{if(x.id.startsWith('macos'))x.pkg.signing='ad-hoc';if(x.id.startsWith('windows'))x.pkg.signing='unsigned';});
 assert.match(distributionStatus(record).label,/Unsigned/);
 record.packages.forEach(x=>{if(x.id.startsWith('macos'))x.pkg.signing='notarized';if(x.id.startsWith('windows'))x.pkg.signing='authenticode';});
 assert.match(distributionStatus(record).label,/Publisher-signed/);
 assert.match(distributionStatus(reviewReleaseRecord([])).label,/unverified/);
});
