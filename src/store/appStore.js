import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recipes } from '../data/recipes';
import { lunchRecipes } from '../data/lunchRecipes';
import { getWeekStart, shiftWeek } from '../lib/week';

// Every recipe across all collections. Anything that resolves a stored ID
// (planner, grocery list, detail page) must look here, not just `recipes`.
export const ALL_RECIPES = [...recipes, ...lunchRecipes];

const recipesById = new Map(ALL_RECIPES.map((r) => [r.id, r]));
const lunchIds = new Set(lunchRecipes.map((r) => r.id));

// Favorites used to store full recipe snapshots. Keep older saved recipes usable
// after the collection or its field names change.
export function normalizeSavedRecipe(saved) {
  if (!saved || typeof saved !== 'object' || !saved.id || !saved.title)
    return null;
  const current = recipesById.get(saved.id);
  if (current) return current;
  return {
    ...saved,
    image: saved.image ?? saved.image_url ?? '',
    prepTime: saved.prepTime ?? saved.prep_time_minutes ?? 0,
    cookTime: saved.cookTime ?? saved.cook_time_minutes ?? 0,
    tags: Array.isArray(saved.tags) ? saved.tags : [],
    ingredients: Array.isArray(saved.ingredients)
      ? saved.ingredients.map((item) =>
          typeof item === 'string'
            ? item
            : [item.quantity, item.unit, item.name].filter(Boolean).join(' '),
        )
      : [],
    steps: Array.isArray(saved.steps) ? saved.steps : [],
    sourceUrl: saved.sourceUrl ?? saved.source_url,
    sourceName: saved.sourceName ?? saved.source_name,
  };
}

/** Looks up a recipe from a collection or a saved favorite. */
export function findRecipe(id) {
  const current = recipesById.get(id);
  if (current) return current;

  const state = useAppStore.getState();
  const favorite = state.likedRecipes.find((recipe) => recipe.id === id);
  if (favorite) return favorite;

  // A removed collection's recipe can still belong to a plan after unfavoriting.
  for (const week of Object.values(state.mealPlans)) {
    for (const day of Object.values(week)) {
      const saved = day.find(
        (entry) =>
          typeof entry === 'object' && entry.recipeId === id && entry.recipe,
      );
      if (saved) return saved.recipe;
    }
  }
}

/** Suggested slot for a recipe; the person planning can choose either slot. */
export function getMealKind(recipeId) {
  return lunchIds.has(recipeId) ? 'lunch' : 'dinner';
}

/** Read both older ID-only plans and plans with a chosen meal slot. */
export function getPlannedMeal(entry) {
  return typeof entry === 'string'
    ? { recipeId: entry, kind: getMealKind(entry) }
    : entry;
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // All available recipes
      recipes: recipes,

      // Liked recipes
      likedRecipes: [],

      // Weekly meal plans: { [weekStart]: { [dayIndex]: [{ recipeId, kind }] } }
      mealPlans: {},

      // Current week being viewed
      currentWeek: getWeekStart(),

      // Actions
      toggleLike: (recipe) => {
        const state = get();
        const isLiked = state.likedRecipes.some(
          (liked) => liked.id === recipe.id,
        );

        if (isLiked) {
          set({
            likedRecipes: state.likedRecipes.filter(
              (liked) => liked.id !== recipe.id,
            ),
          });
        } else {
          set({
            likedRecipes: [...state.likedRecipes, recipe],
          });
        }
      },

      // Remove from liked recipes
      unlikeRecipe: (recipeId) => {
        set((state) => ({
          likedRecipes: state.likedRecipes.filter((r) => r.id !== recipeId),
        }));
      },

      // Weekly planner actions
      addToMealPlan: (
        recipeId,
        weekStart,
        dayIndex,
        kind = getMealKind(recipeId),
        recipeSnapshot = null,
      ) => {
        set((state) => {
          const weekPlan = state.mealPlans[weekStart] || {};
          const dayMeals = weekPlan[dayIndex] || [];
          const savedRecipe = recipesById.has(recipeId)
            ? null
            : (recipeSnapshot ??
              state.likedRecipes.find((recipe) => recipe.id === recipeId));

          return {
            mealPlans: {
              ...state.mealPlans,
              [weekStart]: {
                ...weekPlan,
                [dayIndex]: [
                  ...dayMeals,
                  {
                    recipeId,
                    kind,
                    ...(savedRecipe && { recipe: savedRecipe }),
                  },
                ],
              },
            },
          };
        });
      },

      removeFromMealPlan: (recipeId, weekStart, dayIndex, kind) => {
        set((state) => {
          const weekPlan = state.mealPlans[weekStart] || {};
          const dayMeals = weekPlan[dayIndex] || [];

          // Remove first occurrence of this recipe
          const index = dayMeals.findIndex((entry) => {
            const meal = getPlannedMeal(entry);
            return meal.recipeId === recipeId && (!kind || meal.kind === kind);
          });
          if (index === -1) return state;

          const newDayMeals = [...dayMeals];
          newDayMeals.splice(index, 1);

          return {
            mealPlans: {
              ...state.mealPlans,
              [weekStart]: {
                ...weekPlan,
                [dayIndex]: newDayMeals,
              },
            },
          };
        });
      },

      moveMeal: (recipeId, kind, fromWeek, fromDay, toWeek, toDay) => {
        const state = get();
        const entry = (state.mealPlans[fromWeek]?.[fromDay] || []).find(
          (item) => {
            const meal = getPlannedMeal(item);
            return meal.recipeId === recipeId && meal.kind === kind;
          },
        );
        if (!entry) return;
        state.removeFromMealPlan(recipeId, fromWeek, fromDay, kind);
        state.addToMealPlan(
          recipeId,
          toWeek,
          toDay,
          kind,
          typeof entry === 'string' ? null : entry.recipe,
        );
      },

      setCurrentWeek: (weekStart) => {
        set({ currentWeek: weekStart });
      },

      navigateWeek: (direction) => {
        set((state) => ({
          currentWeek: shiftWeek(state.currentWeek, direction),
        }));
      },
    }),
    {
      name: 'kids-meal-storage',
      // The viewed week isn't saved: the app always opens on this week.
      partialize: (state) => ({
        likedRecipes: state.likedRecipes,
        mealPlans: state.mealPlans,
      }),
      // Older saves included currentWeek; ignore it so it can't pin a stale week.
      merge: (persisted, current) => {
        const { currentWeek: _stale, ...saved } =
          /** @type {Record<string, unknown>} */ (persisted ?? {});
        return {
          ...current,
          ...saved,
          likedRecipes: Array.isArray(saved.likedRecipes)
            ? saved.likedRecipes.map(normalizeSavedRecipe).filter(Boolean)
            : current.likedRecipes,
        };
      },
    },
  ),
);
