import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recipes } from '../data/recipes';
import { lunchboxRecipes } from '../data/lunchboxRecipes';
import { lunchRecipes } from '../data/lunchRecipes';
import { getWeekStart, shiftWeek } from '../lib/week';

// Every recipe across all collections. Anything that resolves a stored ID
// (planner, grocery list, detail page) must look here, not just `recipes`.
export const ALL_RECIPES = [...recipes, ...lunchboxRecipes, ...lunchRecipes];

const recipesById = new Map(ALL_RECIPES.map((r) => [r.id, r]));
const lunchIds = new Set([...lunchboxRecipes, ...lunchRecipes].map((r) => r.id));

/** Looks up a recipe from any collection. */
export function findRecipe(id) {
  return recipesById.get(id);
}

/** Lunch recipes (both lunchbox collections) vs. everything else (dinners). */
export function getMealKind(recipeId) {
  return lunchIds.has(recipeId) ? 'lunch' : 'dinner';
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // All available recipes
      recipes: recipes,

      // Liked recipes
      likedRecipes: [],

      // Weekly meal plans: { [weekStart]: { [dayIndex]: [recipeIds] } }
      mealPlans: {},

      // Current week being viewed
      currentWeek: getWeekStart(),

      // Actions
      toggleLike: (recipe) => {
        const state = get();
        const isLiked = state.likedRecipes.some(liked => liked.id === recipe.id);

        if (isLiked) {
          set({
            likedRecipes: state.likedRecipes.filter(liked => liked.id !== recipe.id),
          });
        } else {
          set({
            likedRecipes: [...state.likedRecipes, recipe],
          });
        }
      },

      // Remove from liked recipes
      unlikeRecipe: (recipeId) => {
        set(state => ({
          likedRecipes: state.likedRecipes.filter(r => r.id !== recipeId),
        }));
      },

      // Weekly planner actions
      addToMealPlan: (recipeId, weekStart, dayIndex) => {
        set(state => {
          const weekPlan = state.mealPlans[weekStart] || {};
          const dayMeals = weekPlan[dayIndex] || [];

          return {
            mealPlans: {
              ...state.mealPlans,
              [weekStart]: {
                ...weekPlan,
                [dayIndex]: [...dayMeals, recipeId],
              },
            },
          };
        });
      },

      removeFromMealPlan: (recipeId, weekStart, dayIndex) => {
        set(state => {
          const weekPlan = state.mealPlans[weekStart] || {};
          const dayMeals = weekPlan[dayIndex] || [];

          // Remove first occurrence of this recipe
          const index = dayMeals.indexOf(recipeId);
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

      moveMeal: (recipeId, fromWeek, fromDay, toWeek, toDay) => {
        const state = get();
        state.removeFromMealPlan(recipeId, fromWeek, fromDay);
        state.addToMealPlan(recipeId, toWeek, toDay);
      },

      setCurrentWeek: (weekStart) => {
        set({ currentWeek: weekStart });
      },

      navigateWeek: (direction) => {
        set(state => ({ currentWeek: shiftWeek(state.currentWeek, direction) }));
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
        const { currentWeek: _stale, ...saved } = persisted ?? {};
        return { ...current, ...saved };
      },
    }
  )
);
