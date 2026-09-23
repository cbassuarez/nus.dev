# Real app footage

## Shell → page hero · September 23, 2026

`hero-desktop.mp4` (1440 × 1080) and `hero-mobile.mp4` (1080 × 1350) are twelve-second, 60-fps edits of a real nus workflow. A zsh PTY starts the included Fieldnotes development server with `npm run dev`; Command–Enter opens its page beside the same shell. The phone composition reframes the desktop recording; it does not depict a mobile app. These are paced demonstrations, not performance measurements.

The native master is 720 lossless PNG frames at 2240 × 1520, captured from an isolated 1120 × 760 logical-pixel window at 2×. Remotion reads those frames directly and adds framing and captions. Final web exports use H.264, CRF 17, yuv420p, 60 fps and faststart. Posters come from frame 540 of the same final compositions. No intermediate video is enlarged.

Source, fixture, capture runner, compositions and reproduction instructions live in the sibling `nus-promo` repository: `hero/README.md`, `hero/scripts/capture.py`, `hero/project/`, and `src/HeroPilot.tsx`. The selected take is `out/hero/take-03`; its `take.json` records the application binary hash and capture parameters. Retain its PNG masters locally. Only the final video, posters and provenance JSON belong here.

Videos load only on explicit Play, select the phone edit at widths up to 700 px, pause when hidden/offscreen, and end with Replay. There is no autoplay. Switching to reduced motion stops playback. The second Memphis recording retains its existing loop behavior.

## Earlier captures · September 20, 2026

`shell.mp4` / `shell.png` are the previous five-second build/test-output hero, retained as source history. They were captured through `NUS_SHOT` at 880 × 580 logical (2×), then downsampled to 1320 × 870. The Memphis clip shows the actual home background, with the same capture dimensions. Other stills and the history recording use a 1280 × 800 logical window, downsampled to 1600 × 1000. Those earlier files use H.264, CRF 24, yuv420p, 60 fps and faststart.

All captures use disposable profiles, never personal browser state or terminal history. The earlier scored promo is separate from these silent site demonstrations.
