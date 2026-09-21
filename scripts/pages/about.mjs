import {SITE,icon} from '../layout.mjs';
export default {title:'About',path:'/about/',depth:1,
 description:'A note from Sebastian Suarez-Solis about making nus, a terminal and browser with room for personal taste.',
 body:`<section class="section">
  <div class="section__in maker-note">
    <p class="cap">A note from the maker</p>
    <h1>Software with<br><em>a point of view.</em></h1>

    <p class="lede">nus is my terminal and my browser. I built it for one user (me!) the way I want it, and I use it every day. I made it for personal and professional work, because none of the popular cross-platform tools integrated with the popular cross-platform browsers. I leave it FOSS as someone else might get some use out of this.</p>

    <p>That means:</p>

    <ul>
      <li>
        <p><strong>I decide the design.</strong> The product decisions live in <a href="https://github.com/cbassuarez/nus/blob/main/docs/PRODUCT.md">docs/PRODUCT.md</a> and <a href="https://github.com/cbassuarez/nus/blob/main/docs/DESIGN.md">docs/DESIGN.md</a>; each "settled" pass there is a decision already made. A change that contradicts them is out of scope, however good.</p>
      </li>
      <li>
        <p><strong>Feature requests are welcome.</strong> Describe the problem you want to solve; requests inform development without promising implementation. Check whether a setting, <code>rules.luau</code>, a theme or a layout already covers it.</p>
      </li>
      <li>
        <p><strong>I read bug reports and small fixes.</strong> A crash with a reproduction, a platform build fix, a typo, a wrong doc: very much welcome. I’ll try to stamp out bugs as quickly as they come in. See <a href="https://github.com/cbassuarez/nus/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a> before opening anything, and email <a href="mailto:contact@cbassuarez.com">contact@cbassuarez.com</a> for secured/responsible disclosure of vulnerabilities. There are limited funds available (I am one person, funding this by themselves, though I am awaiting extra funding to establish an actual program).</p>
      </li>
      <li>
        <p><strong>Preview releases, no support schedule.</strong> Native previews are published for macOS, Windows and Linux. Expect breakage and expect no answer on a schedule.</p>
      </li>
    </ul>

    <p class="maker-signature">
      Sebastian Suarez-Solis<br>
      <span>Making nus, one working day at a time.</span>
    </p>

    <div class="row">
      <a class="btn" href="https://github.com/cbassuarez/nus/issues">
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
          <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"/>
        </svg>
        Leave an issue
      </a>
      <a href="../download/">Try a preview →</a>
    </div>
  </div>
</section>
<section class="section"><div class="section__in personal-grid"><div><p class="cap">nus / terminus</p><h2>A small name.<br>A lot of room.</h2></div><div><p><em>nus</em> is the end of <em>terminus</em>. Short enough to type, with a terminal at its heart.</p><p>The app is written in Rust. Its interface is drawn with wgpu; Chromium handles web pages. The <a href="../docs/">project notes</a> explain how it fits together, including what still needs work.</p><p>The code is MIT licensed. Bundled fonts, icons and Chromium retain their own licences, included with release packages.</p></div></div></section>
<section class="section" id="pictures"><div class="section__in personal-grid"><div><p class="cap">The pictures</p><h2>Made by the app,<br><em>not of it.</em></h2></div><div><p>Every window on this site is the Mac build of nus, recorded by nus. The app has a recorder: it runs a short script on its own event loop — the same functions the keys call, no synthetic input — and writes each frame from its own compositor. The window controls, the type, the caret and the colours are the app’s.</p><p>What is staged is the pacing. A take runs on a fixed clock so it reads at a comfortable speed, which means nothing here is a performance figure; those are on <a href="../docs/measurements/">the measurements page</a>, with how they were taken. The shell in the hero is building this site.</p><p>The scripts are in the repository under <a href="${SITE.repo}/tree/main/docs/promo">docs/promo</a>, and the recorder is the same one <code>nus share</code> uses.</p></div></div></section>`};
