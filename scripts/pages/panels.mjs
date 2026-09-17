import { icon, SITE } from '../layout.mjs';
import * as panel from '../panels.mjs';

const src = (path, line) => {
  const parts = path.split('/');
  const base = parts[parts.length - 1];
  const label = /^(README|index|mod|lib|main)\./i.test(base) ? parts.slice(-2).join('/') : base;
  return `<a class="src" href="${SITE.repo}/blob/main/${path}${line ? `#L${line}` : ''}"` +
    ` target="_blank" rel="noopener noreferrer">${label}${line ? `:${line}` : ''}</a>`;
};

/** One large panel with its explanation beside it; rows alternate sides. */
const item = ({ art, ic, name, chord, why, spec, source }) => `
<div class="panelrow">
  <div class="panelrow__art">${art}</div>
  <div class="panelrow__say">
    <h3>${icon(ic)}${name}${chord ? `<span class="panelrow__chord">${chord}</span>` : ''}</h3>
    <p>${why}</p>
    <ul class="spec">
      ${spec.map(([i, t]) => `<li>${icon(i)}<span>${t}</span></li>`).join('')}
    </ul>
    ${source}
  </div>
</div>`;

const group = (n, title, note, items) => `
<section class="section">
  <div class="section__in">
    <div class="sectionhead">
      <h2><span class="sectionhead__n">${n}</span>${title}</h2>
      <span class="cap">${note}</span>
    </div>
    ${items}
  </div>
</section>`;

export default {
  title: 'Panels',
  path: '/panels/',
  depth: 1,
  bodyClass: 'panels-page',
  description:
    'The surfaces nus puts in front of you — the palette, ask, live folders, the ' +
    'atlas, stacks, the site panel, tiles, peek, picture-in-picture and compact — ' +
    'drawn from the app’s own tokens, each linking the module that builds it.',
  body: `
<section class="section">
  <div class="section__in">
    <h1 style="margin-bottom:16px">The panels</h1>
    <p class="lede">
      What the app actually puts in front of you. Each one below is drawn from the
      same tokens, rule weights and metric table the application draws it with, and
      links the module that builds it. The descriptions are those modules’ own,
      compressed — nothing here was invented for a website.
    </p>
    <p class="dim" style="font-size:13px;max-width:62ch">
      Everything on this page runs today inside the composite spike on Windows.
      <a href="../docs/spikes/">The spike log</a> says what that means.
    </p>
  </div>
</section>

${group('01', 'At the prompt', 'The shell half', `
  ${item({
    art: panel.palette(),
    ic: 'command', name: 'The palette', chord: '⌘K',
    why: `One field for everything addressable: your tabs first, then actions, then
      opening or searching what you typed. URL and search are auto-detected and
      <em>both</em> rows are always offered, so it never guesses wrong on your behalf.
      Every settings row is a palette row too, which is why there is no menu bar.`,
    spec: [
      ['magnifying-glass', '<b>go</b> — tabs, actions, open or search'],
      ['plus', '<b>new</b> — profiles for a shell, or a URL for a page'],
      ['link', '<b>url</b> — address the browser pane'],
      ['clock-counter-clockwise', 'Recent commands come back as rows you can run again']
    ],
    source: src('docs/PRODUCT.md', 96)
  })}

  ${item({
    art: panel.ask(),
    ic: 'sparkle', name: 'Ask', chord: '⌘⇧?',
    why: `A panel beside the shell for the moment you feel dumb. One line in, a few
      command blocks out. It can answer “why did that fail?” because the shell, the
      working directory and the last command’s output are already attached to the
      question — you are not pasting context into a chat window.`,
    spec: [
      ['key-return', '<b>Insert</b> at the prompt, <b>Run</b>, or <b>Copy</b>'],
      ['terminal-window', 'Backends are whatever the machine has: <code>claude -p</code>, <code>codex exec</code>, Copilot through <code>gh</code>, <code>ollama</code>, or the API through <code>curl</code>'],
      ['gear-six', '<code>NUS_ASK_CMD</code> takes anything that reads a prompt on stdin'],
      ['chat-circle-dots', 'Not a chat — the last few turns stay for scrolling, nothing more']
    ],
    source: src('spikes/composite/src/ask.rs')
  })}
`)}

${group('02', 'Down the side', 'What the sidebar is for', `
  ${item({
    art: panel.ports(),
    ic: 'plugs-connected', name: 'Live folders',
    why: `A region under the tabs that fills itself. <b>PORTS</b> is what is listening
      on this machine right now, carrying the process that owns each one, with system
      services filtered out. <b>GITHUB</b> is the pull requests that involve you, from
      <code>gh</code>, off the main thread. The rest are yours.`,
    spec: [
      ['cursor-click', 'An item opens in place, or goes to the tab that already has it'],
      ['code', '<code>folders</code> in <code>rules.luau</code> — a static list, or a function that returns one'],
      ['push-pin', 'A page saved into a folder never archives'],
      ['hard-hat', 'Opening a port brings its hazard tape with it']
    ],
    source: src('spikes/composite/src/folders.rs')
  })}

  ${item({
    art: panel.stacks(),
    ic: 'stack', name: 'Stacks, coloured by rule',
    why: `A tab that spawns another nests under it, as deep as it goes — a shell that
      opens a URL, a page that opens a link, an agent that opens a tab. A stack folds
      to one row and walks with <kbd>⌘⇧[ ]</kbd>. What each one <em>looks</em> like is
      not ours to decide: <code>new_tab(ctx)</code> is handed the kind, the index, the
      profile, the theme and the parent’s colours, and returns a look.`,
    spec: [
      ['shuffle', 'Drag a row onto another to nest it, or between rows to move it'],
      ['code', '<code>new_space</code>, <code>on_page</code> → boosts, <code>on_event</code> → a sound cue'],
      ['shield-check', 'Sandboxed Luau: no <code>io</code>, no <code>os</code>, no FFI'],
      ['arrows-clockwise', 'Hot-reloads on save; RESET returns to Broadsheet']
    ],
    source: src('docs/PRODUCT.md', 188)
  })}

  ${item({
    art: panel.atlas(),
    ic: 'planet', name: 'The atlas',
    why: `What greets a launch: the last session to restore, and the recent pages,
      shells and windows to pick from instead. The icon’s band completes one orbit as
      the panel rises. Esc starts fresh. It is never on the splash — the splash is the
      drawing and nothing else.`,
    spec: [
      ['clock-counter-clockwise', 'Restores profiles, cwds, URLs, scroll — and each shell’s scrollback as read-only history above the fresh prompt'],
      ['planet', 'The planet in the header calls it back later'],
      ['gear-six', 'On demand, on launch, or persistent']
    ],
    source: src('spikes/composite/src/start.rs')
  })}
`)}

${group('03', 'On the page', 'The browser half', `
  ${item({
    art: panel.site(),
    ic: 'shield-check', name: 'The site panel',
    why: `The gear at the end of a URL row, per host. Zoom that is remembered,
      autoplay, JavaScript, cookies to block or clear, the rules’ boosts, content
      blocking — and every permission the site was ever given, each one forgettable.
      Band answers are remembered and answered without asking again.`,
    spec: [
      ['code', 'Kept in <code>profile/sites.json</code>'],
      ['network', 'The request handlers read the same table, so it applies as the page loads'],
      ['hard-hat', 'Local sites are marked here and around the page']
    ],
    source: src('spikes/composite/src/sites.rs')
  })}

  ${item({
    art: panel.peek(),
    ic: 'corners-out', name: 'Peek', chord: 'Alt+click',
    why: `Alt-click a link and it floats over the page behind a scrim, without your
      leaving. Esc or a click outside closes it; <kbd>Ctrl</kbd><kbd>↵</kbd> keeps it
      as a page in the tab’s stack. A peek is a tab the sidebar does not list, so every
      pane path already serves it — there is no second code path to keep honest.`,
    spec: [
      ['stack', 'Keeping it lands it in the stack, unfocused'],
      ['squares-four', 'Nothing blurs: the scrim is flat, the edge is 2px, the shadow is a hard offset']
    ],
    source: src('spikes/composite/src/peek.rs')
  })}

  ${item({
    art: panel.pip(),
    ic: 'picture-in-picture', name: 'Picture-in-picture',
    why: `Ours, in the compositor — not Chromium’s. The tab’s own texture, cropped to
      the video’s rect by an injected script that also scrolls it into view, drawn into
      a small always-on-top window. No second decode and no DRM problem. It appears
      when a playing video’s tab leaves view and goes back when you return to it.`,
    spec: [
      ['keyboard', 'Transport keys act on the element through CDP, so sites cannot hide them'],
      ['arrows-out-cardinal', '←/→ ±10s · Space play-pause · ,/. frame-step · ↑/↓ volume'],
      ['cursor-click', 'Wheel scales around the cursor; corners snap']
    ],
    source: src('spikes/composite/src/pip.rs')
  })}
`)}

${group('04', 'Across both', 'Shape of the window', `
  ${item({
    art: panel.tiles(),
    ic: 'squares-four', name: 'Tiles', chord: 'Ctrl+⇧+D',
    why: `Select tabs with <kbd>Ctrl</kbd>+click, then tile them: two side by side,
      three as an L, four as a grid. The tiling belongs to <em>those tabs</em> and shows
      whenever one of them is active, so it is a property of your work rather than a
      mode you are in.`,
    spec: [
      ['arrows-left-right', 'Dividers drag; <kbd>Ctrl</kbd><kbd>Alt</kbd>+arrows walk, with Shift to swap'],
      ['x', 'Closing a tiled tab re-tiles the rest'],
      ['terminal-window', 'A shell and a page tile together — they are peers']
    ],
    source: src('spikes/composite/src/tiles.rs')
  })}

  ${item({
    art: panel.compact(),
    ic: 'sidebar-simple', name: 'Compact', chord: 'Ctrl+⇧+B',
    why: `The sidebar down to a 48px column of icons, the top strip hidden until the
      pointer reaches the edge. They are the same rows, so clicks, drags, selection and
      the tab menu all work unchanged — this is a width, not a mode.`,
    spec: [
      ['tag', 'The hovered row’s name shows beside the column'],
      ['squares-four', 'Under 900px the split collapses and settings become tiles that drill in'],
      ['sidebar-simple', 'Side, reveal, grace and fullscreen behaviour are all config']
    ],
    source: src('spikes/composite/src/compact.rs')
  })}
`)}

<section class="section section--tight">
  <div class="section__in">
    <div class="row" style="gap:20px">
      <div style="flex:1 1 320px">
        <h2 style="margin-bottom:8px">There is more than fits here.</h2>
        <p class="dim mb0" style="font-size:14px">
          Reader mode, the quick terminal, containers, boosts, the look studio, focus,
          blocks, hints, find in scrollback. The product log records every pass.
        </p>
      </div>
      <div class="row">
        <a class="btn btn--fill" href="../docs/product/">${icon('squares-four')}The product log</a>
        <a class="btn btn--quiet" href="../docs/">${icon('book-open-text')}The record</a>
      </div>
    </div>
  </div>
</section>
`
};
