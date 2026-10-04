# Milestones

This record distinguishes work evidenced in **{{reviewedTag}}** from remaining and proposed work. These statuses do not imply that a grant has been awarded or that planning reserves have been spent. Continuing maintenance is not an unlimited service commitment.

## 01 / Distribution baseline · partial

**Completed for the reviewed candidate:** Windows Authenticode signatures on five executable payloads and the installer, with signature verification. Packages, the release manifest and hashes are published for all three supported platforms.

**Open:** Apple Developer ID signing and notarization. Homebrew, winget and the rolling apt repository did not update because their required credentials were unavailable. The proposed domain purchase remains a planning item.

**Evidence:** [fixed candidate, signing results and integration outcomes](../releases/#reviewed-release). Keep the Mac preview label until publisher distribution is verified.

## 02 / Independent security round · proposed

The September 20 audit is historical and maintainer-led. Release tests and the bounded PTY ring proof do not replace outside examination. Agree researcher scope and payment terms, invite focused examination, reproduce findings and prioritize remediations.

**Evidence to produce:** scope, findings disposition, fixes and regressions. If no eligible findings arrive, document the outcome and seek funder agreement before reallocating the reserve; spending it is not itself success.

## 03 / Packaged platform validation · partial

**Completed for the reviewed candidate:** automated packaged browser rendering, timeout, crash, hang, retry and keyword regressions on the named macOS, Windows and Linux runners. Windows installer checks cover upgrade, native launch, normal uninstall, reinstall with the same local profile, and complete cleanup. Linux's Debian install, launch and removal check also passed.

**Open:** broader real-machine and lower-spec hardware acceptance, sustained resource use and independent testing of private-session and permission boundaries. The Mac walkthrough is a disposable local task, not certification of the other platforms.

**Evidence:** [runner matrix and scoped results](../releases/#reviewed-release), [current native captures](../try/) and a future hardware matrix naming OS, hardware, artifact hash, procedure and result. Unknown stays unknown.

## 04 / CEF investigation · proposed

Create the initial source-build environment, test the narrow extension hypothesis, and decide whether a maintained patch is justified. Standard Chrome extensions remain unsupported today.

**Evidence to produce:** recipe, patch where applicable, compatibility matrix, failed approaches and measured maintenance cost. A rigorous negative result closes this milestone.

## 05 / Closeout · proposed

Publish an expense and outcomes record, remaining obligations and open limitations. Reconcile existing signing work with actual costs before funding is agreed. Signing and domain renewals remain visible as future obligations, even when funds have been reserved.

**Evidence to produce:** amount allocated, spent and remaining per category; public work produced; any funder-approved reallocation. Do not publish researchers' personal payment details.

[Use of funds](../funding/) · [What is outside the claims](../limitations/)
