import {icon,SITE} from '../layout.mjs';
export default {
 title:'nus',path:'/',depth:0,
 description:'A terminal with room for the rest of your work. Shells, web pages, projects and assistants, together in a workspace you can make your own.',
 module:"import { mountFilms } from './assets/js/films.js'; import { mountOrbit } from './assets/js/orbit.js'; mountFilms(); mountOrbit(document.querySelector('[data-orbit]'));",
 body:`
<section class="orbit orbit--flat" data-orbit>
 <div class="orbit__rail" data-orbit-rail><div class="orbit__stage" data-orbit-stage>
  <div class="orbit__core"><p class="cap">nus / terminal + browser</p><h1>A little less<br><em>back and forth.</em></h1><p class="orbit__lede">Your shell. The page you’re building. The assistant helping you untangle it. Give them a place to work together.</p><div class="orbit__acts"><a class="btn btn--signal" href="./download/">${icon('download-simple')}Get nus</a><a class="source-cta" href="${SITE.repo}">Read the source <span aria-hidden="true">↗</span></a></div><div class="orbit__meta"><span>Independent software</span><span>macOS / Windows / Linux</span></div></div>
  <div class="orbit__body" data-orbit-body><figure class="orbit-film" data-film><video width="1320" height="870" poster="./assets/films/shell.png" preload="none" muted playsinline loop aria-label="The real Mac nus terminal building and testing this site, with Mac window controls visible." data-src="./assets/films/shell.mp4"></video><figcaption><span><b>The shell</b> · Your tools, at home.</span><button class="film-toggle" data-film-toggle>Play recording ↗</button></figcaption><p class="film-error small" data-film-error hidden>The recording could not load. The still is from this session.</p></figure></div>
  <div class="orbit__body" data-orbit-body><figure class="orbit-film" data-film><video width="1320" height="870" poster="./assets/films/memphis.png" preload="none" muted playsinline loop aria-label="The real nus Memphis home page on Mac, with native window controls visible." data-src="./assets/films/memphis.mp4"></video><figcaption><span><b>Your home</b> · Make it yours.</span><button class="film-toggle" data-film-toggle>Play recording ↗</button></figcaption><p class="film-error small" data-film-error hidden>The recording could not load. The still is from this session.</p></figure></div>
  <div class="orbit__dial" data-orbit-dial><span>Scroll to orbit</span><span class="orbit__track"><i></i></span><a href="#work">Explore nus ↓</a></div>
 </div></div>
</section>
<div class="section__in capture-note"><span>Actual Mac app captures, including its window controls.</span><span>Play either window. Scripted demonstrations; timing is paced.</span></div>
<section class="section section--tight" id="measured"><div class="section__in">
 <div class="sectionhead"><h2>Light on its feet.</h2><span class="cap">Measured on release builds</span></div>
 <div class="figs figs--lead">
  <div><b>355<small> MiB</small></b><span>macOS bundle</span><em>down from 429 MiB — 17% smaller</em></div>
  <div><b>28.9<small> ms</small></b><span>Opening a 10 MiB file</span><em>p95 across 20 opens</em></div>
  <div><b>63<small> ms</small></b><span>Opening a 100 MiB file</span><em>maximum across five opens</em></div>
  <div><b>101<small> MiB</small></b><span>Each idle browser tab</span><em>101–102 MiB, after initialization</em></div>
  <div><b>1.5–19<small> MiB</small></b><span>Each empty window</span><em>added per extra window</em></div>
 </div>
 <p class="small dim figs__note">A whole Chromium and a whole terminal in one process, and it still opens like a terminal. File opens are the editor pane on real files; memory is what each further tab or window adds once it has settled. <a href="./docs/measurements/">How each number was taken →</a></p>
</div></section>
<section class="section" id="work"><div class="section__in">
 <div class="sectionhead"><h2>The work has a few moving parts.</h2><span class="cap">Keep them close</span></div>
 <div class="work-notes">
  <article><span class="note-number">01</span><h3>Start where you already are.</h3><p>Keep your shell, your commands, your aliases. Open a URL beside the terminal and follow the output without losing your place.</p><a href="./panels/#workspace">Around the workspace →</a></article>
  <article><span class="note-number">02</span><h3>Leave a trail you can use.</h3><p>Find a command, read its output, and move through a session with a scrollable history map. Playback is there when you need it.</p><a href="./panels/#history">Follow the history →</a></article>
  <article><span class="note-number">03</span><h3>Make it feel like yours.</h3><p>Choose what your prompt suggests: shells, pages, assistants, or a mix. Tune the type, the colours, and even the view behind your first command.</p><a href="./panels/#home">Meet your home →</a></article>
 </div>
</div></section>
<section class="section personal-section"><div class="section__in personal-grid"><div><p class="cap">An invitation to tinker</p><h2>Good tools leave<br><em>room for you.</em></h2></div><div><p>nus started with the distance between a terminal and a browser. Every little trip out of the work adds up. So I’m building a place where those tools can share a window, a project, and a bit of context.</p><p>It’s early. There are edges to smooth and platforms to test. You can see the source, read the decisions, and help find what needs attention.</p><a href="./about/">A note from the maker →</a></div></div></section>
<section class="section"><div class="section__in closing-note"><span class="wordmark">nus</span><h2>Pull up a shell.</h2><a class="btn btn--signal" href="./download/">${icon('download-simple')}Get nus</a><p class="small dim">Preview and stable channels, with signing details on every package.</p></div></section>`
};
