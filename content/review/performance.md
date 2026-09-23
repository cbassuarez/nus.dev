# Performance

The figures above come from the September 23 M4 Pro measurements linked in the benchmark report. They are not fresh measurements of every package currently published. The report identifies its hardware, fixture and measurement endpoints.

## Three sizes, not one

Compressed download size, installed application size and runtime memory are different measurements. The [release record](../releases/) derives compressed sizes from the published assets. The source performance report separately describes the installed bundle and RSS measurements. A {{figure:mac.download}} MiB download does not describe its memory footprint.

## Targets that remain open

The reference report records a 2.72 ms p95 for warm Rust highlighting against a 2 ms target. The first browser tab includes initialization costs, and whole-process-tree idle RSS is larger than the per-additional-tab figure. These boundaries should travel with any copied number.

## Not a physical latency claim

The earlier 2.8 ms figure belongs to a historical spike. Current submission counters do not measure display scanout or photons. They cannot establish physical keyboard-to-screen latency or prove that no displayed frames were missed.

## Next useful evidence

The funded validation would cover lower-spec machines and native Windows/Linux packaged behavior, sustained resource use, and clean launch conditions. CPU submission, OS launch and physical presentation should be measured and named separately.

- [Measurement method, raw-data link and unmet targets]({{measurementSource}}/docs/PERFORMANCE_BUDGETS.md)
- [Resource ownership and retention budgets]({{measurementSource}}/docs/RESOURCE_BUDGETS.md)
- [Published package provenance](../releases/)

Historical syntax-highlight measurements retain their original [September 20 source report]({{measurementSource}}/docs/performance/2026-09-20-m4-pro.json). They have not been remeasured by this comparison suite.
