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
npm run sync      # pull docs/*.md out of ../nus into content/
```

Node 18 or newer. There is no `npm install` — the build has no dependencies,
including the Markdown renderer.

## Layout

```
index.html  about/  download/  docs/     generated — do not edit
content/*.md                             verbatim copy of nus/docs/*.md
scripts/
  build.mjs        the whole build
  layout.mjs       page shell: head, masthead, footer, icons
  markdown.mjs     the Markdown subset the docs use
  window.mjs       the app window, rebuilt in HTML
  pages/*.mjs      body of each hand-written page
  sync-docs.mjs    content/ ← ../nus/docs/
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

## Design

The site is drawn from the same tokens as the app: see
[`docs/DESIGN.md`](https://github.com/cbassuarez/nus/blob/main/docs/DESIGN.md)
in the app repo, which is the source of truth. `assets/css/site.css` mirrors it.
Change the app's design doc first, then the CSS.

The hero is not a screenshot — it is the app window rebuilt in HTML, so it
follows the visitor's theme and the signal colour they pick in the masthead,
and it obeys nus's own width rule (no split under 900px, no sidebar under 640).

## Docs

`docs/<slug>/` pages are generated from `content/*.md`, which is a copy of
`docs/*.md` in the app repo. When those change:

```
npm run sync && npm run build && git commit -am "docs: sync"
```

`scripts/markdown.mjs` covers the subset those files use — headings,
paragraphs, lists, pipe tables, fenced code, blockquotes, and the inline set.
If the docs outgrow it, swap in a real parser there; the build only calls
`render()`.

## Checks

`scripts/checks/overflow.html` loads every page in an iframe at 390, 768 and
1440 px and reports any horizontal overflow. Run `npm run dev` and open
<http://localhost:8000/scripts/checks/overflow.html>.

## Deployment

Pages serves `main` at the repo root. `CNAME` points at `nus.dev`; see
[SETUP.md](SETUP.md) for the DNS records.

## Licence

Site code MIT, same as the app. Bundled fonts are OFL (IBM Plex Mono,
Newsreader) and the icons are Phosphor, MIT — see `assets/fonts/OFL-*.txt` and
`assets/icons/LICENSE`.
