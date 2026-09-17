import { icon, SITE } from '../layout.mjs';
import { terminalWindow, browserWindow } from '../window.mjs';

/* Every claim on this page points at the file that makes it true.
   Generic basenames (README.md and friends) carry their parent, so two
   spike logs never both render as "README.md". */
const src = (path, line) => {
  const parts = path.split('/');
  const base = parts[parts.length - 1];
  const label = /^(README|index|mod|lib|main)\./i.test(base)
    ? parts.slice(-2).join('/')
    : base;
  return `<a class="src" href="${SITE.repo}/blob/main/${path}${line ? `#L${line}` : ''}"` +
    ` target="_blank" rel="noopener noreferrer">${label}${line ? `:${line}` : ''}</a>`;
};

const ST = {
  in:     '<span class="st st--in">Shipped</span>',
  flight: '<span class="st st--flight">In flight</span>',
  next:   '<span class="st st--next">Next</span>',
  no:     '<span class="st st--no">No</span>'
};

const row = (label, body, status = '') =>
  `<div class="ledger__row"><span class="cap">${label}</span><p class="mb0">${body}${status ? ' ' + status : ''}</p></div>`;

const spec = (what, detail, status, source) =>
  `<tr><td>${what}</td><td>${detail}</td><td>${status}${source ? ' ' + source : ''}</td></tr>`;

const seq = (items) =>
  `<ul class="seq">${items.map((s) => `<li><code${s.startsWith('!') ? ' class="off"' : ''}>${s.replace(/^!/, '')}</code></li>`).join('')}</ul>`;

const Y = '<span class="y">●</span>';
const N = '<span class="n">○</span>';
const P = '<span class="p">◐</span>';

const mrow = (feature, cells) => `<tr><td>${feature}</td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;

export default {
  title: 'nus',
  path: '/',
  depth: 0,
  description:
    'nus (terminus): a terminal emulator that is also a browser. Own VT core, ' +
    'GPU-composited Chromium, tree-sitter command line, sandboxed Luau config. ' +
    'Pre-alpha, MIT.',
  module: `
import { mountHeroTerminal } from './assets/js/terminal.js';
import { mountOrbit } from './assets/js/orbit.js';

const orbit = document.querySelector('[data-orbit]');
if (orbit) mountOrbit(orbit);

const stage = document.querySelector('[data-hero-term]');
if (stage) {
  mountHeroTerminal(stage, {
    wasm: './assets/wasm/nus_vt_wasm_bg.wasm',
    cast: './casts/nus-vt.cast'
  }).catch((err) => {
    // A hero that fails should say so plainly rather than sit there blank.
    console.error('hero terminal:', err);
    const status = stage.querySelector('[data-term-status]');
    if (status) status.textContent = 'replay unavailable';
    stage.querySelector('[data-term-stage]').innerHTML =
      '<div class="win__termfall">The replay could not load. ' +
      'The recording is a plain text file: ' +
      '<a href="./casts/nus-vt.cast">nus-vt.cast</a>.</div>';
  });
}
`,
  body: `
<section class="orbit" data-orbit>
  <div class="orbit__rail" data-orbit-rail>
    <div class="orbit__stage" data-orbit-stage>

      <div class="orbit__body" data-orbit-body>
        ${terminalWindow()}
        <div class="orbit__tag"><b>The shell</b><span>Real VT core, replaying a real session</span></div>
      </div>

      <div class="orbit__core">
        <h1>One window. A shell and a page, <em>peers</em>.</h1>
        <p class="orbit__lede">
          Two halves of the same application, not two applications. Same tab list,
          same splits, same config, same keys. Type a URL at a prompt and it opens
          in the pane next door.
        </p>
        <div class="orbit__acts">
          <a class="btn btn--fill" href="./docs/">${icon('book-open-text')}The record</a>
          <a class="btn" href="${SITE.repo}" target="_blank" rel="noopener noreferrer">${icon('github-logo')}Source</a>
          <a class="btn btn--quiet" href="./download/">${icon('download-simple')}Builds</a>
        </div>
        <div class="orbit__meta">
          <span class="chip chip--signal">Pre-alpha</span>
          <span>MIT</span>
          <span>Rust · wgpu · CEF · Luau</span>
        </div>
      </div>

      <div class="orbit__body" data-orbit-body>
        ${browserWindow()}
        <div class="orbit__tag"><b>The browser</b><span>Chromium, composited by us</span></div>
      </div>

      <div class="orbit__dial" data-orbit-dial>
        <span>Orbit</span><span class="orbit__track"><i></i></span>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="section__in">
    <p class="dim mb0" style="font-size:13px;max-width:78ch">
      The shell above is not a screenshot and not a video: a recorded PTY session —
      <code>cargo test -p nus-vt</code>, <code>git log</code>, then a URL typed at the
      prompt — replayed through nus's own VT core compiled to WebAssembly, so every
      glyph is placed by the parser the app runs.
      <a href="./casts/nus-vt.cast" download>Download the recording</a> ·
      ${src('crates/vt/src/term.rs')} at <code>30137f4</code>.
      Both windows are drawn from the app's own tokens and rule weights
      (${src('crates/render/src/theme.rs')}), though the sidebar is narrowed at this
      size — at true proportion its rows would be too small to read. The page in the
      browser half is a still, because CEF does not run in a browser.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Conformance</h2><span class="cap">What the terminal answers</span></div>
    <p class="dim" style="margin-bottom:24px;font-size:14px;max-width:62ch">
      The list a terminal is actually judged on, including the parts that answer
      <em>no</em>. <code>XTGETTCAP</code> refuses every capability not named here rather
      than guessing, and <code>DA1</code> advertises only what is decoded.
    </p>

    <div class="tablewrap">
      <table class="spec">
        <thead><tr><th>Capability</th><th>Detail</th><th>Status</th></tr></thead>
        <tbody>
          ${spec('Identity', '<code>TERM=xterm-256color</code>, <code>COLORTERM=truecolor</code>, <code>TERM_PROGRAM=nus</code>', ST.in)}
          ${spec('DA1 / DA2', 'VT220 with ANSI colour. Sixel is not advertised until it decodes.', ST.in, src('crates/vt/src/term.rs', 1288))}
          ${spec('XTVERSION', 'Answers <code>nus &lt;version&gt;</code>', ST.in)}
          ${spec('XTGETTCAP', 'Answers <code>TN</code>, <code>RGB</code>/<code>Tc</code>, <code>colors</code>, <code>setrgbf</code>/<code>setrgbb</code>, <code>Ms</code>, <code>Ss</code>/<code>Se</code>, <code>Smulx</code> — and refuses the rest', ST.in)}
          ${spec('Kitty keyboard', 'Full protocol, negotiated. Disambiguate, report events, alternates.', ST.in, src('crates/vt/src/input.rs'))}
          ${spec('Synchronized output', 'DEC mode 2026', ST.in)}
          ${spec('OSC', seq(['8 hyperlinks', '52 clipboard', '133 prompt marks', '7 cwd', '9;4 progress', '1337 inline images']), ST.in)}
          ${spec('Bracketed paste', 'With a hazard band when the paste looks risky', ST.in)}
          ${spec('Focus events', 'Reported; an unfocused split washes with paper', ST.in)}
          ${spec('Kitty graphics', 'Draws in the shell. ConPTY drops APC, so Windows waits on a transport.', ST.in, src('docs/ARCHITECTURE.md'))}
          ${spec('Sixel', 'Being decoded now. <code>DA1</code> gains <code>4</code> when it lands, not before.', ST.flight)}
          ${spec('terminfo', 'A <code>nus</code> entry shipped, then <code>TERM=nus</code> once tools know it', ST.next)}
          ${spec('vttest / esctest', 'Runs recorded against the suites', ST.next)}
          ${spec('<code>nus</code> CLI', 'Open a URL or a file; <code>nus ask</code>', ST.next)}
        </tbody>
      </table>
    </div>
    <p class="dim mb0" style="font-size:13px">
      Settled in the fourteenth product pass. ${src('docs/PRODUCT.md', 545)}
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Measured</h2><span class="cap">Not estimated</span></div>
    <div class="figs">
      <div>
        <b>2.8<small> ms</small></b>
        <span>Key → present</span>
        <em>vim with ligatures, release</em>
      </div>
      <div>
        <b>&lt;2<small> ms</small></b>
        <span>Full-screen frame</span>
        <em>80×42, release build</em>
      </div>
      <div>
        <b>144<small> fps</small></b>
        <span>Browser texture</span>
        <em>CEF → D3D11 → D3D12, shared</em>
      </div>
      <div>
        <b>25</b>
        <span>VT tests</span>
        <em>grid, modes, input, images</em>
      </div>
    </div>
    <p class="dim" style="margin-top:18px;font-size:13px">
      From the spike logs, which record the runs rather than the hopes.
      ${src('spikes/vt-render/README.md')} ${src('spikes/cef-osr/README.md')}
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>The command line</h2><span class="cap">Terminal-side</span></div>
    <p class="lede" style="margin-bottom:26px">
      Colouring and prediction happen in the terminal, not in your shell. Nothing to
      install, no plugin to keep current, and it works the same in pwsh, bash, zsh,
      fish and cmd — including over <code>ssh</code>, where a shell plugin is not yours to add.
    </p>

    <pre style="max-width:64ch"><code><span style="color:var(--signal)">❯</span> cargo test -p nus-vt --<span style="color:var(--ansi-blue)">nocapture</span> <span style="color:var(--ansi-green)">"kitty"</span><span class="dim">  --release</span>
  <span class="dim">└ command · flag · string · ghost from history</span></code></pre>

    <div class="ledger ledger--tight" style="max-width:none">
      ${row('Token classes', 'Command, flag, string, number, path, operator — classed as you type, coloured from the theme\'s ANSI slots.', src('spikes/composite/src/predict.rs'))}
      ${row('Prediction', 'The most recent history entry that continues the line ghosts after the caret. <kbd>Right</kbd> or <kbd>End</kbd> at the end of the line accepts it.')}
      ${row('How it knows', 'OSC 133 prompt marks say where the command begins, so the terminal can tell a command line from program output.')}
      ${row('History', 'Per profile, in <code>profile/history</code>. Recent commands are palette rows you can run again.')}
      ${row('Blocks', 'Each command is a block: a hairline where it starts, a gutter rule on hover, chips to copy its output or re-run it, <kbd>Ctrl</kbd>+triple-click to select the output, scrollbar ticks at the prompts.', src('crates/vt/src/term.rs', 778))}
      ${row('Shell hooks', 'Injected automatically — PowerShell <code>-EncodedCommand</code>, bash <code>--rcfile</code>, zsh <code>ZDOTDIR</code>, fish <code>-C</code>, cmd <code>PROMPT</code>. nushell already has it. <code>AUTO</code> or <code>OFF</code>.')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Syntax and language</h2><span class="cap">tree-sitter · LSP</span></div>
    <div class="ledger ledger--tight" style="max-width:none">
      ${row('tree-sitter', 'Bash and PowerShell grammars ride in the binary, for the prompt line and the ask panel\'s code blocks.', ST.in + ' ' + src('spikes/composite/src/syntax.rs'))}
      ${row('Other grammars', 'Load from <code>profile/grammars/&lt;name&gt;/</code> — the library <code>tree-sitter build</code> makes, plus <code>highlights.scm</code>. Rust, Python, JavaScript and JSON bundles wait on the release pipeline that builds them.', ST.flight)}
      ${row('LSP', 'An editor pane, with <code>lsp-types</code> and <code>lsp-server</code> behind it. Language servers are already in the optional-tools list — rust-analyzer fetches on <code>GET</code> into <code>profile/bin</code>.', ST.flight + ' ' + src('spikes/composite/assets/bundles.json'))}
      ${row('Optional tools', 'The welcome page asks once. Language servers, grammars and assistant CLIs, each fetched only when you say so, each a folder you can delete. <code>assets/bundles.json</code> is the list; <code>profile/bundles.json</code> adds to it.', ST.in + ' ' + src('spikes/composite/src/bundles.rs'))}
      ${row('Assistants', 'Whatever the machine has: <code>claude -p</code>, <code>codex exec</code>, the Copilot CLI through <code>gh</code>, <code>ollama run</code>, or the API through <code>curl</code>. <code>NUS_ASK_CMD</code> for anything else. The router is a config table.', ST.in + ' ' + src('spikes/composite/src/ask.rs'))}
      ${row('Ask', '<kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>?</kbd> beside a shell. One line in, command blocks out, each with <code>INSERT</code>, <code>RUN</code>, <code>COPY</code>. The shell, the folder and the last command\'s output go with the question. Not a chat.', ST.in)}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Localhost</h2><span class="cap">The dev suite</span></div>
    <p class="lede" style="margin-bottom:26px">
      A dev server is a first-class thing here, not a URL you paste somewhere else.
      Type it at the prompt and it opens in the pane beside the shell that started it.
    </p>
    <div class="ledger ledger--tight" style="max-width:none">
      ${row('Detected', '<code>localhost</code>, <code>127.0.0.1</code>, <code>*.local</code>, RFC-1918. Hazard tape around the page and in the URL field, so a dev server never passes for the real thing.', ST.in + ' ' + src('spikes/composite/src/sites.rs'))}
      ${row('Ports', 'What is listening, with the process name that owns it, as palette rows. Open one and the tape is already on.')}
      ${row('DevTools', 'A windowless CEF pane — console, network, elements — composited beside the page, not a detached window.', src('spikes/composite/src/webui.rs'))}
      ${row('Console → shell', 'The page\'s console mirrored into the terminal split, so one scrollback holds both halves of the bug.')}
      ${row('Responsive', 'Presets at 390 / 768 / 1440, and a screenshot taken from our own texture rather than the OS.')}
      ${row('Reload', 'On directory change. Progress rides the loading bar through OSC 9;4.')}
      ${row('The URL rule', 'A whole line at a fresh prompt that parses as a URL opens in the split on <kbd>↵</kbd>; <kbd>Ctrl</kbd><kbd>↵</kbd> runs it as a command instead. Any editing key disqualifies the line. Bare words never trigger.', src('docs/PRODUCT.md', 83))}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Against the field</h2><span class="cap">Two axes</span></div>
    <p class="dim" style="margin-bottom:22px;font-size:14px;max-width:64ch">
      nus is measured twice: as a terminal, and as a browser. The columns it loses
      are in the table too — a comparison that only shows wins is an advertisement.
    </p>

    <div class="tablewrap">
      <table class="matrix">
        <caption>${Y} in nus today &nbsp; ${P} in flight &nbsp; ${N} not present. Terminal axis.</caption>
        <thead><tr><th>As a terminal</th><th>nus</th><th>Ghostty</th><th>kitty</th><th>WezTerm</th></tr></thead>
        <tbody>
          ${mrow('Own VT core, GPU renderer', [Y, Y, Y, Y])}
          ${mrow('Kitty keyboard protocol', [Y, Y, Y, Y])}
          ${mrow('Kitty graphics', [Y, Y, Y, Y])}
          ${mrow('Sixel', [P, Y, N, Y])}
          ${mrow('Shell integration, no plugin', [Y, Y, N, N])}
          ${mrow('Command blocks', [Y, N, N, N])}
          ${mrow('Prediction without a shell plugin', [Y, N, N, N])}
          ${mrow('tree-sitter on the prompt line', [Y, N, N, N])}
          ${mrow('A browser tab as a peer', [Y, N, N, N])}
          ${mrow('Multiplexer built in', [Y, N, N, Y])}
          ${mrow('Scriptable config language', [Y, N, N, Y])}
        </tbody>
      </table>
    </div>

    <div class="tablewrap" style="margin-top:26px">
      <table class="matrix">
        <caption>${Y} in nus today &nbsp; ${P} in flight &nbsp; ${N} not present. Browser axis.</caption>
        <thead><tr><th>As a browser</th><th>nus</th><th>Arc</th><th>Dia</th><th>Zen</th></tr></thead>
        <tbody>
          ${mrow('Chromium engine', [Y, Y, Y, N])}
          ${mrow('Sidebar tabs, spaces, folders', [Y, Y, Y, Y])}
          ${mrow('Split view', [Y, Y, Y, Y])}
          ${mrow('Per-site boosts (CSS + JS)', [Y, Y, N, N])}
          ${mrow('Named containers / cookie jars', [Y, N, N, Y])}
          ${mrow('Picture-in-picture we own', [Y, N, N, N])}
          ${mrow('Reader mode', [Y, Y, N, Y])}
          ${mrow('Built-in content blocking', [Y, N, N, Y])}
          ${mrow('A shell as a peer pane', [Y, N, N, N])}
          ${mrow('Config as code, sandboxed', [Y, N, N, N])}
          ${mrow('Chrome extensions', [N, Y, Y, Y])}
          ${mrow('Shipping today', [N, Y, Y, Y])}
        </tbody>
      </table>
    </div>

    <p class="dim" style="margin-top:18px;font-size:13px;max-width:64ch">
      Extensions are the honest loss. Windowless CEF browsers are Alloy-style, and
      libcef does not attach the extension request proxy to them: extensions load but
      cannot see our tabs. Blocking, userscripts and password fill are built natively
      instead; our own libcef build is a later phase, not a v1 dependency.
      ${src('docs/ARCHITECTURE.md')}
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Customization</h2><span class="cap">Where it goes further</span></div>
    <p class="lede" style="margin-bottom:26px">
      The axis Arc and Zen stop at. Every surface is a value you can set, and the
      interesting ones are functions you can write.
    </p>
    <div class="ledger ledger--tight" style="max-width:none">
      ${row('rules.luau', '<code>new_tab(ctx)</code> and <code>new_space(ctx)</code> return a look; <code>on_page(ctx)</code> returns per-site CSS and JS; <code>on_event(ev)</code> returns a sound cue or silences it. Sandboxed: no <code>io</code>, no <code>os</code>, no FFI.', src('docs/PRODUCT.md', 188))}
      ${row('Surface', 'Ramps of 2–4 stops with angle, loop, aurora drift and breath. Textures — grain, stipple, stitch, linen, halftone, scale — on the carapace, the chrome or the panes, never on content or video.')}
      ${row('Theme', 'Paper, ink and page tokens per mode, sixteen ANSI colours with a real HSL picker, contrast grade and saturation. Import from Ghostty, Windows Terminal, VS Code or base16. Twenty stock themes, contrast-audited by a test.')}
      ${row('Cursor', 'Shape, hollow or hidden when unfocused, blink never / after 2s / always, colour, and motion: jump, glide or comet.')}
      ${row('Motion', 'One easing, 80–220 ms base, and a register slider from 0.45× snappy to 2.2× cinematic. Reduce-motion follows the OS or is forced.')}
      ${row('Scrolling', 'The shell rides neoscroll\'s curves — a line at a time on an eased clock, more ticks extending the trip. Pages keep Chromium\'s, switchable.', src('spikes/composite/src/scrolling.rs'))}
      ${row('Sound', 'Seventeen synth recipes on <code>cpal</code> across fourteen events, each previewable, each overridable from rules.', src('spikes/composite/src/sound.rs'))}
      ${row('Settings are the file', 'Every edit writes <code>~/.config/nus/init.luau</code>. The file is the source of truth and hot-reloads. Every settings row is also a palette row.')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Provenance</h2><span class="cap">Ported, not imitated</span></div>
    <div class="ledger ledger--tight" style="max-width:none">
      ${row('The caret', 'Neovide\'s cursor renderer, ported: four critically damped springs, leading corners fast and trailing ones slow, drawn as one quad. <code>TRAIL</code> is Neovide\'s <code>trail_size</code>.', src('spikes/composite/src/smear.rs'))}
      ${row('The scroll', 'neoscroll\'s curves.')}
      ${row('The parser', '<code>vte</code> drives the state machine. The grid, cursor, modes, palette and responses are ours.', src('crates/vt/src/lib.rs'))}
      ${row('The blocking', 'Brave\'s <code>adblock</code> engine, in CEF\'s resource request handler — so it works with nothing installed.')}
      ${row('Read, not copied', 'Ghostty for VT state design and the Kitty protocols, Alacritty for <code>vte</code> in practice, WezTerm for ConPTY\'s quirks. The polish passes were researched against Rio, kitty, Warp, Dia, Arc, Zen, Vivaldi and Orion.')}
      ${row('Type and icons', 'IBM Plex Mono and Newsreader, both OFL. Phosphor icons, MIT.')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Where it actually is</h2><span class="cap">Status</span></div>
    <div class="status">
      <div><dt>Stage</dt><dd><span class="lamp"></span>Pre-alpha</dd></div>
      <div><dt>Spikes cleared</dt><dd>4 of 4</dd></div>
      <div><dt>Runs today</dt><dd>Windows 11</dd></div>
      <div><dt>Public builds</dt><dd class="dim">None yet</dd></div>
    </div>
    <p class="dim" style="margin-top:20px;font-size:14px">
      The composite spike — compositor, navigation, shell integration, browser panes,
      21,000 lines of it — runs on Windows and is being moved into <code>crates/</code>.
      macOS and Linux have not been run at all. Nothing is packaged, so there is
      nothing to download. <a href="./docs/spikes/">The spike log</a> is the honest version.
    </p>
    <div class="row" style="margin-top:24px">
      <a class="btn btn--signal" href="${SITE.repo}/subscription" target="_blank" rel="noopener noreferrer">${icon('broadcast')}Watch for releases</a>
      <a class="btn btn--quiet" href="./download/">Build from source</a>
    </div>
  </div>
</section>
`
};
