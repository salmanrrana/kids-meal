import { describe, expect, test } from 'vitest';
import {
  DINNER_BROWSE,
  LUNCH_BROWSE,
  browseSearchValidator,
  filterRecipes,
} from './browse';

const recipe = (overrides) => ({
  id: 'x',
  title: 'Recipe',
  description: '',
  prepTime: 10,
  cookTime: 10,
  tags: [],
  ingredients: [],
  ...overrides,
});

describe('dinner groups', () => {
  test('the first protein named in the title wins', () => {
    const r = recipe({
      title: 'Chicken Bacon Alfredo',
      ingredients: ['bacon'],
    });
    expect(DINNER_BROWSE.groupOf(r)).toBe('chicken');
  });

  test('falls back to ingredients, ignoring broth', () => {
    const r = recipe({
      title: 'Honey Mustard Chops',
      ingredients: ['1 cup chicken broth', '4 boneless pork chops'],
    });
    expect(DINNER_BROWSE.groupOf(r)).toBe('pork');
    expect(DINNER_BROWSE.groupOf(recipe({ title: 'Veggie Lo Mein' }))).toBe(
      'meatless',
    );
  });
});

describe('filterRecipes', () => {
  const soup = recipe({ id: 'soup', title: 'Tomato Soup', cookTime: 30 });
  const wrap = recipe({
    id: 'wrap',
    title: 'Garden Wrap',
    ingredients: ['1 tortilla', '2 tbsp hummus'],
    tags: ['wrap'],
  });

  test('search matches ingredients as well as titles', () => {
    const ids = (q) =>
      filterRecipes([soup, wrap], LUNCH_BROWSE, { q }).map((r) => r.id);
    expect(ids('hummus')).toEqual(['wrap']);
    expect(ids('tomato soup')).toEqual(['soup']);
  });

  test('group and quick filter narrow together', () => {
    expect(
      filterRecipes([soup, wrap], DINNER_BROWSE, { quick: 'under-20' }).map(
        (r) => r.id,
      ),
    ).toEqual(['wrap']);
    expect(
      filterRecipes([soup, wrap], LUNCH_BROWSE, { group: 'sandwiches' }),
    ).toEqual([wrap]);
  });
});

test('URL filters drop unknown values', () => {
  const validate = browseSearchValidator(LUNCH_BROWSE);
  expect(validate({ q: 'egg', group: 'pasta', quick: 'nope' })).toEqual({
    q: 'egg',
    group: 'pasta',
    quick: undefined,
  });
  expect(validate({ group: 'beef', q: '  ' })).toEqual({
    q: undefined,
    group: undefined,
    quick: undefined,
  });
});
