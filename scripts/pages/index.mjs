import {icon,SITE} from '../layout.mjs';
export default {
 title:'nus',path:'/',depth:0,
 description:'A terminal with room for the rest of your work. Shells, web pages, projects and assistants, together in a workspace you can make your own.',
 module:"import { mountFilms } from './assets/js/films.js'; import { mountOrbit } from './assets/js/orbit.js'; mountFilms(); mountOrbit(document.querySelector('[data-orbit]'));",
 body:`
<section class="orbit orbit--flat" data-orbit>
 <div class="orbit__rail" data-orbit-rail><div class="orbit__stage" data-orbit-stage>
 <div class="orbit__core">nus unified environment</p><h1>A little less<br><em>back and forth.</em></h1><p class="orbit__lede">Say hello to never again switching between IDEs, terminals, and broswers just to design one app. <br>Say hello to <i><b>nus</i></b>.</p><div class="orbit__acts"><a class="btn btn--signal" href="./download/">${icon('download-simple')}Get nus</a><a class="source-cta" href="${SITE.repo}">Read the source <span aria-hidden="true">↗</span></a></div><div class="orbit__meta"><span>Independent software</span><span>macOS / Windows / Linux</span></div></div>
  <div class="orbit__body" data-orbit-body><figure class="orbit-film" data-film><video width="1320" height="870" poster="./assets/films/shell.png" preload="none" muted playsinline loop aria-label="A nus window on a Mac: the shell building and testing this site." data-src="./assets/films/shell.mp4"></video><figcaption><span><b>The shell</b> · Building this site, on a Mac.</span><button class="film-toggle" data-film-toggle>Play recording ↗</button></figcaption><p class="film-error small" data-film-error hidden>The recording didn’t load. The still is a frame from the same take.</p></figure></div>
  <div class="orbit__body" data-orbit-body><figure class="orbit-film" data-film><video width="1320" height="870" poster="./assets/films/memphis.png" preload="none" muted playsinline loop aria-label="A nus window on a Mac: the home prompt over the Memphis art." data-src="./assets/films/memphis.mp4"></video><figcaption><span><b>Your home</b> · The Memphis art behind the prompt.</span><button class="film-toggle" data-film-toggle>Play recording ↗</button></figcaption><p class="film-error small" data-film-error hidden>The recording didn’t load. The still is a frame from the same take.</p></figure></div>
  <div class="orbit__dial" data-orbit-dial><span>Scroll to orbit</span><span class="orbit__track"><i></i></span><a href="#work">Explore nus ↓</a></div>
 </div></div>
</section>
<div class="section__in capture-note"><span>Both windows are the Mac build, recorded by the app’s own recorder from a script on a fixed clock — paced for reading, not a measurement.</span><span><a href="./about/#pictures">How the pictures are made</a> · <a href="${SITE.repo}/tree/main/docs/promo">The scripts</a></span></div>
<section class="section section--tight" id="measured"><div class="section__in">
 <div class="sectionhead"><h2>Light on its feet.</h2><span class="cap">Measured on release builds</span></div>
 <div class="figs figs--lead">
  <div><b>355<small> MiB</small></b><span>The Mac app, on disk</span><em>154 MiB to download · Windows 457 MiB · Linux 1.49 GiB</em></div>
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
