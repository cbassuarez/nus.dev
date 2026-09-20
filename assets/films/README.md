# Real app footage

Recorded from the macOS nus app using its built-in `NUS_SHOT` recorder, September 20, 2026. The window controls and all application chrome come from the running app. These are paced demonstrations, not performance measurements. Shell commands run in a real PTY.

The hero uses an 880 × 580 logical-pixel window (2× capture), downsampled to 1320 × 870. The terminal runs this site's build and release tests. The second window shows the Memphis home background. Other stills and the history recording use a 1280 × 800 window, downsampled to 1600 × 1000.

Capture with an isolated profile (`NUS_SHOT_DIR`) and an onboarded marker, never a personal browser profile. Set `NUS_MODE=paper`, `NUS_SHOT_SIZE=880x580`, `NUS_SHOT_OUT` to a temporary folder and `NUS_SHOT` to a script using the app's documented recorder commands. The Memphis script opens `home`, chooses `homelook art memphis`, waits for the scene to settle, takes `shot memphis`, then uses `record memphis 5`. The shell script builds this repository, then runs its tests during a five-second recording.

Encode frame sequences with FFmpeg: H.264, CRF 24, yuv420p, 60 fps, faststart. Posters use the corresponding app-generated PNG. Keep the full window in frame. Videos are loaded only when the visitor requests playback, and pause when hidden or offscreen.

Delete temporary frame sequences and demo profiles after reviewing the encoded result. Only final footage belongs in the repository.
