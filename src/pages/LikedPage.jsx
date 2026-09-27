import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Link } from '@tanstack/react-router';
import { RecipeCard } from '../components/RecipeCard';
import { getWeekStart, shiftWeek, getWeekDates, formatWeekRange } from '../lib/week';
import './LikedPage.css';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Liked recipe card with quick-add actions. The confirmation covers the
// action buttons briefly after "Add today".
function LikedRecipeCard({ recipe, onQuickAdd, onOpenPicker, showSuccess, ...props }) {
  return (
    <div className="liked-recipe-card-wrapper">
      <RecipeCard {...props} recipe={recipe} />
      <div className="quick-actions">
        <button
          type="button"
          className="quick-add-btn"
          onClick={() => onQuickAdd(recipe.id)}
          title="Add to today's meal plan"
        >
          Add today
        </button>
        <button
          type="button"
          className="quick-add-btn secondary"
          onClick={() => onOpenPicker(recipe.id)}
          title="Choose a day for this meal"
        >
          Pick a day
        </button>
        {showSuccess && (
          <div className="success-message" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Added to today</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function LikedPage() {
  const { likedRecipes, unlikeRecipe, addToMealPlan } = useAppStore();
  const [openPicker, setOpenPicker] = useState(null);
  // The picker always opens on the real current week, not the planner's view.
  const [pickerWeek, setPickerWeek] = useState(() => getWeekStart());
  const [showSuccess, setShowSuccess] = useState(null);

  const todayKey = new Date().toDateString();
  const weekDates = getWeekDates(pickerWeek);

  const closePicker = () => setOpenPicker(null);

  const openPickerFor = (recipeId) => {
    setOpenPicker(recipeId);
    setPickerWeek(getWeekStart());
  };

  const handleAddToDay = (recipeId, dayIndex) => {
    addToMealPlan(recipeId, pickerWeek, dayIndex);
    closePicker();
  };

  const handleQuickAddToday = (recipeId) => {
    addToMealPlan(recipeId, getWeekStart(), new Date().getDay());
    setShowSuccess(recipeId);
  };

  // Hide the "added" confirmation after 2s
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(null), 2000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Escape closes the day picker
  useEffect(() => {
    if (!openPicker) return;
    const onKey = (e) => e.key === 'Escape' && setOpenPicker(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPicker]);

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
                <button type="button" className="icon-btn" onClick={() => setPickerWeek(shiftWeek(pickerWeek, -1))} aria-label="Previous week">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="week-label">{formatWeekRange(pickerWeek)}</span>
                <button type="button" className="icon-btn" onClick={() => setPickerWeek(shiftWeek(pickerWeek, 1))} aria-label="Next week">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <div className="picker-days">
                {weekDates.map((date, dayIndex) => {
                  const isToday = date.toDateString() === todayKey;
                  return (
                    <button
                      type="button"
                      key={dayIndex}
                      className={`picker-day ${isToday ? 'today' : ''}`}
                      onClick={() => handleAddToDay(openPicker, dayIndex)}
                      aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    >
                      <span className="day-label">{DAYS_SHORT[dayIndex]}</span>
                      <span className="day-date">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
