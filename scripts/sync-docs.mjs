#!/usr/bin/env node
/* Pulls the app's screenshots into assets/shots/.
 *
 *   node scripts/sync-docs.mjs [path-to-nus-repo]   # default: ../nus
 *
 * The docs in content/ are written for this site and are not synced: the
 * app repo's docs/ are its working notes, and the pages here are the public
 * account of the same thing. Only media comes across. */

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const app = resolve(process.argv[2] || join(ROOT, '..', 'nus'));
const docs = join(app, 'docs');

if (!existsSync(docs)) {
  console.error(`No docs/ at ${docs}\nPass the path to the nus checkout: node scripts/sync-docs.mjs ../nus`);
  process.exit(1);
}

let changed = 0;

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
