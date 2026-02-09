import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import './styles.css';

// Pages
import { DiscoverPage } from './pages/DiscoverPage';
import { LikedPage } from './pages/LikedPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { PlannerPage } from './pages/PlannerPage';
import { GroceryPage } from './pages/GroceryPage';

// Components
import { Navigation } from './components/Navigation';

// Hooks
import { useThemeInit } from './hooks/useThemeInit';

// Root layout component — initializes theme and renders shell
function RootLayout() {
  useThemeInit();
  return (
    <div className="luxury-root">
      <div className="luxury-background" />
      <div className="luxury-content">
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

// Luxury Root layout with navigation
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DiscoverPage,
});

const likedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/liked',
  component: LikedPage,
});

const recipeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipe/$recipeId',
  component: RecipeDetailPage,
});

const plannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/planner',
  component: PlannerPage,
});

const groceryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/grocery',
  component: GroceryPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  likedRoute,
  recipeRoute,
  plannerRoute,
  groceryRoute,
]);

// Create router
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

// Render app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
