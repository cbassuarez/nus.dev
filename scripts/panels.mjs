/* The panels.
 *
 * Each is a faithful reproduction of a surface the app actually draws, built
 * from the same tokens and rule weights. The prose under each one is the
 * module's own doc comment, compressed — these are not invented features.
 *
 *   atlas     spikes/composite/src/start.rs
 *   ports     spikes/composite/src/folders.rs
 *   ask       spikes/composite/src/ask.rs
 *   tiles     spikes/composite/src/tiles.rs
 *   peek      spikes/composite/src/peek.rs
 *   site      spikes/composite/src/sites.rs
 *   compact   spikes/composite/src/compact.rs
 *   rules     docs/PRODUCT.md, sixth pass
 */

import { icon } from './layout.mjs';

const cap = (t) => `<span class="pnl__cap">${t}</span>`;

/* --- atlas ----------------------------------------------------------------- */

export const atlas = () => `
<div class="pnl pnl--float">
  <div class="pnl__head">
    <span class="win__ico">${icon('planet')}</span>
    ${cap('Last time · 3 shells, 4 pages')}
    <span class="grow"></span>
    ${cap('Esc starts fresh')}
  </div>
  <div class="pnl__rows">
    <div class="pnl__row pnl__row--on">
      <span class="win__ico">${icon('clock-counter-clockwise')}</span>
      <span class="grow">Restore last session</span>${cap('↵')}
    </div>
    <div class="pnl__row"><span class="win__ico">${icon('terminal-window')}</span>
      <span class="grow">cargo test · vt</span>${cap('~/nus')}</div>
    <div class="pnl__row"><span class="win__ico">${icon('globe')}</span>
      <span class="grow">Vite + React</span>${cap('localhost:5173')}</div>
    <div class="pnl__row"><span class="win__ico">${icon('book-open-text')}</span>
      <span class="grow">wgpu — Surface</span>${cap('docs.rs')}</div>
    <div class="pnl__row pnl__row--off"><span class="win__ico">${icon('terminal-window')}</span>
      <span class="grow">ssh prod-01</span>${cap('ssh')}</div>
  </div>
</div>`;

/* --- ask ------------------------------------------------------------------- */

export const ask = () => `
<div class="pnl pnl--float">
  <div class="pnl__head">
    <span class="win__ico">${icon('sparkle')}</span>${cap('Ask')}
    <span class="grow"></span>${cap('claude -p')}
  </div>
  <div class="pnl__input">
    <span class="pnl__caret">❯</span>why did that last command fail?
  </div>
  <div class="pnl__said">
    The build ran with the default feature set, so <code>nus-vt</code> was compiled
    without <code>images</code>. Re-run with the feature on, or add it to the
    workspace default.
  </div>
  <div class="pnl__block">
    <div class="pnl__code"><span class="k">cargo</span> test -p nus-vt <span class="f">--features</span> <span class="s">images</span></div>
    <div class="pnl__chips">
      <span class="pnl__chip">Insert</span>
      <span class="pnl__chip">Run</span>
      <span class="pnl__chip">Copy</span>
      <span class="grow"></span>${cap('bash')}
    </div>
  </div>
  <div class="pnl__foot">${cap('The shell, the folder and the last command’s output go along')}</div>
</div>`;

/* --- ports ----------------------------------------------------------------- */

export const ports = () => `
<div class="pnl">
  <div class="pnl__head">
    <span class="win__ico">${icon('caret-down')}</span>${cap('Ports')}
    <span class="grow"></span>${cap('3 listening')}
  </div>
  <div class="pnl__rows">
    ${[['5173', 'node', true], ['8787', 'workerd', false], ['5432', 'postgres', false]]
      .map(([p, proc, on]) => `<div class="pnl__row${on ? ' pnl__row--on' : ''}">
        <span class="win__ico">${icon('plugs-connected')}</span>
        <span class="grow">localhost:${p}</span>${cap(proc)}</div>`).join('')}
  </div>
  <div class="pnl__head" style="border-top:var(--struct) solid var(--ink);border-bottom:0">
    <span class="win__ico">${icon('github-logo')}</span>${cap('Github')}
    <span class="grow"></span>${cap('asking gh…')}
  </div>
</div>`;

/* --- rules ----------------------------------------------------------------- */

export const rules = () => `
<div class="pnl">
  <div class="pnl__head">
    <span class="win__ico">${icon('code')}</span>${cap('profile/rules.luau')}
    <span class="grow"></span>${cap('Sandboxed · hot-reloads')}
  </div>
  <pre class="pnl__src"><code><span class="c">-- what should a new tab look like?</span>
<span class="k">function</span> <span class="fn">new_tab</span>(ctx)
  <span class="k">if</span> ctx.local_site <span class="k">then</span>
    <span class="k">return</span> { signal = hue(<span class="n">14</span>) }
  <span class="k">end</span>
  <span class="c">-- a stack keeps its parent's family</span>
  <span class="k">if</span> ctx.parent <span class="k">then</span>
    <span class="k">return</span> { signal = ctx.parent.signal }
  <span class="k">end</span>
  <span class="k">return</span> { signal = hue(ctx.index * <span class="n">47</span>) }
<span class="k">end</span></code></pre>
  <div class="pnl__foot">${cap('new_space · on_page → boosts · on_event → a cue')}</div>
</div>`;

/* --- tiles ----------------------------------------------------------------- */

export const tiles = () => `
<div class="pnl">
  <div class="pnl__head">
    <span class="win__ico">${icon('squares-four')}</span>${cap('Tiles')}
    <span class="grow"></span><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>D</kbd>
  </div>
  <div class="pnl__tiles">
    <div class="pnl__tile"><span class="pnl__tilelab">01 cargo test</span></div>
    <div class="pnl__tilecol">
      <div class="pnl__tile"><span class="pnl__tilelab">02 localhost:5173</span></div>
      <div class="pnl__tile"><span class="pnl__tilelab">03 console</span></div>
    </div>
  </div>
  <div class="pnl__foot">${cap('Two side by side · three an L · four a grid · dividers drag')}</div>
</div>`;

/* --- peek ------------------------------------------------------------------ */

export const peek = () => `
<div class="pnl pnl--peek">
  <div class="pnl__under">
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
  </div>
  <div class="pnl__scrim"></div>
  <div class="pnl__peekwin">
    <div class="pnl__head">
      <span class="win__favi">r</span>${cap('react.dev · useEffect')}
      <span class="grow"></span><span class="win__ico">${icon('x')}</span>
    </div>
    <div class="pnl__web"><i class="t"></i><i class="l"></i><i class="l2"></i><i class="l"></i></div>
    <div class="pnl__foot">${cap('Esc closes · Ctrl+↵ keeps it in the stack')}</div>
  </div>
</div>`;

/* --- site panel ------------------------------------------------------------ */

export const site = () => `
<div class="pnl pnl--float">
  <div class="pnl__head">
    <span class="win__ico">${icon('gear-six')}</span>${cap('localhost:5173')}
    <span class="grow"></span><span class="win__lamp win__lamp--local"></span>${cap('Local')}
  </div>
  <div class="pnl__rows">
    ${[['Zoom', '110%'], ['JavaScript', 'On'], ['Autoplay', 'Off'],
       ['Cookies', 'Allow · clear'], ['Blocking', 'On'], ['Boosts', '1 from rules']]
      .map(([k, v]) => `<div class="pnl__row"><span class="grow">${k}</span>${cap(v)}</div>`).join('')}
    <div class="pnl__row pnl__row--on"><span class="grow">Camera</span>${cap('Denied · forget')}</div>
  </div>
  <div class="pnl__foot">${cap('profile/sites.json · the request handlers read the same table')}</div>
</div>`;

/* --- compact --------------------------------------------------------------- */

export const compact = () => `
<div class="pnl pnl--compact">
  <div class="pnl__rail">
    <span class="pnl__sq"></span>
    ${['plus', 'terminal-window', 'globe', 'sparkle', 'book-open-text', 'gear-six']
      .map((i, n) => `<span class="win__ico${n === 2 ? ' on' : ''}">${icon(i)}</span>`).join('')}
  </div>
  <div class="pnl__railbody">
    <div class="pnl__tilelab" style="position:static;margin:0 0 10px">localhost:5173</div>
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
    <div class="pnl__underline"></div>
  </div>
</div>`;
