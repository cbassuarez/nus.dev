/* The hero terminal.
 *
 * Not a mockup and not a video: a recorded PTY byte stream fed to nus's own
 * VT core, compiled to WebAssembly. Every glyph's position, colour, width and
 * wrap is decided by the same `nus_vt::Term` the application runs. This file
 * only paints the grid it is handed.
 *
 * The palette is set from the page's theme through the real `Palette`, so the
 * paper/ink toggle drives the terminal the same way a theme does in the app.
 */

import init, { Vt } from '../wasm/nus_vt_wasm.js';

/* Broadsheet's ANSI palettes, from docs/DESIGN.md in the app repo. */
const THEMES = {
  paper: {
    fg: 0x141414, bg: 0xf4f1ea, cursor: 0x141414,
    ansi: [
      0x141414, 0xb3261e, 0x2e7d32, 0x9a6b00, 0x1f5fbf, 0x8e3b8e, 0x1a7f8a, 0x8a857a,
      0x4a4740, 0xd63a2f, 0x3f9a45, 0xc48a00, 0x3b7ee0, 0xb04eb0, 0x22a3b0, 0xf4f1ea
    ]
  },
  ink: {
    fg: 0xece7da, bg: 0x141414, cursor: 0xece7da,
    ansi: [
      0x141414, 0xe0574c, 0x7ac77f, 0xe5b94a, 0x6ea3ef, 0xd086d0, 0x6fd0da, 0xbdb8ab,
      0x5a564e, 0xff6f63, 0x93e39a, 0xffd06a, 0x8fbcff, 0xe9a0e9, 0x8be6ef, 0xece7da
    ]
  }
};

/* Flag bits, mirroring nus_vt::cell::Flags. */
const F_BOLD = 1 << 0;
const F_DIM = 1 << 1;
const F_ITALIC = 1 << 2;
const F_UL = (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7);
const F_STRIKE = 1 << 11;
const F_WIDE_SPACER = 1 << 13;

const STRIDE = 4;
const hex = (v) => '#' + v.toString(16).padStart(6, '0');

/** Parse an asciinema v2 cast: a header line, then [time, "o", data] lines. */
function parseCast(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  const header = JSON.parse(lines[0]);
  const enc = new TextEncoder();
  const events = [];
  for (let i = 1; i < lines.length; i++) {
    const e = JSON.parse(lines[i]);
    if (e[1] === 'o') events.push([e[0], enc.encode(e[2])]);
  }
  return { cols: header.width, rows: header.height, events };
}

class HeroTerminal {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.status = root.querySelector('[data-term-status]');
    this.playBtn = root.querySelector('[data-term-play]');
    this.scrub = root.querySelector('[data-term-scrub]');

    this.vt = null;
    this.cast = null;
    this.cursor = 0;        // index of the next event to apply
    this.clock = 0;         // seconds into the recording
    this.playing = false;
    this.raf = null;
    this.lastFrame = 0;
  }

  /* --- theme ------------------------------------------------------------- */

  currentThemeName() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'ink' || t === 'paper') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'ink' : 'paper';
  }

  applyTheme() {
    const t = THEMES[this.currentThemeName()];
    this.vt.set_theme(t.fg, t.bg, t.cursor, new Uint32Array(t.ansi));
    this.theme = t;
  }

  /* --- layout ------------------------------------------------------------ */

  layout() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pad = 12;
    const availW = Math.max(40, box.width - pad * 2);
    const availH = Math.max(40, box.height - pad * 2);

    // Fit the grid to whichever axis binds, the way a terminal fits a window.
    const byW = availW / (this.cast.cols * 0.6);   // Plex Mono advance = 0.6em
    const byH = availH / (this.cast.rows * 1.45);
    this.fontSize = Math.max(7, Math.min(byW, byH));
    this.cellW = this.fontSize * 0.6;
    this.cellH = this.fontSize * 1.45;
    this.pad = pad;

    this.canvas.width = Math.round(box.width * dpr);
    this.canvas.height = Math.round(box.height * dpr);
    this.canvas.style.width = box.width + 'px';
    this.canvas.style.height = box.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.textBaseline = 'alphabetic';

    this.paint();
  }

  /* --- transport --------------------------------------------------------- */

  wire() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        if (this.playing) { this.userPaused = true; this.pause(); }
        else { this.userPaused = false; this.play(); }
      });
    }
    if (this.scrub) {
      this.scrub.max = String(Math.max(0.01, this.duration));
      this.scrub.addEventListener('input', () => {
        this.pause();
        this.seek(Number(this.scrub.value));
      });
    }
    // Do not spend the visitor's battery on a terminal they cannot see.
    new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting && this.playing) { this.pause(true); this.autoPaused = true; }
        else if (e.isIntersecting && this.autoPaused) { this.autoPaused = false; this.play(); }
      });
    }, { threshold: 0.15 }).observe(this.root);
  }

  play() {
    if (this.playing) return;
    if (this.clock >= this.duration) this.seek(0);
    this.playing = true;
    this.lastFrame = performance.now();
    this.setStatus();
    const step = (now) => {
      if (!this.playing) return;
      const dt = Math.min(0.25, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      this.advanceTo(this.clock + dt);
      if (this.clock >= this.duration) {
        this.pause(true);
        this.setStatus('end');
        // Hold the last frame, then run it again: the hero should never be a
        // still, and the thing typed last is the thing worth reading.
        this.loopTimer = setTimeout(() => {
          if (!this.autoPaused && !this.userPaused) { this.seek(0); this.play(); }
        }, 2600);
        return;
      }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  pause(quiet) {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.loopTimer) { clearTimeout(this.loopTimer); this.loopTimer = null; }
    if (!quiet) this.setStatus();
  }

  seek(t) {
    if (t < this.clock) {                 // rewind: replay from the beginning
      if (this.loopTimer) { clearTimeout(this.loopTimer); this.loopTimer = null; }
      this.vt = new Vt(this.cast.cols, this.cast.rows, 2000);
      this.applyTheme();
      this.cursor = 0;
      this.clock = 0;
    }
    this.advanceTo(t);
  }

  advanceTo(t) {
    const ev = this.cast.events;
    let fed = false;
    while (this.cursor < ev.length && ev[this.cursor][0] <= t) {
      this.vt.feed(ev[this.cursor][1]);
      this.cursor++;
      fed = true;
    }
    this.clock = Math.min(t, this.duration);
    if (this.scrub && document.activeElement !== this.scrub) {
      this.scrub.value = String(this.clock);
    }
    if (fed || !this.painted) this.paint();
  }

  /* --- paint ------------------------------------------------------------- */

  paint() {
    if (!this.vt || !this.cellW) return;
    this.painted = true;

    this.vt.snapshot();
    const cells = this.cellView();
    const { cols, rows } = this.cast;
    const ctx = this.ctx;
    const { cellW, cellH, pad, fontSize } = this;

    // Ground
    ctx.fillStyle = hex(this.vt.default_bg);
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Backgrounds first, coalescing runs so we issue few fills.
    const defaultBg = this.vt.default_bg;
    for (let r = 0; r < rows; r++) {
      let runStart = -1;
      let runColor = -1;
      for (let c = 0; c <= cols; c++) {
        const bg = c < cols ? cells[(r * cols + c) * STRIDE + 2] : -1;
        if (bg !== runColor) {
          if (runStart >= 0 && runColor !== defaultBg && runColor >= 0) {
            ctx.fillStyle = hex(runColor);
            ctx.fillRect(pad + runStart * cellW, pad + r * cellH, (c - runStart) * cellW, cellH);
          }
          runStart = c;
          runColor = bg;
        }
      }
    }

    // Glyphs
    const baseline = pad + fontSize * 1.08;
    let font = '';
    for (let r = 0; r < rows; r++) {
      const y = baseline + r * cellH;
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * STRIDE;
        const code = cells[i];
        const flags = cells[i + 3];
        if (flags & F_WIDE_SPACER) continue;
        if (code === 32 || code === 0) continue;

        const want =
          `${flags & F_ITALIC ? 'italic ' : ''}${flags & F_BOLD ? 600 : 400} ` +
          `${fontSize.toFixed(2)}px "Plex Mono", ui-monospace, monospace`;
        if (want !== font) { ctx.font = want; font = want; }

        ctx.globalAlpha = flags & F_DIM ? 0.55 : 1;
        ctx.fillStyle = hex(cells[i + 1]);
        ctx.fillText(String.fromCodePoint(code), pad + c * cellW, y);

        if (flags & F_UL) {
          ctx.fillRect(pad + c * cellW, y + fontSize * 0.16, cellW, Math.max(1, fontSize / 14));
        }
        if (flags & F_STRIKE) {
          ctx.fillRect(pad + c * cellW, y - fontSize * 0.3, cellW, Math.max(1, fontSize / 14));
        }
        ctx.globalAlpha = 1;
      }
    }

    // Cursor: a block, ink on paper, no blink — Broadsheet's default.
    const cr = this.vt.cursor_row;
    const cc = this.vt.cursor_col;
    if (cr < rows && cc < cols) {
      const x = pad + cc * cellW;
      const y = pad + cr * cellH;
      ctx.fillStyle = hex(this.theme.cursor);
      ctx.fillRect(x, y, cellW, cellH);
      const i = (cr * cols + cc) * STRIDE;
      const code = cells[i];
      if (code && code !== 32) {
        ctx.fillStyle = hex(this.vt.default_bg);
        ctx.font = `400 ${fontSize.toFixed(2)}px "Plex Mono", ui-monospace, monospace`;
        ctx.fillText(String.fromCodePoint(code), x, baseline + cr * cellH);
      }
    }
  }

  /** A view over the frame buffer in wasm memory — no copy. */
  cellView() {
    return new Uint32Array(this.memory.buffer, this.vt.cells, this.vt.cells_len);
  }

  setStatus(kind) {
    if (this.playBtn) {
      this.playBtn.setAttribute('aria-label', this.playing ? 'Pause' : 'Play');
      this.playBtn.textContent = this.playing ? '❚❚' : '▶';
    }
    if (!this.status) return;
    this.status.textContent = kind === 'end' ? 'replay ended' : this.playing ? 'replaying' : 'paused';
  }
}

/* --- boot ------------------------------------------------------------------ */

export async function mountHeroTerminal(root, opts) {
  const term = new HeroTerminal(root);
  const wasm = await init({ module_or_path: opts.wasm });
  term.memory = wasm.memory;

  const castText = await fetch(opts.cast).then((r) => r.text());
  term.cast = parseCast(castText);
  term.duration = term.cast.events.length ? term.cast.events[term.cast.events.length - 1][0] : 0;
  term.vt = new Vt(term.cast.cols, term.cast.rows, 2000);
  term.applyTheme();

  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  term.layout();
  new ResizeObserver(() => term.layout()).observe(term.canvas.parentElement);
  window.addEventListener('nus:theme', () => { term.applyTheme(); term.paint(); });

  term.wire();

  const sizeLabel = root.querySelector('[data-term-size]');
  if (sizeLabel) sizeLabel.textContent = `${term.cast.cols}×${term.cast.rows}`;

  root.dataset.ready = 'true';

  // Someone who asked for less motion gets the finished session, not a movie.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    term.userPaused = true;
    term.seek(term.duration);
    term.setStatus();
  } else {
    term.play();
  }
  return term;
}
