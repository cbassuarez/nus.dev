#!/usr/bin/env node
/* Intentional maintenance command. Normal builds never use the network. */
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const VERSION = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(VERSION || "")) throw new Error("Usage: node scripts/vendor-cuelume.mjs <exact-version>");

const work = join(ROOT, ".vendor-cuelume");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const packed = spawnSync("npm", ["pack", "cuelume@" + VERSION, "--json", "--ignore-scripts"], { cwd: work, encoding: "utf8" });
if (packed.status !== 0) throw new Error((packed.stderr || packed.stdout || "npm pack failed").trim());
const info = JSON.parse(packed.stdout)[0];
if (!info || !info.filename) throw new Error("npm pack returned no archive");

const archive = join(work, info.filename);
const untar = spawnSync("tar", ["-xzf", archive, "-C", work], { encoding: "utf8" });
if (untar.status !== 0) throw new Error((untar.stderr || "tar failed").trim());

const packageRoot = join(work, "package");
const meta = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
if (meta.name !== "cuelume" || meta.version !== VERSION || meta.type !== "module") throw new Error("Unexpected Cuelume package metadata");
if (meta.dependencies && Object.keys(meta.dependencies).length) throw new Error("Cuelume gained runtime dependencies; review before vendoring");

const dest = join(ROOT, "assets", "vendor", "cuelume", VERSION);
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(join(packageRoot, "dist"), dest, { recursive: true });
if (existsSync(join(packageRoot, "LICENSE"))) cpSync(join(packageRoot, "LICENSE"), join(dest, "LICENSE"));

const hashes = {};
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name !== "manifest.json") {
      hashes[relative(dest, path).replaceAll("\\\\", "/")] = createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  }
}
walk(dest);
writeFileSync(join(dest, "manifest.json"), JSON.stringify({
  name: "cuelume",
  version: VERSION,
  source: "npm:cuelume@" + VERSION,
  homepage: "https://cuelume-site.pages.dev/",
  repository: "https://github.com/danielwh2/cuelume",
  license: "MIT",
  entry: "index.js",
  hashes
}, null, 2) + "\n");

rmSync(work, { recursive: true, force: true });
console.log("vendored cuelume@" + VERSION + " (" + Object.keys(hashes).length + " files)");
