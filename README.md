# nus.dev

The site for [nus](https://github.com/cbassuarez/nus) — *terminus*, a terminal
emulator that is also a browser. Published for now at
**[cbassuarez.github.io/nus.dev](https://cbassuarez.github.io/nus.dev/)**,
with **cbassuarez.com/nus.dev** retained as the canonical/final destination.

Static HTML with no dependencies. `node scripts/build.mjs` writes the pages;
the output is committed, so GitHub Pages serves the repo directly with no CI
step and no install.

## Build

```
npm run build     # write the pages
npm run dev       # write them, then serve on http://localhost:8000
npm run sync      # pull the app's screenshots out of ../nus into assets/shots/
npm run releases  # refresh assets/releases.json, the download page's fallback
npm run vendor:cuelume -- 0.2.2  # intentionally refresh the pinned site sound library
npm run wasm      # rebuild the VT core for the browser  (needs Rust + wasm-pack)
npm run record    # re-record the legacy PTY session     (needs the nus checkout)
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

## Product media

The homepage shows a fourteen-second native nus recording of an authored
Hello World project: start its server, open the page beside the terminal,
and click the working counter. The native topbar remains visible. The
install command above it uses the same platform detection and Copy behavior
as the download page.

The muted hero autoplays and loops when visible. A compact pause control
sits over the video; there is no caption row. Offscreen and hidden pages
pause it, and reduced motion keeps the poster until the visitor selects
Play. The complete desktop window keeps its natural proportions at every
width. It is a paced demonstration, not a performance measurement.

The numbered Panels tour pairs each description with a capture from the
same project. The editor, history, Home and Hatch details omit the window
topbar. Hatch shows actual running and finished sessions. The product guide
reuses these figures through `{{capture:name}}` tokens, resolved by
`scripts/product-media.mjs` during the build.

| File in `assets/films/` | Subject |
|---|---|
| `nus-hero-web.mp4` | The 14-second shell and page workflow, 1600 × 1086 at 30 fps |
| `nus-hero-poster.png` | The full-resolution final native frame, 2240 × 1520 |
| `nus-editor-detail.png` | The actual main.js source and file tab, 1433 × 957 |
| `nus-history-detail.png` | Command search, output and the map, 1176 × 1208 |
| `nus-home-project.png` | Saved commands, project and resumable server, 2105 × 1246 |
| `nus-hatch-project.png` | The running server and finished source checks, 1920 × 936 |

`hello-world-provenance.json` records the source build, native capture
parameters, verified states, dimensions and file hashes. These macOS
captures use isolated profiles, `NUS_SHOT_NO_HOVER=1` and disabled port
toasts. Keep their original colors when the site theme changes. Retain
lossless native masters and scripts with the capture work; only publication
exports belong here. Earlier supplied screenshots and the WASM PTY replay
remain available as source history.

## Design

The site is drawn from the same tokens as the app: see
[`docs/DESIGN.md`](https://github.com/cbassuarez/nus/blob/main/docs/DESIGN.md)
in the app repo, which is the source of truth. `assets/css/site.css` mirrors it.
Change the app's design doc first, then the CSS.

The site follows the visitor's theme and signal color. Native product media
keeps the app's recorded Blueprint appearance and original aspect ratio.

## Docs

`docs/<slug>/` pages are generated from `content/*.md`. Those files are the
public account of the app — organised by topic, in the present tense, with
no dates, passes or working notes — and are written here, not copied from
the app repo's `docs/`, which are its working notes. When the app changes,
change the page that describes it and rebuild.

`assets/benchmarks/homepage.json` is the measured data source for the homepage,
measurements document and review figures. `scripts/benchmarks/facts.mjs` formats
those values consistently; markdown uses `{{figure:key}}` tokens. Regenerate
this registry with the NUS repository's `scripts/benchmarks/export-homepage.py`,
then run `npm run build` and `npm test`. Preserve the original reported statistic
when refreshing a value (10 MiB p95, 100 MiB maximum, tab median/range, window
range, and package sizes).

`/benchmarks/` adds complete-stack size/RSS and Speedometer comparisons. All
series use declared axes in `scripts/benchmarks/scales.mjs`, with explicit
reference lines and overflow disclosure. Never derive an axis ceiling from the
largest observation. Publication rejects incomplete comparison trials and
mismatched binaries. Arc follow-up results reuse the user-prepared empty account
in the existing macOS session; they are visually separated and do not claim
fresh-profile isolation or independent process repetitions.
Downloadable raw observations, calibration failures and collector sources live
under `assets/benchmarks/`. Local dirty-build measurements are distinct from
published-package size measurements.

## Installing

`install.sh` and `install.ps1` at the root are served as-is and are what the
download page's one-liners run. Each finds the newest release with a package
for the machine and verifies every download against the release's
`SHA256SUMS.txt`, then installs it the way that system expects: nus.app on
macOS; on Debian and Ubuntu the release's .deb through apt (Chromium's
sandbox, the desktop entry, updates through apt); on other Linux the archive,
through its own `install-desktop.sh`; on Windows the signed installer, run
silently. Every way puts the `nus` command on PATH. They talk to GitHub
Releases directly, so they work wherever the site is hosted.

The package managers are fed by the app's release workflow, not this site
(see the app's `docs/RELEASING.md`): the Homebrew casks `nus` and
`nus@preview` in `cbassuarez/homebrew-tap`, the winget packages
`cbassuarez.nus` and `cbassuarez.nus.Preview`, and the apt repositories in
the app's `apt-release` and `apt-preview` releases. The download page names
them; keep its commands in step with that workflow.

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
Newsreader), the icons are Phosphor (MIT) apart from the Simple Icons (CC0)
platform marks in `assets/icons/brands/`, and the pinned Cuelume interaction
sound library is MIT — see `assets/fonts/OFL-*.txt`, `assets/icons/LICENSE`,
and `assets/vendor/cuelume/0.2.2/LICENSE`.
