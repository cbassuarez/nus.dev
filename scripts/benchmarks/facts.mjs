import {readFileSync} from 'node:fs';
export const HOME=JSON.parse(readFileSync(new URL('../../assets/benchmarks/homepage.json',import.meta.url),'utf8'));
export const F=HOME.figures;
export const P=HOME.package_sizes;
export const rounded=(n,digits=1)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
export const range=x=>`${rounded(x.min)}–${rounded(x.max)}`;
export const tokens={
 'mac.disk':rounded(P.mac.value,0),'mac.download':rounded(P.mac.download_mib,0),
 'windows.disk':rounded(P.windows.unpacked_mib,0),'windows.download':rounded(P.windows.download_mib,0),
 'linux.disk':rounded(P.linux.unpacked_mib/1024,2),'linux.download':rounded(P.linux.download_mib,0),
 'file10.p95':rounded(F.file10.value),'file100.max':rounded(F.file100.value),
 'tabs.median':rounded(F.tabs.value),'tabs.range':range(F.tabs),'windows.range':range(F.windows),
 'recorded.date':HOME.recorded_at.slice(0,10),'package.release':HOME.package_release,
};
export function applyFacts(text){return text.replace(/\{\{figure:([a-z0-9.]+)\}\}/g,(_,key)=>{if(!(key in tokens))throw Error('Unknown measurement figure '+key);return tokens[key]});}
if(HOME.schema!==1||!Number.isFinite(F.file10.value)||F.file10.count!==20||F.file100.count!==5)throw Error('Invalid homepage evidence');
