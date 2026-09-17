import { icon, SITE } from '../layout.mjs';
import { appWindow } from '../window.mjs';

const card = (ic, title, body, more) => `<${more ? 'a' : 'div'} class="card"${more ? ` href="${more[1]}"` : ''}>
  <h3>${icon(ic)}${title}</h3>
  <p>${body}</p>
  ${more ? `<span class="card__more">${more[0]} →</span>` : ''}
</${more ? 'a' : 'div'}>`;

const key = (chord, what) => `<div>
  <span class="k">${chord.split(' ').map((c) => `<kbd>${c}</kbd>`).join('')}</span>
  <span class="v">${what}</span>
</div>`;

const swatch = (name, hex, style = '') =>
  `<div class="swatch"><div class="swatch__chip" style="background:${style || hex}"></div>
   <div class="swatch__name">${name}<br><span class="swatch__hex">${hex}</span></div></div>`;

export default {
  title: 'nus',
  path: '/',
  depth: 0,
  description:
    'nus (terminus) is a terminal emulator that is also a browser: one window, ' +
    'own VT core, GPU-composited Chromium, sandboxed Luau config. Pre-alpha, MIT.',
  body: `
<section class="hero">
  <div class="hero__in">
    <h1 class="hero__title">A terminal emulator that is <em>also</em> a browser.</h1>
    <p class="hero__lede">
      One window. Tabs that are shells and tabs that are pages, peers in the same
      list, split beside each other. Type a URL at a prompt and it opens in the pane
      next door. No multiplexer, no second app, no webview pretending to be a UI.
    </p>

    <div class="hero__acts">
      <a class="btn btn--fill" href="./docs/">${icon('book-open-text')}Read the docs</a>
      <a class="btn" href="${SITE.repo}" target="_blank" rel="noopener noreferrer">${icon('github-logo')}Source</a>
      <a class="btn btn--quiet" href="./download/">${icon('download-simple')}Builds</a>
    </div>

    <div class="hero__meta">
      <span class="chip chip--signal">Pre-alpha</span>
      <span>MIT</span>
      <span>Rust · wgpu · CEF</span>
      <span>Windows 11 · macOS · Linux</span>
    </div>

    <div class="hero__win">
      ${appWindow()}
      <div class="hero__caption">
        <span>Fig. 1</span>
        <span class="dim">
          The window, drawn here from the same tokens the app renders from —
          it takes your theme and the signal you picked above.
        </span>
      </div>
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
      The four de-risking spikes are done and the composite spike — compositor,
      navigation, shell integration, browser panes — runs on Windows. macOS and
      Linux runs are outstanding, and the spike code is still being moved into the
      real crates. Nothing is packaged, so there is nothing to download.
      <a href="./docs/spikes/">The spike log</a> records what each one answered.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Four commitments</h2><span class="cap">Architecture</span></div>
    <div class="grid grid--quad">
      ${card('terminal-window', 'Our own VT core',
        'A real terminal, not an embedded one. <code>vte</code> for the state machine; grid, scrollback and modes ours. Kitty keyboard and graphics, ligatures, 2.8&nbsp;ms key&nbsp;→&nbsp;pixel measured rather than guessed.')}
      ${card('globe', 'Chromium, composited by us',
        'CEF offscreen on the Chrome runtime. Each tab paints into a wgpu texture — shared texture where the platform allows it. Ad-blocking is Brave’s <code>adblock</code> engine in the resource handler, so it works with nothing installed.')}
      ${card('squares-four', 'One window model',
        'Windows → tabs → splits. A shell tab and a page tab are peers in one list; a tab is one pane or a left|right pair. We own the compositor, so splits, previews and PiP behave the same on all three OSes.')}
      ${card('code', 'Config is a sandboxed language',
        'Luau through <code>mlua</code>: no <code>io</code>, no <code>os</code>, no FFI, no arbitrary <code>require</code>. A curated table for keybinds, themes, profiles and hooks — and <code>rules.luau</code>, which decides what a new tab looks like.')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>A URL at the prompt</h2><span class="cap">The idea</span></div>
    <p class="lede" style="margin-bottom:26px">
      The feature the rest of the design is built around. Type a URL at a fresh
      prompt, press Enter, and nus clears the line and opens the page in the split
      beside the shell — instead of handing it to a browser in another app.
    </p>

    <pre style="max-width:62ch"><code><span style="color:var(--signal)">❯</span> localhost:5173
  ↵ opens in browser · ctrl+↵ runs in shell</code></pre>

    <div class="ledger" style="max-width:none">
      <div class="ledger__row"><span class="cap">What counts</span><p class="mb0">
        A scheme, <code>localhost[:port]</code>, or <code>host.tld[/path]</code> with a known TLD —
        and only when it is the whole line at a fresh prompt. Bare words never trigger it.</p></div>
      <div class="ledger__row"><span class="cap">What disqualifies</span><p class="mb0">
        Any editing key — arrows, history, a <kbd>Ctrl</kbd> chord — takes the line out of the
        running until the next Enter. The hint disappears with it.</p></div>
      <div class="ledger__row"><span class="cap">Local sites are marked</span><p class="mb0">
        <code>localhost</code>, <code>127.0.0.1</code>, <code>*.local</code> and RFC-1918 addresses get
        hazard tape around the page and in the URL field, so a dev server never
        passes for the real thing.</p></div>
      <div class="ledger__row"><span class="cap">It is a hook</span><p class="mb0">
        Implemented as <code>on_output(tab, line)</code> in the config API — the same hook your
        own rules get, so you can replace it.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Built, not planned</h2><span class="cap">In the spike today</span></div>
    <div class="grid">
      ${card('command', 'Shell integration, auto-injected',
        'OSC 133 prompt marks, OSC 7 cwd and OSC 9;4 progress, with bundled hooks for pwsh, bash, zsh, fish and cmd. It buys prompt jumping, DONE/FAILED badges, the window’s name from the cwd, and no close-confirm at a prompt.')}
      ${card('stack', 'Blocks and stacks',
        'Every command is a block with a hairline, a gutter rule, and chips to copy its output or run it again. A tab that spawns another nests under it; a stack collapses to one row and walks with <kbd>⌘⇧[ ]</kbd>.')}
      ${card('picture-in-picture', 'Our own picture-in-picture',
        'The tab’s texture cropped to the video, drawn into a small always-on-top window — no second decode and no DRM problem. Transport keys act through CDP, so sites cannot hide them.')}
      ${card('sparkle', 'Ask, beside the shell',
        'One line in, a few command blocks out, each with INSERT, RUN and COPY. Backends are whatever the machine has: <code>claude -p</code>, <code>codex exec</code>, ollama, the Copilot CLI, or the API through curl.')}
      ${card('shield-check', 'Containers',
        'Named cookie jars, one CEF request context each. A window’s container colours its square and names its title; pages open in it, and a page can be reopened in another.')}
      ${card('palette', 'A look studio',
        'Surfaces, ramps, textures on the carapace, sixteen ANSI colours with a real picker, twenty stock themes, and a live proof of the window at the top of the page that changes as you change it.')}
    </div>
    <p class="dim" style="margin-top:22px;font-size:14px">
      All of it on Windows, inside the composite spike, pending the move into
      <code>crates/</code>. <a href="./docs/product/">The product log</a> records each pass and what it settled.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Broadsheet</h2><span class="cap">Design</span></div>
    <p class="lede" style="margin-bottom:28px">
      Ink on paper, one monospace face, rules instead of boxes, and one colour on
      screen: the Space’s signal. Nothing blurs, nothing is rounded, nothing is
      translucent. This page is drawn from the same tokens.
    </p>

    <div class="swatches" style="margin-bottom:26px">
      ${swatch('Signal', 'the one colour', 'var(--signal)')}
      ${swatch('Paper', '#f4f1ea')}
      ${swatch('Ink', '#141414')}
      ${swatch('Dim', '#8a857a')}
      ${swatch('Page', '#ffffff')}
    </div>

    <div class="grid grid--2">
      ${card('keyboard', 'Hierarchy by weight and case',
        'Never by colour. Rule weights are 1 hairline, 1.5 structure, 2 floating and a 6px signal band. Radii are 0 everywhere; shadows are hard offsets with no blur, ever.')}
      ${card('book-open-text', 'One face, one exception',
        'IBM Plex Mono for the UI and the terminal alike. Newsreader Italic appears only as a wordmark — <em class="serif">nus</em>, <em class="serif">go</em>, <em class="serif">quick</em> — and nowhere else.')}
    </div>

    <p style="margin-top:24px"><a class="btn btn--quiet" href="./docs/design/">${icon('palette')}The design record</a></p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Keys</h2><span class="cap">macOS shown</span></div>
    <p class="dim" style="margin-bottom:22px;font-size:14px">
      App chords are ⌘ on macOS and <kbd>Ctrl</kbd><kbd>Shift</kbd> on Windows and Linux, so they
      never reach the shell. <kbd>Ctrl</kbd><kbd>1–9</kbd> is the one plain-Ctrl chord: shells do not use it.
    </p>
    <div class="keys">
      ${key('⌘K', 'The palette, in <em>go</em> mode')}
      ${key('⌘T', 'New tab — profiles, or a URL')}
      ${key('⌘L', 'Address the browser pane')}
      ${key('⌘D', 'Toggle the browser split')}
      ${key('⌘⇧S', 'Pin the sidebar')}
      ${key('⌥⌘T', 'Quick terminal, over any app')}
      ${key('⌘↵', 'Open the detected URL in the split')}
      ${key('⌘1–9', 'Tab by position')}
      ${key('⌘Z', 'Reopen the last closed tab')}
      ${key('⌃`', 'Cycle tabs, most recent first')}
      ${key('⌘⇧R', 'Reader mode')}
      ${key('⌘⇧?', 'Ask, beside the shell')}
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>The record</h2><span class="cap">Docs</span></div>
    <div class="grid grid--quad">
      ${card('network', 'Architecture', 'The host, the crates, and why the compositor is ours. Each entry is a commitment, not a suggestion.', ['Read', './docs/architecture/'])}
      ${card('palette', 'Design', 'Broadsheet: tokens, type, rules, spacing, and every surface the app draws.', ['Read', './docs/design/'])}
      ${card('squares-four', 'Product', 'Thirteen passes of settled behaviour — navigation, stacks, sound, the look studio, containers.', ['Read', './docs/product/'])}
      ${card('hard-hat', 'Spikes', 'Four throwaway binaries, each one able to kill the design. What they answered, and when.', ['Read', './docs/spikes/'])}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="section__in">
    <div class="row" style="gap:20px">
      <div style="flex:1 1 320px">
        <h2 style="margin-bottom:8px">No builds yet.</h2>
        <p class="dim mb0" style="font-size:14px">
          When there are, they will be notarized on macOS, signed on Windows, and
          self-updating from GitHub Releases. No telemetry, then or ever.
        </p>
      </div>
      <div class="row">
        <a class="btn btn--signal" href="${SITE.repo}/subscription" target="_blank" rel="noopener noreferrer">${icon('broadcast')}Watch for releases</a>
        <a class="btn btn--quiet" href="./download/">What to expect</a>
      </div>
    </div>
  </div>
</section>
`
};
