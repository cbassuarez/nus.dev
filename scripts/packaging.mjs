#!/usr/bin/env node
/* Writes the package-manager manifests from the release snapshot.
 *
 *   node scripts/packaging.mjs
 *
 * Homebrew:  packaging/homebrew/Casks/nus.rb   → pushed to cbassuarez/homebrew-tap
 * winget:    packaging/winget/manifests/c/cbassuarez/nus/<version>/*.yaml
 *            → submitted to microsoft/winget-pkgs (wingetcreate, or a PR)
 *
 * Each manifest points at the newest release that has that platform's
 * package — stable if one exists, else preview — with the hash from the
 * release itself. Nothing is written for a platform with no package yet. */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { latestPackageFor } from '../assets/js/releases.js';
import { SITE } from './layout.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SNAPSHOT = join(ROOT, 'assets', 'releases.json');
const REPO = 'https://github.com/cbassuarez/nus';

const { releases } = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));

/** Stable if it has the package, else the newest preview that does. */
function pick(target) {
  return latestPackageFor(releases, 'stable', target) || latestPackageFor(releases, 'preview', target);
}

function write(rel, text) {
  const abs = join(ROOT, rel);
  mkdirSync(join(abs, '..'), { recursive: true });
  const same = existsSync(abs) && readFileSync(abs, 'utf8') === text;
  if (!same) writeFileSync(abs, text);
  console.log(`  ${same ? 'same ' : 'wrote'}  ${rel}`);
}

/* --- Homebrew --------------------------------------------------------------- */

const mac = pick('macos-arm64');
if (mac) {
  const version = mac.release.tag_name.slice(1);
  const preview = mac.release.prerelease;
  write('packaging/homebrew/Casks/nus.rb', `cask "nus" do
  version "${version}"
  sha256 "${mac.pkg.hash}"

  url "${REPO}/releases/download/v#{version}/nus-#{version}-macos-arm64.zip"
  name "nus"
  desc "Terminal emulator that is also a browser"
  homepage "${SITE.url}/"

  livecheck do
    url "${REPO}/releases"
    regex(%r{/v?(\\d+(?:\\.\\d+)+${preview ? '(?:-preview\\.\\d+)?' : ''})/nus-[^/]+-macos-arm64\\.zip}i)
    strategy :page_match
  end

  depends_on arch: :arm64

  app "nus.app"
  binary "#{appdir}/nus.app/Contents/Resources/bin/nus"
${preview && mac.pkg.signing !== 'notarized' ? `
  caveats <<~EOS
    This is a preview build and is not notarized. The first time, right-click
    nus.app in Applications and choose Open, or install with --no-quarantine.
  EOS
` : ''}
  zap trash: [
    "~/Library/Application Support/nus",
    "~/Library/Caches/nus",
  ]
end
`);
} else {
  console.log('  skip   homebrew: no macOS package published yet');
}

/* --- winget ----------------------------------------------------------------- */

const win = pick('windows-x86_64');
if (win) {
  const version = win.release.tag_name.slice(1);
  const dir = `packaging/winget/manifests/c/cbassuarez/nus/${version}`;
  const id = 'cbassuarez.nus';
  const folder = `nus-${version}-windows-x86_64`;
  write(`${dir}/${id}.yaml`, `# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.1.6.0.schema.json
PackageIdentifier: ${id}
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: 1.6.0
`);
  write(`${dir}/${id}.installer.yaml`, `# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.1.6.0.schema.json
PackageIdentifier: ${id}
PackageVersion: ${version}
InstallerType: zip
NestedInstallerType: portable
NestedInstallerFiles:
  - RelativeFilePath: ${folder}\\bin\\nus.exe
    PortableCommandAlias: nus
Commands:
  - nus
ReleaseDate: ${win.release.published_at.slice(0, 10)}
ReleaseNotesUrl: ${REPO}/releases/tag/${win.release.tag_name}
Installers:
  - Architecture: x64
    InstallerUrl: ${win.pkg.url}
    InstallerSha256: ${win.pkg.hash.toUpperCase()}
ManifestType: installer
ManifestVersion: 1.6.0
`);
  write(`${dir}/${id}.locale.en-US.yaml`, `# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.1.6.0.schema.json
PackageIdentifier: ${id}
PackageVersion: ${version}
PackageLocale: en-US
Publisher: Sebastian Suarez-Solis
PublisherUrl: ${REPO}
PublisherSupportUrl: ${REPO}/issues
PackageName: nus
PackageUrl: ${SITE.url}/
License: MIT
LicenseUrl: ${REPO}/blob/main/LICENSE
ShortDescription: A terminal emulator that is also a browser.
Description: |-
  nus puts a terminal and a browser in one window: one tab list, one set of
  splits, one config. Its own VT core, Chromium composited by the app, an
  editor pane, an assistant panel, a ports board and a quick terminal.
Tags:
  - terminal
  - browser
  - developer-tools
ManifestType: defaultLocale
ManifestVersion: 1.6.0
`);
} else {
  console.log('  skip   winget: no Windows package published yet');
}
