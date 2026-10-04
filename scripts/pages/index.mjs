import {icon,SITE} from '../layout.mjs';
import {tokens as figures} from '../benchmarks/facts.mjs';

export default {
 title:'nus',path:'/',depth:0,bodyClass:'home-page',
 description:'A terminal with room for the rest of your work. Shells, web pages, projects and assistants, together in a workspace you can make your own.',
 body:`
<section class="continuum-hero" aria-labelledby="hero-title">
 <div class="continuum-hero__copy">
  <p class="cap">nus unified environment</p>
  <h1 id="hero-title">A little less<br><em>back and forth.</em></h1>
  <p class="continuum-hero__lede">Say hello to less switching between IDEs, terminals, and browsers just to build one app.<br>Say hello to <span class="hero-wordmark">nus</span>.</p>
  <div class="continuum-hero__actions"><a class="btn btn--signal" href="./download/">${icon('download-simple')}Get nus</a><a class="source-cta" href="${SITE.repo}">Read the source <span aria-hidden="true">↗</span></a></div>
  <p class="continuum-hero__meta">macOS · Windows · Linux <span aria-hidden="true">/</span> Preview software</p>
 </div>
 <div class="shell-stage">
  <div class="shell-install cmd" data-cmd>
   <div class="cmd__tabs" role="tablist" aria-label="Install on your system" data-cmd-tabs hidden><button type="button" role="tab" aria-selected="true" data-cmd-tab="unix">macOS · Linux</button><button type="button" role="tab" aria-selected="false" data-cmd-tab="windows">Windows</button></div>
   <div class="cmd__line" data-cmd-panel="unix"><span class="cmd__os">macOS · Linux</span><span class="cmd__prompt" aria-hidden="true">»</span><code>curl -fsSL ${SITE.url}/install.sh | sh</code><button class="copy" type="button" data-copy aria-label="Copy the macOS and Linux install command">${icon('copy')}<span>Copy</span></button></div>
   <div class="cmd__line" data-cmd-panel="windows"><span class="cmd__os">Windows</span><span class="cmd__prompt" aria-hidden="true">»</span><code>irm ${SITE.url}/install.ps1 | iex</code><button class="copy" type="button" data-copy aria-label="Copy the Windows install command">${icon('copy')}<span>Copy</span></button></div>
  </div>
  <figure class="shell-capture hero-film" data-film data-film-autoplay>
   <video width="1600" height="1086" data-src="./assets/films/nus-browser-hero-web.mp4" data-poster-desktop="./assets/films/nus-browser-hero-poster.png" poster="./assets/films/nus-browser-hero-poster.png" autoplay muted loop playsinline preload="none" aria-label="A real nus browser workflow: click the Hello World counter, find text in the page, open its source beside it, and keep the page for later."></video>
   <div class="hero-film__controls"><button class="film-toggle" type="button" data-film-toggle data-play-label="Play demo" hidden aria-pressed="false">Play demo</button></div>
   <p class="film-error sr-only" data-film-error hidden role="status">The demo could not start automatically. Select Play demo to try again.</p>
  </figure>
 </div>
</section>

<section class="section home-performance" id="measured"><div class="section__in">
 <div class="home-sectionhead"><div><p class="cap">Substance behind the feeling</p><h2>Light on its feet.</h2></div><a href="./benchmarks/">Explore the benchmarks ↗</a></div>
 <div class="home-measurements">
  <div><p>Open a 10 MiB file<span>p95 across 20 independent launches</span></p><b>${figures['file10.p95']}<small> ms</small></b></div>
  <div><p>Open a 100 MiB file<span>Maximum across five independent launches</span></p><b>${figures['file100.max']}<small> ms</small></b></div>
  <div><p>A terminal, browser, and editor<span>Mac app on disk · APFS · ${figures['package.release']}</span></p><b>${figures['mac.disk']}<small> MiB</small></b></div>
 </div>
 <p class="home-measurements__note">Apple M4 Pro · 48 GiB · ${figures['recorded.date']}. File opens end at the first loaded-content submission, before display scanout. The package measurement describes ${figures['package.release']}; current downloads may differ. <a href="./benchmarks/">Methods, builds, and raw results ↗</a></p>
</div></section>

<section class="section" id="work"><div class="section__in">
 <div class="home-sectionhead"><div><p class="cap">Keep the work close</p><h2>The work has a few moving parts.</h2></div></div>
 <div class="work-notes">
  <article><span class="note-number">01</span><h3>Start where you already are.</h3><p>Keep your shell, your commands, your aliases. Open a URL beside the terminal and follow the output without losing your place.</p><a href="./panels/#workspace">Around the workspace ↗</a></article>
  <article><span class="note-number">02</span><h3>Leave a trail you can use.</h3><p>Find a command, read its output, and move through a session with a scrollable history map. Playback is there when you need it.</p><a href="./panels/#history">Follow the history ↗</a></article>
  <article><span class="note-number">03</span><h3>Make it feel like yours.</h3><p>Choose what your prompt suggests: shells, pages, assistants, or a mix. Tune the type, the colours, and even the view behind your first command.</p><a href="./panels/#home">Meet your home ↗</a></article>
 </div>
</div></section>

<section class="section home-evaluation"><div class="section__in">
 <div><p class="cap">Know your tools</p><h2>A clear view<br>before you commit.</h2><p>Inspect the source, the release, and the boundaries before bringing nus into your work. It’s preview software, with its progress and limitations in the open.</p></div>
 <nav aria-label="Evaluate nus"><a href="${SITE.repo}/blob/main/SECURITY.md"><span>Security &amp; data handling</span><span aria-hidden="true">↗</span></a><a href="./download/"><span>Packages, signing &amp; installation</span><span aria-hidden="true">↗</span></a><a href="./docs/architecture/"><span>Architecture &amp; boundaries</span><span aria-hidden="true">↗</span></a><a href="./docs/product/"><span>Product behaviour &amp; current scope</span><span aria-hidden="true">↗</span></a></nav>
</div></section>

<section class="section personal-section"><div class="section__in personal-grid"><div><p class="cap">An invitation to tinker</p><h2>Good tools leave<br><em>room for you.</em></h2></div><div><p>nus started with the distance between a terminal and a browser. Every little trip out of the work adds up. So I’m building a place where those tools can share a window, a project, and a bit of context.</p><p>It’s early. There are edges to smooth and platforms to test. You can see the source, read the decisions, and help find what needs attention.</p><a href="./about/">A note from the maker ↗</a></div></div></section>
<section class="section"><div class="section__in closing-note"><span class="wordmark">nus</span><h2>Pull up a shell.</h2><a class="btn btn--signal" href="./download/">${icon('download-simple')}Get nus</a><p class="small dim">Preview builds for macOS, Windows, and Linux.<br>Package verification and signing details on the download page.</p></div></section>`
};
