// Declared display domains; never set a chart's ceiling to its observed maximum.
// An observation outside the domain is explicitly listed beside an overflow marker.
export const AXES = {
 file_open:{max:200,ticks:[0,50,100,150,200],unit:'ms',reason:'Shared file-open scale; 100 ms is the existing NUS 10 MiB target.'},
 startup:{max:2000,ticks:[0,500,1000,1500,2000],unit:'ms',reason:'Fixed 0–2 second startup scale; not a pass/fail budget.'},
 workflow:{max:5000,ticks:[0,1000,2000,3000,4000,5000],unit:'ms',reason:'Shared 0–5 second scale for all scripted workflow durations.'},
 rss:{max:8192,ticks:[0,2048,4096,6144,8192],unit:'MiB',reason:'Shared 0–8 GiB scale for process-tree RSS; not a resource budget.'},
 installed:{max:2560,ticks:[0,512,1024,1536,2048,2560],unit:'MiB',reason:'Shared 0–2.5 GiB scale for installed application file bytes.'},
 tab:{max:256,ticks:[0,64,128,192,256],unit:'MiB',reason:'Fixed tab-increment scale; the 150 MB target is 143.05 MiB.'},
 window:{max:32,ticks:[0,8,16,24,32],unit:'MiB',reason:'Fixed window-increment scale; the 25 MB target is 23.84 MiB.'},
 browser:{max:100,ticks:[0,25,50,75,100],unit:'score',reason:'Fixed 0–100 display range; higher is better. Scores are not percentages and can exceed 100.'},
 terminal:{max:1000,ticks:[0,250,500,750,1000],unit:'ms',reason:'Shared terminal completion scale; write through parser reply, not display scanout.'},
};
export function axisFor(metric) {
 if(metric.id.includes('file_') || metric.id==='file10'||metric.id==='file100')return AXES.file_open;
 if(metric.id.startsWith('startup'))return AXES.startup;
 if(metric.id.startsWith('workflow'))return AXES.workflow;
 if(metric.unit==='MiB')return AXES.rss;
 throw Error('Metric needs an explicit scale policy: '+metric.id);
}
export function percent(value,axis){return Math.max(0,Math.min(100,100*value/axis.max));}
