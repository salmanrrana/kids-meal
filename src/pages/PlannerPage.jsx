import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { recipes } from '../data/recipes';
import './PlannerPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function PlannerPage() {
  const navigate = useNavigate();
  const {
    currentWeek,
    navigateWeek,
    mealPlans,
    removeFromMealPlan,
    addToMealPlan,
    likedRecipes,
  } = useAppStore();

  const [draggedMeal, setDraggedMeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(null); // day index

  const weekPlan = mealPlans[currentWeek] || {};

  const getMealsForDay = (dayIndex) => {
    const recipeIds = weekPlan[dayIndex] || [];
    return recipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);
  };

  const handleDragStart = (e, recipe, fromDay) => {
    setDraggedMeal({ recipe, fromDay });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toDay) => {
    e.preventDefault();
    if (!draggedMeal) return;

    const { recipe, fromDay } = draggedMeal;

    // Remove from original day
    if (fromDay !== null && fromDay !== undefined) {
      removeFromMealPlan(recipe.id, currentWeek, fromDay);
    }

    // Add to new day
    addToMealPlan(recipe.id, currentWeek, toDay);
    setDraggedMeal(null);
  };

  const handleRemoveMeal = (recipeId, dayIndex) => {
    removeFromMealPlan(recipeId, currentWeek, dayIndex);
  };

  const handleAddMeal = (recipeId, dayIndex) => {
    addToMealPlan(recipeId, currentWeek, dayIndex);
    setShowAddModal(null);
  };

  const availableRecipes = likedRecipes.filter(recipe => {
    // Show recipes not already added to this day
    const dayMeals = weekPlan[showAddModal] || [];
    return !dayMeals.includes(recipe.id);
  });

  return (
    <div className="planner-page page-with-nav">
      {/* Header with week navigation */}
      <header className="planner-header">
        <h1>Weekly Planner</h1>
        <div className="week-nav">
          <button className="week-btn" onClick={() => navigateWeek(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span className="week-label">{formatWeekRange(currentWeek)}</span>
          <button className="week-btn" onClick={() => navigateWeek(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </header>

      {/* Kanban board */}
      <div className="kanban-board">
        {DAYS.map((day, dayIndex) => {
          const meals = getMealsForDay(dayIndex);
          const isToday = new Date().getDay() === dayIndex;

          return (
            <div
              key={day}
              className={`day-column ${isToday ? 'today' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dayIndex)}
            >
              <div className="day-header">
                <span className="day-name">{day}</span>
                <span className="day-full">{DAYS_FULL[dayIndex]}</span>
                {isToday && <span className="today-badge">Today</span>}
              </div>

              <div className="day-meals">
                {meals.map((meal, mealIndex) => (
                  <div
                    key={`${meal.id}-${mealIndex}`}
                    className="meal-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, meal, dayIndex)}
                    onClick={() => navigate({ to: '/recipe/$recipeId', params: { recipeId: meal.id } })}
                  >
                    <img src={meal.image} alt="" className="meal-thumb" />
                    <div className="meal-info">
                      <span className="meal-title">{meal.title}</span>
                      <span className="meal-time">{meal.prepTime + meal.cookTime} min</span>
                    </div>
                    <button
                      className="remove-meal"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMeal(meal.id, dayIndex);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  className="add-meal-btn"
                  onClick={() => setShowAddModal(dayIndex)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Meal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grocery list button */}
      <div className="planner-actions">
        <button
          className="btn btn-primary grocery-btn"
          onClick={() => navigate({ to: '/grocery' })}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Generate Grocery List
        </button>
      </div>

      {/* Add meal modal */}
      {showAddModal !== null && (
        <div className="modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Meal to {DAYS_FULL[showAddModal]}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              {availableRecipes.length === 0 ? (
                <div className="no-recipes">
                  <p>No liked recipes available.</p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(null);
                      navigate({ to: '/' });
                    }}
                  >
                    Discover Meals
                  </button>
                </div>
              ) : (
                <div className="recipe-select-list">
                  {availableRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      className="recipe-select-item"
                      onClick={() => handleAddMeal(recipe.id, showAddModal)}
                    >
                      <img src={recipe.image} alt="" className="select-thumb" />
                      <div className="select-info">
                        <span className="select-title">{recipe.title}</span>
                        <span className="select-meta">
                          {recipe.tags[0]} • {recipe.prepTime + recipe.cookTime} min
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
