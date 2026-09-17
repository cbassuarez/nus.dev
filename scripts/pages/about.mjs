import { icon, SITE } from '../layout.mjs';

export default {
  title: 'About',
  path: '/about/',
  depth: 1,
  description:
    'What nus is, what it refuses to be, where the name comes from, and what ' +
    '“personal software” means for something you can still fork.',
  body: `
<section class="section">
  <div class="section__in">
    <h1 style="margin-bottom:18px">About</h1>
    <p class="lede">
      nus is a terminal emulator that is also a browser. It is personal software,
      written for one person’s working day, and MIT-licensed so that using it never
      requires a conversation about licensing.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>The premise</h2><span class="cap">Why</span></div>
    <p>
      Work that starts in a shell rarely stays there. A dev server prints a URL, a
      stack trace names a doc, a test fails against an API you have to go read. The
      usual answer is a second application, a window manager and a habit of
      alt-tabbing, and the two halves never learn anything about each other.
    </p>
    <p>
      nus puts them in one window and makes them peers. A shell tab and a page tab
      sit in the same list, split beside one another, restored together. A URL typed
      at a prompt opens next door rather than somewhere else. The terminal knows the
      browser exists; the browser knows which directory you are in.
    </p>
    <p>
      That is the whole idea. Everything in
      <a href="./../docs/architecture/">the architecture</a> follows from wanting it to
      be true without compromise: our own VT core so the terminal is real, Chromium
      offscreen so the browser is real, and our own compositor so neither one is a
      guest in the other’s window.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>What it refuses</h2><span class="cap">Constraints</span></div>
    <div class="ledger" style="max-width:none">
      <div class="ledger__row"><span class="cap">No HTML in the UI</span><p class="mb0">
        The chrome is a hand-rolled retained scene graph on wgpu. The only web content
        in the process is the page you asked for. A UI built from the same engine as
        the untrusted content is a category error, and it is also slow.</p></div>
      <div class="ledger__row"><span class="cap">No multiplexer</span><p class="mb0">
        Windows, tabs and splits are the app’s own. Nothing is nested inside a second
        program that has its own idea of what a pane is.</p></div>
      <div class="ledger__row"><span class="cap">No config that can read your disk</span><p class="mb0">
        Luau in a sandbox: no <code>io</code>, no <code>os</code>, no FFI, no arbitrary
        <code>require</code>. A config file people copy from the internet should not be
        able to do anything interesting to the machine.</p></div>
      <div class="ledger__row"><span class="cap">No telemetry</span><p class="mb0">
        Not off by default — absent. Crashes write a local log.</p></div>
      <div class="ledger__row"><span class="cap">No Chrome extensions in v1</span><p class="mb0">
        Decided after a spike said no rather than hoped so: windowless CEF browsers are
        Alloy-style, and the extension request proxy never attaches to them. Ad-blocking,
        userscripts and password filling are built natively instead, and the escape hatch
        — our own libcef build — is a later phase, not a dependency.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>The name</h2><span class="cap">nus · terminus</span></div>
    <p>
      <em class="serif" style="font-size:22px">terminus</em> — an end point, and the root
      the word <em>terminal</em> comes from. <em class="serif" style="font-size:22px">nus</em>
      is its last three letters, which is what you type. The icon is a Newsreader
      italic <em class="serif">n</em> with an open tapered band in orbit, heavier at the
      belly and tilted −24°: a meatball, if you grew up on NASA insignia.
    </p>
    <div class="row" style="gap:20px;align-items:flex-end;margin-top:26px">
      <img src="../assets/icon/nus-256.png" alt="The nus icon: an italic n crossed by an orbiting band."
           width="112" height="112" style="border:2px solid var(--ink);box-shadow:6px 6px 0 var(--ink)">
      <p class="dim mb0" style="font-size:13px;max-width:38ch">
        The live icon follows the current theme and signal; the bundled one ships
        Broadsheet. The splash screen is the same drawing and nothing else, and it
        fades once the first tab has painted.
      </p>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Personal software</h2><span class="cap">What that means</span></div>
    <p>
      nus is built to one person’s taste and does not take feature requests as
      obligations. There is no roadmap you are on, no plan to grow it, and no
      support commitment. Decisions get made once and written down, and the
      documents in <a href="./../docs/">the record</a> are the real ones — when a
      decision changes, the document changes with it.
    </p>
    <p>
      It is also MIT. Fork it, cut it up, ship something else with it. The licence
      exists so the answer to “can I…” is always yes and nobody has to ask.
    </p>
    <div class="row" style="margin-top:26px">
      <a class="btn" href="${SITE.repo}" target="_blank" rel="noopener noreferrer">${icon('github-logo')}Source</a>
      <a class="btn btn--quiet" href="./../docs/">${icon('book-open-text')}The record</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Credits</h2><span class="cap">Standing on</span></div>
    <div class="ledger" style="max-width:none">
      <div class="ledger__row"><span class="cap">Read, not copied</span><p class="mb0">
        Ghostty for VT state design and the Kitty protocols, Alacritty for
        <code>vte</code> in practice, WezTerm for ConPTY’s quirks. The polish pass was
        researched against Rio, kitty, Warp, Dia, Arc, Zen, Vivaldi and Orion.</p></div>
      <div class="ledger__row"><span class="cap">Libraries</span><p class="mb0">
        winit, wgpu, vte, portable-pty, swash, rustybuzz, mlua, cef-rs, Brave’s
        <code>adblock</code>, cpal, AccessKit. <a href="./../docs/dependencies/">The list</a>.</p></div>
      <div class="ledger__row"><span class="cap">Type &amp; icons</span><p class="mb0">
        IBM Plex Mono and Newsreader, both OFL. Phosphor icons, MIT.</p></div>
      <div class="ledger__row"><span class="cap">Written by</span><p class="mb0">
        ${SITE.author}.</p></div>
    </div>
  </div>
</section>
`
};
