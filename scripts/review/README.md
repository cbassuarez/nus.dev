# Review room maintenance

This is a parallel unlisted collection in the existing static site. Run
`npm run build` and `npm test`; commit the generated `review/` output along
with source changes. No framework, package install or client CMS is required.

- `manifest.mjs` defines all eleven routes and both navigation forms.
- `data.mjs` owns proposal amounts, edition and fixed narrative/evidence revisions.
- `assets/review/release-evidence.json` owns the reviewed candidate, scoped workflow results and integration outcomes. Inspect runs and logs before updating it; green optional jobs can have skipped their work.
- `components.mjs` reuses the public release parser and formats evidence.
- `layout.mjs` provides review chrome to the shared `scripts/layout.mjs` page shell.
- `build.mjs` combines structured pages and `content/review/*.md`.
- `assets/css/review.css` adds only review-scoped Broadsheet components.
- `assets/js/review.js` adds hash copying and an explicit check for newer releases.

## Hosting and discovery

Canonical URLs use `SITE.url` (`https://cbassuarez.com/nus.dev`); the entry
address is `SITE.entryUrl` (`https://cbassuarez.github.io/nus.dev`). All navigation
and assets are relative to the route so both hosts retain the project prefix.
Do not add a CNAME for nus.dev while it is only a proposed domain purchase.

The collection is built after `buildFeeds(publicPages)`, and never enters the
public navigation, Docs index or sitemap. Every review page carries
`noindex,nofollow,noarchive`. This is not authentication. Source, documents and
URLs remain public; do not store credentials, private reports or payment records.

## Evidence and amounts

Use `{{budget:bounties}}`, `{{budget:cef}}`, `{{budget:automated}}` and
`{{request}}` in Markdown instead of duplicating amounts. `{{source}}` expands
to the packet's pinned application source revision. `{{securitySource}}` keeps the historical audit's source; `{{reviewedTag}}` names the fixed candidate. Unknown tokens fail the build.

Refresh `assets/releases.json` through `npm run releases`. The latest published
release is selected automatically; each platform keeps its newest validated package
in that channel, with its own version, source, signing label and checksum. Live pages
check on entry, when returning after a minute, and every five minutes while visible.
An unavailable API leaves the displayed packages intact with an explicit status.
The release-snapshot workflow rebuilds and tests the review output before committing
it, so the no-JavaScript fallback advances too. Historical performance evidence uses
`REVIEW.measurementRevision` and never advances with the download snapshot. Narrative, fixed release checks, captures, security audit and runtime measurements have separate dates. A newer download does not inherit older checks.

The review walkthrough uses native stills of the published preview 17 Mac package. `capture.py` verifies the supplied archive against its published manifest and checks that the captured executable matches the archive. It copies `fixture/` into a disposable project and uses isolated profile/shell state; no app rebuild is involved. Run it with `--app`, `--archive`, `--manifest` and a fresh `--out`. Original PNG exports and `walkthrough.json` belong in `assets/review/`; keep original PNGs and logs locally. Inspect every export before publishing. The native harness skips onboarding, uses Chromium software-paint upload and scripts the task; stills are not timing or cross-platform acceptance evidence. Earlier movies remain source history on public product pages.

Budget rows are proposed ceilings; existing Windows signing is operational and its allocation is a continuation reserve. No spending, grant award, active bounty program or third-party approval is implied.

## Checks

The Node suite covers route completeness, exactly one h1, base paths, robots
metadata, public inbound-link exclusion, budget balance, release integrity and
no-JavaScript content. Check all eleven routes at 390, 768 and 1440 pixels;
exercise paper/ink, every signal, native details, keyboard focus, reduced motion
and a failed release check. Local overflow can be allowed inside a code/table
viewport, never on the page itself.

## Site navigation

All generated pages use the shared Swup 4.10.0 router and Head Plugin 2.3.1,
served locally with their licenses and integrity manifests. Swup swaps the header,
main content and footer. The document uses a short clip-and-slide transition with
no opacity fade; reduced motion disables it. The head plugin updates route metadata
and waits for stylesheets. Page setup returns cleanup functions for observers,
refresh timers and global event listeners. The router never re-executes fetched
page scripts. Downloads and external destinations retain normal browser navigation.
