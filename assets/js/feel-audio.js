/* Resilient Cuelume transport.
   Desktop uses Cuelume's Web Audio engine. iOS/iPadOS uses the exact vendored
   Cuelume recipes rendered to PCM/WAV and HTMLAudioElement playback, avoiding
   WebKit AudioContext sessions that can remain "running" while silent. */
import {
  play as webPlay,
  setEnabled as webSetEnabled,
  setVolume as webSetVolume
} from "../vendor/cuelume/0.2.2/audio/engine.js";
import {
  RECIPES,
  isSoundName
} from "../vendor/cuelume/0.2.2/sounds/recipes.js";

const RATE = 44100;
const FLOOR = 0.0001;
const OUTPUT_GAIN = 4;
const HOVER_GAP_MS = 150;

let enabled = true;
let globalVolume = 1;
const mediaCache = new Map();
const activeMedia = new Set();
const boundRoots = new WeakSet();
const handledEvents = new WeakSet();
let lastHover = -Infinity;

export function isIOSWebKit() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadDesktopUA = platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadDesktopUA;
}

export function audioBackend() {
  return isIOSWebKit() ? "media-wav" : "cuelume-webaudio";
}

function setPlaybackSession(active) {
  if (typeof navigator === "undefined" || !navigator.audioSession) return;
  try { navigator.audioSession.type = active ? "playback" : "ambient"; } catch {}
}

function normalizeVolume(value, fallback) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;
}

export function setEnabled(value) {
  if (typeof value !== "boolean") return;
  enabled = value;
  webSetEnabled(value);
  if (isIOSWebKit()) setPlaybackSession(value);
}

export function setVolume(value) {
  globalVolume = normalizeVolume(value, globalVolume);
  webSetVolume(globalVolume);
}

function envelope(t, attack, decay, peak) {
  if (t < 0) return 0;
  if (t < attack) return FLOOR * Math.pow(peak / FLOOR, t / Math.max(attack, 1e-4));
  if (t < attack + decay) return peak * Math.pow(FLOOR / peak, (t - attack) / Math.max(decay, 1e-4));
  return 0;
}

function wave(kind, phase) {
  const p = ((phase % 1) + 1) % 1;
  if (kind === "sine") return Math.sin(p * Math.PI * 2);
  if (kind === "triangle") return 4 * Math.abs(p - .5) - 1;
  if (kind === "square") return p < .5 ? 1 : -1;
  return 2 * p - 1; // sawtooth
}

class Biquad {
  constructor(type, freq, q = .7, rate = RATE) {
    const w0 = Math.PI * 2 * Math.min(freq, rate * .45) / rate;
    const sin = Math.sin(w0), cos = Math.cos(w0);
    const alpha = sin / (2 * Math.max(q, .01));
    let b0,b1,b2,a0,a1,a2;
    if (type === "lowpass") {
      b0=(1-cos)/2;b1=1-cos;b2=(1-cos)/2;a0=1+alpha;a1=-2*cos;a2=1-alpha;
    } else {
      b0=alpha;b1=0;b2=-alpha;a0=1+alpha;a1=-2*cos;a2=1-alpha;
    }
    this.b0=b0/a0;this.b1=b1/a0;this.b2=b2/a0;this.a1=a1/a0;this.a2=a2/a0;
    this.x1=0;this.x2=0;this.y1=0;this.y2=0;
  }
  run(x) {
    const y=this.b0*x+this.b1*this.x1+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2;
    this.x2=this.x1;this.x1=x;this.y2=this.y1;this.y1=y;return y;
  }
}

function rngFor(name) {
  let seed = 2166136261;
  for (let i=0;i<name.length;i++) seed = Math.imul(seed ^ name.charCodeAt(i), 16777619) >>> 0;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0;
    return (seed / 0xffffffff) * 2 - 1;
  };
}

function renderRecipe(name, recipe, rate = RATE) {
  const sourceEnd = Math.max(...recipe.layers.map(layer =>
    (layer.offset || 0) + layer.attack + layer.decay + .05
  ));
  const shimmer = recipe.shimmer;
  const tail = shimmer && shimmer.feedback > 0
    ? shimmer.delay * (1 + Math.ceil(Math.log(FLOOR) / Math.log(shimmer.feedback)))
    : 0;
  const n = Math.max(1, Math.ceil((sourceEnd + tail + .05) * rate));
  const dry = new Float32Array(n);
  const rand = rngFor(name);

  for (const layer of recipe.layers) {
    const offset = layer.offset || 0;
    const start = Math.floor(offset * rate);
    const len = Math.ceil((layer.attack + layer.decay + .05) * rate);

    if (layer.kind === "tone") {
      const f0 = layer.frequency * Math.pow(2, (layer.detune || 0) / 1200);
      const gt = Math.max(layer.glideTime || layer.attack + layer.decay, 1e-4);
      let phase = 0;
      for (let i=0;i<len && start+i<n;i++) {
        const t=i/rate;
        const f = layer.glideTo === undefined
          ? f0
          : f0 * Math.pow(layer.glideTo / f0, Math.min(t / gt, 1));
        phase += f/rate;
        dry[start+i] += wave(layer.waveform, phase) * envelope(t,layer.attack,layer.decay,layer.peak);
      }
    } else {
      const filter = new Biquad(layer.filterType,layer.filterFrequency,layer.filterQ || .7,rate);
      for (let i=0;i<len && start+i<n;i++) {
        const t=i/rate;
        dry[start+i] += filter.run(rand()) * envelope(t,layer.attack,layer.decay,layer.peak);
      }
    }
  }

  for (let i=0;i<n;i++) dry[i] *= recipe.masterGain;
  const out = new Float32Array(dry);

  if (shimmer) {
    const d=Math.max(1,Math.floor(shimmer.delay*rate));
    const line=new Float32Array(n+d);
    const lp=new Biquad("lowpass",shimmer.lowpass,.7,rate);
    for(let i=0;i<n;i++){
      const delayed=i>=d?line[i-d]:0;
      const filtered=lp.run(delayed);
      line[i]=dry[i]+filtered*shimmer.feedback;
      out[i]+=filtered*shimmer.wet;
    }
  }

  for(let i=0;i<n;i++){
    const x=out[i]*OUTPUT_GAIN, a=Math.abs(x);
    out[i]=a<.4?x:Math.sign(x)*(.4+Math.tanh(a-.4)*.6);
  }
  return out;
}

function wavBlob(samples, rate = RATE) {
  const buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);
  const text=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));};
  text(0,"RIFF");view.setUint32(4,36+samples.length*2,true);text(8,"WAVE");
  text(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  text(36,"data");view.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++){
    const s=Math.max(-1,Math.min(1,samples[i]));
    view.setInt16(44+i*2,s<0?s*0x8000:s*0x7fff,true);
  }
  return new Blob([buffer],{type:"audio/wav"});
}

export function renderCueBlob(name) {
  if (!isSoundName(name)) throw new Error("Unknown Cuelume cue: " + name);
  return wavBlob(renderRecipe(name, RECIPES[name]));
}

function mediaURL(name) {
  let url=mediaCache.get(name);
  if (url) return url;
  const blob=renderCueBlob(name);
  url=URL.createObjectURL(blob);
  mediaCache.set(name,url);
  return url;
}

function mediaPlay(name, options) {
  if (typeof Audio === "undefined") return;
  setPlaybackSession(true);
  const audio=new Audio(mediaURL(name));
  audio.preload="auto";
  audio.playsInline=true;
  audio.volume=globalVolume*normalizeVolume(options?.volume,1);
  activeMedia.add(audio);
  const clean=()=>activeMedia.delete(audio);
  audio.addEventListener("ended",clean,{once:true});
  audio.addEventListener("error",clean,{once:true});
  try {
    const p=audio.play();
    if (p && typeof p.catch === "function") p.catch(clean);
  } catch { clean(); }
}

export function play(sound="chime",options) {
  if (!enabled || !isSoundName(sound)) return;
  if (isIOSWebKit()) {
    mediaPlay(sound,options);
    return;
  }
  webPlay(sound,options);
}

function resolve(el,attr,fallback) {
  const requested=el.getAttribute(attr);
  return isSoundName(requested)?requested:fallback;
}
function findTarget(root,event,attr) {
  if (!(event.target instanceof Element)) return null;
  const element=event.target.closest("["+attr+"]");
  return element && root.contains(element)?element:null;
}
function listen(root,eventName,attr,fallback,mouseOnly=false) {
  root.addEventListener(eventName,event=>{
    const element=findTarget(root,event,attr);
    if(!element||handledEvents.has(event))return;
    if(mouseOnly){
      const mouse=event.pointerType==="mouse"&&matchMedia("(hover: hover) and (pointer: fine)").matches;
      if(!mouse)return;
      const related=event.relatedTarget;
      if(related instanceof Node&&element.contains(related))return;
      const now=performance.now();if(now-lastHover<HOVER_GAP_MS)return;lastHover=now;
    }
    handledEvents.add(event);
    play(resolve(element,attr,fallback));
  },true);
}
export function bind(root=document) {
  if(typeof document==="undefined"||boundRoots.has(root))return;
  boundRoots.add(root);
  listen(root,"pointerenter","data-cuelume-hover","chime",true);
  listen(root,"pointerdown","data-cuelume-press","press");
  listen(root,"pointerup","data-cuelume-release","release");
  listen(root,"click","data-cuelume-toggle","toggle");
}

export function diagnostics() {
  return {
    backend: audioBackend(),
    ios: isIOSWebKit(),
    enabled,
    volume: globalVolume,
    cachedMedia: mediaCache.size,
    activeMedia: activeMedia.size,
    audioSession: typeof navigator!=="undefined"&&navigator.audioSession?navigator.audioSession.type:null
  };
}
