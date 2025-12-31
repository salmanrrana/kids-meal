# Kids Meal Planner

A "Tinder for kids meals" web app that helps parents discover family-friendly recipes through swipe-based browsing, plan weekly meals, and generate grocery lists.

## Features

- **Discover Recipes** - Swipe right to save, left to skip. Tinder-style card animations powered by react-spring
- **Liked Collection** - View all your saved recipes in a grid layout
- **Weekly Planner** - Kanban-style board to drag recipes into your weekly meal plan
- **Grocery List** - Aggregated shopping list from planned meals, grouped by food category with copy-to-clipboard

## Tech Stack

- **React 19** with Vite
- **TanStack Router** for client-side routing
- **react-spring** + **@use-gesture/react** for swipe animations
- **Zustand** for state management with localStorage persistence
- **CSS** with custom properties for theming

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at http://localhost:3000

## Building for Production

```bash
npm run build
```

Output is in the `dist` folder, ready for deployment to Netlify, Vercel, or any static host.

## Project Structure

```
src/
├── components/
│   ├── Navigation.jsx    # Bottom navigation bar
│   └── SwipeCard.jsx     # Animated swipe card component
├── data/
│   └── mockRecipes.js    # 20 family-friendly recipes
├── pages/
│   ├── DiscoverPage.jsx  # Swipe screen
│   ├── LikedPage.jsx     # Saved recipes grid
│   ├── RecipeDetailPage.jsx  # Recipe details with tabs
│   ├── PlannerPage.jsx   # Weekly meal planner
│   └── GroceryPage.jsx   # Aggregated shopping list
├── store/
│   └── appStore.js       # Zustand store
├── main.jsx              # App entry & routing
└── styles.css            # Global styles
```

## Roadmap

- [ ] Supabase integration for persistent storage
- [ ] Clerk authentication with Google OAuth
- [ ] Couple mode - connect with partner, either person liking saves the recipe
- [ ] Recipe scraping from Budget Bytes, AllRecipes, etc.

## License

MIT
