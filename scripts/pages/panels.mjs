import {SITE,icon} from '../layout.mjs';
import {productFigure} from '../product-media.mjs';

const FILMS='../assets/films/';

/* The numbered sections, one slide each: the copy, and the capture that shows it. */
const SLIDES=[
 {id:'home',tab:'Your home',title:'A place to begin.<br>A place to come back to.',
  copy:['Start at the prompt, open a project, or resume a session. Saved commands, links, and prompts keep the things you use close at hand.','The background, type, colours, and suggestions are yours to choose. Keep it quiet, or give your workspace a little personality.'],
  link:['../docs/product/','Explore the product guide ↗'],
  capture:'home'},
 {id:'workspace',tab:'Shells &amp; pages',title:'Your shell,<br>with a view.',
  copy:['Keep your shell configuration, aliases, and command-line tools. Start a server and open its page beside the output. Keep documentation nearby while a command runs.','Tabs, splits, and named Spaces let each project keep its own arrangement.'],
  points:[['A real terminal.','Your commands run in a shell. Follow their output, select text, and return to the session when you need it.'],['A browser beside it.','Chromium pages have navigation, search, downloads, and developer tools. Open a detected localhost address straight from the shell.'],['Room for the whole job.','Keep the server, documentation, and assistant in the same project. Move between them without losing your place.']],
  capture:'workspace'},
 {id:'editor',tab:'The editor',title:'From the output<br>to the source.',
  copy:['Open a file beside the terminal. Follow a file-and-line reference from command output into the editor, then return to the running shell.','Keep the source close to the page you’re building, with dedicated text selection and editing controls.'],
  link:['../docs/product/','Read about the editor ↗'],
  capture:'editor'},
 {id:'history',tab:'History',title:'Find your<br>way back.',
  copy:['A session is more than its last screen. Move through commands and their output, find an earlier result, or follow a recording when the sequence matters.','Keep useful commands in your saved collection so you can find them again without digging through a whole session.'],
  points:[['Commands &amp; output','Navigate the work by command, with its output close at hand.'],['Session playback','Revisit a recorded session in order, at your own pace.'],['Saved commands','Keep recurring commands, links, and prompts together.']],
  capture:'history'},
 {id:'hatch',tab:'Hatch',title:'Ongoing work.<br>Within reach.',
  copy:['Bring up an overview of terminal work across your Spaces. See what’s running, finished, or needs your attention, then return to the original session.','Use a dropdown from the top edge or a centred panel. Move the same shell into the full workspace when you need more room.'],
  small:'Shortcuts, window placement, and focus behaviour vary by platform and desktop. Native-platform testing is ongoing.',
  capture:'hatch'}
];

const n=i=>String(i+1).padStart(2,'0');

const figure=(s,i)=>productFigure(s.capture,{eager:i===0});

const slide=(s,i)=>`
  <article class="tour__slide" id="${s.id}" data-tour-slide>
   ${figure(s,i)}
   <div class="tour__copy">
    <p class="cap">${n(i)} / ${s.tab}</p>
    <h2>${s.title}</h2>
    ${s.copy.map(p=>`<p>${p}</p>`).join('')}
    ${s.points?`<ul class="tour__points">${s.points.map(([t,d])=>`<li><b>${t}</b>${d}</li>`).join('')}</ul>`:''}
    ${s.small?`<p class="small">${s.small}</p>`:''}
    ${s.link?`<a class="tour__more" href="${s.link[0]}">${s.link[1]}</a>`:''}
   </div>
  </article>`;

export default {
 title:'Around nus',path:'/panels/',depth:1,bodyClass:'panels-page',
 description:'Explore the nus workspace: shells, pages, source files, saved commands, session history, and Hatch.',
 body:`
<section class="panels-intro">
 <div class="panels-intro__copy"><p class="cap">A look around nus</p><h1>One project.<br><em>A few good neighbours.</em></h1><p>Run the command. Read the page. Open the source.<br>Keep the work together, and make the space your own.</p></div>
</section>

<section class="section tour" data-tour aria-label="A look around nus"><div class="section__in">
 <div class="tour__bar">
  <button class="tour__btn tour__play" type="button" data-tour-play data-tour-controls hidden aria-label="Pause the tour"><span data-tour-playing>${icon('pause')}</span><span data-tour-paused hidden>${icon('play')}</span></button>
  <nav class="tour__tabs" aria-label="Workspace features" data-tour-tabs>${SLIDES.map((s,i)=>`<a class="tour__tab" href="#${s.id}" data-tour-tab data-no-swup><span class="tour__n">${n(i)}</span>${s.tab}<i class="tour__progress" data-tour-progress aria-hidden="true"></i></a>`).join('')}</nav>
  <div class="tour__step" data-tour-controls hidden><button class="tour__btn" type="button" data-tour-prev aria-label="Previous slide">${icon('caret-left')}</button><span class="tour__count" data-tour-count aria-hidden="true">01 / ${n(SLIDES.length-1)}</span><button class="tour__btn" type="button" data-tour-next aria-label="Next slide">${icon('caret-right')}</button></div>
 </div>
 <div class="tour__slides" data-tour-slides>${SLIDES.map(slide).join('')}
 </div>
</div></section>

<section class="section panels-assistants"><div class="section__in">
 <div class="panels-assistants__copy"><p class="cap">Your tools, your choice</p><h2>Keep your assistant<br>in the workspace.</h2><p>Configure Claude, Codex, or Ollama and send work to a shell you can return to. Inspect how each tool is launched, and keep the project context nearby.</p><p class="small">Provider tools need to be installed and authenticated separately. Review what context is shared with external services.</p><a href="${SITE.repo}/blob/main/SECURITY.md">Security &amp; data handling ↗</a></div>
 <figure class="tour__shot"><a href="${FILMS}nus-assistants-2026-09-26.webp" target="_blank" rel="noopener" aria-label="View the full-size capture: Assistants settings"><img src="${FILMS}nus-assistants-2026-09-26.webp" width="2000" height="1194" loading="lazy" decoding="async" alt="Settings open on Assistants: Claude and Codex signed in and ready to start a session, an intelligence dial, and a live preview beside them."></a><figcaption>Settings · Assistants: Claude and Codex signed in, ready to start a session.</figcaption></figure>
</div></section>

<section class="section"><div class="section__in closing-note"><span class="wordmark">nus</span><h2>Make room for your work.</h2><div class="row"><a class="btn btn--signal" href="../download/">${icon('download-simple')}Get nus</a><a class="source-cta" href="${SITE.repo}">Read the source <span aria-hidden="true">↗</span></a></div><p class="small dim">Preview software for macOS, Windows, and Linux.</p></div></section>`
};
