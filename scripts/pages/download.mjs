import { icon, SITE } from '../layout.mjs';

const plat = (name, target, status, note) => `<tr>
  <td><strong>${name}</strong></td>
  <td><code>${target}</code></td>
  <td>${status}</td>
  <td class="dim">${note}</td>
</tr>`;

export default {
  title: 'Download',
  path: '/download/',
  depth: 1,
  description:
    'nus is pre-alpha and has no packaged builds yet. What the release will look ' +
    'like when it exists, and how to build it from source in the meantime.',
  body: `
<section class="section">
  <div class="section__in">
    <div class="row" style="gap:14px;margin-bottom:18px">
      <h1 style="margin:0">Download</h1>
      <span class="chip chip--signal">Not yet</span>
    </div>
    <p class="lede">
      There are no builds. nus is pre-alpha: the de-risking spikes are done and the
      composite spike runs on Windows, but nothing is packaged, signed or notarized,
      and the spike code has not finished moving into the real crates. Putting a
      binary here before that would be a favour to nobody.
    </p>
    <div class="row" style="margin-top:26px">
      <a class="btn btn--fill" href="${SITE.repo}/subscription" target="_blank" rel="noopener noreferrer">${icon('broadcast')}Watch the repo</a>
      <a class="btn btn--quiet" href="${SITE.repo}/releases" target="_blank" rel="noopener noreferrer">${icon('github-logo')}Releases page</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Targets</h2><span class="cap">Planned</span></div>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Platform</th><th>Target</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>
          ${plat('Windows 11', 'x86_64-pc-windows-msvc', '<span class="chip">Spike runs</span>',
            'D3D11 shared texture, 144 fps. ConPTY drops APC, so Kitty graphics wait.')}
          ${plat('macOS', 'aarch64-apple-darwin', '<span class="chip chip--dim">Not run</span>',
            'IOSurface shared textures planned; builds will be notarized.')}
          ${plat('Linux', 'x86_64-unknown-linux-gnu', '<span class="chip chip--dim">Not run</span>',
            'Wayland first, X11 works. CEF under a Wayland-only session is unverified.')}
        </tbody>
      </table>
    </div>
    <p class="dim" style="font-size:14px">
      Intel Macs and 32-bit Windows are not targets. Status here tracks
      <a href="../docs/spikes/">the spike log</a>, which is the honest version.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>Build it yourself</h2><span class="cap">Today</span></div>
    <p>Stable Rust via <code>rustup</code>, plus the platform toolchain:</p>
    <ul>
      <li><strong>Windows</strong> — Visual Studio 2022 with the <em>Desktop development with C++</em> workload.</li>
      <li><strong>macOS</strong> — Xcode command line tools.</li>
      <li><strong>Linux</strong> — <code>build-essential pkg-config libwayland-dev libxkbcommon-dev libgtk-3-dev</code>.</li>
    </ul>
<pre><code>git clone --recurse-submodules ${SITE.repo}.git
cd nus

scripts/fetch-cef.sh              # CEF binary matching vendor/cef-rs → vendor/cef
export CEF_PATH=$PWD/vendor/cef   # per-OS library paths: vendor/cef-rs/README.md

cargo build</code></pre>
    <p class="dim" style="font-size:14px">
      Expect it to be rough, and expect it to be rough in a different way on macOS
      and Linux, where the compositor has not been run at all.
    </p>
  </div>
</section>

<section class="section">
  <div class="section__in">
    <div class="sectionhead"><h2>When there is a release</h2><span class="cap">The shape of it</span></div>
    <div class="ledger" style="max-width:none">
      <div class="ledger__row"><span class="cap">Channel</span><p class="mb0">
        GitHub Releases, one artifact per platform. The app self-updates from there and
        offers the update in the top strip; you can decline it.</p></div>
      <div class="ledger__row"><span class="cap">Signing</span><p class="mb0">
        Notarized on macOS, signed on Windows. An unsigned build is a build that
        teaches people to click through warnings.</p></div>
      <div class="ledger__row"><span class="cap">Telemetry</span><p class="mb0">
        None. Crashes write a local log and stay there. There is no analytics
        endpoint to turn off because there is not one to begin with.</p></div>
      <div class="ledger__row"><span class="cap">Chromium currency</span><p class="mb0">
        CEF is pinned and bumped on Chromium’s four-week cadence. A stale CEF is a
        stale browser, which is a security problem rather than a cosmetic one.</p></div>
      <div class="ledger__row"><span class="cap">Licence</span><p class="mb0">
        MIT, so the licence question never comes up.
        <a href="${SITE.repo}/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">Read it</a>.</p></div>
    </div>
  </div>
</section>
`
};
