# Feel — sound and motion

Sound and motion are two outputs of the same interaction language.

**Sound describes an interaction that already has a visible state. Motion describes a state change that already exists in the document. Neither creates meaning on its own.**

## Audio

The site vendors an exact Cuelume release under assets/vendor/cuelume. Normal builds never fetch it.

- Sound is enabled by default.
- Browsers still decide when Web Audio may start; nus.dev does not try to defeat autoplay policy.
- The global site volume is 0.55.
- The user can mute from the masthead. The preference is stored as nus.sound = on/off.
- Muting is immediately silent. Enabling sound may acknowledge itself.
- Prose links are quiet. Chrome and explicit controls carry the interaction vocabulary.
- Semantic Review events suppress generic activation cues so one action does not become a stack of sounds.

Update Cuelume intentionally:

    npm run vendor:cuelume -- 0.2.2
    npm run build
    npm test

Listen through scripts/checks/feel.html before committing a version change.

## Motion

Broadsheet motion uses the existing timing tokens: fast 90 ms, base 160 ms, slow 220 ms, one ease-out cubic.

Allowed gestures are rule extension, small vertical settling, state replacement and the existing hard-shadow button movement. Content does not bounce, blur, zoom or spring.

Review pages opt into same-origin cross-document View Transitions as progressive enhancement. Unsupported browsers get ordinary navigation. The Review masthead and rail remain stable furniture; the document changes.

prefers-reduced-motion settles the same composition immediately. Reduced motion does not mute sound, and muting sound does not alter motion.

## Review semantics

- review.navigate -> page
- review.disclosure.open -> bloom + reveal
- review.disclosure.close -> droplet
- review.inspect -> scan + inspect
- review.funding.open -> page + reveal
- review.copy.success -> success + confirm
- review.copy.error -> error + refuse
- review.refresh.start -> loading + working
- review.refresh.ready -> ready
- review.refresh.error -> error + refuse
- film.play -> pulse

## Manual release check

- Fresh load makes no sound before interaction.
- Audio is enabled by default after the browser permits it.
- Mute is immediate and survives reload.
- Keyboard activation receives the same semantic feedback as pointer activation.
- Touch scrolling does not synthesize hover noise.
- Ordinary reading stays quiet.
- Reduced motion is settled immediately.
- Review works without JavaScript.
- Review navigation degrades cleanly when View Transitions are unavailable.
- No Cuelume runtime request leaves nus.dev.
- No state exists only as sound or motion.
