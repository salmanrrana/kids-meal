import { afterEach, describe, expect, test } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
} from '@tanstack/react-router';
import { LunchboxPage } from './pages/LunchboxPage';
import { lunchRecipes } from './data/lunchRecipes';

function renderWithRouter(ui) {
  const rootRoute = createRootRoute({ component: () => ui });
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => null,
    }),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/lunchbox'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('LunchboxPage', () => {
  afterEach(cleanup);

  test('collection filters narrow and restore the grid', async () => {
    renderWithRouter(<LunchboxPage />);
    await screen.findByText('Lunchbox ideas');
    expect(await screen.findAllByRole('article')).toHaveLength(
      lunchRecipes.length,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pasta Salads' }));
    const pastaCount = screen.getAllByRole('article').length;
    expect(pastaCount).toBeGreaterThan(0);
    expect(pastaCount).toBeLessThan(lunchRecipes.length);

    fireEvent.click(screen.getByRole('button', { name: 'All Recipes' }));
    expect(screen.getAllByRole('article')).toHaveLength(lunchRecipes.length);
  });

  test('every recipe keeps its source attribution data', () => {
    for (const r of lunchRecipes) {
      expect(r.sourceUrl).toMatch(/^https?:\/\//);
      expect(r.sourceName).toBeTruthy();
      expect(r.image).toMatch(/^https?:\/\//);
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});
