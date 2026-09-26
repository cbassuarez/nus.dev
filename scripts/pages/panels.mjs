import {SITE,icon} from '../layout.mjs';

export default {
 title:'Around nus',path:'/panels/',depth:1,bodyClass:'panels-page',
 description:'Explore the nus workspace: shells, pages, source files, saved commands, session history, and Hatch.',
 body:`
<section class="panels-intro">
 <div class="panels-intro__copy"><p class="cap">A look around nus</p><h1>One project.<br><em>A few good neighbours.</em></h1><p>Run the command. Read the page. Open the source.<br>Keep the work together, and make the space your own.</p></div>
 <nav class="panels-index" aria-label="Workspace features"><a href="#home">Your home</a><a href="#workspace">Shells &amp; pages</a><a href="#editor">The editor</a><a href="#history">History</a><a href="#hatch">Hatch</a></nav>
</section>

<section class="section panels-home" id="home"><div class="section__in">
 <figure class="shell-capture"><a href="../assets/films/nus-home-2026-09-26.png" target="_blank" rel="noopener" aria-label="View the full-size nus home screenshot"><img src="../assets/films/nus-home-2026-09-26.png" width="3204" height="1912" fetchpriority="high" alt="The current nus home: a prompt and saved commands, with projects and resumable sessions beneath, surrounded by Memphis artwork."></a></figure>
 <div class="panels-section-copy"><div><p class="cap">01 / Your home</p><h2>A place to begin.<br>A place to come back to.</h2></div><div><p>Start at the prompt, open a project, or resume a session. Saved commands, links, and prompts keep the things you use close at hand.</p><p>The background, type, colours, and suggestions are yours to choose. Keep it quiet, or give your workspace a little personality.</p><a href="../docs/product/">Explore the product guide ↗</a></div></div>
</div></section>

<section class="section" id="workspace"><div class="section__in">
 <div class="panels-section-copy"><div><p class="cap">02 / Shells &amp; pages</p><h2>Your shell,<br>with a view.</h2></div><div><p>Keep your shell configuration, aliases, and command-line tools. Start a server and open its page beside the output. Keep documentation nearby while a command runs.</p><p>Tabs, splits, and named Spaces let each project keep its own arrangement.</p></div></div>
 <div class="panels-features">
  <article><span class="panels-feature-icon">${icon('code')}</span><h3>A real terminal.</h3><p>Your commands run in a shell. Follow their output, select text, and return to the session when you need it.</p></article>
  <article><span class="panels-feature-icon">${icon('globe-bold')}</span><h3>A browser beside it.</h3><p>Chromium pages have navigation, search, downloads, and developer tools. Open a detected localhost address straight from the shell.</p></article>
  <article><span class="panels-feature-icon">${icon('squares-four')}</span><h3>Room for the whole job.</h3><p>Keep the server, documentation, and assistant in the same project. Move between them without losing your place.</p></article>
 </div>
</div></section>

<section class="section panels-editor" id="editor"><div class="section__in panels-section-copy">
 <div><p class="cap">03 / The editor</p><h2>From the output<br>to the source.</h2></div><div><p>Open a file beside the terminal. Follow a file-and-line reference from command output into the editor, then return to the running shell.</p><p>Keep the source close to the page you’re building, with dedicated text selection and editing controls.</p><a href="../docs/product/">Read about the editor ↗</a></div>
</div></section>

<section class="section" id="history"><div class="section__in">
 <div class="panels-section-copy"><div><p class="cap">04 / History</p><h2>Find your<br>way back.</h2></div><div><p>A session is more than its last screen. Move through commands and their output, find an earlier result, or follow a recording when the sequence matters.</p><p>Keep useful commands in your saved collection so you can find them again without digging through a whole session.</p></div></div>
 <div class="panels-detail-row"><div><h3>Commands &amp; output</h3><p>Navigate the work by command, with its output close at hand.</p></div><div><h3>Session playback</h3><p>Revisit a recorded session in order, at your own pace.</p></div><div><h3>Saved commands</h3><p>Keep recurring commands, links, and prompts together.</p></div></div>
</div></section>

<section class="section panels-hatch" id="hatch"><div class="section__in panels-section-copy">
 <div><p class="cap">05 / Hatch</p><h2>Ongoing work.<br>Within reach.</h2></div><div><p>Bring up an overview of terminal work across your Spaces. See what’s running, finished, or needs your attention, then return to the original session.</p><p>Use a dropdown from the top edge or a centred panel. Move the same shell into the full workspace when you need more room.</p><p class="small dim">Shortcuts, window placement, and focus behaviour vary by platform and desktop. Native-platform testing is ongoing.</p></div>
</div></section>

<section class="section panels-assistants"><div class="section__in panels-section-copy">
 <div><p class="cap">Your tools, your choice</p><h2>Keep your assistant<br>in the workspace.</h2></div><div><p>Configure Claude, Codex, or Ollama and send work to a shell you can return to. Inspect how each tool is launched, and keep the project context nearby.</p><p class="small dim">Provider tools need to be installed and authenticated separately. Review what context is shared with external services.</p><a href="${SITE.repo}/blob/main/SECURITY.md">Security &amp; data handling ↗</a></div>
</div></section>

<section class="section"><div class="section__in closing-note"><span class="wordmark">nus</span><h2>Make room for your work.</h2><div class="row"><a class="btn btn--signal" href="../download/">${icon('download-simple')}Get nus</a><a class="source-cta" href="${SITE.repo}">Read the source <span aria-hidden="true">↗</span></a></div><p class="small dim">Preview software for macOS, Windows, and Linux.</p></div></section>`
};
