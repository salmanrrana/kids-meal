# Product

## Register

product

## Users

Busy parents of toddler-to-school-age kids. They plan the family's dinners in stolen moments: on the couch after bedtime, in the kitchen with one hand free, in the grocery store aisle. Mobile and desktop matter equally. The job: find meals the whole family will actually eat, slot them into the week, and walk into the store with one list.

## Product Purpose

A meal discovery and weekly planning app. Browse curated family recipes (all ≤30 min, ≤8 ingredients, mild, real food), save favorites, arrange them on a weekly board, and generate a categorized grocery list. These are family meals, not "kid food": real flavor that happens to be quick and picky-eater friendly.

## Brand Personality

Calm, appetizing, printed. The feel of a well-used cookbook or a newspaper food section: warm paper, black ink, square photos, and rules on the page. Confidence without fuss. Food photography is the only color; the interface is the paper it sits on.

## Anti-references

- Kiddie UI: primary colors, bubbly mascots, emoji-as-design.
- Recipe-blog clutter: ads-shaped layouts, ten competing CTAs, walls of chips.
- Template tells: rounded bordered cards for every list item, pill chips everywhere, icons in circles, hero-plus-CTA, three equal feature boxes, gradients, glass, dark-mode-with-gold "premium".
- Generic SaaS dashboard chrome.

## Design Principles

1. **The food is the only color.** Paper and ink everywhere else; nothing competes with the photos in saturation.
2. **Rules, not boxes.** Structure comes from typography, whitespace, alignment, hairline rules, and identical photo crops. Nothing on a page is wrapped in a border or a filled box.
3. **Accent marks state, never actions.** One paprika accent for today, the active tab, a saved heart, a checked item. Buttons are ink.
4. **Serif for the meal, sans for the machine.** Recipe titles and page headings get the display serif; buttons, labels, and data stay in the UI sans.
5. **Every repeated thing is the same size.** A recipe tile or row is identical to its siblings regardless of title length or photo shape.
6. **Every state is designed.** Empty lists, missing recipes, copied lists, past days vs. today: each one looks intentional, and none of them needs an icon.

## Accessibility & Inclusion

WCAG 2.1 AA. All text ≥4.5:1 on its surface, checked against the paper palette (the lightest text, ink-3, is about 5:1; past planner days use color, not opacity, so they keep it). Visible focus rings on all interactive elements, and when the focused control disappears (removing a meal, unfavoriting, closing a sheet), focus moves to the nearest sensible control. Reading and Tab order follow what's on screen. `prefers-reduced-motion` honored everywhere. Every touch target ≥44px: nav, buttons, tabs, rows, checkboxes, and inline text buttons.
