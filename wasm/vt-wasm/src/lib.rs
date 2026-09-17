//! nus's terminal, for the browser.
//!
//! This is a binding, not a reimplementation. The session is decoded by
//! `nus_vt::Term` and drawn by `nus_render::GridRenderer` — the same parser and
//! the same grid renderer the application runs. What crosses into JavaScript is
//! the renderer's own draw list: `nus_render::Instance` quads, in push order,
//! plus the glyph bitmaps `FontSystem` rasterised with swash.
//!
//! So the cell metrics, the shaping, the glyph coverage, the colour resolution,
//! the wide-character handling and the cursor are all the app's. The only thing
//! the page does for itself is blit the quads, which is exact.
//!
//! wgpu is not involved: the pipeline passes screen size as a WGSL immediate,
//! which WebGPU has no equivalent for. Consuming the scene instead of rendering
//! it needs nothing from the GPU and works in every browser.

use nus_render::text::bundled;
use nus_render::{FontSystem, GridRenderer, Scene};
use nus_vt::palette::{Rgb, BG, CURSOR, FG};
use nus_vt::Term;
use wasm_bindgen::prelude::*;

/// Floats per instance in the flattened draw list.
const STRIDE: usize = 14;

#[inline]
fn un(v: u32) -> Rgb {
    Rgb {
        r: (v >> 16) as u8,
        g: (v >> 8) as u8,
        b: v as u8,
    }
}

#[wasm_bindgen]
pub struct Shell {
    term: Term,
    fonts: FontSystem,
    grid: GridRenderer,
    scene: Scene,
    /// The draw list, flattened for JS.
    flat: Vec<f32>,
    /// Glyph bitmaps the renderer rasterised since the last drain, packed as
    /// `[x, y, w, h]` little-endian u32 followed by `w * h` coverage bytes.
    atlas: Vec<u8>,
}

#[wasm_bindgen]
impl Shell {
    /// `px` is the terminal font size in physical pixels — pass the CSS size
    /// times the device pixel ratio, the way the app passes its scale factor.
    #[wasm_bindgen(constructor)]
    pub fn new(cols: usize, rows: usize, scrollback: usize, px: f32) -> Result<Shell, JsValue> {
        let mut fonts = FontSystem::new();
        let font = fonts
            .load_bytes(bundled::PLEX_MONO, 0)
            .map_err(|e| JsValue::from_str(&format!("font: {e}")))?;
        // The app loads these too; a run that needs bold or italic finds them.
        let _ = fonts.load_bytes(bundled::PLEX_MONO_SEMIBOLD, 0);
        let _ = fonts.load_bytes(bundled::PLEX_MONO_ITALIC, 0);

        let grid = GridRenderer::new(&fonts, font, px);
        Ok(Shell {
            term: Term::new(cols, rows, scrollback),
            fonts,
            grid,
            scene: Scene::new(),
            flat: Vec::new(),
            atlas: Vec::new(),
        })
    }

    /// Feed raw PTY bytes — exactly the bytes a shell wrote.
    pub fn feed(&mut self, bytes: &[u8]) {
        self.term.advance(bytes);
    }

    pub fn tick(&mut self) {
        self.term.tick();
    }

    pub fn resize(&mut self, cols: usize, rows: usize) {
        self.term.resize(cols, rows);
    }

    /// Change the font size, in physical pixels. Rebuilds the cell metrics the
    /// way the app does when the window's scale factor changes.
    pub fn set_px(&mut self, px: f32) {
        let font = self.grid.font;
        self.grid.set_font(&self.fonts, font, px);
    }

    /// Build the frame. Afterwards `instances` holds the renderer's draw list
    /// and `take_atlas` holds any glyphs it rasterised on the way.
    pub fn draw(&mut self, focused: bool) {
        self.scene.clear();
        self.scene.layer(None);
        self.grid
            .draw(&mut self.scene, &mut self.fonts, &self.term, (0.0, 0.0), focused);
        // Close the layer so the scene is readable.
        self.scene.layer(None);

        let src = self.scene.instances();
        self.flat.clear();
        self.flat.reserve(src.len() * STRIDE);
        for i in src {
            self.flat.extend_from_slice(&[
                i.pos[0], i.pos[1],
                i.size[0], i.size[1],
                i.uv[0], i.uv[1], i.uv[2], i.uv[3],
                i.color[0], i.color[1], i.color[2], i.color[3],
                i.kind as f32,
                i.phase,
            ]);
        }

        // Drain whatever swash rasterised into the atlas this frame.
        self.atlas.clear();
        for (x, y, w, h, data) in self.fonts.uploads.drain(..) {
            self.atlas.extend_from_slice(&x.to_le_bytes());
            self.atlas.extend_from_slice(&y.to_le_bytes());
            self.atlas.extend_from_slice(&w.to_le_bytes());
            self.atlas.extend_from_slice(&h.to_le_bytes());
            self.atlas.extend_from_slice(&data);
        }
    }

    /// Pointer to the flattened draw list; JS wraps it in a `Float32Array`.
    /// Each instance is `[x, y, w, h, u0, v0, u1, v1, r, g, b, a, kind, phase]`.
    #[wasm_bindgen(getter)]
    pub fn instances(&self) -> *const f32 {
        self.flat.as_ptr()
    }

    #[wasm_bindgen(getter)]
    pub fn instances_len(&self) -> usize {
        self.flat.len()
    }

    #[wasm_bindgen(getter)]
    pub fn stride(&self) -> usize {
        STRIDE
    }

    /// Glyph bitmaps rasterised during the last `draw`, packed as described on
    /// the field. Empty once the atlas has warmed up.
    #[wasm_bindgen(getter)]
    pub fn atlas(&self) -> *const u8 {
        self.atlas.as_ptr()
    }

    #[wasm_bindgen(getter)]
    pub fn atlas_len(&self) -> usize {
        self.atlas.len()
    }

    #[wasm_bindgen(getter)]
    pub fn atlas_size(&self) -> u32 {
        nus_render::text::ATLAS_SIZE
    }

    #[wasm_bindgen(getter)]
    pub fn cell_w(&self) -> f32 {
        self.grid.cell_size().0
    }

    #[wasm_bindgen(getter)]
    pub fn cell_h(&self) -> f32 {
        self.grid.cell_size().1
    }

    #[wasm_bindgen(getter)]
    pub fn cols(&self) -> usize {
        self.term.cols()
    }

    #[wasm_bindgen(getter)]
    pub fn rows(&self) -> usize {
        self.term.rows()
    }

    /// True when the cursor sits at a shell prompt, from the OSC 133 marks in
    /// the stream — how the app tells a command line from program output.
    #[wasm_bindgen(getter)]
    pub fn at_prompt(&self) -> bool {
        self.term.at_prompt()
    }

    #[wasm_bindgen(getter)]
    pub fn default_bg(&self) -> u32 {
        let c = self.term.palette.get(BG);
        ((c.r as u32) << 16) | ((c.g as u32) << 8) | c.b as u32
    }

    /// Repaint the palette for a theme change: the app's themes drive it the
    /// same way, so paper and ink here are the real mechanism.
    pub fn set_theme(&mut self, fg: u32, bg: u32, cursor: u32, ansi: &[u32]) {
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

/// Which nus this was built from, so the page can name it.
#[wasm_bindgen]
pub fn source_rev() -> String {
    "30137f4".into()
}
