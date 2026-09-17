#!/usr/bin/env node
/* Copies the decision records out of the app repo into content/.
 *
 *   node scripts/sync-docs.mjs [path-to-nus-repo]   # default: ../nus
 *
 * content/ is a verbatim copy, never edited by hand — edit docs/ in the app
 * repo, sync, rebuild, commit. The build reads content/ so that this repo
 * still builds on a machine that does not have the app checked out. */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FILES = ['ARCHITECTURE.md', 'DESIGN.md', 'PRODUCT.md', 'SPIKES.md', 'DEPENDENCIES.md'];

const app = resolve(process.argv[2] || join(ROOT, '..', 'nus'));
const docs = join(app, 'docs');

if (!existsSync(docs)) {
  console.error(`No docs/ at ${docs}\nPass the path to the nus checkout: node scripts/sync-docs.mjs ../nus`);
  process.exit(1);
}

let changed = 0;
for (const f of FILES) {
  const src = join(docs, f);
  if (!existsSync(src)) { console.warn(`  skip  ${f} (missing in app repo)`); continue; }
  const next = readFileSync(src, 'utf8');
  const dest = join(ROOT, 'content', f);
  const prev = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
  if (prev === next) { console.log(`  same  ${f}`); continue; }
  writeFileSync(dest, next);
  console.log(`  ${prev === null ? 'new ' : 'sync'}  ${f}`);
  changed++;
}

/* --- media ----------------------------------------------------------------
 * Screenshots of the running app live in docs/media/ in the app repo, so they
 * are versioned with the thing they show. Capture them on the machine that
 * runs nus, commit them there, then sync.
 */
const media = join(app, 'docs', 'media');
if (existsSync(media)) {
  const dest = join(ROOT, 'assets', 'shots');
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(media)) {
    if (!/\.(png|jpe?g|webp|avif|mp4|webm)$/i.test(f)) continue;
    const from = join(media, f);
    const to = join(dest, f);
    const fresh = !existsSync(to) || statSync(from).mtimeMs > statSync(to).mtimeMs;
    if (!fresh) { console.log(`  same  media/${f}`); continue; }
    copyFileSync(from, to);
    console.log(`  shot  media/${f}`);
    changed++;
  }
} else {
  console.log(`\n  no docs/media/ in the app repo yet — nothing to pull.`);
}

console.log(changed ? `\n${changed} file(s) updated — run \`npm run build\` and commit.` : '\nUp to date.');
