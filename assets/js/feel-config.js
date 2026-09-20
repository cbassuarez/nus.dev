/* nus.dev sensory policy. Meaning first; sound and motion are outputs. */
export const SOUND_DEFAULT = true;
export const SOUND_VOLUME = 0.55;

export const FEEL_EVENTS = Object.freeze({
  "review.navigate":          { cue: "page",    volume: 0.42 },
  "review.disclosure.open":  { cue: "bloom",   volume: 0.38, motion: "reveal" },
  "review.disclosure.close": { cue: "droplet", volume: 0.34, motion: "collapse" },
  "review.inspect":           { cue: "scan",    volume: 0.36, motion: "inspect" },
  "review.funding.open":      { cue: "page",    volume: 0.34, motion: "reveal" },
  "review.copy.success":      { cue: "success", volume: 0.42, motion: "confirm" },
  "review.copy.error":        { cue: "error",   volume: 0.44, motion: "refuse" },
  "review.refresh.start":     { cue: "loading", volume: 0.30, motion: "working" },
  "review.refresh.ready":     { cue: "ready",   volume: 0.38, motion: "ready" },
  "review.refresh.error":     { cue: "error",   volume: 0.40, motion: "refuse" },
  "film.play":                { cue: "pulse",   volume: 0.32 }
});
