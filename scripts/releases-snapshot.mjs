#!/usr/bin/env node
/* Writes assets/releases.json: the published releases as GitHub reports
   them, filtered to what the download page would show. The page reads the
   live API first and falls back to this file when GitHub is unreachable or
   rate-limited, so it should never be far behind a release.

     node scripts/releases-snapshot.mjs            # refresh; exit 0 either way
     node scripts/releases-snapshot.mjs --check    # exit 1 if it changed  */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API, publishedReleases } from '../assets/js/releases.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'assets', 'releases.json');

const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(API, { headers, signal: AbortSignal.timeout(20000) });
if (!res.ok) { console.error(`GitHub API ${res.status}`); process.exit(2); }
const data = await res.json();

// Keep only the fields the page reads, so the file stays small and stable.
const releases = publishedReleases(data).map((r) => ({
  tag_name: r.tag_name, prerelease: r.prerelease, draft: false, published_at: r.published_at,
  body: r.body, assets: r.assets.map((a) => ({
    name: a.name, size: a.size, state: a.state, digest: a.digest, browser_download_url: a.browser_download_url
  }))
}));

const prev = (() => { try { return JSON.parse(readFileSync(OUT, 'utf8')); } catch { return null; } })();
const same = prev && JSON.stringify(prev.releases) === JSON.stringify(releases);
if (!same) writeFileSync(OUT, JSON.stringify({ checked_at: new Date().toISOString(), releases }) + '\n');
console.log(same ? `unchanged (${releases.length} releases)` : `updated (${releases.length} releases)`);
if (process.argv.includes('--check') && !same) process.exit(1);
