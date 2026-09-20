/* Site-level feel: Cuelume audio + Broadsheet motion. No meaning depends on either. */
import { bind, play, setEnabled, setVolume } from "../vendor/cuelume/0.2.2/index.js";
import { SOUND_VOLUME } from "./feel-config.js";
import { createFeel } from "./feel-core.js";
import { createMotion } from "./feel-motion.js";

const safeStorage = {
  getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { try { localStorage.setItem(key, value); } catch {} }
};

setVolume(SOUND_VOLUME);

export const feel = createFeel({
  audio: { play, setEnabled },
  storage: safeStorage,
  motion: createMotion(),
  dispatch(event) {
    document.dispatchEvent(new CustomEvent("nus:feel", { detail: event }));
  }
});

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
      paint();
      return;
    }
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
