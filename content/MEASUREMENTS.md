# Measurements

The numbers the site quotes, and how each was taken. Every figure here is a
recorded run on a release build, not an estimate; where a number is from an
isolated harness rather than the full application, it says so.

## Size

| Platform | Download | On disk |
|---|---|---|
| macOS, Apple silicon | 154 MiB `.zip` | 355 MiB `nus.app` |
| Windows, x64 | 191 MiB `.zip` | 457 MiB |
| Linux, x64 | 358 MiB `.tar.gz` | 1.49 GiB |

The current release packages, as published, and what they unpack to.
Chromium is most of every one of them; the Linux library also carries its
symbol table, which is where its on-disk figure comes from.

## Memory

| Measurement | Result |
|---|---|
| Additional idle browser tabs | 101–102 MiB each, after initialization |
| Additional empty windows | 1.5–19 MiB each |

What each further tab or window adds to the process once it has finished
initializing and gone idle — the marginal cost, not the baseline. A browser
tab is a full Chromium renderer, which is where the hundred megabytes go; a
window is only the app's own state, which is why an empty one costs so
little.

## Opening files

| Measurement | Result |
|---|---|
| A 10 MiB file | 28.9 ms at p95, across 20 opens |
| A 100 MiB file | 63 ms at most, across five opens |

Opening a file means the editor pane, on a real file of that size. The
buffer is a rope, so a large file is not copied into place line by line. The
p95 is the number to plan around; the maximum is given for the large file
because five opens are too few for a percentile to mean anything.

## The terminal

| Measurement | Result |
|---|---|
| Key event → present call | 2.77 ms mean over 134 keystrokes |
| Full-screen frame, vim, 80×42 | 1.5–1.8 ms |
| Dumping a 10k-line file | 0.88 ms per frame, average |
| Browser texture | 144 fps, vsync-bound on a 144 Hz display |

Taken on Windows 11 with an Intel integrated GPU over Vulkan, at 13pt × 1.25
DPI, in release. Latency is measured from the window's key event to the
present call of the frame containing the echo — including ConPTY and
PowerShell's own round trip — in the isolated rendering harness, not the
full application, and a present call is not a photon: GPU scheduling,
compositor queues, refresh and scanout add to it. It is an upper bound on
what nus itself spends, not on what you see. The frame figures are for the
renderer building a full screen of shaped, rasterized cells. The browser
figure is Chromium's paint output arriving as a shared D3D11 texture and
being drawn by the compositor, which runs at the display's rate.

## What is checked on every release

Each platform package is built, its tests run, its executable and runtime
loader started, and its archive hashed before anything is published. The
Mac build has native checks over startup, settings, the hatch, downloads and
the sidebar, run with isolated profiles and real PTYs, each of which also
captures paper and ink at narrow and wide widths for review. Latency and
memory are re-measured by hand on reference hardware, not inferred from
those functional runs.
