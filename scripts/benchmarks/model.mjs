// Public schema 1. Values are re-derived; imported aggregates are never trusted.
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const finite = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
export function validateCatalog(data) {
  if(data?.schema !== 1 || !Array.isArray(data.records)) throw Error('Unsupported benchmark catalog');
  const ids = new Set();
  for(const r of data.records) {
    if(!/^[a-f0-9]{16}$/.test(r.id) || ids.has(r.id)) throw Error('Invalid/duplicate report ID');
    ids.add(r.id);
    if(!['complete','failed','running'].includes(r.status)) throw Error('Invalid report status');
    for(const k of ['requested_runs','completed_runs','warmup_runs','failed_attempts','unattempted_runs']) if(!Number.isSafeInteger(r[k]) || r[k]<0) throw Error('Invalid run accounting');
    if(r.completed_runs>r.requested_runs || r.unattempted_runs>r.requested_runs-r.completed_runs) throw Error('Inconsistent run accounting');
    if(r.status==='complete' && (r.completed_runs!==r.requested_runs || r.failed_attempts || r.unattempted_runs)) throw Error('Incomplete complete report');
    for(const k of ['source_sha256','binary_sha256']) if(!/^[a-f0-9]{64}$/.test(r[k])) throw Error('Missing artifact identity');
    for(const k of ['product','scenario','recorded_at','platform','execution','cache_policy','hardware']) if(typeof r[k]!=='string') throw Error('Missing provenance');
    if(!Array.isArray(r.metrics) || new Set(r.metrics.map(m=>m.id)).size!==r.metrics.length) throw Error('Invalid metric catalog');
    for(const m of r.metrics) {
      if(!['ms','MiB'].includes(m.unit) || m.direction!=='lower' || typeof m.label!=='string' || typeof m.boundary!=='string') throw Error('Invalid metric contract');
      if(!Array.isArray(m.observations)) throw Error('Missing observations');
      const seen=new Set();
      for(const o of m.observations) {
        if(!Number.isSafeInteger(o.run)||o.run<1||o.run>r.completed_runs||seen.has(o.run)||!finite(o.value)) throw Error('Invalid/duplicate observation');
        seen.add(o.run);
      }
    }
  }
  return data;
}
export function summarize(observations) {
  const values=observations.map(o=>o.value).sort((a,b)=>a-b), n=values.length;
  if(!n)return {n:0,median:null,min:null,max:null,ci:null};
  const median=n%2?values[(n-1)/2]:(values[n/2-1]+values[n/2])/2;
  // Distribution-free two-sided interval for a population median: order
  // statistics with binomial coverage >=95%. No finite 95% interval for n<6.
  let ci=null, probability=2**(-n), tail=0;
  // Underflow at extreme n: don't manufacture precision; suppress interval.
  if(probability>0)for(let k=1;k<=Math.floor((n+1)/2);k++) {
    tail+=probability;
    const coverage=1-2*tail;
    if(coverage>=.95)ci={low:values[k-1],high:values[n-k],coverage};
    else break;
    probability*= (n-k+1)/k;
  }
  return {n,median,min:values[0],max:values[n-1],ci};
}
export const format = n => n===null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
