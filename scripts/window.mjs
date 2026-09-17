/* The two halves of nus, as two windows of the same application.
 *
 * Both are built from the same chrome primitives and the same metric table
 * (crates/render/src/theme.rs, mod metric), because that is the claim: a shell
 * tab and a page tab are peers in one app, not two programs bolted together.
 *
 * The shell pane is not a drawing — it is a canvas driven by nus's own VT core
 * compiled to WebAssembly, replaying a recorded PTY session.
 */

import { icon } from './layout.mjs';

/* --- shared chrome --------------------------------------------------------- */

const strip = (crumb, { url = false } = {}) => `
  <div class="win__strip">
    <span class="serif">nus</span>
    ${url
      ? `<span class="win__crumbfield">${crumb}</span>`
      : `<span class="win__crumb">${crumb}</span>`}
    <span class="win__spacer"></span>
    <span class="win__ico">${icon('magnifying-glass')}</span>
    <span class="win__ctl">—&nbsp;▢&nbsp;✕</span>
  </div>`;

const spaces = (active) => `
  <div class="win__spaces">
    ${[['work', '#1f5fbf'], ['nus', 'var(--signal)'], ['home', '#d9a400']]
      .map(([n, c], i) => `<div class="win__space${i === active ? ' win__space--on' : ''}">
        <i style="background:${c}"></i>${n}</div>`).join('')}
  </div>`;

/** One 32px sidebar row — ROW_H in the metric table. */
const row = ({ n, ic, title, note, state, depth = 0, badge }) => `
  <div class="win__row${state ? ` win__row--${state}` : ''}"${depth ? ` style="--depth:${depth}"` : ''}>
    <span class="win__n">${n || ''}</span>
    <span class="win__ico">${icon(ic)}</span>
    <span class="win__title">${title}</span>
    ${badge === 'waiting' ? '<span class="win__wait">waiting</span>'
      : note ? `<span class="win__note">${note}</span>` : ''}
  </div>`;

const foot = (icons) => `
  <div class="win__foot">${icons.map((i) => `<span class="win__ico">${icon(i)}</span>`).join('')}</div>`;

/* --- the terminal window --------------------------------------------------- */

export function terminalWindow() {
  // Chromeless, which is the app's default: a 6px signal band and a 30px top
  // strip are all the furniture, and the sidebar slides in on the hot edge.
  return `<div class="win win--term" data-hero-term data-win="term">
  <div class="win__band"></div>
  ${strip('nus · 01 cargo test · ~/nus')}

  <div class="win__body">
    <div class="win__edge" aria-hidden="true"></div>
    <div class="win__panes">
      <div class="win__pane">
        <div class="win__panehead">
          <span class="win__ico">${icon('terminal-window')}</span>
          <b>01 · cargo test</b><span class="dim">~/nus</span>
          <span class="grow"></span><span class="dim" data-term-size>68×20</span>
        </div>
        <div class="win__term" data-term-stage>
          <canvas data-term-canvas aria-label="A recorded shell session: cargo test -p nus-vt reporting 25 passing tests, git log, and a URL typed at the prompt."></canvas>
          <noscript><div class="win__termfall">The shell replays a recorded session through nus's VT core compiled to WebAssembly, which needs JavaScript. The recording is a plain text file: <a href="./casts/nus-vt.cast">nus-vt.cast</a>.</div></noscript>
        </div>
        <div class="win__transport">
          <button class="win__tbtn" type="button" data-term-play aria-label="Pause">❚❚</button>
          <input class="win__scrub" type="range" min="0" max="1" step="0.01" value="0"
                 data-term-scrub aria-label="Scrub the recording">
          <span class="cap dim" data-term-status>loading</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

/* --- the browser window ---------------------------------------------------- */

export function browserWindow() {
  return `<div class="win win--web" data-win="web" role="img"
     aria-label="The browser half of nus: stacked tabs with a live PORTS folder, a page on localhost behind hazard tape, and devtools composited beside it.">
  <div class="win__band"></div>
  ${strip(`<span class="win__favi">v</span>Vite + React · localhost:5173`, { url: true })}

  <div class="win__body">
    <div class="win__side">
      ${spaces(1)}
      ${row({ n: '01', ic: 'globe', title: 'localhost:5173', note: 'local', state: 'on' })}
      ${row({ ic: 'link', title: 'HMR — Vite docs', depth: 1 })}
      ${row({ ic: 'link', title: 'react.dev · useEffect', depth: 1, state: 'off' })}
      ${row({ n: '02', ic: 'book-open-text', title: 'wgpu — Surface', state: 'off' })}

      <div class="win__folder">
        <span class="win__ico">${icon('caret-down')}</span>
        <span class="win__foldern">PORTS</span>
        <span class="win__note">3 listening</span>
      </div>
      ${row({ ic: 'plugs-connected', title: 'localhost:5173', note: 'node', depth: 1 })}
      ${row({ ic: 'plugs-connected', title: 'localhost:8787', note: 'workerd', depth: 1 })}
      ${row({ ic: 'plugs-connected', title: 'localhost:5432', note: 'postgres', depth: 1 })}

      <div class="win__fill"></div>
      ${foot(['user-circle', 'plus', 'clock-counter-clockwise', 'download-simple', 'gear-six'])}
    </div>

    <div class="win__panes">
      <div class="win__pane">
        <div class="win__url">
          <span class="win__ico">${icon('arrow-left')}</span>
          <span class="win__ico dim">${icon('arrow-right')}</span>
          <span class="win__ico">${icon('arrows-clockwise')}</span>
          <span class="field"><span class="win__lamp win__lamp--local"></span>localhost:5173</span>
          <span class="win__ico">${icon('gear-six')}</span>
        </div>
        <div class="tape" aria-hidden="true"></div>

        <div class="win__web">
          <i class="t"></i><i class="l"></i><i class="l2"></i>
          <div class="cells"><span></span><span></span><span></span></div>
          <i class="l"></i><i class="l2"></i>
        </div>

        <div class="win__dev">
          <span class="win__ico">${icon('code')}</span><b>Console</b>
          <span class="dim">Network</span><span class="dim">Elements</span>
          <span class="grow"></span>
          <span class="dim">390 · 768 · 1440</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}
