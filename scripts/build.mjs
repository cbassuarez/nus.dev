#!/usr/bin/env node
/* Builds nus.dev.
 *
 *   node scripts/build.mjs           build
 *   node scripts/build.mjs --serve   build, then serve ./ on :8000
 *
 * Static pages come from scripts/pages/*.mjs; doc pages are rendered from the
 * markdown in content/, which is a verbatim copy of docs/ in the app repo.
 * Output is committed, so GitHub Pages needs no CI and no install step. */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  { slug: 'architecture', file: 'ARCHITECTURE.md', title: 'Architecture', ic: 'network',
    blurb: 'The host, the crates, the browser, and the security posture. Each entry is a commitment.' },
  { slug: 'design', file: 'DESIGN.md', title: 'Design', ic: 'palette',
    blurb: 'Broadsheet: tokens, type, rules, spacing, shadow, and every surface the app draws.' },
  { slug: 'product', file: 'PRODUCT.md', title: 'Product', ic: 'squares-four',
    blurb: 'Thirteen passes of settled behaviour — navigation, stacks, sound, containers, the look studio.' },
  { slug: 'spikes', file: 'SPIKES.md', title: 'Spikes', ic: 'hard-hat',
    blurb: 'Four throwaway binaries, ordered cheapest-to-kill. What each one answered, and when.' },
  { slug: 'dependencies', file: 'DEPENDENCIES.md', title: 'Dependencies', ic: 'stack',
    blurb: 'What nus is built on, and what each crate is there to do.' }
];

const SOURCE = (file) => `${SITE.repo}/blob/main/docs/${file}`;

function docNav(current) {
  const items = DOCS.map((d) => `<li><a href="../${d.slug}/">${d.title}</a></li>`).join('');
  const toc = current.toc.length
    ? `<h4>On this page</h4><ul>${current.toc
        .map((h) => `<li class="${h.level > 2 ? 'sub' : ''}"><a href="#${h.id}">${h.text}</a></li>`)
        .join('')}</ul>`
    : '';
  return `<nav class="doc__nav" aria-label="Documentation">
  <h4>The record</h4>
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
    <span class="doc__source">
      <a href="${SOURCE(d.file)}" target="_blank" rel="noopener noreferrer">docs/${d.file} ↗</a>
    </span>
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
    <h1 style="margin-bottom:18px">The record</h1>
    <p class="lede">
      nus is documented as a set of decision records rather than a manual. Each one
      says what was settled, when, and what it rules out — and when a decision changes,
      the document changes with it. These pages are generated from the markdown in the
      app repository, so they cannot drift from it.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="grid">
      ${cards}
    </div>
    <p class="dim" style="margin-top:24px;font-size:14px">
      These are working project notes, including plans and historical decisions.
      Check <a href="../download/">the download page</a> for published builds and installation details.
    </p>
  </div>
</section>`;

  return write(join('docs', 'index.html'), page({
    title: 'Docs',
    description: 'Architecture, design, product and spike records for nus — generated from the app repository.',
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
    <a class="btn btn--quiet" href="/docs/">The record</a>
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
    const mod = (await import(join(pageDir, file))).default;
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
