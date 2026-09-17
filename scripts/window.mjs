/* The app window.
 *
 * The terminal pane is not a drawing of a terminal: it is a canvas driven by
 * nus's own VT core compiled to WebAssembly, replaying a recorded PTY session.
 * The chrome around it — strip, sidebar, panes, rules — is drawn from the same
 * tokens the app renders from, and obeys nus's own width rule.
 *
 * Ported from design/Main.dc.html in the app repo.
 */

const tab = ({ n, title, meta, preview, state }) => {
  const cls = state === 'on' ? ' win__tab--on' : state === 'off' ? ' win__tab--off' : '';
  const right = meta === 'waiting'
    ? '<span class="win__wait">waiting</span>'
    : meta ? `<span class="cap">${meta}</span>` : '';
  return `<div class="win__tab${cls}">
        <div class="win__tabrow"><b>${n}</b><span class="grow">${title}</span>${right}</div>
        ${preview ? `<div class="win__prev">${preview}</div>` : ''}
      </div>`;
};

export function appWindow() {
  return `<div class="win" data-hero-term>
  <div class="win__band"></div>

  <div class="win__strip">
    <span class="serif">nus</span>
    <span class="win__crumb">nus · 01 cargo test · ~/nus</span>
    <span class="win__spacer"></span>
    <span>⌘K</span>
    <span class="win__ctl">—&nbsp;▢&nbsp;✕</span>
  </div>

  <div class="win__body">
    <div class="win__side">
      <div class="win__spaces">
        <div class="win__space"><i style="background:#1f5fbf"></i>work</div>
        <div class="win__space win__space--on"><i style="background:var(--signal)"></i>nus</div>
        <div class="win__space"><i style="background:#d9a400"></i>home</div>
      </div>

      ${tab({
        n: '01', title: 'cargo test · vt', meta: '~/nus', state: 'on',
        preview: `test result: ok. 25 passed
test term::xtversion_and_xtgettcap
test term::wide_chars_take_two_cells
test input::kitty_disambiguate`
      })}
      ${tab({
        n: '02', title: 'claude', meta: 'waiting',
        preview: `Spike 4 findings recorded.
Move the glue into crates? (y/n)
▌`
      })}
      ${tab({ n: '03', title: 'localhost:5173', meta: 'split →' })}
      ${tab({ n: '04', title: 'wgpu docs — Surface', state: 'off' })}

      <div class="win__sidefoot"><span class="grow">+ new tab</span><span>⌘T</span></div>
    </div>

    <div class="win__panes">
      <div class="win__pane">
        <div class="win__panehead">
          <b>01 · cargo test</b>
          <span class="dim">~/nus</span>
          <span class="grow"></span>
          <span class="dim" data-term-size>80×24</span>
        </div>

        <div class="win__term" data-term-stage>
          <canvas data-term-canvas aria-label="A recorded shell session: cargo test -p nus-vt reporting 25 passing tests, git log, and a URL typed at the prompt."></canvas>
          <noscript><div class="win__termfall">The hero replays a recorded session through nus's VT core compiled to WebAssembly, which needs JavaScript. The recording itself is a plain text file: <a href="./casts/nus-vt.cast">nus-vt.cast</a>.</div></noscript>
        </div>

        <div class="win__transport">
          <button class="win__tbtn" type="button" data-term-play aria-label="Pause">❚❚</button>
          <input class="win__scrub" type="range" min="0" max="1" step="0.01" value="0"
                 data-term-scrub aria-label="Scrub the recording">
          <span class="cap dim" data-term-status>loading</span>
        </div>
      </div>

      <div class="win__pane">
        <div class="win__url"><span>←</span><span class="field">localhost:5173</span><span class="cap dim">devtools</span></div>
        <div class="tape" aria-hidden="true"></div>
        <div class="win__web">
          <i class="t"></i><i class="l"></i><i class="l2"></i>
          <div class="cells"><span></span><span></span><span></span></div>
        </div>
        <div class="win__panehead" style="border-bottom:0;border-top:1px solid var(--ink)">
          <b style="text-decoration:underline">Console</b><span class="dim">Network</span><span class="dim">Elements</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}
