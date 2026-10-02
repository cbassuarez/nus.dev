import { icon, SITE } from '../layout.mjs';
import { TARGETS } from '../../assets/js/releases.js';

const LOGOS = { macos: 'brands/apple', windows: 'brands/windows', linux: 'brands/linux' };

/* One tile per published target. The first is checked so the page works
   before the script runs; releases.js then checks the visitor's own OS. */
const tiles = TARGETS.map(([id, os, arch], i) => `
        <label class="platform-tile">
          <input type="radio" name="platform" value="${id}"${i === 0 ? ' checked' : ''}>
          <span class="platform-tile__here" data-detected hidden>Detected</span>
          <span class="platform-tile__logo">${icon(LOGOS[id.split('-')[0]])}</span>
          <span class="platform-tile__dot" aria-hidden="true"></span>
          <span class="platform-tile__os">${os}</span>
          <span class="platform-tile__arch">${arch}</span>
          <span class="platform-tile__pkg" data-tile-pkg>Checking…</span>
        </label>`).join('');

/* A command, and the button that copies it (install.js). */
const copy = `<button class="copy" type="button" data-copy aria-label="Copy command">${icon('copy')}<span>Copy</span></button>`;
const codebox = cmd => `<div class="codebox"><pre><code>${cmd}</code></pre>${copy}</div>`;

export default {
  title: 'Download', path: '/download/', depth: 1,
  description: 'Get nus for macOS, Windows and Linux. Published releases, signing details, checksums and installation instructions in one place.',
  module: "import { mountDownloads } from '../assets/js/releases.js'; mountDownloads();",
  body: `
<section class="section install-hero" id="get"><div class="section__in">
  <p class="cap">nus / downloads</p>
  <h1>Make yourself<br><em>at home.</em></h1>
  <p class="lede">Paste this into the terminal you have now.<br>It’s the last thing you’ll ask of it.</p>
  <div class="cmd" data-cmd>
    <div class="cmd__tabs" role="tablist" aria-label="Your system" data-cmd-tabs hidden>
      <button type="button" role="tab" aria-selected="true" data-cmd-tab="unix">macOS · Linux</button><button type="button" role="tab" aria-selected="false" data-cmd-tab="windows">Windows</button>
    </div>
    <div class="cmd__line" data-cmd-panel="unix"><span class="cmd__os">macOS · Linux</span><span class="cmd__prompt" aria-hidden="true">$</span><code>curl -fsSL ${SITE.url}/install.sh | sh</code>${copy}</div>
    <div class="cmd__line" data-cmd-panel="windows"><span class="cmd__os">Windows</span><span class="cmd__prompt" aria-hidden="true">&gt;</span><code>irm ${SITE.url}/install.ps1 | iex</code>${copy}</div>
  </div>
  <p class="small dim install-hero__note">It finds the newest release for your machine, checks it against the release’s <code>SHA256SUMS.txt</code>, and installs it the way your system expects: nus.app on a Mac; on Debian and Ubuntu, the .deb through apt, which asks for <code>sudo</code> and keeps nus updated; on other Linux, for your account alone; on Windows, the signed installer. Every way ends with the <code>nus</code> command. <a href="${SITE.url}/install.sh">Read it first</a> if you like; it is short.</p>
  <p class="small dim"><code>NUS_CHANNEL=preview</code> takes the preview channel when a stable exists; <code>NUS_VERSION=v0.0.1</code> pins a tag; <code>NUS_USER=1</code> installs on Linux for your account only, without apt or <code>sudo</code>. On Windows, set them as <code>$env:</code> variables first.</p>
</div></section>
<section class="section" id="install"><div class="section__in">
  <div class="sectionhead"><h2>Or your package manager.</h2><span class="cap">Homebrew · winget · apt</span></div>
  <div class="install-lines">
    <div><span class="cap">macOS</span>${codebox('brew install cbassuarez/tap/nus@preview')}</div>
    <div><span class="cap">Windows</span>${codebox('winget install cbassuarez.nus.Preview')}</div>
    <div><span class="cap">Debian · Ubuntu</span>${codebox(`sudo curl -fsSLo /usr/share/keyrings/nus-archive-keyring.gpg ${SITE.repo}/releases/download/apt-preview/nus-archive-keyring.gpg
sudo curl -fsSLo /etc/apt/sources.list.d/nus-preview.sources ${SITE.repo}/releases/download/apt-preview/nus-preview.sources
sudo apt update &amp;&amp; sudo apt install nus-preview`)}</div>
  </div>
  <p>Whichever you use, the command is <code>nus</code>. On its own it opens nus, or brings it forward; <code>nus &lt;file or URL&gt;</code> opens that, and <code>nus --help</code> lists the rest.</p>
  <p class="small dim">These are the preview channel, where every release so far has been. For stable, drop <code>@preview</code> and <code>.Preview</code>, and use <code>apt-release</code>, <code>nus.sources</code> and the package <code>nus</code>. Each is written from the release’s own hashes when it is published. The winget listing appears once Microsoft’s reviewers accept a release; until then the one line above installs the same installer. A preview cask is not notarized, so it clears macOS’s quarantine flag itself.</p>
</div></section>
<div class="download-body" data-downloads>
<section class="section" id="download"><div class="section__in">
  <div class="sectionhead"><h2>Or download it.</h2><span class="cap">Pick a build</span></div>
  <div class="download-workbench">
    <div class="download-choice">
      <fieldset class="channel-picker"><legend>Release channel</legend>
        <label><input type="radio" name="channel" value="preview" checked> Preview</label>
        <label><input type="radio" name="channel" value="stable"> Stable</label>
      </fieldset>
      <p class="small dim">Preview is where new work lands. Stable appears after a release has cleared its checks.</p>
      <fieldset class="platform-tiles" data-target><legend class="cap">Your machine</legend>
        <div class="platform-tiles__grid">${tiles}
        </div>
      </fieldset>
      <p class="small dim" data-platform-note>Apple silicon only on the Mac; Intel Macs are not a target.</p>
      <a class="btn btn--fill download-primary" data-download hidden>Download nus</a>
      <p class="download-status small" data-status role="status" aria-live="polite">Checking published releases…</p>
      <div class="row"><a data-notes href="${SITE.repo}/releases">Release notes ↗</a><button class="text-button" data-retry>Check again</button></div>
      <noscript><p>JavaScript is off. <a href="${SITE.repo}/releases">Download from GitHub Releases</a>; each release includes signing information and checksums.</p></noscript>
    </div>
    <div class="download-receipt">
      <p class="cap">02 / The release record</p>
      <dl><div><dt>Version</dt><dd data-version>Checking…</dd></div><div><dt>Published</dt><dd data-date>—</dd></div><div><dt>Signing</dt><dd data-signing>Shown with each published package</dd></div><div><dt>Licence</dt><dd><a href="${SITE.repo}/blob/main/LICENSE">MIT · source available</a></dd></div><div><dt>Delivery</dt><dd>Direct from GitHub Releases</dd></div></dl>
      <details data-hash-section hidden><summary>Verify your download</summary><p class="small">Compare your archive’s SHA-256 with this release record.</p><code class="download-hash" data-hash></code><button class="text-button" data-copy>Copy SHA-256</button><p class="small">macOS / Linux: <code>shasum -a 256 filename</code><br>PowerShell: <code>Get-FileHash filename -Algorithm SHA256</code></p></details>
    </div>
  </div>
</div></section>
<section class="section"><div class="section__in">
  <div class="sectionhead"><h2>Up and running.</h2><span class="cap">Installation</span></div>
    <div data-install="macos"><ol class="install-steps"><li>Unzip the complete download.</li><li>Move <strong>nus.app</strong> into Applications.</li><li>For an unnotarized preview, macOS may require <b>System Settings</b> › <b>Privacy &amp; Security</b> › <b>Open Anyway</b>.</li><li>Open <i>nus</i> and choose your shell. Your existing shell configuration comes with you.</li></ol><p class="dim small">Check the package record above for the selected build’s signing and notarization status. Homebrew and the one-line installer below also put the <code>nus</code> command on your PATH.</p></div>
  <div data-install="windows" hidden><ol class="install-steps"><li>Run the downloaded <strong>setup</strong> file. It installs for your user and asks for no administrator rights.</li><li>Choose where nus goes, and whether to add the <code>nus</code> command to PATH, list nus as a browser, or put an icon on your desktop.</li><li>Open nus and choose your shell. Settings are stored in your user profile, and updates arrive inside the app.</li></ol><p class="dim small">The package record states whether this build is signed; if it is not, Windows may show a SmartScreen warning. Windows signing uses a separate certificate from Apple. A portable ZIP is on the <a href="${SITE.repo}/releases">release page</a> for the rare case you want to run nus from a folder.</p></div>
  <div data-install="linux" hidden><ol class="install-steps"><li>On Debian or Ubuntu, use apt: the <a href="#get">one line at the top</a> or the <a href="#install">repository</a>, or the release’s <strong>.deb</strong> with <code>sudo apt install ./nus-preview_*.deb</code>. It sets up Chromium’s sandbox and the applications entry, and apt keeps nus updated.</li><li>Anywhere else, extract the archive and run <code>./install-desktop.sh</code>. It installs nus for your account, adds it to your applications and puts the <code>nus</code> command in <code>~/.local/bin</code>; the extracted folder can go afterwards. If your system blocks Chromium’s sandbox, it prints the one <code>sudo</code> command that allows it.</li><li>Open nus from your applications, or run <code>nus</code>.</li></ol><p class="dim small">Requires glibc 2.35 or newer, GTK 3, NSS, ALSA and a working Vulkan driver. Ubuntu 22.04 is the packaging baseline. Wayland and X11 behavior depends on your desktop; report issues with the compositor and graphics driver noted.</p></div>
</div></section>
<section class="section"><div class="section__in">
  <div class="sectionhead"><h2>Every package, together.</h2><span class="cap">Selected channel</span></div>
  <div class="tablewrap"><table><thead><tr><th>Platform</th><th>Processor</th><th>Version</th><th>Signing</th><th>Package</th></tr></thead><tbody data-packages></tbody></table></div>
  <p class="small dim">A download appears only after it is published with a checksum. If this page cannot reach GitHub, <a href="${SITE.repo}/releases">the release archive</a> is the source of record.</p>
</div></section>
</div>`
};
