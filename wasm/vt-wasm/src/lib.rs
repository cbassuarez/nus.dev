//! nus-vt for the browser.
//!
//! This is a thin binding, not a reimplementation: every escape sequence is
//! decoded by the same `nus_vt::Term` the app runs, so what nus.dev paints is
//! the parser's own grid rather than a transcription of one. The page feeds it
//! recorded PTY bytes on the recording's clock and reads the grid back.
//!
//! The grid crosses into JavaScript as a flat `u32` array in wasm memory, four
//! words per cell, read through a `Uint32Array` view — no copy, no JSON.

use nus_vt::cell::{Color, Flags};
use nus_vt::palette::{Rgb, BG, CURSOR, FG};
use nus_vt::Term;
use wasm_bindgen::prelude::*;

/// Words per cell in the snapshot buffer.
const STRIDE: usize = 4;

#[inline]
fn pack(c: Rgb) -> u32 {
    ((c.r as u32) << 16) | ((c.g as u32) << 8) | (c.b as u32)
}

#[wasm_bindgen]
pub struct Vt {
    term: Term,
    frame: Vec<u32>,
}

#[wasm_bindgen]
impl Vt {
    #[wasm_bindgen(constructor)]
    pub fn new(cols: usize, rows: usize, scrollback: usize) -> Vt {
        Vt {
            term: Term::new(cols, rows, scrollback),
            frame: vec![0; cols * rows * STRIDE],
        }
    }

    /// Feed raw PTY bytes — exactly the bytes a shell wrote.
    pub fn feed(&mut self, bytes: &[u8]) {
        self.term.advance(bytes);
    }

    /// Advance timers (cursor blink phase, etc.).
    pub fn tick(&mut self) {
        self.term.tick();
    }

    pub fn resize(&mut self, cols: usize, rows: usize) {
        self.term.resize(cols, rows);
        self.frame.resize(cols * rows * STRIDE, 0);
    }

    /// Re-read the visible grid into the frame buffer.
    ///
    /// Each cell is `[codepoint, fg_rgb, bg_rgb, flags]`. Colours are already
    /// resolved through the palette, so OSC 4/10/11 overrides in the recorded
    /// stream land here the same way they land in the app.
    pub fn snapshot(&mut self) {
        let cols = self.term.cols();
        let rows = self.term.rows();
        let need = cols * rows * STRIDE;
        if self.frame.len() != need {
            self.frame.resize(need, 0);
        }

        let grid = self.term.grid();
        let pal = &self.term.palette;

        for r in 0..rows {
            let row = grid.visible_row(r);
            for c in 0..cols {
                let cell = &row.cells[c];
                let inverse = cell.flags.contains(Flags::INVERSE);
                let (fg_c, bg_c) = if inverse {
                    (cell.bg, cell.fg)
                } else {
                    (cell.fg, cell.bg)
                };

                // A hidden cell paints as its own background.
                let fg = if cell.flags.contains(Flags::HIDDEN) {
                    pal.resolve(bg_c, false)
                } else {
                    pal.resolve(fg_c, true)
                };

                let i = (r * cols + c) * STRIDE;
                self.frame[i] = cell.ch as u32;
                self.frame[i + 1] = pack(fg);
                self.frame[i + 2] = pack(pal.resolve(bg_c, false));
                self.frame[i + 3] = cell.flags.bits() as u32;
            }
        }
    }

    /// Pointer into wasm memory; JS wraps it in a `Uint32Array`.
    ///
    /// Only valid until the next call that can reallocate (`resize`,
    /// `snapshot` after a resize), so the page re-reads it each frame.
    #[wasm_bindgen(getter)]
    pub fn cells(&self) -> *const u32 {
        self.frame.as_ptr()
    }

    #[wasm_bindgen(getter)]
    pub fn cells_len(&self) -> usize {
        self.frame.len()
    }

    #[wasm_bindgen(getter)]
    pub fn cols(&self) -> usize {
        self.term.cols()
    }

    #[wasm_bindgen(getter)]
    pub fn rows(&self) -> usize {
        self.term.rows()
    }

    #[wasm_bindgen(getter)]
    pub fn cursor_row(&self) -> usize {
        self.term.cursor().row
    }

    #[wasm_bindgen(getter)]
    pub fn cursor_col(&self) -> usize {
        self.term.cursor().col
    }

    #[wasm_bindgen(getter)]
    pub fn title(&self) -> String {
        self.term.title().to_string()
    }

    /// True when the cursor sits at a shell prompt — from OSC 133 marks in the
    /// stream, which is how the app knows a command line from program output.
    #[wasm_bindgen(getter)]
    pub fn at_prompt(&self) -> bool {
        self.term.at_prompt()
    }

    #[wasm_bindgen(getter)]
    pub fn default_fg(&self) -> u32 {
        pack(self.term.palette.get(FG))
    }

    #[wasm_bindgen(getter)]
    pub fn default_bg(&self) -> u32 {
        pack(self.term.palette.get(BG))
    }

    /// Repaint the palette for a theme change. `ansi` is 16 packed RGB words.
    ///
    /// The app's themes drive the palette exactly this way, so the hero
    /// changing colour with the page is the real mechanism, not a CSS filter.
    pub fn set_theme(&mut self, fg: u32, bg: u32, cursor: u32, ansi: &[u32]) {
        let un = |v: u32| Rgb {
            r: (v >> 16) as u8,
            g: (v >> 8) as u8,
            b: v as u8,
        };
        self.term.palette.set_base(FG, un(fg));
        self.term.palette.set_base(BG, un(bg));
        self.term.palette.set_base(CURSOR, un(cursor));
        for (i, v) in ansi.iter().take(16).enumerate() {
            self.term.palette.set_base(i, un(*v));
        }
    }

    /// Text of the visible grid — what a selection would copy.
    pub fn text(&self) -> String {
        let grid = self.term.grid();
        (0..self.term.rows())
            .map(|r| grid.visible_row(r).text())
            .collect::<Vec<_>>()
            .join("\n")
    }
}

/// Which `nus-vt` this was built from, so the page can name it.
#[wasm_bindgen]
pub fn vt_source_rev() -> String {
    "30137f4".into()
}

/// Colour constants are exported so the painter never re-derives them.
#[wasm_bindgen]
pub fn flag_bits() -> Vec<u32> {
    vec![
        Flags::BOLD.bits() as u32,
        Flags::DIM.bits() as u32,
        Flags::ITALIC.bits() as u32,
        Flags::ANY_UNDERLINE.bits() as u32,
        Flags::STRIKE.bits() as u32,
        Flags::WIDE.bits() as u32,
        Flags::WIDE_SPACER.bits() as u32,
    ]
}

// Keep `Color` referenced so the import documents the contract above.
const _: Option<Color> = None;
