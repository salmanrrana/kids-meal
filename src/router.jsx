import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

// Pages
import { DiscoverPage } from './pages/DiscoverPage';
import { LikedPage } from './pages/LikedPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { PlannerPage } from './pages/PlannerPage';
import { GroceryPage } from './pages/GroceryPage';
import { LunchboxPage } from './pages/LunchboxPage';

// Components
import { Navigation } from './components/Navigation';
import {
  DINNER_BROWSE,
  LUNCH_BROWSE,
  browseSearchValidator,
} from './lib/browse';

// Root layout. The nav comes first: a sticky top bar on desktop, and a bar
// fixed to the bottom of the screen below 1024px.
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
    </>
  ),
});

const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: browseSearchValidator(DINNER_BROWSE),
    component: DiscoverPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/liked',
    component: LikedPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/recipe/$recipeId',
    component: RecipeDetailPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/planner',
    component: PlannerPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/grocery',
    component: GroceryPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/lunchbox',
    validateSearch: browseSearchValidator(LUNCH_BROWSE),
    component: LunchboxPage,
  }),
]);

/**
 * Builds the app's router. The browser uses its real address bar; tests pass
 * a memory history to start on any page.
 *
 * @param {{ history?: import('@tanstack/react-router').RouterHistory }} [options]
 */
export function createAppRouter({ history } = {}) {
  return createRouter({
    routeTree,
    history,
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
}
