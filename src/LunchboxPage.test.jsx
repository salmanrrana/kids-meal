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
import { LUNCH_BROWSE, browseSearchValidator } from './lib/browse';

function renderLunchbox() {
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/lunchbox',
      validateSearch: browseSearchValidator(LUNCH_BROWSE),
      component: LunchboxPage,
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

  test('shelves switch to a filtered grid and back', async () => {
    renderLunchbox();
    expect(await screen.findAllByRole('region')).toHaveLength(
      LUNCH_BROWSE.groups.length,
    );

    const pastaCount = lunchRecipes.filter(
      (r) => LUNCH_BROWSE.groupOf(r) === 'pasta',
    ).length;
    fireEvent.click(
      screen.getByRole('button', { name: `See all ${pastaCount}` }),
    );
    expect(
      await screen.findByText(`${pastaCount} matches in pasta salads`),
    ).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(pastaCount);
    expect(screen.queryAllByRole('region')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /^All/ }));
    expect(await screen.findAllByRole('region')).toHaveLength(
      LUNCH_BROWSE.groups.length,
    );
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
