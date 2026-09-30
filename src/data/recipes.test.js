import { describe, expect, test } from 'vitest';
import { ALL_RECIPES } from '../store/appStore';
import { lunchRecipes } from './lunchRecipes';

// The planner, grocery list, and detail page look recipes up by ID across
// every collection, so an ID shared by two collections resolves to the wrong one.
describe('recipe data', () => {
  test('every recipe ID is unique across all collections', () => {
    const counts = new Map();
    for (const { id } of ALL_RECIPES) counts.set(id, (counts.get(id) ?? 0) + 1);
    const dupes = [...counts].filter(([, n]) => n > 1).map(([id]) => id);
    expect(dupes).toEqual([]);
  });

  test('every lunch keeps its source attribution data', () => {
    for (const r of lunchRecipes) {
      expect(r.sourceUrl).toMatch(/^https?:\/\//);
      expect(r.sourceName).toBeTruthy();
      expect(r.image).toMatch(/^https?:\/\//);
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});
