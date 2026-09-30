// What a family actually does with the app, start to finish, through the
// screen: find recipes, save them, plan the week, and shop. Each test renders
// the whole app and only uses what a person can see, click, and type.
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router';
import { createAppRouter } from './router';
import { useAppStore } from './store/appStore';
import { getWeekStart } from './lib/week';

/**
 * Opens the app at `path`, like typing that address into the browser.
 * @param {string} path
 */
function renderApp(path) {
  const history = createMemoryHistory({ initialEntries: [path] });
  const user = userEvent.setup();
  render(<RouterProvider router={createAppRouter({ history })} />);
  return { user };
}

// Every test starts as a first-time visitor: no favorites, nothing planned.
// The clock is pinned to a Wednesday noon, so "Today" is always in the week
// the planner opens on and a run can't cross midnight.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 30, 12));
  useAppStore.setState({
    likedRecipes: [],
    mealPlans: {},
    currentWeek: getWeekStart(),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

test('finds a dinner by ingredient, saves it, plans it from Favorites, then unsaves it', async () => {
  const { user } = renderApp('/');

  // Only matches Chicken Pesto Tortellini through its ingredients.
  await user.type(
    await screen.findByRole('searchbox', {
      name: 'Search dinners or ingredients',
    }),
    'grape tomatoes',
  );
  expect(
    await screen.findByRole('link', { name: 'Chicken Pesto Tortellini' }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('link', { name: 'Ground Turkey Tacos' }),
  ).toBeNull();

  await user.click(
    screen.getByRole('button', { name: 'Favorite Chicken Pesto Tortellini' }),
  );
  await user.click(screen.getByRole('link', { name: 'Favorites' }));
  expect(
    await screen.findByRole('link', { name: 'Chicken Pesto Tortellini' }),
  ).toBeTruthy();

  await user.click(
    screen.getByRole('button', {
      name: 'Add to plan: Chicken Pesto Tortellini',
    }),
  );
  const picker = await screen.findByRole('dialog', { name: 'Add to plan' });
  await user.click(within(picker).getByRole('button', { name: /^Today/ }));
  expect(await screen.findByText(/^Added to dinner on/)).toBeTruthy();

  await user.click(screen.getByRole('link', { name: 'Plan' }));
  const today = await screen.findByRole('region', { name: /Today/ });
  expect(
    within(today).getByRole('button', {
      name: /^Remove Chicken Pesto Tortellini from \w+ dinner$/,
    }),
  ).toBeTruthy();

  await user.click(screen.getByRole('link', { name: 'Favorites' }));
  await user.click(
    await screen.findByRole('button', {
      name: 'Favorite Chicken Pesto Tortellini',
    }),
  );
  expect(
    await screen.findByRole('heading', { name: 'No favorites yet' }),
  ).toBeTruthy();
});

test('plans a dinner for tonight, then shops for it', async () => {
  const { user } = renderApp('/');

  await user.type(
    await screen.findByRole('searchbox', {
      name: 'Search dinners or ingredients',
    }),
    'pesto tortellini',
  );
  await user.click(
    await screen.findByRole('link', { name: 'Chicken Pesto Tortellini' }),
  );
  await user.click(await screen.findByRole('button', { name: 'Add to plan' }));

  const picker = await screen.findByRole('dialog', { name: 'Add to plan' });
  await user.click(within(picker).getByRole('button', { name: 'Dinner' }));
  await user.click(within(picker).getByRole('button', { name: /^Today/ }));
  expect(await screen.findByText(/^Added to dinner on/)).toBeTruthy();

  await user.click(screen.getByRole('link', { name: 'Plan' }));
  const today = await screen.findByRole('region', { name: /Today/ });
  expect(
    within(today).getByRole('button', {
      name: /^Remove Chicken Pesto Tortellini from \w+ dinner$/,
    }),
  ).toBeTruthy();

  await user.click(screen.getByRole('link', { name: 'Build grocery list' }));
  const tortellini = await screen.findByRole('checkbox', {
    name: '12 oz cheese tortellini',
  });
  await user.click(tortellini);
  expect(tortellini).toHaveProperty('checked', true);

  await user.click(screen.getByRole('button', { name: 'Copy list' }));
  expect(await screen.findByText('Copied to clipboard')).toBeTruthy();
  expect(await navigator.clipboard.readText()).toContain(
    '12 oz cheese tortellini',
  );
});

test('fills a lunch slot from the planner, then takes it back off', async () => {
  const { user } = renderApp('/planner');

  const today = await screen.findByRole('region', { name: /Today/ });
  await user.click(
    within(today).getByRole('button', { name: /^Add lunch on/ }),
  );
  // With no favorites saved, the sheet opens on all recipes.
  const sheet = await screen.findByRole('dialog', { name: 'Add lunch' });
  await user.type(
    within(sheet).getByRole('searchbox', { name: 'Search recipes' }),
    'ranch wraps',
  );
  await user.click(
    within(sheet).getByRole('button', { name: /Turkey Ranch Wraps/ }),
  );

  expect(screen.queryByRole('dialog')).toBeNull();
  const remove = within(today).getByRole('button', {
    name: /^Remove Turkey Ranch Wraps from \w+ lunch$/,
  });

  await user.click(remove);
  expect(
    within(today).queryByRole('link', { name: 'Turkey Ranch Wraps' }),
  ).toBeNull();
});

test('narrows lunches to no-cook ones, opens one, and comes back to the same list', async () => {
  const { user } = renderApp('/lunchbox');

  await user.click(await screen.findByRole('checkbox', { name: 'No cooking' }));
  expect(
    await screen.findByRole('link', { name: 'Turkey Ranch Wraps' }),
  ).toBeTruthy();
  // Baked in the oven, so it doesn't make the cut.
  expect(
    screen.queryByRole('link', { name: 'Ham & Swiss Pinwheels' }),
  ).toBeNull();

  await user.click(screen.getByRole('link', { name: 'Turkey Ranch Wraps' }));
  expect(await screen.findByText(/Wrap each one snugly in foil/)).toBeTruthy();

  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(
    await screen.findByRole('checkbox', { name: 'No cooking' }),
  ).toHaveProperty('checked', true);
  expect(screen.getByRole('link', { name: 'Turkey Ranch Wraps' })).toBeTruthy();
  expect(
    screen.queryByRole('link', { name: 'Ham & Swiss Pinwheels' }),
  ).toBeNull();
});
