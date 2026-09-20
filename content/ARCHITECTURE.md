# Architecture

One process, one compositor. Everything on screen — the chrome, the terminal
grids, the browser tabs, picture-in-picture — is a layer in nus's own scene
graph, drawn on the GPU. There are no platform child windows and no web view
for the UI, which is what makes Wayland, PiP, tab previews and splits behave
the same on every OS.

## Host

A Rust workspace, one binary per OS. `winit` owns the window, `wgpu` owns
the surface, and nus owns the compositor.

| Crate | Owns |
|---|---|
| `vt` | the VT parser (`vte`), grid, scrollback, modes, the Kitty keyboard protocol, Kitty / iTerm2 / Sixel graphics |
| `pty` | shell profiles; local shells, WSL distros and `ssh <host>` via `portable-pty`; the process table and reaping |
| `hold` | the holder: a pty that outlives the app |
| `render` | the wgpu compositor, retained scene graph, glyph atlas (swash + rustybuzz), external texture layers |
| `ui` | sidebar, windows, tabs, splits, the palette, previews, attention |
| `browser` | the CEF host (offscreen, Chrome runtime), containers, content blocking, import |
| `lsp` | the language-server client |
| `config` | the Luau sandbox, the curated API, keys, themes, hooks |
| `cli` | the `nus` command, `nus mcp`, `nus hatch` |
| `sync` | the sealed profile carrier |
| `app` | wiring, the event loop, notifications |

## Terminal

Its own core. `vte` drives the state machine; the grid, scrollback, modes,
palette and responses are nus's. Output from the pty goes through a bounded
channel into the core, so a noisy process pauses while the UI is busy and
resumes without loss. The same core, compiled to WebAssembly, replays
recordings on this site and in shared session files — the picture is the
app's own.

## Browser

Chromium through CEF, rendered offscreen with the Chrome runtime. Each tab is
a `CefBrowser` whose paint output lands in a wgpu texture — a shared texture
where the platform allows (D3D11 on Windows, IOSurface on macOS), a CPU
upload otherwise. Containers are CEF request contexts.

Content blocking is nus's: Brave's `adblock` engine hooked into CEF's
resource request handler, so it works with nothing installed. Userscripts,
boosts, the reader and the dev suite share one mechanism: scripts injected
per tab through the DevTools protocol, results back through a message
observer. Picture-in-picture is a tab's texture drawn into a small
always-on-top window, not Chromium's.

**No Chrome extensions.** Windowless CEF browsers are Alloy-style, and libcef
does not attach the tab model or the extension request proxy to them:
extensions load and run but cannot see, filter or inject into nus's tabs.
What extensions are used for is built natively — blocking, userscripts and
userstyles, containers, tab tools — and password filling goes through the
`op` (1Password) and `bw` (Bitwarden) CLIs behind a credential provider. A
libcef build of nus's own that wires Alloy tabs into the extension system is
a later phase, not something the app depends on.

## Chrome UI

A hand-rolled retained scene graph on wgpu: rects, rounded rects, text runs,
texture quads, polygons filled from a signed distance, clip, scroll. No
general-purpose toolkit — the surface area (sidebar, tabs, the palette,
settings) does not justify one, and nothing else composites external
textures without friction. The tree is an AccessKit tree from the first
frame.

## Config

Luau via `mlua`, sandboxed: no `io`, no `os`, no `require` of arbitrary
files, no FFI. The config sees a curated `nus` table — keys, theme,
profiles, and the hooks the [product page](../product/#rules) lists — which
is how the built-in behaviours are written, so a rule can replace any of
them.

## The holder

`nus-hold` is one process per held shell. It spawns the shell through the
same pty code the app uses, keeps a ring of the last 4 MB it has read, and
serves the pty's bytes both ways over a loopback socket to one client at a
time, named by `profile/hold/<id>.json` (port, a per-launch token, the pids).
The app is a client; the VT core stays in the app. Detach is closing the
socket; attach is opening it and taking the ring, which the core replays
before going live. The holder outlives the app on purpose — on Windows,
closing the pseudoconsole terminates its client, so whoever owns the
pseudoconsole decides whether a running assistant survives a restart — and
runs in its own process group with no console. It exits when its child does,
or on kill.

## The assistant bridge

Eyes and hands are the instance protocol behind `nus mcp`, an MCP server on
stdio that maps tools to the protocol's verbs. A verb whose answer waits on
the page — a DevTools reply, a capture on the next draw — is parked and
answered when it comes; a hand is parked in the pane's band until you
answer. Reading a page is the reader pipeline (`Runtime.evaluate`) and, for
pixels, the tab's texture read back — the OS screen is never read. Console
and network are DevTools events kept per page. Hands are
`Input.dispatchMouseEvent`, `Input.insertText`, `Input.dispatchKeyEvent`
and the tab's own navigation, each checked against the HANDS setting and the
allowed hosts before it runs; your input on that pane while a hand waits
cancels it and answers the tool *taken over*.

## Checkpoints and replay

Every shell pane records an asciinema v2 cast with resizes and command
markers. At each block boundary a checkpoint is taken for the tab: the cast
segment since the last one, the page beside as an MHTML snapshot plus its
URL and scroll, its pixels as the texture read back (skipped when the DOM is
unchanged), and each editor buffer as a diff. The store is
`profile/replay/<session>/`, pruned by age. Scrubbing replays the cast into
a scratch terminal up to *t* — the same core, so the picture is exact — and
swaps the page pane for the still. Sharing bundles the cast, the stills and
the WebAssembly renderer into one HTML file with everything inline, because a
`file://` page can fetch nothing; a replay needs no server and no nus.

## Closing

Closing a tab ends the whole process tree under its shell, not just the
shell: the process table is read once, walked leaves-first, and signalled —
a word first (SIGTERM, `taskkill`), a short breath when there were children,
then outright. Dropping a pane runs the same path, so nothing can orphan a
shell. A held shell is the holder's: closing its tab ends it on purpose, and
the holder reaps on its side; detach and quit let a working held shell go on
living, which is what holding is for.

## Security posture

- HTML is never used for UI. The only web content in the process is the
  user's browsing.
- Config is a sandboxed VM with no host access.
- Terminal and browser talk in typed messages, in process. The browser never
  gets a pty handle; the terminal never gets a `CefBrowser`.
- An assistant's hands run only under the HANDS setting and the allowed
  hosts, and any input of yours on the pane takes over.
- The instance port is loopback, with a per-launch token. The phone's page is
  plain HTTP on the local network with a token in its address, and turning it
  off closes the listener.
- Sync carries only ciphertext: every file sealed with XChaCha20-Poly1305
  under a key that lives on your devices, its path as associated data, its
  name on the carrier a hash. A forge token goes to the forge as a header per
  git command and is never in a URL or in git's config.
- CEF is pinned and bumped on Chromium's four-week cadence. A stale CEF is a
  stale browser.
- No telemetry. Crashes write a local log and stay there.

## Platforms

- **Windows:** ConPTY; pwsh as the default profile; WSL distros enumerated as
  profiles; D3D11 shared textures; a taskbar progress button and a tray
  entry; `RegisterHotKey` for the hatch.
- **macOS:** IOSurface shared textures; Apple silicon; notarized stable
  builds; the hatch drops from the camera housing on a notched display; a
  menu-bar entry.
- **Linux:** Wayland first, X11 works; a StatusNotifierItem tray where the
  desktop offers one; on Wayland the hatch is bound in the desktop's own
  shortcut settings, and placement and focus are the compositor's.
