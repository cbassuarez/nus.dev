# Measurements

The numbers the site quotes, and how each was taken. [Comparison charts and raw observations](../../benchmarks/) cover these same figures. Runtime figures were measured on {{figure:recorded.date}} using the local optimized macOS build on an Apple M4 Pro with 48 GiB RAM; package sizes retain their separately named release. Every figure here is a
recorded run on a release build, not an estimate; where a number is from an
isolated harness rather than the full application, it says so.

## Size

| Platform | Download | On disk |
|---|---|---|
| macOS, Apple silicon | {{figure:mac.download}} MiB `.zip` | {{figure:mac.disk}} MiB `nus.app` |
| Windows, x64 | {{figure:windows.download}} MiB `.zip` | {{figure:windows.disk}} MiB |
| Linux, x64 | {{figure:linux.download}} MiB `.tar.gz` | {{figure:linux.disk}} GiB |

Packages from {{figure:package.release}}, verified against their published SHA-256 hashes. macOS on-disk size is allocated storage after extraction on APFS; Windows/Linux sizes are unpacked file bytes, not native filesystem allocation.
Chromium is most of every one of them; the Linux library also carries its
symbol table, which is where its on-disk figure comes from.

## Memory

| Measurement | Result |
|---|---|
| Additional idle browser tabs | {{figure:tabs.range}} MiB each, after initialization |
| Additional empty windows | {{figure:windows.range}} MiB each |

Five independent profiles were measured through eight browser tabs and four windows. Tab deltas use summed process-tree RSS; window deltas use parent-process RSS. Shared pages can be counted more than once. The first browser tab and its initialization cost are excluded from the per-further-tab range.

What each further tab or window adds to the process once it has finished
initializing and gone idle — the marginal cost, not the baseline. A browser
tab is a full Chromium renderer, which is where the hundred megabytes go; a
window is only the app's own state, which is why an empty one costs so
little.

Empty-window RSS deltas include a negative observation. Process pages can be reclaimed between snapshots; this is a measured change in resident memory, not a negative allocation cost. The full range is retained.

## Opening files

| Measurement | Result |
|---|---|
| A 10 MiB file | {{figure:file10.p95}} ms at p95, across 20 opens |
| A 100 MiB file | {{figure:file100.max}} ms at most, across five opens |

Each open used an independent process with a fresh onboarded profile; one excluded warmup preceded each file-size experiment. The endpoint is loaded-content submission, not display scanout. Filesystem caches were not evicted.

Opening a file means the editor pane, on a real file of that size. The
buffer is a rope, so a large file is not copied into place line by line. The
p95 is an empirical percentile from this sample, not a tail guarantee; the maximum is given for the large file
because five opens are too few for a percentile to mean anything.

## Optimized build observations

The same local optimized release binary was used for the current native
and browser measurements. The frozen original and optimized build
were measured on this Mac; OS caches, thermals and background activity were
uncontrolled. These are observations from one machine, not performance promises.

| Measurement | Original | Optimized |
|---|---|---|
| Native startup, median | 388.7 ms, 5 runs | 271.0 ms, 10 runs |
| Settled native-home process-tree RSS, median | 393.0 MiB | 127.5 MiB |
| UI loop turns during a ten-second native-home fixture, median | 8,220 | 391 |

Idle results use three independent profiles per build. Startup ends at the
present-call return. Browser framework loading now happens at first browser
use, so the native-startup improvement shifts work rather than eliminating all
browser initialization. UI loop turns are not kernel wakeups, CPU usage or
energy; RSS can double-count shared pages.

Speedometer 3.1 scored **44.3** for NUS
(observed range 43.4–45.1) and
**40.1** for Zen
(range 33.6–40.9).
Each product used five fresh-profile launches in alternating order; each score
contains ten internal iterations of unchanged, pinned default workloads.
These measure web-app responsiveness, not whole-workspace productivity.
Zen trial 4 stalled with its window appearing as a macOS thumbnail and completed
before timeout after read-only UI inspection, which may have changed focus.
Its lower score is retained. Continuous foreground/occlusion was not instrumented;
this batch does not establish a tightly controlled causal competitor speedup.

The first lightweight calibration regressed to about 29. A repeated document
scan on input was removed; a same-host pilot measured 42.5 on the original and
42.4 after the correction. Those single pilots diagnose recovery, not a gain
over the original. All five final trials, individual suite timings, binary
identities and the failed calibration remain available in the
[browser observations](../../assets/benchmarks/browser.json),
[calibration report](../../assets/benchmarks/browser-lightweight-calibration.json)
and [comparison protocol](../../assets/benchmarks/COMPARISON_PROTOCOL.md).

Disposable HTTP, code and GPU caches share a **256 MiB retention budget across
containers after graceful shutdown**. This is not a live-session hard cap or a
limit on the whole profile. Cookies, IndexedDB, service-worker data, projects,
downloads and recovery generations are excluded. Active recordings count
toward the existing 128 MiB replay retention budget but are never deleted to
meet it; their per-window limits still apply.

The Dock animation bank fell from 13,826,538 to 5,384,341 bytes. The Dock settles
on static Mercury artwork; the claim and Settings preview retain their motion.
The before/after resource evidence, sleeping-tab lifecycle checks and precise
boundaries are in the [lightweight report](../../assets/benchmarks/lightweight.json).
[Collector sources](../../assets/benchmarks/collectors.zip) and
[native workflow observations](../../assets/benchmarks/catalog.json) are available
for reproduction. Historical results remain in the catalog.

## The terminal — historical Windows spike

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
