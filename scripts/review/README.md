# Review room maintenance

This is a parallel unlisted collection in the existing static site. Run
`npm run build` and `npm test`; commit the generated `review/` output along
with source changes. No framework, package install or client CMS is required.

- `manifest.mjs` defines all eleven routes and both navigation forms.
- `data.mjs` owns proposal amounts, edition and the selected app release.
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
to the packet's pinned application source revision. Unknown tokens fail the build.

Refresh `assets/releases.json` through `npm run releases`. The latest published
release is selected automatically; each platform keeps its newest validated package
in that channel, with its own version, source, signing label and checksum. Live pages
check on entry, when returning after a minute, and every five minutes while visible.
An unavailable API leaves the displayed packages intact with an explicit status.
The release-snapshot workflow rebuilds and tests the review output before committing
it, so the no-JavaScript fallback advances too. Historical performance evidence uses
`REVIEW.measurementRevision` and never advances with the download snapshot.

The present movie is an existing paced recording of the app building this site,
not a new full workflow demo or latency test. Budget rows are proposed ceilings;
no bounty program or third-party approval is implied.

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
