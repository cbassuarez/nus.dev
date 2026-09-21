/* The page shell: head, signal band, masthead, footer.
   Every page on nus.dev goes through here, so the chrome cannot drift. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const assetVersion = path => createHash('sha256').update(readFileSync(join(ROOT,path))).digest('hex').slice(0,12);

export const SITE = {
  name: 'nus',
  long: 'terminus',
  domain: 'nus.dev',
  // Served under a subpath until the nus.dev domain is live; every absolute
  // URL on the site and in the install scripts comes from here.
  url: 'https://cbassuarez.com/nus.dev',
  entryUrl: 'https://cbassuarez.github.io/nus.dev',
  repo: 'https://github.com/cbassuarez/nus',
  tagline: 'A terminal with room for the rest.',
  author: 'Sebastian Suarez-Solis'
};

const iconCache = new Map();
export const nusMark = readFileSync(join(ROOT, 'assets/icon/nus.svg'), 'utf8')
  .replace('<svg ', '<svg class="nus-mark" aria-hidden="true" focusable="false" ');

/** Inlines a Phosphor icon so it inherits colour and costs no request. */
export function icon(name, cls = '') {
  if (!iconCache.has(name)) {
    const raw = readFileSync(join(ROOT, 'assets/icons', `${name}.svg`), 'utf8');
    iconCache.set(name, raw.replace(/\s*\n\s*/g, '').trim());
  }
  let svg = iconCache.get(name);
  svg = svg.replace('<svg', `<svg aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}`);
  return svg;
}

/** Hidden until the local Feel module initializes. Muting never plays a final cue. */
export function soundControl() {
  return `<button class="iconbtn" type="button" data-sound-toggle hidden aria-pressed="true" aria-label="Mute site sounds">
    <span data-sound-on>${icon('speaker-high')}</span><span data-sound-off hidden>${icon('speaker-slash')}</span>
  </button>`;
}

/** `depth` is how many directories deep the page sits, for relative asset paths. */
export const rel = (depth) => (depth === 0 ? '.' : Array(depth).fill('..').join('/'));

function masthead(depth) {
  const r = rel(depth);
  // The app's own rule: text labels in the chrome give way to icons, and caps
  // labels stay only for words that are content. The header is chrome.
  const links = [
    ['Panels', `${r}/panels/`, 'squares-four'],
    ['Docs', `${r}/docs/`, 'book-open-text'],
    ['Download', `${r}/download/`, 'download-simple'],
    ['About', `${r}/about/`, 'planet'],
    ['Source', SITE.repo, 'github-logo']
  ];

  return `<header class="masthead">
  <div class="masthead__in">
    <a class="mark" href="${r}/" aria-label="nus — home" title="nus">
      ${nusMark}
      <span class="wordmark">nus</span>
    </a>
    <nav class="nav" aria-label="Primary">
      ${links.map(([t, h, ic]) => {
        const ext = /^https?:/.test(h);
        return `<a href="${h}" title="${t}" aria-label="${t}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(ic)}<span class="nav__name">${t}</span></a>`;
      }).join('\n      ')}
    </nav>
    <div class="controls">
      <div class="signalpick" data-signalpick role="group" aria-label="Signal colour"></div>
      ${soundControl()}
      <button class="iconbtn" type="button" data-theme-toggle data-cuelume-toggle="toggle" aria-label="Switch theme">
        <span data-sun hidden>${icon('sun')}</span><span data-moon>${icon('moon')}</span>
      </button>
    </div>
  </div>
</header>`;
}

function footer(depth) {
  const r = rel(depth);
  const year = new Date().getFullYear();

  const cols = [
    ['Project', [
      ['Download', `${r}/download/`],
      ['Source', SITE.repo],
      ['Releases', `${SITE.repo}/releases`],
      ['Issues', `${SITE.repo}/issues`]
    ]],
    ['Docs', [
      ['Panels', `${r}/panels/`],
      ['Architecture', `${r}/docs/architecture/`],
      ['Design', `${r}/docs/design/`],
      ['Product', `${r}/docs/product/`],
      ['Measurements', `${r}/docs/measurements/`]
    ]],
    ['More', [
      ['About', `${r}/about/`],
      ['Dependencies', `${r}/docs/dependencies/`],
      ['Licence', `${SITE.repo}/blob/main/LICENSE`]
    ]]
  ];

  return `<footer class="foot">
  <div class="foot__in">
    <div>
      <a class="wordmark" href="${r}/" style="font-size:30px">nus</a>
      <p class="dim" style="font-size:12.5px;margin-top:10px;max-width:24ch">${SITE.tagline}<br>Independent software, in progress.</p>
    </div>
    ${cols.map(([h, items]) => `<div>
      <h4>${h}</h4>
      <ul>${items.map(([t, u]) => {
        const ext = /^https?:/.test(u);
        return `<li><a href="${u}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${t}</a></li>`;
      }).join('')}</ul>
    </div>`).join('\n    ')}
  </div>
  <div class="foot__end">
    <div>
      <span>© ${year} ${SITE.author}</span>
      <span>MIT</span>
      <span class="grow"></span>
      <span>Set in IBM Plex Mono &amp; Newsreader</span>
    </div>
  </div>
</footer>`;
}

/**
 * @param {{title:string, description:string, body:string, depth?:number,
 *          path?:string, bodyClass?:string, head?:string, indexed?:boolean,
 *          chrome?:{header:string,footer:string}|null, module?:string}} page
 */
export function page({ title, description, body, depth = 0, path = '/', bodyClass = '', head = '', module = '', indexed = true, chrome = null }) {
  const r = rel(depth);
  const full = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} · ${SITE.name}`;
  const canonical = SITE.url + path;
  module = module.replace(/(['"])(\.\.?\/assets\/js\/([^'"]+))\1/g, (_, quote, url, name) => `${quote}${url}?v=${assetVersion('assets/js/'+name)}${quote}`);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${full}</title>
<meta name="description" content="${description}">
${indexed ? '' : '<meta name="robots" content="noindex,nofollow,noarchive">'}
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#c8102e">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.domain}">
<meta property="og:title" content="${full}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/icon/nus-512.png">
<meta name="twitter:card" content="summary">

<link rel="icon" type="image/svg+xml" href="${r}/assets/icon/nus-paper.svg" data-nus-favicon data-icon-root="${r}/assets/icon/">
<link rel="apple-touch-icon" href="${r}/assets/icon/nus-256.png">

<link rel="preload" as="font" type="font/woff2" href="${r}/assets/fonts/IBMPlexMono-Regular.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="${r}/assets/fonts/Newsreader-Italic.woff2" crossorigin>
<link rel="stylesheet" href="${r}/assets/css/site.css?v=${assetVersion('assets/css/site.css')}">
<script>
/* Apply the stored theme and signal before first paint, so the page never flashes. */
(function(){try{
  var t=localStorage.getItem('nus.theme');
  if(t==='paper'||t==='ink')document.documentElement.setAttribute('data-theme',t);
  var s=localStorage.getItem('nus.signal');
  if(s){document.documentElement.style.setProperty('--signal',s);
    document.documentElement.style.setProperty('--on-signal',s==='#d9a400'?'#141414':'#ffffff');}
}catch(e){}})();
</script>
${head}</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<div class="band"></div>
<div id="site-header">${chrome ? chrome.header : masthead(depth)}</div>
<main id="main"${chrome ? '' : ' data-page-transition'}>
${body}
</main>
<div id="site-footer">${chrome ? chrome.footer : footer(depth)}</div>
<div id="page-announcer" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
<script type="module" src="${r}/assets/js/navigation.js?v=${assetVersion('assets/js/navigation.js')}"></script>
</body>
</html>
`;
}
