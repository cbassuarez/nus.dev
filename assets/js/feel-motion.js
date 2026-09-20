export function createMotion({ reduced } = {}) {
  const media = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  const isReduced = () => reduced === true || (reduced == null && Boolean(media && media.matches));

  function run(name, target) {
    if (!target || isReduced()) return;
    target.dataset.feelMotion = name;
    const clean = () => {
      if (target.dataset.feelMotion === name) delete target.dataset.feelMotion;
    };
    target.addEventListener("animationend", clean, { once: true });
    setTimeout(clean, 500);
  }

  return { run, isReduced };
}
