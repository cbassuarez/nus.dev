import {escape as e,format as f} from './model.mjs';
import {percent} from './scales.mjs';
export function comparisonChart({id,title,subtitle,axis,series,references=[],note=''}) {
 const overflowing=series.flatMap(s=>(s.observations?.length?s.observations:[{run:'reported statistic',value:s.value}]).filter(x=>x.value>axis.max||x.value<0).map(x=>`${s.label}, observation ${x.run}: ${f(x.value)} ${axis.unit}`));
 for(const s of series)if(!Number.isFinite(s.value)||s.value<0)throw Error('Invalid comparison value');
 return `<section class="comparison" id="${e(id)}"><header><h2>${e(title)}</h2><p>${e(subtitle)}</p></header>
 <div class="comparison__legend"><span><i></i> Reported statistic</span>${series.some(s=>s.observations?.length)?'<span>● Individual observations</span>':''}${series.some(s=>s.followup)?'<span>▨ Follow-up · retained Arc session</span>':''}${references.map(r=>`<span>┆ ${e(r.label)}: ${f(r.value)} ${e(axis.unit)}</span>`).join('')}</div>
 ${series.map(s=>`<div class="comparison__row"><div class="comparison__label"><strong>${e(s.label)}</strong><span>${e(s.statistic||'Median')}</span></div><div class="comparison__track" role="img" aria-label="${e(s.label)}: ${f(s.value)} ${e(axis.unit)}. Scale zero to ${axis.max}.">
 ${axis.ticks.map(t=>`<span class="comparison__gridline" style="left:${percent(t,axis)}%"></span>`).join('')}
 <span class="comparison__bar ${s.primary?'comparison__bar--primary':''} ${s.followup?'comparison__bar--followup':''}" style="width:${percent(s.value,axis)}%"></span>
 ${s.interval?`<span class="comparison__interval" style="left:${percent(s.interval[0],axis)}%;width:${percent(s.interval[1],axis)-percent(s.interval[0],axis)}%"></span>`:''}
 ${references.map(r=>`<span class="comparison__reference" style="left:${percent(r.value,axis)}%" title="${e(r.label)}: ${f(r.value)} ${e(axis.unit)}"></span>`).join('')}
 ${(s.observations||[]).map(o=>`<span class="comparison__point" style="left:${percent(o.value,axis)}%" title="${e(s.label)}, run ${o.run}: ${f(o.value)} ${e(axis.unit)}">${o.value>axis.max?'›':o.value<0?'‹':''}</span>`).join('')}
 </div><div class="comparison__number">${f(s.value)}<small>${e(axis.unit)}</small></div></div>`).join('')}
 <div class="comparison__axis-row"><span></span><div class="comparison__axis">${axis.ticks.map(t=>`<span style="left:${percent(t,axis)}%">${f(t)}</span>`).join('')}</div><span></span></div>
 <p class="comparison__scale-note">${e(axis.reason)}</p>${overflowing.length?`<p class="benchmark__warning">Outside the fixed plot domain: ${overflowing.map(e).join('; ')}. Edge arrows preserve these observations; exact values remain below.</p>`:''}
 ${note?`<p class="comparison__note">${e(note)}</p>`:''}
 <details><summary>Values, scope and evidence</summary>${series.map(s=>`<section><h3>${e(s.label)}</h3><p>${e(s.detail||'')}</p>${s.source?`<p><a href="${e(s.source)}" download data-no-swup>Download source observations</a></p>`:''}${s.observations?.length?`<table><caption>${e(s.statistic||'Median')} · ${e(axis.unit)}</caption><thead><tr><th>Observation</th><th>Value</th></tr></thead><tbody>${s.observations.map(o=>`<tr><th>${e(o.run)}</th><td>${e(o.value)}</td></tr>`).join('')}</tbody></table>`:'<p>Deterministic size measurement; no sampling interval.</p>'}</section>`).join('')}</details></section>`;
}
