import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { sounds } from "../assets/vendor/cuelume/0.2.2/index.js";
import { FEEL_EVENTS, SOUND_DEFAULT, SOUND_VOLUME } from "../assets/js/feel-config.js";
import { createFeel } from "../assets/js/feel-core.js";
import { renderCueBlob } from "../assets/js/feel-audio.js";

const ROOT=fileURLToPath(new URL("..",import.meta.url));
const read=p=>readFileSync(join(ROOT,p),"utf8");

function harness(initial={}) {
  const values=new Map(Object.entries(initial)), plays=[], enabled=[], motions=[], events=[];
  const feel=createFeel({
    audio:{play:(name,options)=>plays.push({name,options}),setEnabled:value=>enabled.push(value)},
    storage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},
    motion:{run:(name,target)=>motions.push({name,target})},
    dispatch:event=>events.push(event)
  });
  return {feel,values,plays,enabled,motions,events};
}

test("sound defaults on, persists off, and mute itself is silent",()=>{
  assert.equal(SOUND_DEFAULT,true);assert.equal(SOUND_VOLUME,0.55);
  const h=harness();assert.equal(h.feel.soundEnabled,true);assert.deepEqual(h.enabled,[true]);
  h.feel.setSound(false);assert.equal(h.values.get("nus.sound"),"off");
  h.feel.emit("review.copy.success");
  assert.deepEqual(h.plays,[]);
  h.feel.setSound(true);h.feel.emit("review.copy.success");
  assert.equal(h.plays.at(-1).name,"success");
});

test("every semantic event uses a real Cuelume cue and sane volume",()=>{
  const valid=new Set(sounds);assert.equal(valid.size,17);
  for(const [name,event] of Object.entries(FEEL_EVENTS)){
    assert.ok(valid.has(event.cue),name+" -> "+event.cue);
    assert.ok(event.volume>=0&&event.volume<=1,name+" volume");
  }
});

test("semantic events drive sound and motion from one event",()=>{
  const h=harness();const target={};
  const event=h.feel.emit("review.inspect",{target});
  assert.equal(event.cue,"scan");assert.equal(event.motion,"inspect");
  assert.equal(h.plays[0].name,"scan");assert.equal(h.motions[0].name,"inspect");
  assert.equal(h.events[0].name,"review.inspect");
  assert.throws(()=>h.feel.emit("made.up"),/Unknown feel event/);
});

test("vendored Cuelume integrity manifest matches committed bytes",()=>{
  const dir=join(ROOT,"assets/vendor/cuelume/0.2.2");
  const manifest=JSON.parse(readFileSync(join(dir,"manifest.json"),"utf8"));
  assert.equal(manifest.name,"cuelume");assert.equal(manifest.version,"0.2.2");assert.equal(manifest.license,"MIT");
  for(const [path,digest] of Object.entries(manifest.hashes)){
    const actual=createHash("sha256").update(readFileSync(join(dir,path))).digest("hex");
    assert.equal(actual,digest,path);
  }
  assert.ok(Object.keys(manifest.hashes).includes("index.js"));
  assert.ok(Object.keys(manifest.hashes).includes("LICENSE"));
});

test("the built site uses only local Cuelume runtime assets",()=>{
  function pages(dir=ROOT){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(entry.name.startsWith(".")||["assets","content","scripts","tests","wasm"].includes(entry.name))return [];
    const path=join(dir,entry.name);return entry.isDirectory()?pages(path):path.endsWith(".html")?[path]:[];
  });}
  for(const file of pages()){
    const html=readFileSync(file,"utf8");
    assert.ok(!/cdn\.jsdelivr\.net\/npm\/cuelume|unpkg\.com\/cuelume|<script[^>]+src="https?:/i.test(html),relative(ROOT,file));
    if(!html.includes("http-equiv=\"refresh\"")){
      assert.ok(html.includes("data-sound-toggle"),relative(ROOT,file));
      assert.ok(html.includes("/assets/js/feel.js")||html.includes("../assets/js/feel.js")||html.includes("./assets/js/feel.js"),relative(ROOT,file));
    }
  }
});


test("iOS transport renders the vendored Cuelume recipes as valid WAV media",async()=>{
  for(const name of ["toggle","success","arrival"]){
    const blob=renderCueBlob(name);
    assert.equal(blob.type,"audio/wav");
    assert.ok(blob.size>4000,name+" WAV too small");
    const bytes=Buffer.from(await blob.arrayBuffer());
    assert.equal(bytes.toString("ascii",0,4),"RIFF");
    assert.equal(bytes.toString("ascii",8,12),"WAVE");
    assert.equal(bytes.toString("ascii",36,40),"data");
  }
});

test("iOS transport bypasses Cuelume AudioContext while preserving its recipe catalog",()=>{
  const audio=read("assets/js/feel-audio.js");
  const feel=read("assets/js/feel.js");
  assert.ok(audio.includes('from "../vendor/cuelume/0.2.2/sounds/recipes.js"'));
  assert.ok(audio.includes('return iOSDevice || iPadDesktopUA'));
  assert.ok(audio.includes('navigator.audioSession.type = active ? "playback" : "ambient"'));
  assert.ok(audio.includes("new Audio(mediaURL(name))"));
  assert.ok(feel.includes('from "./feel-audio.js"'));
  assert.ok(!feel.includes("../vendor/cuelume/0.2.2/index.js"));
});

test("mobile Feel Lab exercises production transport and keeps a raw Web Audio control",()=>{
  const html=read("scripts/checks/feel.html");
  assert.ok(html.includes('from "../../assets/js/feel-audio.js"'));
  assert.ok(html.includes("Production backend"));
  assert.ok(html.includes("Raw Web Audio tone"));
  assert.ok(html.includes("raw Web Audio tone requested"));
});
