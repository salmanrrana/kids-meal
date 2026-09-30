# Design

A printed cookbook page, not an app dashboard. Warm paper, black ink, square food photos, and hairline rules do all the structuring; nothing is boxed. One accent (paprika) marks state (today, active tab, saved, checked) and is never a button.

Why the brand moved from dark to paper: a good share of the photos have white backgrounds or watermarks and glare on a dark surface; on paper they sit quietly. Light also works in a daylight kitchen and a grocery aisle, and "paper and rules" is the least template-like thing a recipe app can be.

Theme: light only.

## Color

All tokens in OKLCH, defined once in `src/styles.css`.

| Token           | Value                                   | Role                                                                                |
| --------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| `--paper`       | `oklch(0.975 0.006 85)`                 | Page background, sheet/modal surface, text on ink                                   |
| `--paper-2`     | `oklch(0.945 0.008 85)`                 | Hover/pressed background, photo placeholder                                         |
| `--rule`        | `oklch(0.87 0.008 85)`                  | Hairlines between rows, under tab rows, input underline                             |
| `--ink`         | `oklch(0.22 0.012 60)`                  | Text, primary button fill, section rules, icons                                     |
| `--ink-hover`   | `oklch(0.3 0.012 60)`                   | Primary button hover fill                                                           |
| `--ink-2`       | `oklch(0.44 0.012 60)`                  | Secondary text, inactive tabs and nav, icon buttons (≈7:1)                          |
| `--ink-3`       | `oklch(0.52 0.01 60)`                   | Meta text (minutes, counts, dates), placeholders, checked-off items (≈5:1 on paper) |
| `--accent`      | `oklch(0.52 0.17 32)`                   | State only: active underline, today, filled heart, checked box, focus ring (≈5:1)   |
| `--accent-soft` | `oklch(0.52 0.17 32 / 0.1)`             | Drag-and-drop target tint                                                           |
| `--backdrop`    | `oklch(0.2 0.012 60 / 0.4)`             | Behind sheets and modals                                                            |
| `--shadow`      | `0 24px 48px -16px oklch(0 0 0 / 0.25)` | Desktop modal only                                                                  |
| `--photo-edge`  | `inset 0 0 0 1px oklch(0 0 0 / 0.06)`   | Faint edge drawn over every photo                                                   |

Rules: accent is never a button fill and never decoration. Photos are the only saturated thing on screen. No gradients, no glass, no shadows on page content.

## Type

Google Fonts (swap the `index.html` link): **Newsreader** (variable: `ital,opsz,wght@0,6..72,400..600;1,6..72,400..600`) and **Public Sans** (400, 500, 600). Fallbacks `Georgia, serif` and `system-ui, sans-serif`.

- **Newsreader** (`--font-display`): page titles, section titles, sheet titles, recipe titles everywhere (tile, row, detail), day numerals, step numerals. Weight 500, `letter-spacing: -0.01em`, line-height 1.1 (≥30px) or 1.25 (smaller). Optical size is automatic.
- **Public Sans** (`--font-ui`): everything else. 400 body, 500 buttons/tabs/labels, 600 only for the active desktop nav link. `font-variant-numeric: tabular-nums` on minutes, dates, counts.

Named sizes (rem, 16 base):

| Token         | Size                                         | Used for                                                                                     |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `--t-page`    | 40 at ≥600 / 30 phone (line 1.05 / 1.1)      | Page title, recipe detail title                                                              |
| `--t-lead`    | 24 / 1.25                                    | Empty-state titles, planner desktop day numerals                                             |
| `--t-section` | 22 / 1.2                                     | Section headers, sheet titles, planner day numerals (phone)                                  |
| `--t-mark`    | 20 / 1.2                                     | Desktop wordmark, planner strip dates                                                        |
| `--t-title`   | 17 / 1.25                                    | Recipe titles on tiles and rows (15 in `.tile--compact`)                                     |
| `--t-body`    | 16 / 1.55                                    | Description, ingredients, steps, grocery items, search input                                 |
| `--t-ui`      | 15 / 1.3                                     | Buttons, tabs, intro/subtitle, nav links, day rows                                           |
| `--t-meta`    | 13 / 1.3                                     | Minutes, counts, dates, sheet sublines                                                       |
| `--t-label`   | 12 / 1.2 uppercase, `letter-spacing: 0.08em` | LUNCH / DINNER, PACKING TIP, PLANNED MEALS (`.label`, always Public Sans, even on a heading) |
| `--t-micro`   | 11 / 1.2                                     | Bottom nav labels, planner strip weekdays                                                    |

Uppercase only for micro labels of two words or fewer. Never invent a size inside a component; use the scale.

## Spacing and layout

4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

- Page padding: 16 (<600) / 24 (600–1023) / 32 (≥1024). Container `max-width: 1200px`, centered.
- Reading measure for text and lists: 640px (`--measure`). Grids span the full container.
- Breakpoints, and only these: **phone <600** (covers 360 and 390), **tablet 600–1023** (820), **desktop ≥1024** (1280). One extra column step at ≥1280 for tile grids.
- Where this doc gives a "phone / desktop" pair (page title size, header top padding, tile gaps, tab gap), the phone value is <600 and the other value starts at 600; tablets get it too.
- `--bar-height` (56px) is the nav bar's height, top or bottom. `--nav-height` is the room the bottom bar takes (`--bar-height` + safe area; 0 at ≥1024). Sticky offsets derive from `--bar-height`.
- Bottom nav clearance on <1024: pages end with `padding-bottom: calc(var(--nav-height) + 24px)`.
- `(pointer: coarse)` needs no special rules: every target is already ≥44px.

## Rules and shape

- **Section rule**: 1px `--ink` under every section header. Today's planner day uses 2px `--accent` instead.
- **List rule**: 1px `--rule` between rows; none after the last row.
- **Radius**: 4px on photos, buttons, inputs, checkboxes, toast. 12px on the top corners of the phone sheet, 8px on the desktop modal. Nothing else is rounded; no circles.
- **Photo edge**: every photo gets `--photo-edge` so white-background photos still read as a square. Placeholder while loading and on error: flat `--paper-2`, no icon.
- **Depth**: none on the page. `--shadow` only on the desktop modal.

## Patterns

### Recipe tile

Used on Discover/Lunchbox shelves and results, and in planner desktop cells.

```
photo   aspect-ratio 1/1, object-fit cover, radius 4, edge shadow
title   Newsreader --t-title 500, margin-top 10, height 2.5em, -webkit-line-clamp 2  (two lines are ALWAYS reserved)
meta    44px row: "24 min" (--t-meta, ink-3, tabular) left … heart icon button 44×44 right,
        button margin-right -11px so the 22px icon aligns with the photo's right edge
```

Tile height = width + 10 + 2.5em + 44, so every tile in a grid is the same size regardless of title length or photo shape. No tags, no description, no time badge on the photo.

Link: the title is a `<Link>` with `::after { content:''; position:absolute; inset:0 }` stretched over the tile (`.tile { position: relative }`). The heart is `position: relative; z-index: 1` so it toggles without navigating. Hover (`hover: hover` only): title underline. Focus-visible: 2px accent outline, offset 2, on the tile.

Grid: `display: grid; gap: 24px 16px` (phone `20px 12px`). Columns **2 / 3 / 4 / 5** at <600 / ≥600 / ≥1024 / ≥1280.

`.tile--compact` (planner cells): title 15/1.25, meta row 40px, the × remove button takes the heart's place.

### Recipe row

Used on Favorites, planner meals below desktop, and the add sheet.

```
[thumb 56×56, 1/1, radius 4, edge shadow] 12 [ title Newsreader --t-title 500, max 2 lines (clamp)
                                                meta --t-meta ink-3, one line, may hold an inline text button ] 8 [ action(s) 44×44 ]
```

Every row is exactly 76px: `min-height: 76px`, padding 8px 0 (a two-line title plus the meta line is 60px), and the 1px `--rule` is an inset shadow so it takes no height. The title link is stretched over the row exactly like the tile; meta buttons and actions sit above it. Two components: `RecipeRow` (link row; planner meals pass an × action) and `RecipePickRow` (add sheet: one `<button>`, disabled at opacity 0.6 with "Added" in ink-3 on the right). Hover: title underline.

### Page header

Title (`--t-page`), optional one-line subtitle (`--t-ui`, ink-2, margin-top 6), optional right-side actions aligned to the title's top. `padding-top: 24` (phone) / 40 (≥600), `margin-bottom: 24`. No rule. On phone, actions wrap under the subtitle with margin-top 16. The title sits at the same height on every page.

### Section header

Newsreader `--t-section` title; optional count (`--t-meta`, ink-3, 8px after the title, baseline aligned); optional right-side text button ("See all 74"); 1px ink rule below (`padding-bottom: 10`, `margin-bottom: 16`). `min-height: 44` so the right link is a full tap target. Used for shelves, grocery aisles, Ingredients and Steps, planner days.

### Tabs

One control for the group filter, the add sheet's Favorites/All, the picker's Lunch/Dinner, and the desktop nav. A row of text buttons: `--t-ui` 500, ink-2, height 44, padding 0 4px, gap 20 (phone 16); 1px `--rule` under the whole row. The first tab pulls in its 4px (`margin-left: -4px`) so its label starts on the content edge. Active: ink text and a 2px accent bottom border the width of the label. Counts: `--t-meta` ink-3, 6px after the label. Overflow: `overflow-x: auto; white-space: nowrap`, scrollbar hidden, no edge fades; the active option scrolls into view. On Discover/Lunchbox the row bleeds to the screen edges (so the trailing padding is the page padding) while its rule stays at content width. The `Tabs` component is a labelled group of `aria-pressed` buttons; the desktop nav uses `aria-current`. The look never changes.

### Checkbox toggle

Quick filters and grocery items. 18×18 box, 1.5px ink-2 border, radius 2; checked: ink fill with a paper check. The `<label>` is the hit area, `min-height: 44`, gap 10. Label `--t-ui` (quick filters `--t-meta`). Checked grocery item: ink-3 and `line-through`.

### Search field

Full width, height 44, no box: bottom border 1px `--rule` only. Search icon 20px ink-3 at the left (input `padding-left: 28`), text `--t-body` (16px so iOS doesn't zoom), placeholder ink-3. Focus: bottom border becomes 2px accent, no outline. No built-in clear (×) button. Used on Discover/Lunchbox and in the add sheet.

### Buttons

All: `--t-ui` 500, height 44 (48 when full-width on phone), padding 0 18px, radius 4, gap 8, icon 18px. No transforms. Disabled: opacity 0.4. Focus-visible: 2px accent outline, offset 2 (global rule).

- **Primary**: ink fill, paper text; hover `--ink-hover`. At most one per screen: "Add to plan" on the detail page, "Build grocery list", empty-state CTAs.
- **Outline**: 1px ink border, transparent, ink text; hover paper-2 fill. "Surprise me", "Copy list", "Clear filters".
- **Text**: no border or fill, ink text, 1px underline with `text-underline-offset: 3px`; hover: accent underline. "See all 74", "+ Add", "Add to plan" inside rows, "← Back", "This week", "Browse all recipes". Always `padding: 12px 10px; margin: -12px -10px`, so it reaches 44px without moving the text and lines up with the words around it; its focus ring uses `outline-offset: -8px` so it hugs the words instead of covering the text beside it. Inside a row's meta line it takes the meta size and 14px vertical padding (still 44px).
- **Icon**: 44×44, no background, ink-2 icon 22px at stroke 1.75; hover: ink and paper-2 fill (radius 4). Never circular. Heart when liked: accent fill and stroke, `aria-pressed="true"`.

### Sheet / modal

- **Phone (<600)**: bottom sheet, full width, paper, top radius 12, `max-height: 85dvh`, `padding-bottom: env(safe-area-inset-bottom)`, slides up 220ms. Backdrop `--backdrop` fades in 150ms.
- **≥600**: centered panel, `width: min(480px, 100vw - 48px)`, `max-height: 80vh`, radius 8, 1px `--rule` border, `--shadow`, fade in with a 4px rise, 180ms.
- Anatomy: header (title `--t-section`, optional subline `--t-meta` ink-2, × icon button right, padding 16 20, 1px rule below) → optional tools row (padding 0 20; the tabs' or search field's own rule closes it) → scrolling body (padding 0 20 16). Content height by default; a list that changes while open (the add sheet) uses the full 85dvh / 80vh so it doesn't jump. Escape closes, backdrop click closes, body scroll is locked, the rest of the page is `inert`, focus moves into the sheet and returns to the opener. `role="dialog" aria-modal="true"`, labelled by the title. Rows inside use hover underline, not fills.

### Toast

Fixed, bottom center. Phone/tablet: `bottom: calc(var(--nav-height) + 16px)`; desktop: `bottom: 24px`. Ink fill, paper text `--t-ui` 500, padding 12 16, radius 4, `max-width: calc(100vw - 32px)`, `role="status"`, 2.2s, 4px slide-up and fade in 200ms. No icon. Used for "Added to dinner on Tue", "Copied to clipboard", and "Couldn't copy…" when copying fails.

### Empty state

Left-aligned under the page header, inside `--measure`: Newsreader 24 title, one `--t-body` ink-2 sentence, one button (primary when it leads forward, outline when it clears). `margin-top: 32`, which collapses with the header's 24px bottom margin. The title is an h2, or the h1 when the empty state is the whole page ("Recipe not found"). No icon, no centering.

### Navigation

- **<1024**: fixed bottom bar, paper, 1px `--rule` top, height `--nav-height` (`--bar-height` + `env(safe-area-inset-bottom)`). 5 equal columns; each item is a 22px line icon over an 11/500 label, gap 2; inactive ink-3, active accent (icon filled where the icon allows). Current icons stay.
- **≥1024**: sticky top bar, height `--bar-height`, paper, 1px `--rule` bottom, contents aligned to the container. Wordmark "Family Meal Planner" in Newsreader 20/500 on the left (a plain link home, never marked as the current page); links on the right (`--t-ui` 500, ink-2, gap 28), active link ink 600 with a 2px accent underline sitting on the bar's bottom rule. No icons. Pages get no top padding beyond the header's own.

## Motion

Color and background transitions 150ms; sheet 220ms; toast 200ms; modal 180ms; easing `cubic-bezier(0.2, 0, 0, 1)`. No hover lifts, no photo zoom, no shimmer. Drag: dragged tile opacity 0.5; drop-target column background `--accent-soft`. `@media (prefers-reduced-motion: reduce)`: all durations 0.01ms, transforms removed.

## Pages

### Discover `/` and Lunchbox `/lunchbox` (`RecipeBrowser`)

Page header (title, intro; "Surprise me" outline on the right ≥600, under the intro on phone) → search → group tabs (All 177 · Chicken & turkey 74 · …; lunch: All 82 · Sandwiches & wraps 26 · …) → status row: "177 recipes" / "74 matches in chicken & turkey" (`--t-meta` ink-3) left, quick-filter checkboxes right (dinner: 20 min or less / 30 min or less; lunch: No cooking / Make ahead; they drop under the count on <600, where the count's row is 32px tall; one at a time, since the URL holds one), 1px `--rule` below, `margin-bottom: 32`.

No filters: one section per group (section header with "See all N" text button) and a tile grid of the group's first 5 recipes. CSS keeps exactly one row of tiles (two on phone): hide `.tile:nth-child(n+5)` below 600 (2×2), `:nth-child(n+4)` at 600–1023, `:nth-child(n+5)` at 1024–1279, show all 5 at ≥1280. 48px between sections. Any filter: the same tile grid with every result, under a visually hidden "Results" h2. No results: empty state "No recipes match" / "Try a different word, or clear the filters to see everything." / outline "Clear filters". Filters stay in the URL.

### Recipe `/recipe/:id`

Single scroll, no tabs. Top row (44px): "← Back" text button left, heart icon right. Then, on phone/tablet: photo full-bleed `aspect-ratio 4/3`, `max-height 420`, cover, no radius → title `--t-page` (`text-wrap: balance`) → meta line `--t-ui` ink-2 "24 min · 4 servings · Pasta · Chicken" (tags as plain words) → primary "Add to plan" full width 48 → times line `--t-ui` ink-2 "Prep 10 min · Cook 14 min · Total 24 min" → description `--t-body` → lunch recipes only: PACKING TIP label + paragraph → section "Ingredients" with count, rows `--t-body`, `min-height 44`, padding 10 0, `--rule` → section "Steps": Newsreader 22 numeral in ink-3 in a 40px column, text `--t-body` line-height 1.6, 20px between steps, no rules → "Recipe from <a>Two Peas & Their Pod</a>" `--t-ui` ink-2, link underlined ink, `margin-top: 32`.

Desktop (≥1024): container 1100; grid `5fr 7fr`, gap 48. Left column sticky (`top: --bar-height + 24`): photo 1:1, primary "Add to plan" full column width, times line. Right column (measure 640): title, meta, description, Ingredients, Steps, source.

The markup is in that same order at every size (only the photo, which has no text, is moved up on phone/tablet), so reading and Tab order match the screen. An unknown ID shows the "Recipe not found" empty state.

"Add to plan" opens the shared plan picker (below).

### Plan picker (`PlanPicker`, recipe page and Favorites)

Sheet titled "Add to plan", subline = the recipe title. Tools row: tabs Lunch | Dinner, starting on the recipe's usual slot. Body: a week navigator row (‹ › icon buttons 44×44 at the edges, "Sep 28 – Oct 4" `--t-ui` tabular centered, `--rule` below), then 7 day rows starting **today**: `min-height 48`, `--rule` between; label `--t-ui` ink left ("Today", "Tomorrow", then "Wed, Sep 30"), the date `--t-meta` ink-3 right only when it differs from the label; today's label in accent. › moves 7 days forward; ‹ goes back 7 and is disabled on the first page, so you can never plan in the past. Picking a day saves it, closes the sheet (focus returns to the button that opened it), and the page shows the toast "Added to dinner on Tue, Sep 29".

### Favorites `/liked`

Header "Favorites" + "5 recipes your family loves". Recipe rows: meta reads "24 min · Add to plan" where "Add to plan" is an inline text button that opens the plan picker; the action is the filled heart (unfavorite). ≥1024: `grid-template-columns: 1fr 1fr; column-gap: 48`. Confirmation is the toast. Unfavoriting removes the row and moves focus to the next row's heart (else the previous one, else the page title). Empty: "No favorites yet" / "Tap the heart on any recipe you'd cook again, and it will wait for you here." / primary "Browse recipes".

### Planner `/planner`

Header: title "This week" / "Next week" / …; subtitle "Sep 27 – Oct 3 · 3 dinners · 1 lunch"; ‹ › icon buttons centered on the title line; "This week" text button when not on it (under the subtitle on <1024, after › on ≥1024; using it moves focus to the title); ≥1024 also the primary "Build grocery list" at the far right. "Build grocery list" (here or at the bottom) shows only when the week has at least one meal. Removing a meal moves focus to its slot's "+ Add".

**<1024**: week strip sticky at `top: 0` (paper, `--rule` below): 7 equal columns, each a `--bar-height` button: DOW `--t-micro` uppercase ink-3 / date Newsreader 20 / up to three 4px ink-3 dots. Today: accent date and a 2px accent underline; past: date in ink-3. Tapping scrolls to the day. Days follow, 32px apart: section header "Mon 28" (Newsreader 22 date + `--t-meta` ink-2 "Mon"; "Today" in accent after it) with the ink rule (accent 2px for today) → LUNCH label row (44px: `--t-label` ink-3 left, "+ Add" text button right) → recipe rows → DINNER label row → rows. Past days: date and weekday in ink-3 and photos at opacity 0.6; no opacity on text, so it all stays ≥4.5:1. After Saturday: primary "Build grocery list" full width 48. On tablets (600–1023) the header, strip, and days keep to `--measure`, like Favorites.

**≥1024**: week grid, `grid-template-columns: repeat(7, 1fr); column-gap: 16`, three explicit rows: day headers (DOW `--t-label` ink-3 + Newsreader 24 date, rule below: ink 1px, accent 2px and accent date for today) / Lunch cells / Dinner cells, so slots align across days. Cell: label row (LUNCH + "+ Add"), then one `.tile--compact` per meal (× remove in the meta row), gap 16. The column headers are the jump strip; no separate strip. Whole tiles drag; the target column tints `--accent-soft`; past columns get the same ink-3 date and faded photos as the day list.

Add sheet: title "Add dinner", subline "Wednesday, Sep 30"; tools: tabs "Favorites 5 | All recipes" + search; body: `.row--pick` rows (thumb, title, "24 min · Two Peas & Their Pod"), already-planned rows disabled with "Added". Empty favorites: "No favorites yet." + text button "Browse all recipes".

### Grocery `/grocery`

Header "Grocery list" + "33 items for Sep 27 – Oct 3"; right: outline "Copy list" (reads "Copied" while the 2.2s toast is up; a `min-width` keeps it from shifting; if copying fails the toast says so and the label stays). Under the header: PLANNED MEALS label, then each meal as an underlined ink link separated by " · " (`--t-ui`). Then aisle sections (Produce, Meat & Protein, Dairy, Pantry, Spices & Seasonings, Frozen, Other): section header with count, rows = checkbox toggles (`--t-body` 1.4, `min-height 44`, `--rule`). The checkboxes are plain uncontrolled inputs: leaving the page or reloading clears them (fine for v1). ≥600: `columns: 2`; ≥1024: `columns: 3`; `column-gap: 48`; sections `break-inside: avoid`. Empty: "Nothing to shop for yet" / "Plan a few meals for the week and the shopping list builds itself." / primary "Plan the week".

## Don'ts

- No borders or fills around list items or sections. If you are typing `border: 1px` around a thing, use a rule under it instead.
- No pills, no chips. Tags appear only as plain words in the detail meta line.
- No icons in circles, no icon-only empty states, no emoji, no time badges on photos.
- No shadows, lifts, or zooms on page content.
- Every repeated recipe item on a page is the same pixel size as its siblings.
