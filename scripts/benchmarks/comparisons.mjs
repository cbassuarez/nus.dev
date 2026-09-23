import {comparisonChart as chart} from './chart.mjs';
import {AXES} from './scales.mjs';
import {summarize,escape as e,format as f} from './model.mjs';
const source=name=>`../assets/benchmarks/${name}.json`;
export function validateComparison(d,products){
 if(d.schema!==1||d.status!=='complete'||!Number.isInteger(d.requested_trials)||d.requested_trials<5)throw Error('Incomplete comparison');
 if(d.attempts.length!==products.length*d.requested_trials)throw Error('Unexpected comparison sample count');
 for(const name of products){const rows=d.attempts.filter(r=>r.product===name);if(rows.length!==d.requested_trials||new Set(rows.map(r=>r.trial)).size!==rows.length||rows.some(r=>r.status!=='complete'))throw Error('Missing or failed comparison trials');}
 return d;
}
function samples(d,name,key){return d.attempts.filter(r=>r.product===name).map(r=>({run:r.trial,value:key(r)}));}
function series(label,observations,detail,file,primary=false){
 if(observations.some(o=>!Number.isFinite(o.value)||o.value<0))throw Error('Invalid comparison observation');
 const s=summarize(observations);return {label,value:s.median,statistic:`Median · n=${s.n}`,observations,primary,detail:`${detail} Observed range ${f(s.min)}–${f(s.max)}. ${s.ci?'Median interval available in detailed statistics.':'Five independent trials are too few for a finite distribution-free 95% median interval.'}`,source:source(file)};
}
function retainedSeries(label,observations,detail,file,statistic){
 if(observations.some(o=>!Number.isFinite(o.value)||o.value<0))throw Error('Invalid Arc observation');
 const v=summarize(observations);
 return {label,value:v.median,statistic,observations,followup:true,source:source(file),detail:`${detail} Observed range ${f(v.min)}–${f(v.max)}. Shared Arc session; no independence assumption or confidence interval.`};
}
export function validateArc(d,products,expectedHash){
 validateComparison(d,products);
 if(d.session_reused!==true||d.apps?.Arc?.binary_sha256!==expectedHash)throw Error('Arc session policy or binary mismatch');
 return d;
}
function validateWorkspace(d){
 for(const r of d.attempts)if(r.samples?.length!==5||r.samples.some(s=>!Number.isFinite(s.rss_mib)||s.rss_mib<=0)||r.oracles?.page!==true||r.oracles?.terminal!==true||r.oracles?.editor_bytes!==102400||summarize(r.samples.map(s=>({value:s.rss_mib}))).median!==r.rss_mib)throw Error('Invalid workspace measurement');
}
function validateSpeedometer(d){
 for(const r of d.attempts)if(!r.result.valid||!r.result.score.isValid||r.result.iterations.length!==10||r.result.visible!=='visible')throw Error('Invalid Speedometer run');
}
export function renderComparisons(home,browser,workspace=null,arcBrowser=null,arcWorkspace=null){
 const historicalWorkspace=workspace?.historical_baseline?.binary_sha256===workspace?.apps?.NUS?.binary_sha256 && /^[a-f0-9]{64}$/.test(workspace?.historical_baseline?.source_sha256||'');
 if(browser.apps?.NUS?.binary_sha256!==home.runtime_binary_sha256||workspace&&workspace.apps?.NUS?.binary_sha256!==home.runtime_binary_sha256&&!historicalWorkspace)throw Error('Mixed runtime binaries');
 const F=home.figures,apps=home.packages.applications,byName=Object.fromEntries(apps.map(a=>[a.product,a]));
 const size=(names)=>names.reduce((n,k)=>n+byName[k].logical_bytes,0)/1048576;
 const installed=[{label:'NUS',value:size(['NUS']),primary:true,statistic:'Local optimized build',source:source('homepage'),detail:'One application bundle. Runtime build identity is recorded in the source data.'}];
 for(const browser of ['Zen','Arc'])for(const terminal of ['Ghostty','Kitty','WezTerm']){const names=['VS Code',browser,terminal];installed.push({label:names.join(' + '),value:size(names),statistic:'Three application bundles',source:source('homepage'),detail:names.map(n=>`${n} ${n==='WezTerm'?'20240203-110809-5046fc22':byName[n].version}`).join('; ')});}
 let html=`<nav class="benchmark__jump" aria-label="Benchmark sections"><a href="#stack-size">Stack size</a><a href="#workspace-memory">Workspace memory</a><a href="#browser-speed">Browser</a><a href="#package-figures">Homepage figures</a><a href="#native-workflows">Native workflows</a><a href="#correctness">Verification</a></nav>`;
 html+=chart({id:'stack-size',title:'One environment. Six complete stacks.',subtitle:'Installed application bytes · lower is smaller. NUS compared with VS Code + a browser + a terminal, all on this Mac.',axis:AXES.installed,series:installed,references:[{label:'NUS bundle',value:installed[0].value}],note:'Regular-file bytes, each inode counted once; symlinks and user profiles excluded. Packages are measured as distributed, including universal binaries where supplied. This is storage, not RAM. The homepage’s macOS package figure uses allocated APFS storage for published preview.7; this comparison uses logical bytes of the local runtime build.'});
 if(workspace){
  const names=['NUS','VS Code + Zen + Ghostty','VS Code + Zen + Kitty','VS Code + Zen + WezTerm'];validateComparison(workspace,names);
  validateWorkspace(workspace);
  const ss=names.map(n=>series(n==='NUS'&&historicalWorkspace?'NUS (earlier build)':n,samples(workspace,n,r=>r.rss_mib),(historicalWorkspace?workspace.historical_baseline.reason+' ':'')+workspace.sampling+' '+workspace.limits,'workspace',n==='NUS'));
  if(arcWorkspace){
   const names=['Ghostty','Kitty','WezTerm'].map(t=>'VS Code + Arc + '+t);validateArc(arcWorkspace,names,byName.Arc.executable_sha256);validateWorkspace(arcWorkspace);
   ss.push(...names.map(n=>retainedSeries(n,samples(arcWorkspace,n,r=>r.rss_mib),arcWorkspace.sampling+' '+arcWorkspace.limits,'arc-workspace','Median · 5 trials / Arc session retained')));
  }
  html+=chart({id:'workspace-memory',title:historicalWorkspace?'Earlier workspace baseline: three surfaces open.':'The same three surfaces, open together.',subtitle:'Process-tree RSS · lower is smaller. A 100 KiB file, a local web page and an idle terminal command; editor foreground.',axis:AXES.rss,series:ss,references:[{label:'NUS median',value:ss[0].value}],note:(historicalWorkspace?workspace.historical_baseline.reason+' Recorded '+workspace.historical_baseline.recorded_at.slice(0,10)+'. ':'')+'NUS and Zen stacks: five fresh-profile trials with rotating run order. Each dot summarizes five RSS snapshots. Summed RSS double-counts shared pages; it is not physical footprint. NUS has one window; the stack has three. '+(arcWorkspace?'Hatched Arc rows are a later batch: fresh VS Code/terminal launches share one retained Arc test-account session after the browser benchmark. Profile and prior workload differ; no matched causal speedup or independent Arc-memory confidence claim.':'Arc runtime measurements are pending.')});
 }else html+='<section class="comparison" id="workspace-memory"><h2>Workspace memory</h2><p>Matched workspace runs are pending. Missing results are not represented as zero.</p></section>';
 validateComparison(browser,['NUS','Zen']);
 validateSpeedometer(browser);
 const bs=['NUS','Zen'].map(n=>series(n,samples(browser,n,r=>r.result.score.mean),'Speedometer 3.1 default suites; ten internal iterations per independent run. '+browser.limits,'browser',n==='NUS'));
 if(arcBrowser){
  validateArc(arcBrowser,['Arc'],byName.Arc.executable_sha256);validateSpeedometer(arcBrowser);
  if(arcBrowser.source_revision!==browser.source_revision)throw Error('Mismatched Speedometer workloads');
  bs.push(retainedSeries('Arc',samples(arcBrowser,'Arc',r=>r.result.score.mean),arcBrowser.limits,'arc-browser','Median · 5 repetitions / one session'));
 }
 html+=chart({id:'browser-speed',title:'Web applications, on the same workload.',subtitle:'Speedometer 3.1 · higher is better. NUS and Zen: five process launches each.'+(arcBrowser?' Arc: five repetitions in one test-account session.':''),axis:AXES.browser,series:bs,references:[{label:'NUS median',value:bs[0].value}],note:'NUS/Zen: fresh profiles, alternating application order. All use unchanged pinned Speedometer workloads served locally. Ten internal iterations produce each dot; they are not ten independent app launches. This measures web-app responsiveness, not human productivity. '+(arcBrowser?'Hatched Arc row: later follow-up batch with retained profile/cache state in the existing macOS account. Repetitions share one process; no confidence interval or claim of a profile-matched speedup.':'Arc has no clean-profile runtime result yet.')});
 html+=`<p class="benchmark__machine">Browser workload: <a href="https://github.com/WebKit/Speedometer/tree/${e(browser.source_revision)}">Speedometer source ${e(browser.source_revision.slice(0,12))}</a>. NUS Chromium 152.0.7977.83 · Zen ${e(byName.Zen.version)}. ${arcBrowser?`Arc ${e(byName.Arc.version)} · `:''}Native viewport and user-agent values are retained in each run.</p>`;
 const P=home.package_sizes;
 html+=`<section class="comparison" id="package-figures"><h2>The package figures on the homepage.</h2><p class="comparison__note">Published ${e(home.package_release)}, authenticated archives. The comparison above uses the local runtime build; these are the shipping package measurements.</p><table><caption>Download and installed size are distinct measurements</caption><thead><tr><th>Platform</th><th>Download</th><th>On disk / unpacked</th></tr></thead><tbody>${[['mac','macOS ARM64'],['windows','Windows x64'],['linux','Linux x64']].map(([k,label])=>`<tr><th>${label}</th><td>${f(P[k].download_mib)} MiB</td><td>${f(k==='mac'?P[k].value:P[k].unpacked_mib)} MiB${k==='linux'?` (${f(P[k].unpacked_mib/1024)} GiB)`:''}</td></tr>`).join('')}</tbody></table><p class="comparison__note">macOS: allocated APFS storage after extraction. Windows/Linux: archive file payload bytes, not native filesystem allocation. <a href="${source('homepage')}" download data-no-swup>Archive hashes and exact sizes ↓</a></p></section>`;
 html+=chart({id:'file-opens',title:'The file figures on the homepage.',subtitle:'Request to loaded-content submission · lower is better. Both file sizes share the same 0–200 ms axis.',axis:AXES.file_open,series:['file10','file100'].map((k,i)=>({label:i?'100 MiB file':'10 MiB file',value:F[k].value,statistic:`${i?'Maximum':'p95'} · ${F[k].count} independent opens`,primary:true,observations:F[k].observations,detail:F[k].boundary,source:source('homepage')})),references:[{label:'10 MiB target only',value:100}],note:'The homepage keeps its original statistics: p95 for 20 opens of 10 MiB, maximum for five opens of 100 MiB. One excluded warmup per experiment. The 100 ms target applies only to the 10 MiB workload. These are NUS measurements against its target, not an editor comparison or a photon-latency measurement.'});
 for(const [key,id,title,axis,target] of [['tabs','tab-memory','What an additional browser tab costs.',AXES.tab,150e6/1048576],['windows','window-memory','What an additional empty window costs.',AXES.window,25e6/1048576]]){
  const v=F[key];html+=chart({id,title,subtitle:`${v.boundary} Lower is smaller.`,axis,series:[{label:key==='tabs'?'NUS additional tab':'NUS additional window',value:v.value,statistic:`Median · ${v.count} increments / five profiles`,primary:true,observations:v.observations,source:source('homepage'),detail:`${v.boundary} Range ${f(v.min)}–${f(v.max)} MiB. Increments within a profile are dependent.`}],references:[{label:'Existing NUS budget',value:target}],note:`Observed range ${f(v.min)}–${f(v.max)} MiB. Homepage reports ${key==='tabs'?'the median and range':'the range'}; all increments remain inspectable. Five fresh profiles, ${key==='tabs'?'tabs 2–8 after first-tab initialization':'windows 2–4'}. No confidence interval treats these dependent increments as independent runs. This target is a NUS resource budget, not a competitor result.`});
 }
 html+=`<details class="benchmark__method"><summary>Machine, versions and reproducibility</summary><dl><dt>Hardware</dt><dd>Apple M4 Pro · 48 GiB RAM · ${e(browser.platform)}. One host; OS caches and background activity uncontrolled.</dd><dt>Runtime measured</dt><dd>${e(home.recorded_at.slice(0,10))} · local optimized build, including uncommitted source changes. Binary SHA-256: <code>${e(home.runtime_binary_sha256)}</code></dd><dt>Applications</dt><dd>${apps.map(a=>`${e(a.product)} ${e(a.product==='WezTerm'?'20240203-110809-5046fc22':a.version)}`).join(' · ')}</dd><dt>Published packages</dt><dd>${e(home.package_release)}. Download bytes, archive hashes, unpacked bytes and macOS allocation are recorded separately in <a href="${source('homepage')}" download data-no-swup>homepage evidence</a>.</dd><dt>Reproduce</dt><dd><a href="../assets/benchmarks/COMPARISON_PROTOCOL.md" download data-no-swup>Comparison protocol and commands</a>. <a href="../assets/benchmarks/collectors.zip" download data-no-swup>Download current collector sources</a> / <a href="../assets/benchmarks/collectors-baseline.zip" download data-no-swup>Exact baseline collectors</a> (requires a matching NUS build and external apps). Raw JSON retains every successful observation and the exact harness identities. Failed calibration evidence: <a href="../assets/benchmarks/browser-calibration.json" download data-no-swup>browser v1</a> / <a href="../assets/benchmarks/workspace-calibration.json" download data-no-swup>workspace v1</a>.</dd></dl></details>`;
 return html;
}
