/* Site-level feel: Cuelume audio + Broadsheet motion. No meaning depends on either. */
import { bind, play, setEnabled, setVolume } from "../vendor/cuelume/0.2.2/index.js";
import { SOUND_VOLUME } from "./feel-config.js";
import { createFeel } from "./feel-core.js";
import { createMotion } from "./feel-motion.js";

const safeStorage = {
  getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { try { localStorage.setItem(key, value); } catch {} }
};

function setAudioSession(active) {
  if (typeof navigator === "undefined" || !navigator.audioSession) return;
  try {
    navigator.audioSession.type = active ? "playback" : "ambient";
  } catch {
    /* Older WebKit exposes no writable AudioSession API. */
  }
}

setVolume(SOUND_VOLUME);

export const feel = createFeel({
  audio: { play, setEnabled },
  storage: safeStorage,
  motion: createMotion(),
  dispatch(event) {
    document.dispatchEvent(new CustomEvent("nus:feel", { detail: event }));
  }
});

setAudioSession(feel.soundEnabled);

/*
 * WebKit/iOS can leave Web Audio suspended until resume() happens directly on
 * a real activating gesture. Prime Cuelume on that stack with a nearly silent
 * cue; do not synthesize anything before activation, and do not consume the
 * listener while sound is disabled.
 */
function installAudioPrimer() {
  if (typeof window === "undefined") return () => {};
  const events = ["pointerup", "touchend", "click", "keydown", "mousedown"];
  let primed = false;

  const remove = () => {
    for (const name of events) window.removeEventListener(name, prime, true);
  };

  const prime = () => {
    if (primed || !feel.soundEnabled) return;
    const activation = navigator.userActivation;
    if (activation && activation.hasBeenActive === false && activation.isActive === false) return;

    setAudioSession(true);
    play("tick", { volume: 0.0001 });
    primed = true;
    remove();
    document.dispatchEvent(new CustomEvent("nus:audio-prime"));
  };

  for (const name of events) {
    window.addEventListener(name, prime, { capture: true, passive: true });
  }
  return remove;
}

let removeAudioPrimer = installAudioPrimer();

function soundButton(root) {
  const button = root.querySelector("[data-sound-toggle]");
  if (!button) return;
  const on = button.querySelector("[data-sound-on]");
  const off = button.querySelector("[data-sound-off]");
  const paint = () => {
    const enabled = feel.soundEnabled;
    button.hidden = false;
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Mute site sounds" : "Enable site sounds");
    button.title = enabled ? "Sound · on" : "Sound · off";
    if (on) on.hidden = !enabled;
    if (off) off.hidden = enabled;
  };
  button.addEventListener("click", () => {
    if (feel.soundEnabled) {
      feel.setSound(false);
      setAudioSession(false);
      paint();
      return;
    }

    setAudioSession(true);
    feel.setSound(true);
    play("toggle", { volume: 0.35 });
    paint();
  });
  paint();
}

function primitiveBindings(root) {
  for (const link of root.querySelectorAll(".nav a, .reviewhead__exit a")) {
    link.setAttribute("data-cuelume-hover", "tick");
    link.setAttribute("data-cuelume-press", "press");
  }
  for (const button of root.querySelectorAll(".btn:not(.btn--signal):not([data-feel-semantic])")) {
    button.setAttribute("data-cuelume-press", "press");
    button.setAttribute("data-cuelume-release", "release");
  }
  for (const button of root.querySelectorAll(".btn--signal:not([data-feel-semantic])")) {
    button.setAttribute("data-cuelume-toggle", "pulse");
  }
  for (const link of root.querySelectorAll("[data-review-nav]")) {
    link.setAttribute("data-cuelume-hover", "tick");
  }
}

function semanticBindings(root) {
  root.addEventListener("click", event => {
    const nav = event.target instanceof Element ? event.target.closest("[data-review-nav]") : null;
    if (nav) feel.emit("review.navigate", { target: nav });
  }, true);

  root.addEventListener("play", event => {
    if (event.target instanceof HTMLMediaElement) feel.emit("film.play", { target: event.target });
  }, true);
}

export function mountFeel(root = document) {
  primitiveBindings(root);
  bind(root);
  soundButton(root);
  semanticBindings(root);
  return feel;
}

if (typeof document !== "undefined") mountFeel(document);

export const audioDiagnostics = {
  get enabled() { return feel.soundEnabled; },
  get userActivation() {
    if (typeof navigator === "undefined" || !navigator.userActivation) return null;
    return {
      hasBeenActive: navigator.userActivation.hasBeenActive,
      isActive: navigator.userActivation.isActive
    };
  },
  get audioSession() {
    return typeof navigator !== "undefined" && navigator.audioSession
      ? navigator.audioSession.type
      : null;
  },
  rearm() {
    removeAudioPrimer();
    removeAudioPrimer = installAudioPrimer();
    return true;
  }
};
