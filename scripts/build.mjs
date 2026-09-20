#!/usr/bin/env node
/* Builds nus.dev.
 *
 *   node scripts/build.mjs           build
 *   node scripts/build.mjs --serve   build, then serve ./ on :8000
 *
 * Static pages come from scripts/pages/*.mjs; doc pages are rendered from the
 * markdown in content/, which is written for this site. Output is committed,
 * so GitHub Pages needs no CI and no install step. */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { render } from './markdown.mjs';
import { page, icon, SITE } from './layout.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

function write(relPath, html) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
  return relPath;
}

/* --- the docs -------------------------------------------------------------- */

const DOCS = [
  { slug: 'product', file: 'PRODUCT.md', title: 'Product', ic: 'squares-four',
    blurb: 'What nus does and how it behaves: windows and tabs, the terminal, the browser, assistants, the hatch, the look, rules and settings.' },
  { slug: 'architecture', file: 'ARCHITECTURE.md', title: 'Architecture', ic: 'network',
    blurb: 'One process, one compositor: the host, the crates, the terminal core, the browser, held shells, replay, and the security posture.' },
  { slug: 'design', file: 'DESIGN.md', title: 'Design', ic: 'palette',
    blurb: 'Broadsheet: the principles, the tokens, type, rules, spacing and shadow, and every surface the app draws.' },
  { slug: 'measurements', file: 'MEASUREMENTS.md', title: 'Measurements', ic: 'hard-hat',
    blurb: 'The numbers behind the claims: bundle size, memory per tab and window, file opens, latency, frame cost — and how each was taken.' },
  { slug: 'dependencies', file: 'DEPENDENCIES.md', title: 'Dependencies', ic: 'stack',
    blurb: 'What nus is built on, what it bundles, and what it ported.' }
];

/* The old address of the measurements page. */
const MOVED = { 'docs/spikes/index.html': '/docs/measurements/' };

function docNav(current) {
  const items = DOCS.map((d) => `<li><a href="../${d.slug}/">${d.title}</a></li>`).join('');
  const toc = current.toc.length
    ? `<h4>On this page</h4><ul>${current.toc
        .map((h) => `<li class="${h.level > 2 ? 'sub' : ''}"><a href="#${h.id}">${h.text}</a></li>`)
        .join('')}</ul>`
    : '';
  return `<nav class="doc__nav" aria-label="Documentation">
  <h4>Docs</h4>
  <ul>${items}</ul>
  ${toc}
</nav>`;
}

function buildDoc(d) {
  const md = read(join('content', d.file));
  const { html, title, toc } = render(md);

  const body = `<div class="doc">
${docNav({ toc })}
<article class="doc__body">
  <h1>${title || d.title}</h1>
  <div class="doc__meta">
    <span>${icon(d.ic)}</span>
    <span>${d.title}</span>
  </div>
${html}
</article>
</div>`;

  return write(join('docs', d.slug, 'index.html'), page({
    title: d.title,
    description: d.blurb,
    path: `/docs/${d.slug}/`,
    depth: 2,
    body
  }));
}

function buildDocsIndex() {
  const cards = DOCS.map((d) => `<a class="card" href="./${d.slug}/">
    <h3>${icon(d.ic)}${d.title}</h3>
    <p>${d.blurb}</p>
    <span class="card__more">Read →</span>
  </a>`).join('\n      ');

  const body = `<section class="section">
  <div class="section__in">
    <h1 style="margin-bottom:18px">Docs</h1>
    <p class="lede">
      What nus does, how it is built, how it looks, and what was measured. Start with
      the product page for the behaviour, the architecture page for the machinery
      underneath, and the measurements page for the numbers.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="grid">
      ${cards}
    </div>
    <p class="dim" style="margin-top:24px;font-size:14px">
      In the app, F1 opens the keyboard guide and every settings row is also a palette
      row. <a href="../download/">The download page</a> has the builds.
    </p>
  </div>
</section>`;

  return write(join('docs', 'index.html'), page({
    title: 'Docs',
    description: 'nus documentation: product behaviour, architecture, the Broadsheet design system, measurements and dependencies.',
    path: '/docs/',
    depth: 1,
    body
  }));
}

/* --- extras ---------------------------------------------------------------- */

function buildFeeds(written) {
  const urls = written
    .map((p) => '/' + p.replace(/index\.html$/, '').replace(/\\/g, '/'))
    .map((p) => (p === '/' ? '/' : p));

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  write('sitemap.xml', sitemap);

  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

  // Old addresses keep working: a tiny page that forwards, and says where to.
  for (const [from, to] of Object.entries(MOVED)) {
    write(from, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Moved · nus</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}${to}">
<meta http-equiv="refresh" content="0; url=${to}"></head>
<body><h1>Moved</h1><p>This page is now at <a href="${to}">${SITE.url}${to}</a>.</p></body></html>
`);
  }

  write('404.html', page({
    title: 'Not found',
    description: 'That page is not here.',
    path: '/404.html',
    depth: 0,
    body: `<section class="section"><div class="section__in">
  <h1 style="margin-bottom:14px">404</h1>
  <p class="lede">That page is not here. It may never have been.</p>
  <div class="row" style="margin-top:24px">
    <a class="btn btn--fill" href="/">${icon('arrow-right')}Home</a>
    <a class="btn btn--quiet" href="/docs/">Docs</a>
  </div>
</div></section>`
  }));
}

/* --- run ------------------------------------------------------------------- */

async function build() {
  const t0 = Date.now();
  const written = [];

  // Static pages
  const pageDir = join(ROOT, 'scripts', 'pages');
  for (const file of readdirSync(pageDir).sort()) {
    if (!file.endsWith('.mjs')) continue;
    const mod = (await import(pathToFileURL(join(pageDir, file)).href)).default;
    const out = mod.path === '/' ? 'index.html' : join(mod.path.replace(/^\/|\/$/g, ''), 'index.html');
    written.push(write(out, page(mod)));
  }

  written.push(buildDocsIndex());
  for (const d of DOCS) written.push(buildDoc(d));

  buildFeeds(written);

  console.log(written.map((p) => `  ${p}`).join('\n'));
  console.log(`\n${written.length} pages in ${Date.now() - t0}ms`);
  return written;
}

const written = await build();

if (process.argv.includes('--serve')) {
  const {siteServer} = await import('./serve.mjs');
  siteServer(ROOT).listen(8000, '127.0.0.1', () => console.log('→ http://localhost:8000'));

}

export { build, written };
