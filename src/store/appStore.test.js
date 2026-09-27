import { afterEach, describe, expect, test } from 'vitest';
import {
  findRecipe,
  getPlannedMeal,
  normalizeSavedRecipe,
  useAppStore,
} from './appStore';

const week = '2026-09-27';

afterEach(() => {
  useAppStore.setState({ likedRecipes: [], mealPlans: {} });
});

describe('saved recipes and meal slots', () => {
  test('an older favorite stays usable after its recipe collection is removed', () => {
    const recipe = normalizeSavedRecipe({
      id: 'old-favorite',
      title: 'Old favorite',
      image_url: 'photo.jpg',
      prep_time_minutes: 10,
      cook_time_minutes: 5,
      ingredients: [{ quantity: '2', unit: 'tbsp', name: 'honey' }],
      steps: ['Cook it'],
    });

    expect(recipe).toMatchObject({
      image: 'photo.jpg',
      prepTime: 10,
      cookTime: 5,
      tags: [],
      ingredients: ['2 tbsp honey'],
    });
    useAppStore.setState({ likedRecipes: [recipe] });
    expect(findRecipe('old-favorite')).toEqual(recipe);

    useAppStore.getState().addToMealPlan('old-favorite', week, 0, 'lunch');
    useAppStore.getState().unlikeRecipe('old-favorite');
    expect(findRecipe('old-favorite')).toEqual(recipe);
    useAppStore.getState().moveMeal('old-favorite', 'lunch', week, 0, week, 1);
    expect(findRecipe('old-favorite')).toEqual(recipe);
  });

  test('a recipe can fill both slots, and removing one leaves the other', () => {
    const { addToMealPlan, removeFromMealPlan } = useAppStore.getState();
    addToMealPlan('turkey-breakfast-skillet', week, 0, 'lunch');
    addToMealPlan('turkey-breakfast-skillet', week, 0, 'dinner');
    removeFromMealPlan('turkey-breakfast-skillet', week, 0, 'lunch');

    expect(useAppStore.getState().mealPlans[week][0]).toEqual([
      { recipeId: 'turkey-breakfast-skillet', kind: 'dinner' },
    ]);
  });

  test('older ID-only plans keep their suggested slots when moved', () => {
    useAppStore.setState({
      mealPlans: { [week]: { 0: ['turkey-breakfast-skillet'] } },
    });
    expect(getPlannedMeal('turkey-breakfast-skillet')).toEqual({
      recipeId: 'turkey-breakfast-skillet',
      kind: 'dinner',
    });

    useAppStore
      .getState()
      .moveMeal('turkey-breakfast-skillet', 'dinner', week, 0, week, 1);
    expect(useAppStore.getState().mealPlans[week][0]).toEqual([]);
    expect(useAppStore.getState().mealPlans[week][1]).toEqual([
      { recipeId: 'turkey-breakfast-skillet', kind: 'dinner' },
    ]);
  });
});
