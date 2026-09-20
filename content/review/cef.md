# CEF research

One browser problem has a large build behind it. The question is not whether nus can display a web page; it is whether a source-built CEF change can make the extension model fit its existing offscreen rendering path.

## Where the boundary is today

| Capability | Current account |
|---|---|
| Web-page rendering | CEF output composited by the native host |
| DevTools | Available through the embedded browser tooling |
| Userscripts and site behavior | Native/injected routes described in the source |
| Standard Chrome extension model | Not supported for nus's OSR tabs |

The extension notes describe Chrome-style tab and request plumbing that Alloy/offscreen views do not receive. The proposed patch is a hypothesis to test, not an established small fix.

## A bounded question

Can a maintained libcef change attach the necessary extension machinery without replacing the rendering path or weakening browser security boundaries?

The **{{budget:cef}}** allowance funds one initial platform, a pinned source version, a limited build/rebuild budget and a small explicit compatibility test set. Document source revision, compiler, build flags, storage needs and measured build cost. Retain only the caches and outputs the experiment needs.

## A / Works

Publish the patch, build recipe and compatibility results. Identify the security checks and ongoing maintenance cost before proposing wider use.

## B / Partial

Publish exactly which tab, content-script, request-handling and extension-UI behaviors work. Partial compatibility is not universal Chrome extension support.

## C / Does not work

Publish the failure evidence and close the branch of investigation. Do not spend indefinitely trying to rescue a preferred implementation.

## Independent of the public release

This experiment must not hold ordinary nus distribution hostage. A usable release with a clearly stated extension limitation remains a useful deliverable.

[Source proposal and known barriers]({{source}}/docs/EXTENSIONS.md) · [CEF integration]({{source}}/spikes/composite/src/browser.rs)
