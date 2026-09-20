# Design — Broadsheet

Ink on paper, one monospace face, rules instead of boxes, and one colour on
screen: the window's signal. This site is set in the same system.

## Principles

1. Rules, not boxes. Hierarchy by weight and case, never by colour.
2. One colour on screen: the window's signal. Everything else is ink on
   paper.
3. The terminal keeps its ANSI palette; the chrome stays monochrome around
   it.
4. Floating things get a 2px edge and a hard offset shadow. Nothing blurs,
   nothing is rounded, nothing is translucent — unless you turn the radius
   or the opacity yourself.
5. Chromeless by default: a 6px signal band and a 30px top strip are all the
   furniture; the sidebar slides in from the edge.

## Tokens

| Token | Paper (light) | Ink (dark) |
|---|---|---|
| paper | `#ffffff` | `#141414` |
| ink | `#141414` | `#ece7da` |
| tint | `rgba(20,20,20,0.06)` | `rgba(236,231,218,0.07)` |
| hot edge | `rgba(20,20,20,0.12)` | `rgba(236,231,218,0.14)` |
| dim | `#8a857a` | `#8a857a` |
| page | `#ffffff` (web content) | `#ffffff` |
| scrim | `rgba(255,255,255,.55)` | `rgba(0,0,0,0.5)` |
| caret | the ink | the ink |
| selection | the ink at 22% | the ink at 22% |

Signals, the same in both themes: red `#c8102e`, blue `#1f5fbf`, gold
`#d9a400`, green `#2e7d32`, violet `#6b3fa0`, teal `#1a7f8a`. Attention
("waiting") uses the window's own signal as a filled label.

ANSI 0–15, paper:
`#141414 #b3261e #2e7d32 #9a6b00 #1f5fbf #8e3b8e #1a7f8a #8a857a`
`#4a4740 #d63a2f #3f9a45 #c48a00 #3b7ee0 #b04eb0 #22a3b0 #ffffff`

ANSI 0–15, ink:
`#141414 #e0574c #7ac77f #e5b94a #6ea3ef #d086d0 #6fd0da #bdb8ab`
`#5a564e #ff6f63 #93e39a #ffd06a #8fbcff #e9a0e9 #8be6ef #ece7da`

The terminal's default foreground and background are the theme's ink and
paper. The cursor is a block in the theme's caret colour, no blink by
default. Caret and selection are tokens a theme may set per face; the
shell's selection, the editor's selection and both carets draw from them,
and the cursor rule's other choices (the signal, the tab's own colour) sit
over the caret.

A program's own colours — truecolour and the 256 — are graded before they
reach the screen: any text under 4.5:1 against its background is walked
toward white or black, the way it leans, until it reads. THE THEME'S SIXTEEN
snaps them to the nearest of the theme's in Oklab, so a program wears the
theme; `program(p)` in `rules.luau` does either per program, gives one its
own sixteen, or remaps a colour it hardcodes.

Broadsheet's own tokens are not editable: edits layer over them, and RESET
returns. Any token can be any colour through the picker in the look studio,
and twenty stock themes ship, each contrast-audited.

## Type

- UI and terminal: IBM Plex Mono by default — regular 400, medium 500,
  semibold 600. Victor Mono, JetBrains Mono and ABC Areal (with its Semi Mono
  and Mono) are bundled too; installed monospaced fonts can be chosen; the
  interface, terminal and editor families are independent.
- Wordmark and the reader: Newsreader Italic 500 — *nus*, *go*, *quick*,
  *paper*, *ink*.
- Ramp: UI 13/1.5; UI strong 600; label 11 caps, tracking 0.08em; palette
  input 16; preview 7.5/1.5; wordmark 34 in the sidebar, 20 in the top
  strip, 18 elsewhere.

## Rules, spacing, shadow

- Rule weights: 1 hairline for rows; 1.5 structure for the sidebar edge and
  headers; 2 floating for the palette, the hatch and PiP; 6 for the signal
  band.
- Shadow: hard offset only — 8×8 for the palette and the hatch, 6×6 for PiP,
  4×4 for the localhost chip. No blur radius, ever.
- Radii: 0 everywhere, unless the carapace radius is turned.
- Spacing: sidebar rows 12×14, pane headers 32 tall, top strip 30, sidebar
  272, browser split 520, palette 600, tab preview 52 tall.
- Inactive: 60% opacity. Selected: ink fill, paper text. Hover: a soft ink
  overlay. Links: 1.5px underline, 3px offset.

## Motion

One easing (ease-out cubic), base durations of 80–220 ms, and a register
from snappy (0.45×) to cinematic (2.2×). Things slide and rules extend;
nothing scales, bounces or blurs. The sidebar slides, rows grow, stacks
unfold, the active tint travels, the palette rises, bands drop, the loading
bar travels. Content switches instantly. Reduce motion follows the OS or is
forced, and shows a settled composition wherever there would have been an
entrance.

## Surfaces

- **Top strip** (30): the wordmark, then a crumb — favicon, *Title · host*,
  or the folder — that becomes an editable address when a page is focused;
  the status cluster (waiting, PiP, assistant, ports) as icons with counts;
  platform-native window controls. Present in every state; it is the drag
  region.
- **Sidebar** (272): 32px rows with a favicon or profile icon, ⌘-numerals for
  the first nine, a waiting dot, children under a rule; a one-row footer.
- **Panes:** terminal, browser and editor are peers split by a 1.5 rule; each
  has a caps header. The browser's URL row is a 1px boxed field; devtools is
  a caps tab row under the page.
- **Palette** (600 wide, 220 from the top): a serif *go* prompt, 2px edge,
  8×8 shadow, selected row in ink fill.
- **The hatch:** a 960-wide sheet from the top edge with no top border, the
  signal band as a lip along its foot; or a card, 70% × 60%, centred, the
  carapace as a 22px frame.
- **PiP:** 400 wide, a 4px signal band, 2px edge, 6×6 shadow, a caps footer.
- **Bands:** questions — a risky paste, a permission, a link about to open,
  an assistant's hand — are a ruled band over the pane, answered with a key,
  never a dialog.
- **The localhost chip:** anchored to the detected line, 1.5 edge, 4×4
  shadow — `localhost:5173 · open split ⌘↵ · new tab ⌘⇧↵`.
- **The carapace:** the signal as a physical shell around the window — a
  band along the top, or a stroke on all four edges — with a ramp, an
  optional texture, a width and a radius. Texture stays on the carapace,
  the chrome or the panes, never on content or video.

## The icon

A Newsreader italic *n* with an open, tapered band in orbit: heavier at the
belly, tilted −24°. Ink *n*, signal band. The live icon follows the current
theme and signal; the bundled one ships Broadsheet red. The splash is the
same drawing and nothing else.
