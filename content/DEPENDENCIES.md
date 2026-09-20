# Dependencies

What nus is built on, what it bundles, and what it read but did not copy.
Every release package carries the licences of what it ships.

## Bundled

- **Chromium**, through the Chromium Embedded Framework (BSD). The version
  is pinned by the `cef-rs` submodule and bumped on Chromium's four-week
  cadence. Windows x64, macOS Apple silicon, Linux x64.
- **Fonts:** IBM Plex Mono, Victor Mono, JetBrains Mono (all OFL), ABC Areal
  with its Semi Mono and Mono (under its own licence), and Newsreader (OFL)
  for the wordmark and the reader. No system font installation is required.
- **Icons:** Phosphor (MIT), rasterized into the glyph atlas.
- **Grammars:** tree-sitter grammars for bash and PowerShell (MIT), in the
  binary; others fetch on request as bundles.
- **Sounds:** seventeen synth recipes, rendered by nus's own synth at
  runtime — no sample files.

## Carried as source

- `cef-rs` (tauri-apps), as a submodule with nus's patches around offscreen
  shared textures and Chrome-runtime windowless mode.
- `wgpu-hal`, crates.io plus a macOS first-frame fix that is on its way
  upstream.

## Crates

wgpu, winit, raw-window-handle, vte, portable-pty, unicode-width, swash,
rustybuzz, fontdb, tree-sitter, ropey, lsp-types, lsp-server, adblock
(Brave's engine), mlua (Luau), rusqlite (browser import), keyring,
notify-rust, cpal (sound), AccessKit, rfd (the system's own file dialog —
NSOpenPanel, the common item dialog, the XDG portal), image, and the
`windows` crate for notifications, the taskbar and the process table.

## Ported

- **The caret** is Neovide's cursor renderer, ported: four critically damped
  springs drawn as one quad (MIT).
- **Scrolling** rides neoscroll's easing curves (MIT).

## Read, not copied

- **Ghostty** — terminal state design, the Kitty keyboard and graphics
  protocols, shaping.
- **Alacritty** — `vte` in practice, the grid.
- **WezTerm** — ConPTY's quirks, SSH profiles.
- **Brave** — integrating the `adblock` engine.
- **Zed / gpui** — scene graph and text system design.
- **Arc, Dia, Zen, Vivaldi, Orion** — the browser side; **Rio, kitty, Warp** —
  the terminal side. Arc's sidebar and Chromium's bookmarks and history
  formats, for import.
