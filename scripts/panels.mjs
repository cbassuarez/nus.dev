/* The panels.
 *
 * Each is a reproduction of a surface the app draws, built from the same
 * tokens, rule weights and metric table. The prose beside each one is the
 * module's own doc comment, compressed — these are not invented features.
 *
 *   palette   spikes/composite/src/app.rs
 *   ask       spikes/composite/src/ask.rs
 *   ports     spikes/composite/src/folders.rs
 *   atlas     spikes/composite/src/start.rs
 *   stacks    spikes/composite/src/windows.rs + rules, PRODUCT.md sixth pass
 *   site      spikes/composite/src/sites.rs
 *   tiles     spikes/composite/src/tiles.rs
 *   peek      spikes/composite/src/peek.rs
 *   pip       spikes/composite/src/pip.rs
 *   compact   spikes/composite/src/compact.rs
 */

import { icon } from './layout.mjs';

const cap = (t) => `<span class="pnl__cap">${t}</span>`;
const ic = (n) => `<span class="win__ico">${icon(n)}</span>`;

const head = (iconName, title, right = '') => `
  <div class="pnl__head">
    ${ic(iconName)}${cap(title)}
    <span class="grow"></span>${right}
  </div>`;

const row = (iconName, title, note, mod = '') => `
  <div class="pnl__row${mod ? ` pnl__row--${mod}` : ''}">
    ${iconName ? ic(iconName) : ''}<span class="grow">${title}</span>${note ? cap(note) : ''}
  </div>`;

/* --- palette --------------------------------------------------------------- */

export const palette = () => `
<div class="pnl pnl--float">
  <div class="pnl__prompt"><span class="serif">go</span><span class="pnl__typed">cargo te</span><span class="pnl__bar"></span></div>
  <div class="pnl__rows">
    ${row('terminal-window', 'cargo test · vt', '01 · tab', 'on')}
    ${row('clock-counter-clockwise', 'cargo test -p nus-vt --release', 'run again')}
    ${row('sparkle', 'ask claude in this shell', 'claude -p')}
    ${row('magnifying-glass', 'search the web for “cargo test”', 'google')}
    ${row('globe', 'open cargo.test', 'url')}
    ${row('gear-six', 'terminal · scrollback', 'settings')}
  </div>
  <div class="pnl__foot">${cap('Tabs, then actions, then open-or-search — both always offered')}</div>
</div>`;

/* --- ask ------------------------------------------------------------------- */

export const ask = () => `
<div class="pnl pnl--float">
  ${head('sparkle', 'Ask', `${cap('claude -p')}`)}
  <div class="pnl__ctx">
    ${cap('~/nus')} ${cap('zsh')} ${cap('exit 101')}
  </div>
  <div class="pnl__input"><span class="pnl__caret">»</span>why did that last command fail?</div>
  <div class="pnl__said">
    <code>nus-vt</code> was built without its <code>images</code> feature, so the
    Kitty-graphics tests were compiled out and the suite exited 101. Turn the
    feature on for the run, or make it a workspace default.
  </div>
  <div class="pnl__block">
    <div class="pnl__code"><span class="k">cargo</span> test -p nus-vt <span class="f">--features</span> <span class="s">images</span></div>
    <div class="pnl__chips">
      <span class="pnl__chip">${icon('key-return')}Insert</span>
      <span class="pnl__chip">${icon('caret-right')}Run</span>
      <span class="pnl__chip">${icon('copy')}Copy</span>
      <span class="grow"></span>${cap('bash')}
    </div>
  </div>
  <div class="pnl__block">
    <div class="pnl__code"><span class="c"># or, for good</span>
<span class="k">cargo</span> add nus-vt <span class="f">--features</span> <span class="s">images</span></div>
    <div class="pnl__chips">
      <span class="pnl__chip">${icon('key-return')}Insert</span>
      <span class="pnl__chip">${icon('caret-right')}Run</span>
      <span class="pnl__chip">${icon('copy')}Copy</span>
    </div>
  </div>
</div>`;

/* --- ports ----------------------------------------------------------------- */

export const ports = () => `
<div class="pnl">
  ${head('caret-down', 'Ports', cap('3 listening'))}
  <div class="pnl__rows">
    ${row('plugs-connected', 'localhost:5173', 'node', 'on')}
    ${row('plugs-connected', 'localhost:8787', 'workerd')}
    ${row('plugs-connected', 'localhost:5432', 'postgres')}
  </div>
  ${head('github-logo', 'Github', cap('4 open'))}
  <div class="pnl__rows">
    ${row('shuffle', 'vt: decode sixel, answer DA1 with 4', '#41 · you')}
    ${row('shuffle', 'render: fit() bisects', '#38 · review')}
    ${row('shuffle', 'ci: fmt and clippy clean', '#37 · merged', 'off')}
  </div>
  ${head('folder-simple', 'Reading', cap('from rules.luau'))}
  <div class="pnl__rows">
    ${row('book-open-text', 'wgpu — Surface', 'docs.rs')}
    ${row('book-open-text', 'Kitty graphics protocol', 'sw.kovidgoyal.net')}
  </div>
</div>`;

/* --- atlas ----------------------------------------------------------------- */

export const atlas = () => `
<div class="pnl pnl--float">
  <div class="pnl__atlashead">
    <img src="../assets/icon/nus-128.png" alt="" width="34" height="34">
    <div>
      <div class="pnl__atlast">Last time</div>
      ${cap('3 shells · 4 pages · 2 windows')}
    </div>
    <span class="grow"></span>${cap('Esc starts fresh')}
  </div>
  <div class="pnl__rows">
    ${row('clock-counter-clockwise', 'Restore last session', '↵', 'on')}
    ${row('terminal-window', 'cargo test · vt', '~/nus')}
    ${row('globe', 'Vite + React', 'localhost:5173')}
    ${row('book-open-text', 'wgpu — Surface', 'docs.rs')}
    ${row('terminal-window', 'ssh prod-01', 'ssh', 'off')}
    ${row('squares-four', 'nus · work', 'window', 'off')}
  </div>
  <div class="pnl__foot">${cap('The planet in the header calls it back later — never the splash')}</div>
</div>`;

/* --- stacks ---------------------------------------------------------------- */

export const stacks = () => `
<div class="pnl pnl--split">
  <div class="pnl__side">
    ${head('stack', 'Tabs')}
    <div class="pnl__rows">
      ${row('terminal-window', 'cargo test · vt', '01', 'on')}
      ${row('globe', 'localhost:5173', '02')}
      ${row('link', 'HMR — Vite', '', 'child')}
      ${row('link', 'react.dev', '', 'child')}
      ${row('link', 'MDN — fetch', '', 'grand')}
      ${row('book-open-text', 'wgpu — Surface', '03', 'off')}
    </div>
  </div>
  <div class="pnl__main">
    ${head('code', 'profile/rules.luau', cap('hot-reloads'))}
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
  </div>
</div>`;

/* --- site panel ------------------------------------------------------------ */

export const site = () => `
<div class="pnl pnl--float">
  ${head('gear-six', 'localhost:5173',
    `<span class="win__lamp win__lamp--local"></span>${cap('Local')}`)}
  <div class="pnl__rows">
    ${row('magnifying-glass', 'Zoom', '110%')}
    ${row('code', 'JavaScript', 'On')}
    ${row('speaker-high', 'Autoplay', 'Off')}
    ${row('cookie', 'Cookies', 'Allow · clear')}
    ${row('shield-check', 'Blocking', 'On · 14 today')}
    ${row('paint-brush', 'Boosts', '1 from rules')}
  </div>
  ${head('warning', 'Given', cap('each forgettable'))}
  <div class="pnl__rows">
    ${row('cursor-click', 'Clipboard', 'Allowed')}
    ${row('bell', 'Notifications', 'Denied', 'on')}
  </div>
  <div class="pnl__foot">${cap('profile/sites.json — the request handlers read the same table')}</div>
</div>`;

/* --- tiles ----------------------------------------------------------------- */

export const tiles = () => `
<div class="pnl">
  ${head('squares-four', 'Tiles', '<kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>D</kbd>')}
  <div class="pnl__tiles">
    <div class="pnl__tile">
      <span class="pnl__tilelab">${ic('terminal-window')}01 cargo test</span>
      <div class="pnl__tileterm"><span class="p">»</span> cargo test -p nus-vt
<span class="g">   ok</span>. 25 passed</div>
    </div>
    <div class="pnl__tilecol">
      <div class="pnl__tile">
        <span class="pnl__tilelab">${ic('globe')}02 localhost:5173</span>
        <div class="pnl__tileweb"><i></i><i class="s"></i><i class="s"></i></div>
      </div>
      <div class="pnl__tile">
        <span class="pnl__tilelab">${ic('code')}03 console</span>
        <div class="pnl__tileterm"><span class="d">[vite] hmr update</span>
<span class="d">/src/App.tsx</span></div>
      </div>
    </div>
  </div>
  <div class="pnl__foot">${cap('Two side by side · three an L · four a grid · dividers drag')}</div>
</div>`;

/* --- peek ------------------------------------------------------------------ */

export const peek = () => `
<div class="pnl pnl--peek">
  <div class="pnl__under">
    <div class="pnl__underline w"></div>
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
    <div class="pnl__underline"></div>
  </div>
  <div class="pnl__scrim"></div>
  <div class="pnl__peekwin">
    <div class="pnl__head">
      <span class="win__favi">r</span>${cap('react.dev · useEffect')}
      <span class="grow"></span>${ic('corners-out')}${ic('x')}
    </div>
    <div class="pnl__web"><i class="t"></i><i class="l"></i><i class="l2"></i><i class="l"></i><i class="l2"></i></div>
    <div class="pnl__foot">${cap('Esc closes · Ctrl+↵ keeps it in the stack')}</div>
  </div>
</div>`;

/* --- picture-in-picture ---------------------------------------------------- */

export const pip = () => `
<div class="pnl pnl--peek">
  <div class="pnl__under">
    <div class="pnl__underline w"></div>
    <div class="pnl__underline"></div><div class="pnl__underline s"></div>
    <div class="pnl__underline"></div>
  </div>
  <div class="pnl__pipwin">
    <div class="pnl__pipband"></div>
    <div class="pnl__pipvideo">${icon('picture-in-picture')}</div>
    <div class="pnl__pipfoot">
      ${cap('nus · 02')}<span class="grow"></span>${cap('↗')}${cap('✕')}
    </div>
  </div>
</div>`;

/* --- compact --------------------------------------------------------------- */

export const compact = () => `
<div class="pnl pnl--compact">
  <div class="pnl__rail">
    <span class="pnl__sq"></span>
    ${ic('plus')}
    ${['terminal-window', 'globe', 'sparkle', 'book-open-text']
      .map((n, i) => `<span class="win__ico${i === 1 ? ' on' : ''}">${icon(n)}</span>`).join('')}
    <span class="grow"></span>
    ${ic('gear-six')}
  </div>
  <div class="pnl__railbody">
    <div class="pnl__tip">${ic('globe')}localhost:5173</div>
    <div class="pnl__web"><i class="t"></i><i class="l"></i><i class="l2"></i><i class="l"></i></div>
  </div>
</div>`;
