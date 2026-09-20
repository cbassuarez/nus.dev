import { FEEL_EVENTS } from "./feel-config.js";

export function createFeel({ audio, storage, motion, dispatch } = {}) {
  if (!audio || typeof audio.play !== "function" || typeof audio.setEnabled !== "function") {
    throw new TypeError("Feel requires an audio adapter");
  }
  const store = storage || { getItem(){ return null; }, setItem(){} };
  const mover = motion || { run(){} };
  let soundEnabled = store.getItem("nus.sound") !== "off";
  audio.setEnabled(soundEnabled);

  function emit(name, options = {}) {
    const spec = FEEL_EVENTS[name];
    if (!spec) throw new Error("Unknown feel event: " + name);
    const event = {
      name,
      cue: spec.cue || null,
      motion: spec.motion || null,
      target: options.target || null,
      detail: options.detail || null
    };
    if (typeof dispatch === "function") dispatch(event);
    if (soundEnabled && spec.cue) audio.play(spec.cue, { volume: spec.volume == null ? 1 : spec.volume });
    if (spec.motion && options.target) mover.run(spec.motion, options.target, options.detail);
    return event;
  }

  function setSound(enabled) {
    soundEnabled = Boolean(enabled);
    audio.setEnabled(soundEnabled);
    store.setItem("nus.sound", soundEnabled ? "on" : "off");
    return soundEnabled;
  }

  return {
    emit,
    setSound,
    get soundEnabled() { return soundEnabled; }
  };
}
