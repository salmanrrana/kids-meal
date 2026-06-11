import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Link, useNavigate } from '@tanstack/react-router';
import { RecipeCard } from '../components/RecipeCard';
import './LikedPage.css';

// Get today's date for quick add functionality
const getTodayIndex = () => new Date().getDay();

// Liked recipe card with quick-add actions
function LikedRecipeCard({ recipe, onQuickAdd, onOpenPicker, showSuccess, ...props }) {
  return (
    <div className="liked-recipe-card-wrapper">
      <RecipeCard {...props} recipe={recipe} />
      {showSuccess && (
        <div className="success-message" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Added to today's plan</span>
        </div>
      )}
      <div className="quick-actions">
        <button
          className="quick-add-btn"
          onClick={() => onQuickAdd(recipe.id)}
          title="Add to today's meal plan"
        >
          Add today
        </button>
        <button
          className="quick-add-btn secondary"
          onClick={() => onOpenPicker(recipe.id)}
          title="Choose a day for this meal"
        >
          Pick a day
        </button>
      </div>
    </div>
  );
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(weekStart) {
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);

  return DAYS_SHORT.map((dayName, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      dayName,
      dayIndex: index,
      dateNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: new Date().toDateString() === date.toDateString(),
    };
  });
}

function formatWeekLabel(weekStart) {
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function getNextWeekStart(weekStart, direction) {
  const [year, month, day] = weekStart.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  current.setDate(current.getDate() + (direction * 7));
  const d = current.getDay();
  current.setDate(current.getDate() - d);
  return current.toISOString().split('T')[0];
}

export function LikedPage() {
  const navigate = useNavigate();
  const { likedRecipes, unlikeRecipe, addToMealPlan, currentWeek } = useAppStore();
  const [openPicker, setOpenPicker] = useState(null);
  const [pickerWeek, setPickerWeek] = useState(currentWeek);
  const [showSuccess, setShowSuccess] = useState(null);

  const weekDates = getWeekDates(pickerWeek);

  const handleAddToDay = (recipeId, dayIndex) => {
    addToMealPlan(recipeId, pickerWeek, dayIndex);
    setOpenPicker(null);
    setPickerWeek(currentWeek);
  };

  const handleQuickAddToday = (recipeId) => {
    addToMealPlan(recipeId, currentWeek, getTodayIndex());
    setShowSuccess(recipeId);
    setTimeout(() => setShowSuccess(null), 2000);
  };

  const closePicker = () => {
    setOpenPicker(null);
    setPickerWeek(currentWeek);
  };

  const openPickerFor = (recipeId) => {
    setOpenPicker(recipeId);
    setPickerWeek(currentWeek);
  };

  const navigatePickerWeek = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setPickerWeek(getNextWeekStart(pickerWeek, direction));
  };

  const handleDayClick = (e, recipeId, dayIndex) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToDay(recipeId, dayIndex);
  };

  if (likedRecipes.length === 0) {
    return (
      <div className="liked-page page-with-nav">
        <div className="page-container">
          <header className="page-header">
            <h1 className="page-title">Favorites</h1>
          </header>
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <h2>No favorites yet</h2>
            <p>Tap the heart on any recipe you'd cook again, and it will wait for you here.</p>
            <Link to="/" className="btn btn-primary">
              Browse recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Favorites</h1>
          <p className="page-subtitle">
            {likedRecipes.length} {likedRecipes.length === 1 ? 'recipe' : 'recipes'} your family loves
          </p>
        </header>

        <div className="recipe-grid">
          {likedRecipes.map((recipe) => (
            <LikedRecipeCard
              key={recipe.id}
              recipe={recipe}
              isLiked={true}
              onClick={() => navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } })}
              onLikeToggle={() => unlikeRecipe(recipe.id)}
              onQuickAdd={handleQuickAddToday}
              onOpenPicker={openPickerFor}
              showSuccess={showSuccess === recipe.id}
            />
          ))}
        </div>
      </div>

      {/* Day picker modal */}
      {openPicker && (
        <div className="modal-overlay" onClick={closePicker}>
          <div
            className="modal day-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add to meal plan"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add to meal plan</h3>
              <button type="button" className="icon-btn" onClick={closePicker} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="week-navigator">
                <button type="button" className="icon-btn" onClick={(e) => navigatePickerWeek(e, -1)} aria-label="Previous week">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="week-label">{formatWeekLabel(pickerWeek)}</span>
                <button type="button" className="icon-btn" onClick={(e) => navigatePickerWeek(e, 1)} aria-label="Next week">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <div className="picker-days">
                {weekDates.map(({ dayName, dayIndex, dateNum, isToday }) => (
                  <button
                    type="button"
                    key={dayIndex}
                    className={`picker-day ${isToday ? 'today' : ''}`}
                    onClick={(e) => handleDayClick(e, openPicker, dayIndex)}
                  >
                    <span className="day-label">{dayName}</span>
                    <span className="day-date">{dateNum}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
