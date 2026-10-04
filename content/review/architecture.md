# Architecture

A shell, a page, an editor and an assistant can share a task without becoming one undifferentiated trust domain. The host connects their views; each boundary still needs an implementation and a test.

## A local working environment

The native host owns windows, tab state, rules and the compositor. A PTY connects the terminal to the user's shell. CEF handles web pages and hands their rendered output to the host. The editor uses ropes and language-server tooling. The assistant can use an installed command or a configured provider.

The diagram above is conceptual, not a process inventory or proof of sandbox isolation. In particular, embedding Chromium does not mean Chromium has become a Rust component or a single process.

## Replace the assistant, keep the workspace

The documented assistant routes include local and hosted backends. A declared command can receive a prompt on stdin and return an answer on stdout. An explicitly chosen backend that is missing should fail visibly rather than silently changing providers.

Hosted providers retain their own account requirements and data policies. A local option does not make a selected cloud provider local.

## Profiles and sync

A profile lives locally. “Here” uses a shared location for the installed channel, so updating, reinstalling or moving the app continues with the same local profile without sync. A busy or failed legacy migration stops rather than creating a duplicate. Normal uninstall keeps the profile for reinstall; deliberate complete cleanup removes that channel's local data, recovery copies, vault keys, logs and owned retained packages.

Other channels, projects and external sync folders remain outside that cleanup. [Try and cleanup instructions](../try/) describe the two uninstall choices.

Optional sync encrypts selected profile files under a user-held key and carries them through a chosen folder or private Git remote. There is no nus-operated account or sync service in the path. The carrier can still observe blob sizes and timing, and losing the key has recovery consequences described in the source notes.

## Keeping and finding the task

Kept provides one record for a page's bookmark, reading, saved-copy, keyword, pin and collection roles. Address and palette results prioritize those records; `said:<word>` searches saved copies. The shared Find bar searches pages, shells and editors, with wider scopes when the current pane has no answer. Whole-word and pattern support depends on the surface; browser-page search stays plain text and case.

Orrery and tab dragging arrange the same workspace. Tab rows report running, listening, waiting, finished, playing and edited state. These are views of local task state, not a claim that web pages, executable tools and assistant output share one trust level.

## Implementation record

- [Host architecture]({{source}}/docs/ARCHITECTURE.md)
- [Assistant selection and execution]({{source}}/spikes/composite/src/ask.rs)
- [Sync design and its threat model]({{source}}/docs/SYNC.md)
- [Privacy and context disclosure]({{source}}/docs/PRIVACY_AND_DIAGNOSTICS.md)

These links refer to the source revision used for this packet. The newest branch can move independently of that record.
