# Security

The unusual part of nus is also the risky part: web pages, shells and assistants share a working context. The grant would fund closer examination of those boundaries, not a promise that integration makes them safe.

## Trust model

| Actor or input | Treatment |
|---|---|
| The local user | Trusted to control their own shell |
| Web pages and page text | Untrusted |
| Command output | Potentially attacker-controlled |
| Other local programs | Not automatically authorized |
| The local network | Untrusted |

## Intended invariants

**Assistant output does not execute itself.** The Ask panel requires a deliberate user action to run a suggestion. Page/tab-influenced answers require an additional confirmation; multiline output is inserted for inspection rather than given an automatic sequence of Enters. This describes the Ask panel, not an instruction to distrust every shell automation the user deliberately configures.

**Private mode exposes less.** Private sessions are intended to refuse shells, assistants, CLI/remote control and external debugging. Downloads remain an explicitly documented persistence exception.

**Local control requires credentials.** The source documents random instance tokens and owner-only credential handling. Optional phone access is a separate, narrowed interface with TLS and first-connection trust limitations.

**Context is visible.** The assistant shows which context is selected. Shell, block and page chips may start enabled. A question sent to a hosted backend transmits its selected context; this is not a claim that no information ever leaves the device.

[Invariant source and tests]({{source}}/SECURITY.md) · [Ask implementation]({{source}}/spikes/composite/src/ask.rs) · [Private-session implementation]({{source}}/spikes/composite/src/private.rs)

## What the prior review reported

| Finding in the September 20 audit | Recorded response |
|---|---|
| Ordinary browsing used a test keychain | Production Keychain path restored; macOS fixture checked |
| External debugging opened by default | Deliberate opt-in and loopback binding |
| Weak local-control credentials | OS randomness and owner-only file handling |
| Unauthenticated launch handoff | Authenticated requests and acknowledgment |
| Private-context persistence | Explicit private context and disposable process root |
| Permission decisions crossed origins | Full-origin parsing and regression coverage |

This is a **historical, maintainer-led review record**. Its original scope and open release gates remain relevant. Publishing a package does not retroactively prove every listed platform test passed. A funded round should tie fresh results to one fixed packaged candidate.

[Full audit, including remaining gates]({{source}}/docs/RELEASE_AUDIT_2026-09-20.md)

## Proposed independent round

The proposal reserves **{{budget:bounties}}** for outside research and **{{budget:automated}}** for automated analysis and reproduction. The bounty reserve is not yet an active program.

Before researchers begin, establish scope, authorization, award limits, duplicate treatment, disclosure coordination and payment terms. Investigate locally on disposable test data. A useful finding includes reproducible impact, maintainer validation and a regression test where feasible. Details that would expose users should wait for coordinated remediation.

A bounty buys a finding, not a clean bill of health.

## A limit worth keeping visible

Hostile repository or command output can enter assistant context. The documented double-confirmation rule does not label all shell output as web context. User confirmation reduces accidental execution; it does not prove that an assistant's suggestion is safe.

[Context handling and limitations]({{source}}/docs/PRIVACY_AND_DIAGNOSTICS.md) · [Funding terms](../funding/)
