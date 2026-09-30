# Kids Meal Planner

A web app that helps parents find family-friendly recipes, plan the week's lunches and dinners, and walk into the store with one grocery list. The look is a printed cookbook page: warm paper, black ink, square food photos, and hairline rules (see `DESIGN.md`).

## Features

- **Discover** - Browse family dinners in shelves by main protein, search by title or ingredient, and filter by total time
- **Lunchbox** - The same browsing for no-reheat lunches, with packing tips
- **Recipe page** - Photo, times, ingredients, steps, and a link to the original recipe
- **Favorites** - Save recipes with the heart and add any of them to a day's lunch or dinner
- **Planner** - A week of lunch and dinner slots; a day list on phones and tablets, a 7-column grid with drag and drop on desktop
- **Grocery list** - Every ingredient from the week's meals, grouped by store aisle, with check-off boxes and copy to clipboard

## Tech Stack

- **React 19** with Vite
- **TanStack Router** for client-side routing (browse filters live in the URL)
- **Zustand** for state management with localStorage persistence
- **Plain CSS** with custom properties for the design tokens
- **Vitest**, **Oxlint**, and a JSDoc-typed `tsc` check

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint, type-check the JavaScript, and run focused tests
npm run check:fast
```

`npm install` configures an executable pre-commit hook. It checks an isolated
snapshot of staged source/configuration with Oxlint and Prettier, then runs the
project JavaScript typecheck and tests for changes that can affect them. Source
deletions trigger project checks, and unstaged edits are left alone.

The app runs at http://localhost:3000

## Building for Production

```bash
npm run build
```

Output is in the `dist` folder, ready for deployment to Netlify, Vercel, or any static host.

## Project Structure

```
src/
├── components/         # Shared UI, each with its own CSS file
│   ├── Navigation.jsx      # Bottom tab bar on phones/tablets, top bar on desktop
│   ├── RecipeBrowser.jsx   # Discover and Lunchbox: search, group tabs, shelves
│   ├── RecipeTile.jsx      # Square-photo tile for grids
│   ├── RecipeRow.jsx       # List row (Favorites, planner, add sheet)
│   ├── PlanPicker.jsx      # "Add to plan" sheet
│   └── …                   # Sheet, Tabs, Toast, Photo, LikeButton, Icon
├── data/
│   ├── recipes.js          # Dinner recipes, each with its source link
│   └── lunchRecipes.js     # Lunchbox recipes
├── lib/
│   ├── browse.js           # Shelf groups, quick filters, search
│   └── week.js             # Week dates, kept in local time
├── pages/                  # One per route: Discover, Lunchbox, Recipe, Favorites, Planner, Grocery
├── store/
│   └── appStore.js         # Zustand store: favorites, meal plans, the viewed week
├── main.jsx                # App entry and routes
└── styles.css              # Design tokens and shared page patterns
```

## Roadmap

- [ ] Supabase integration for persistent storage
- [ ] Clerk authentication with Google OAuth
- [ ] Couple mode - connect with partner, either person liking saves the recipe
- [ ] Recipe scraping from Budget Bytes, AllRecipes, etc.

## License

MIT
