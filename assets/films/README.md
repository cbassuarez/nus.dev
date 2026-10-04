# Real app footage

## Hello World workflow and details · October 4, 2026

`nus-hero-web.mp4` is a fourteen-second, silent recording of the native
macOS app: run `npm run dev`, open the Hello World page beside the shell,
and click its working counter twice. The native topbar stays in the image.
The H.264 web export is 1600 × 1086, 30 fps, CRF 19, yuv420p and faststart;
its full-resolution poster is 2240 × 1520. The 60-fps lossless native
masters contain a four-second command take followed by a ten-second page
take. This is a paced demonstration, not a latency measurement.

The homepage hero autoplays muted and loops while visible. Its compact
pause control overlays the video; there is no caption row. It pauses
when offscreen, when the page is hidden, and when the site navigates away.
Reduced motion shows the poster until the visitor explicitly selects Play.
The same desktop composition keeps its original proportions on phones.

The numbered tour and product guide use the same project's native stills:

- `nus-home-project.png`: 2105 × 1246, the prompt, saved commands, project
  and resumable development server.
- `nus-editor-detail.png`: 1433 × 957, the actual main.js source and file tab.
- `nus-history-detail.png`: 1176 × 1208, searchable commands, output and map.
- `nus-hatch-project.png`: 1920 × 936, a real running development server
  and a finished source check. This replaces the HTML drawing of Hatch.

These details omit the native window topbar. The PNGs preserve the captured
pixels, with full-size links. `hello-world-provenance.json` records build
and script hashes, capture geometry, verified counter/status states and
export hashes. All new captures use isolated profiles, clear hover before
every frame, suppress automatic URL hint chips, and disable port toasts.
Lossless masters, fixture and scripts are retained with the capture work.

## Panels tour captures · September 26, 2026

`nus-shell-page-2026-09-26.webp`, `nus-split-2026-09-26.webp`,
`nus-history-2026-09-26.webp` and `nus-assistants-2026-09-26.webp` are the
author's supplied 2000 × 1194 captures of the current app in its dark theme
with a green signal, taken just after the site redesign was pushed: a zsh
session beside the GitHub page it pushed to, the same tab split into two
shells, that session's command history, and Settings · Assistants. They are
WebP with only their colour profile (no EXIF or XMP), displayed intact with
full-size links. The assistants capture remains beside its own section. The other captures
are retained as source history; the numbered tour now uses the Hello World
project above.

## Earlier Home still · September 26, 2026

`nus-home-2026-09-26.png` is the author's supplied 3204 × 1912 screenshot of
the current nus home, with the dark Memphis background and sidebar. It is
displayed intact at its original proportions, with a full-size link. It is a
still image, not an interactive terminal or a recording of the older build.
The original pixels, including the session rows, are preserved. The earlier
recordings below remain available on the product pages and as source history.

## Shell → page hero · September 23, 2026

`hero-desktop.mp4` (1440 × 1080) and `hero-mobile.mp4` (1080 × 1350) are twelve-second, 60-fps edits of a real nus workflow. A zsh PTY starts the included Fieldnotes development server with `npm run dev`; Command–Enter opens its page beside the same shell. The phone composition reframes the desktop recording; it does not depict a mobile app. These are paced demonstrations, not performance measurements.

The native master is 720 lossless PNG frames at 2240 × 1520, captured from an isolated 1120 × 760 logical-pixel window at 2×. Remotion reads those frames directly and adds framing and captions. Final web exports use H.264, CRF 17, yuv420p, 60 fps and faststart. Posters come from frame 540 of the same final compositions. No intermediate video is enlarged.

Source, fixture, capture runner, compositions and reproduction instructions live in the sibling `nus-promo` repository: `hero/README.md`, `hero/scripts/capture.py`, `hero/project/`, and `src/HeroPilot.tsx`. The selected take is `out/hero/take-03`; its `take.json` records the application binary hash and capture parameters. Retain its PNG masters locally. Only the final video, posters and provenance JSON belong here.

The older player loads only on explicit Play, selects the phone edit at widths up to 700 px, pauses when hidden/offscreen, and ends with Replay. The new homepage uses the Hello World autoplay behavior described above. Switching to reduced motion stops playback. The second Memphis recording retains its existing loop behavior.

## Earlier captures · September 20, 2026

`shell.mp4` / `shell.png` are the previous five-second build/test-output hero, retained as source history. They were captured through `NUS_SHOT` at 880 × 580 logical (2×), then downsampled to 1320 × 870. The Memphis clip shows the actual home background, with the same capture dimensions. Other stills and the history recording use a 1280 × 800 logical window, downsampled to 1600 × 1000. Those earlier files use H.264, CRF 24, yuv420p, 60 fps and faststart.

Scripted captures use disposable profiles, never personal browser state or terminal history. Author-supplied September 26 captures preserve their original pixels. The earlier scored promo is separate from these silent site demonstrations.
