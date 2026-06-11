import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recipes } from '../data/recipes';

// Get start of current week (Sunday)
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
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
        set(state => {
          // Parse date parts to avoid timezone issues
          const [year, month, day] = state.currentWeek.split('-').map(Number);
          const current = new Date(year, month - 1, day);
          current.setDate(current.getDate() + (direction * 7));
          return { currentWeek: getWeekStart(current) };
        });
      },



      // Get recipe by ID
      getRecipeById: (id) => {
        return recipes.find(r => r.id === id);
      },

      // Get meals for a specific week
      getWeekMeals: (weekStart) => {
        const state = get();
        const weekPlan = state.mealPlans[weekStart] || {};
        const meals = {};

        for (let day = 0; day < 7; day++) {
          const recipeIds = weekPlan[day] || [];
          meals[day] = recipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);
        }

        return meals;
      },
    }),
    {
      name: 'kids-meal-storage',
      partialize: (state) => ({
        likedRecipes: state.likedRecipes,
        mealPlans: state.mealPlans,
        currentWeek: state.currentWeek,
      }),
    }
  )
);
