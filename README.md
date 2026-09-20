# nus.dev

The site for [nus](https://github.com/cbassuarez/nus) — *terminus*, a terminal
emulator that is also a browser. Published at **[nus.dev](https://nus.dev)**.

Static HTML with no dependencies. `node scripts/build.mjs` writes the pages;
the output is committed, so GitHub Pages serves the repo directly with no CI
step and no install.

## Build

```
npm run build     # write the pages
npm run dev       # write them, then serve on http://localhost:8000
npm run sync      # pull the app's screenshots out of ../nus into assets/shots/
npm run releases  # refresh assets/releases.json, the download page's fallback
npm run packaging # write the Homebrew cask and winget manifests from it
npm run vendor:cuelume -- 0.2.2  # intentionally refresh the pinned site sound library
npm run wasm      # rebuild the VT core for the browser  (needs Rust + wasm-pack)
npm run record    # re-record the hero session           (needs the nus checkout)
```

Node 18 or newer. There is no `npm install` — the build has no dependencies,
including the Markdown renderer. `wasm` and `record` are the only steps that
need a toolchain, and their outputs are committed, so a plain `npm run build`
works on a clean checkout.

## Layout

```
index.html  about/  download/  docs/     generated — do not edit
content/*.md                             the docs, written for this site
scripts/
  build.mjs        the whole build
  layout.mjs       page shell: head, masthead, footer, icons
  markdown.mjs     the Markdown subset the docs use
  window.mjs       the app window, rebuilt in HTML
  pages/*.mjs      body of each hand-written page
  sync-docs.mjs    assets/shots/ ← ../nus/docs/media/
  checks/          dev-only harnesses (not linked from the site)
assets/
  css/site.css     the Broadsheet design system
  js/site.js       theme, signal, scrollspy
  fonts/           IBM Plex Mono + Newsreader Italic, subset to woff2 (OFL)
  icon/  icons/    app icon, and Phosphor icons (MIT)
CNAME                                    nus.dev
```

Editing a page means editing `scripts/pages/*.mjs` or `content/*.md` and
rebuilding — never the generated HTML, which is overwritten.

## The hero terminal

The shell in the hero is not a mockup and not a video. It is a recorded PTY
session replayed through **nus's own VT core compiled to WebAssembly**, so
every glyph's position, colour, width and wrap is decided by the same
`nus_vt::Term` the application runs.

```
wasm/vt-wasm/          a wasm-bindgen shim over nus-vt (pinned by git rev)
assets/wasm/           the built artifact, committed — 224 KB
casts/nus-vt.cast      the recording, asciinema v2, plain text
casts/session.txt      what gets typed during a recording
casts/zdotdir/.zshrc   the OSC 133 prompt nus installs for zsh
assets/js/terminal.js  the canvas painter and transport
```

`crates/vt` depends only on `vte`, `bitflags`, `unicode-width` and `png`, so it
cross-compiles to `wasm32-unknown-unknown` unmodified. The grid crosses into
JavaScript as a flat `u32` array read through a `Uint32Array` view on wasm
memory — four words per cell, no copy and no JSON.

Because it is the real parser, the page gets the real behaviour for free: OSC
133 marks make `at_prompt()` answer, the theme toggle repaints through
`Palette::set_base` rather than a CSS filter, and resizing reflows the grid.

To re-record, with the nus checkout at `../nus`:

```
cd ../nus
ZDOTDIR=../nus-site/casts/zdotdir \
  python3 ../nus-site/scripts/record-cast.py ../nus-site/casts/nus-vt.cast \
  --cols 80 --rows 24 --max-seconds 3 --send ../nus-site/casts/session.txt -- zsh -i
```

Bump `wasm/vt-wasm/Cargo.toml`'s pinned `rev` and the revision named in the
hero caption together — the caption is a claim about which commit painted the
page, so it has to stay true.

## Screenshots

Real captures of the running app live in `docs/media/` in the **app** repo, so
they are versioned with the thing they show. `npm run sync` copies them into
`assets/shots/`.

nus runs on Windows today, so they have to be taken there. The shot list the
site wants, one file each:

| File | What |
|---|---|
| `window-browser.png` | The browser half: sidebar revealed with a stack and the PORTS folder, a page on localhost with its hazard tape, devtools beside it |
| `panel-palette.png` | ⌘K mid-query, tabs above actions |
| `panel-ask.png` | Ask with a question answered and command blocks out |
| `panel-folders.png` | The sidebar showing PORTS and GITHUB filled |
| `panel-atlas.png` | The atlas over a launch |
| `panel-stacks.png` | The sidebar with a stack nested two deep |
| `panel-site.png` | The site panel open on a host |
| `panel-tiles.png` | Three tabs tiled as an L |
| `panel-peek.png` | A peek floating over a page |
| `panel-pip.png` | PiP over another tab |
| `panel-compact.png` | Compact, with a row hovered |

Capture the whole window, PNG, no OS shadow, and take each one **twice** —
once in paper and once in ink — suffixed `-paper` / `-ink`, so the page can
swap with the theme the way everything else does. Note the scale factor in the
commit message; the site needs it to size them without guessing.

The shell in the hero does **not** want a screenshot: it is live, and a still
would be a downgrade.

## Design

The site is drawn from the same tokens as the app: see
[`docs/DESIGN.md`](https://github.com/cbassuarez/nus/blob/main/docs/DESIGN.md)
in the app repo, which is the source of truth. `assets/css/site.css` mirrors it.
Change the app's design doc first, then the CSS.

The hero is not a screenshot — it is the app window rebuilt in HTML, so it
follows the visitor's theme and the signal colour they pick in the masthead,
and it obeys nus's own width rule (no split under 900px, no sidebar under 640).

## Docs

`docs/<slug>/` pages are generated from `content/*.md`. Those files are the
public account of the app — organised by topic, in the present tense, with
no dates, passes or working notes — and are written here, not copied from
the app repo's `docs/`, which are its working notes. When the app changes,
change the page that describes it and rebuild.

`content/MEASUREMENTS.md` carries every number the site quotes, with how it
was taken; the home page's figures come from there.

## Installing

`install.sh` and `install.ps1` at the root are served as-is and are what the
download page's one-liners run: find the newest release with a package for
the machine, verify it against the release's `SHA256SUMS.txt`, unpack, put
`nus` on PATH. They talk to GitHub Releases directly, so they work wherever
the site is hosted.

`scripts/packaging.mjs` writes `packaging/homebrew/Casks/nus.rb` and the
winget manifests from `assets/releases.json`. The release-snapshot workflow
runs it and pushes the cask to `cbassuarez/homebrew-tap` when a `TAP_TOKEN`
secret (contents: write on the tap) exists; winget manifests are submitted
to microsoft/winget-pkgs by hand or with `wingetcreate`.

`scripts/markdown.mjs` covers the subset those files use — headings,
paragraphs, lists, pipe tables, fenced code, blockquotes, and the inline set.
If the docs outgrow it, swap in a real parser there; the build only calls
`render()`.

## Checks

Run `npm run dev`, then:

- **`/scripts/checks/overflow.html`** loads every page in an iframe at 390, 768
  and 1440 px and reports any horizontal overflow.
- **`/scripts/checks/replay.html`** drives the hero terminal to fixed points in
  the recording and paints each one, with the cursor position, `at_prompt` and
  title beneath — so the replay can be checked without waiting on wall-clock
  time, and regressions in the painter are obvious.

## Deployment

Pages serves `main` at the repo root. `CNAME` points at `nus.dev`; see
[SETUP.md](SETUP.md) for the DNS records.

## Licence

Site code MIT, same as the app. Bundled fonts are OFL (IBM Plex Mono,
Newsreader), the icons are Phosphor (MIT), and the pinned Cuelume interaction
sound library is MIT — see `assets/fonts/OFL-*.txt`, `assets/icons/LICENSE`,
and `assets/vendor/cuelume/0.2.2/LICENSE`.
