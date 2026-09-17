/* The app window, rebuilt in HTML from the same tokens the app renders from.
   Not a screenshot: it takes the page's theme and signal, and it obeys nus's
   own width rule — under 900px the split collapses, under 640 the sidebar goes.
   Ported from design/Main.dc.html in the app repo. */

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
  return `<div class="win" role="img" aria-label="The nus window: a sidebar of tabs, a shell running cargo test with a URL typed at the prompt, and the page it opens in the split beside it.">
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
        preview: `test term::alt_screen_round_trip ... ok
test term::wide_chars_take_two_cells ... ok
test input::kitty_disambiguate ... ok
test result: ok. 17 passed; 0 failed`
      })}
      ${tab({
        n: '02', title: 'claude', meta: 'waiting',
        preview: `Spike 3 findings recorded.
Proceed with spike 4? (y/n)
▌`
      })}
      ${tab({ n: '03', title: 'localhost:5173', meta: 'split →' })}
      ${tab({ n: '04', title: 'wgpu docs — Surface', state: 'off' })}

      <div class="win__sidefoot"><span class="grow">+ new tab</span><span>⌘T</span></div>
    </div>

    <div class="win__panes">
      <div class="win__pane">
        <div class="win__panehead"><b>01 · cargo test</b><span class="dim">~/nus</span><span class="grow"></span><span class="dim">80×42</span></div>
        <div class="win__term"><span class="p">❯</span> cargo test -p nus-vt
<span class="d">   Compiling</span> nus-vt v0.0.1 (~/nus/crates/vt)
<span class="d">    Finished</span> \`test\` profile in 1.84s
<span class="d">     Running</span> unittests src/lib.rs

running 17 tests
test input::app_cursor_mode_uses_ss3 ... <span class="g">ok</span>
test input::kitty_disambiguate ... <span class="g">ok</span>
test term::alt_screen_round_trip ... <span class="g">ok</span>
test term::resize_keeps_cursor_line ... <span class="g">ok</span>
test term::wide_chars_take_two_cells ... <span class="g">ok</span>

test result: <span class="g">ok</span>. 17 passed; 0 failed

<span class="p">❯</span> localhost:5173<span class="win__caret">&nbsp;</span>
<span class="d">  ↵ opens in browser · ctrl+↵ runs in shell</span></div>
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
