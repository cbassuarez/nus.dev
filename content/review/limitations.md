# Not claimed

The evidence is more useful when its edges are visible. These are technical limits and deliberate product choices, not items quietly promised for the next release.

## Universal Chrome extensions

Not supported by the current OSR architecture. The CEF proposal funds an investigation, not guaranteed compatibility with every extension or API.

## An independent security certification

The prior review was maintainer-led and automated. Reported fixes are evidence of work, not proof of absence. The proposed research reserve is not an active public bounty program.

## Cross-platform benchmark parity

An M4 Pro fixture does not certify lower-spec Windows or Linux behavior. Download sizes are not runtime-memory measurements, and compile success is not native GUI acceptance.

## Perfect isolation from hostile context

Page text, files and command output can influence an assistant. Deliberate execution controls do not make a suggested command trustworthy. A hosted model can receive selected context when the user sends a question.

## Signed production builds on every platform

The reviewed Windows package and installer are Authenticode signed. The Mac package remains ad-hoc signed and is not Apple-notarized; Linux publishes SHA-256 checksums. Read each current asset's own label when downloads advance. Signing identifies a publisher; a checksum identifies bytes; neither is a security audit.

## Default accelerated rendering in the current Mac split capture

The local {{reviewedTag}} capture showed a black strip and clipped page content in the accelerated browser split; its resized-paint wait did not finish. The software-paint capture passed. The cause is not yet established. The [evidence record and original capture](../releases/#reviewed-release) retain this open observation; the walkthrough names its software-paint path explicitly.

## Package-manager availability everywhere

The reviewed release did not update Homebrew, winget or the rolling apt repository. Their optional jobs exited successfully without the required credentials. Direct release packages, including the Windows installer and Debian package, were published. A green job does not establish that a package-manager listing changed.

## No dependencies or licensing constraints

nus depends on Chromium/CEF, native libraries, fonts and other software with their own licenses. MIT on the project does not relicense those dependencies. Media/DRM support and distribution rights need their own verification; this packet does not certify them.

## A nus-operated cloud service

Not required. A user can still choose external websites, Git hosting, sync transport and hosted assistants, each with its own service relationship.

## A community-governed roadmap

The project is maintainer-led. Reports and contributions can inform its development without purchasing control of the design or a response-time guarantee.

## A confidential data room

This section is unlisted and asks crawlers not to index it. Anyone with its URL can read it, and its public source repository remains discoverable. No secrets, private vulnerability reports or payment details belong here.

[Security record]({{source}}/SECURITY.md) · [Release contract]({{source}}/docs/RELEASING.md) · [Dependency notices]({{source}}/NOTICE)
