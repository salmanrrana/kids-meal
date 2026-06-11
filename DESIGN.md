# Design

Dark, editorial, food-forward. "Midnight supper club": warm near-black surfaces, champagne gold by the drop, photography as the light source.

## Theme

Dark only. Warm-tinted near-black (hue ~75–85 in OKLCH, toward the gold accent) so the dark never reads cold or pure-black.

## Color

All tokens in OKLCH, defined in `src/styles.css`.

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(0.17 0.01 80)` | App background |
| `--surface` | `oklch(0.21 0.012 80)` | Cards, nav, panels |
| `--surface-2` | `oklch(0.25 0.014 80)` | Hover, raised elements, inputs |
| `--line` | `oklch(0.31 0.015 80)` | Hairline borders |
| `--line-strong` | `oklch(0.4 0.018 80)` | Hover borders, dividers |
| `--ink` | `oklch(0.95 0.012 85)` | Primary text |
| `--ink-2` | `oklch(0.78 0.015 85)` | Secondary text |
| `--ink-3` | `oklch(0.66 0.015 85)` | Tertiary text (≥4.5:1 on bg/surface) |
| `--gold` | `oklch(0.8 0.13 90)` | Accent: primary actions, active states only |
| `--gold-strong` | `oklch(0.86 0.14 92)` | Accent hover |
| `--gold-soft` | gold @ 12% alpha | Selected-state tint |
| `--on-gold` | `oklch(0.22 0.03 80)` | Text/icons on gold fills |
| `--danger` | `oklch(0.7 0.19 25)` | Destructive, "pass" |
| `--success` | `oklch(0.78 0.17 150)` | Confirmation |

Strategy: **Restrained**. Gold carries ≤10% of any screen. Recipe photography supplies all other color.

## Typography

- **Display: Fraunces** (optical-size variable serif). Page titles, recipe titles, empty-state headings, day numerals. Weight 450–600, letter-spacing -0.01em to -0.02em.
- **UI/body: Outfit.** Buttons, labels, nav, meta, body copy. Weights 400/500/600.
- Fixed rem scale: 0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.125.
- Uppercase only for ≤2-word micro-labels (nav items, day abbreviations), tracked +0.08em.

## Shape & Depth

- Radii: 6 / 10 / 14 px; pills for buttons and chips. Nothing rounder than 16px on a card.
- Depth on dark comes from **surface steps + hairline borders**, not drop shadows. One soft shadow (≤24px, low alpha) reserved for overlays (modals, toasts).
- Never pair a visible border with a wide shadow on the same element.

## Components

- **Buttons**: pill. Primary = gold fill + `--on-gold` text. Secondary = `--surface-2` fill + `--ink`. Ghost = transparent + `--ink-2`. All have hover / focus-visible (2px gold ring, 2px offset) / active / disabled.
- **Recipe card**: photo top (4:3), surface body, Fraunces title, 2-line clamped description, time chip overlaid on photo (solid dark scrim, white text). Heart button: dark scrim circle; liked = gold fill.
- **Chips/filters**: pill, `--surface-2`; active = `--gold-soft` bg + gold text + gold border.
- **Bottom nav**: fixed, `--surface` with hairline top border. 4 items (Discover, Favorites, Plan, Grocery). Active = gold icon + label.
- **Modals**: centered panel on 60% black backdrop, `--surface`, radius 14.
- **Toast**: bottom-centered pill above nav, `--surface-2`, gold check.
- **Empty states**: inline SVG line icon (1.5px stroke, `--ink-3`), Fraunces heading, one sentence, one primary action.

## Motion

- 150–250 ms, `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint feel).
- Motion conveys state only: hover lift ≤2px, toast slide-up, modal fade/scale-in.
- Every animation guarded by `@media (prefers-reduced-motion: reduce)`.

## Layout

- Page container: max-width 1100px, 20px side padding (16px <480px).
- Bottom nav clearance: `padding-bottom: 96px` on pages.
- Recipe grids: `repeat(auto-fill, minmax(240px, 1fr))`.
- Planner: 7-column grid ≥1024px, horizontal scroll-snap columns below.
