import { icon, SITE } from '../layout.mjs';
export default {
  title: 'Download', path: '/download/', depth: 1,
  description: 'Get nus for macOS, Windows and Linux. Published releases, signing details, checksums and installation instructions in one place.',
  module: "import { mountDownloads } from '../assets/js/releases.js'; mountDownloads();",
  body: `
<section class="section"><div class="section__in">
  <p class="cap">nus / downloads</p>
  <h1>Make yourself<br><em>at home.</em></h1>
  <p class="lede">A shell, a browser, and the space between them.<br>Pick your machine. Keep your tools.</p>
</div></section>
<div data-downloads>
<section class="section"><div class="section__in">
  <div class="download-workbench">
    <div class="download-choice">
      <fieldset class="channel-picker"><legend>Release channel</legend>
        <label><input type="radio" name="channel" value="preview" checked> Preview</label>
        <label><input type="radio" name="channel" value="stable"> Stable</label>
      </fieldset>
      <p class="small dim">Preview is where new work lands. Stable appears after a release has cleared its checks.</p>
      <label class="cap" for="download-platform">Your machine</label>
      <select id="download-platform" data-target>
        <option value="macos-arm64">macOS · Apple silicon (M-series)</option>
        <option value="macos-x86_64">macOS · Intel</option>
        <option value="windows-x86_64">Windows · Intel / AMD 64-bit</option>
        <option value="linux-x86_64">Linux · Intel / AMD 64-bit</option>
      </select>
      <p class="small dim">On a Mac, find your chip under Apple menu → About This Mac.</p>
      <a class="btn btn--fill download-primary" data-download hidden>Download nus</a>
      <p class="download-status small" data-status role="status" aria-live="polite">Checking published releases…</p>
      <div class="row"><a data-notes href="${SITE.repo}/releases">Release notes ↗</a><button class="text-button" data-retry>Check again</button></div>
      <noscript><p>JavaScript is off. <a href="${SITE.repo}/releases">Download from GitHub Releases</a>; each release includes signing information and checksums.</p></noscript>
    </div>
    <div class="download-receipt">
      <p class="cap">Package record</p>
      <dl><div><dt>Version</dt><dd data-version>Checking…</dd></div><div><dt>Published</dt><dd data-date>—</dd></div><div><dt>Signing</dt><dd data-signing>Shown with each published package</dd></div><div><dt>Licence</dt><dd><a href="${SITE.repo}/blob/main/LICENSE">MIT · source available</a></dd></div><div><dt>Delivery</dt><dd>Direct from GitHub Releases</dd></div></dl>
      <details data-hash-section hidden><summary>Verify your download</summary><p class="small">Compare your archive’s SHA-256 with this release record.</p><code class="download-hash" data-hash></code><button class="text-button" data-copy>Copy SHA-256</button><p class="small">macOS / Linux: <code>shasum -a 256 filename</code><br>PowerShell: <code>Get-FileHash filename -Algorithm SHA256</code></p></details>
    </div>
  </div>
</div></section>
<section class="section"><div class="section__in">
  <div class="sectionhead"><h2>Up and running.</h2><span class="cap">Installation</span></div>
  <div data-install="macos"><ol class="install-steps"><li>Unzip the complete download.</li><li>Move <strong>nus.app</strong> into Applications.</li><li>Open nus and choose your shell. Your existing shell configuration comes with you.</li></ol><p class="dim small">Check the package record above for the exact signing and notarization status. Intel and Apple silicon builds are separate downloads.</p></div>
  <div data-install="windows" hidden><ol class="install-steps"><li>Extract the entire ZIP into a folder you want to keep.</li><li>Open <strong>nus.exe</strong>. Keep the runtime files beside it.</li><li>Choose your shell. Settings are stored in your user profile.</li></ol><p class="dim small">Windows previews may be unsigned and show a SmartScreen warning. The package record states the signing status; Windows signing uses a separate certificate from Apple.</p></div>
  <div data-install="linux" hidden><ol class="install-steps"><li>Extract the archive into a folder you want to keep.</li><li>Run <code>./nus</code> inside that folder.</li><li>Follow the included README for desktop integration.</li></ol><p class="dim small">Requires glibc 2.35 or newer, GTK 3, NSS, ALSA and a working Vulkan driver. Ubuntu 22.04 is the packaging baseline. Wayland and X11 behavior depends on your desktop; report issues with the compositor and graphics driver noted.</p></div>
</div></section>
<section class="section"><div class="section__in">
  <div class="sectionhead"><h2>Every package, together.</h2><span class="cap">Selected channel</span></div>
  <div class="tablewrap"><table><thead><tr><th>Platform</th><th>Processor</th><th>Signing</th><th>Package</th></tr></thead><tbody data-packages></tbody></table></div>
  <p class="small dim">A download appears only after it is published with a checksum. If this page cannot reach GitHub, <a href="${SITE.repo}/releases">the release archive</a> is the source of record.</p>
</div></section>
</div>
<section class="section"><div class="section__in">
  <div class="sectionhead"><h2>For the curious.</h2><span class="cap">Build from source</span></div>
  <p>nus is written in Rust, with Chromium for pages. Bring a stable Rust toolchain and your platform’s native build tools.</p>
<pre><code>git clone --recurse-submodules ${SITE.repo}.git
cd nus
bash scripts/fetch-cef.sh
source scripts/env.sh
cargo build --release --locked --manifest-path spikes/composite/Cargo.toml --bins
# On macOS, create the app bundle:
bash scripts/bundle-mac.sh</code></pre>
  <p><a href="${SITE.repo}/blob/main/docs/RELEASING.md">Build and release notes ↗</a> · <a href="${SITE.repo}/issues">Report something broken ↗</a></p>
</div></section>`
};
