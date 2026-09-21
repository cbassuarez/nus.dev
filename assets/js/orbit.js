/* The orbit.
 *
 * Two windows travel an ellipse around the copy between them, the way the
 * icon's band orbits the wordmark: tilted −24°, behind at the top of the
 * sweep and in front at the belly.
 *
 * The page is never prevented from scrolling. The scene is pinned with
 * position: sticky for one extra viewport and the orbit is driven from how far
 * through that pin you are, so a flick of the wheel still leaves — the motion
 * is bounded, not captured.
 *
 * Depth reads the way the app reads it: scale and overlap, plus the 60%
 * opacity the chrome already uses for anything inactive. Nothing blurs,
 * nothing is translucent, nothing is rounded.
 */

const TILT = (-24 * Math.PI) / 180;  // the icon's band, in radians
const RING = 0.30;                   // how far the front of the ring dips
const MIN_OPACITY = 0.6;             // the chrome's own "inactive"

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Where a body sits at angle θ, in the orbit's own space. */
function place(theta, a, c) {
  const x0 = Math.cos(theta) * a;
  const z = Math.sin(theta) * c;
  const y0 = z * RING;                 // the near side of the ring rides lower

  // Roll the whole ellipse by the wordmark's tilt.
  const x = x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
  const y = x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
  return { x, y, z };
}

export function mountOrbit(root) {
  if(!root)return null;
  const stage = root.querySelector('[data-orbit-stage]');
  const bodies = [...root.querySelectorAll('[data-orbit-body]')];
  const dial = root.querySelector('[data-orbit-dial]');
  if (!stage || bodies.length < 2) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 700px)');

  let raf = null;
  let live = false;

  function flat() {
    return reduced.matches || narrow.matches;
  }

  function reset() {
    bodies.forEach((b) => {
      b.style.removeProperty('--x');
      b.style.removeProperty('--y');
      b.style.removeProperty('--z');
      b.style.removeProperty('--s');
      b.style.removeProperty('--o');
      b.style.removeProperty('--zi');
    });
    if (dial) dial.style.setProperty('--p', 0);
  }

  function frame() {
    raf = null;
    if (flat()) return;

    const rail = root.querySelector('[data-orbit-rail]');
    const railBox = rail.getBoundingClientRect();
    const travel = railBox.height - stage.offsetHeight;
    const p = travel > 0 ? clamp(-railBox.top / travel, 0, 1) : 0;

    // Half a turn across the pin: the two windows trade places.
    const theta0 = p * Math.PI;

    // Keep the complete Mac window and its caption visible at rest.
    const a = stage.offsetWidth * 0.35;
    const c = 260;

    bodies.forEach((body, i) => {
      const { x, y, z } = place(theta0 + i * Math.PI, a, c);
      const depth = z / c;                       // −1 behind … +1 in front
      body.style.setProperty('--x', x.toFixed(2));
      body.style.setProperty('--y', (y * .65).toFixed(2));
      body.style.setProperty('--z', z.toFixed(2));
      body.style.setProperty('--o', (MIN_OPACITY + (1 - MIN_OPACITY) * (depth + 1) / 2).toFixed(3));
      body.style.setProperty('--zi', depth >= 0 ? 8 : 1);
    });

    if (dial) dial.style.setProperty('--p', p.toFixed(4));
  }

  function schedule() {
    if (raf === null) raf = requestAnimationFrame(frame);
  }

  function apply() {
    const isFlat = flat();
    root.classList.toggle('orbit--flat', isFlat);

    if (isFlat && live) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      live = false;
      reset();
    } else if (!isFlat && !live) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      live = true;
      schedule();
    } else if (!isFlat) {
      schedule();
    }
  }

  reduced.addEventListener('change', apply);
  narrow.addEventListener('change', apply);
  apply();

  return { refresh: schedule, destroy(){
    window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);
    reduced.removeEventListener("change",apply);narrow.removeEventListener("change",apply);
    if(raf!==null)cancelAnimationFrame(raf);
  } };
}
