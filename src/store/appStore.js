import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockRecipes, getShuffledRecipes } from '../data/mockRecipes';

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
      // Recipe deck for swiping
      deck: getShuffledRecipes(),
      currentIndex: 0,

      // Liked recipes
      likedRecipes: [],

      // Swipe history (for undo)
      swipeHistory: [],

      // Weekly meal plans: { [weekStart]: { [dayIndex]: [recipeIds] } }
      mealPlans: {},

      // Current week being viewed
      currentWeek: getWeekStart(),

      // Actions
      swipeRight: (recipe) => {
        const state = get();
        set({
          likedRecipes: [...state.likedRecipes, recipe],
          swipeHistory: [...state.swipeHistory, { recipe, action: 'liked' }],
          currentIndex: state.currentIndex + 1,
        });
      },

      swipeLeft: (recipe) => {
        const state = get();
        set({
          swipeHistory: [...state.swipeHistory, { recipe, action: 'passed' }],
          currentIndex: state.currentIndex + 1,
        });
      },

      undoSwipe: () => {
        const state = get();
        if (state.swipeHistory.length === 0) return;

        const lastSwipe = state.swipeHistory[state.swipeHistory.length - 1];
        const newHistory = state.swipeHistory.slice(0, -1);

        // If last swipe was a like, remove from liked
        const newLiked = lastSwipe.action === 'liked'
          ? state.likedRecipes.filter(r => r.id !== lastSwipe.recipe.id)
          : state.likedRecipes;

        set({
          swipeHistory: newHistory,
          likedRecipes: newLiked,
          currentIndex: Math.max(0, state.currentIndex - 1),
        });
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
          const current = new Date(state.currentWeek);
          current.setDate(current.getDate() + (direction * 7));
          return { currentWeek: getWeekStart(current) };
        });
      },

      // Reset deck when all cards viewed
      resetDeck: () => {
        set({
          deck: getShuffledRecipes(),
          currentIndex: 0,
        });
      },

      // Get recipe by ID
      getRecipeById: (id) => {
        return mockRecipes.find(r => r.id === id);
      },

      // Get meals for a specific week
      getWeekMeals: (weekStart) => {
        const state = get();
        const weekPlan = state.mealPlans[weekStart] || {};
        const meals = {};

        for (let day = 0; day < 7; day++) {
          const recipeIds = weekPlan[day] || [];
          meals[day] = recipeIds.map(id => mockRecipes.find(r => r.id === id)).filter(Boolean);
        }

        return meals;
      },
    }),
    {
      name: 'kids-meal-storage',
      partialize: (state) => ({
        likedRecipes: state.likedRecipes,
        mealPlans: state.mealPlans,
        swipeHistory: state.swipeHistory,
        currentIndex: state.currentIndex,
      }),
    }
  )
);
