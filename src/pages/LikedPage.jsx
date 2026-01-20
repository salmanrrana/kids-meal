import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Link, useNavigate } from '@tanstack/react-router';
import { RecipeCard } from '../components/RecipeCard';
import './LikedPage.css';

// Get today's date for quick add functionality
const getTodayIndex = () => new Date().getDay();

// Custom LikedRecipeCard with quick add functionality
function LikedRecipeCard({ recipe, onQuickAdd, onOpenPicker, showSuccess, ...props }) {
  return (
    <div className="liked-recipe-card-wrapper">
      <RecipeCard {...props} recipe={recipe} />
      {showSuccess && (
        <div className="success-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Added to today's plan!</span>
        </div>
      )}
      <div className="quick-actions">
        <button
          className="quick-add-btn"
          onClick={() => onQuickAdd(recipe.id)}
          title="Add to today's meal plan"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="12" y1="14" x2="12" y2="18"></line>
            <line x1="10" y1="16" x2="14" y2="16"></line>
          </svg>
          <span className="quick-add-text">Add Today</span>
        </button>
        <button
          className="quick-add-btn secondary"
          onClick={() => onOpenPicker(recipe.id)}
          title="Choose day for meal plan"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="quick-add-text">Choose Day</span>
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
        <header className="page-header">
          <h1>Liked Meals</h1>
        </header>
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h2>No liked meals yet</h2>
          <p>Start swiping to discover meals you love!</p>
          <Link to="/" className="btn btn-primary">
            Discover Meals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-page page-with-nav">
      <header className="page-header">
        <h1>Liked Meals</h1>
        <span className="count">{likedRecipes.length} recipes</span>
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

      {/* Day picker modal */}
      {openPicker && (
        <div className="picker-overlay">
          <div className="picker-backdrop" onClick={closePicker} />
          <div className="day-picker-modal" role="dialog" aria-modal="true">
            <div className="picker-header">
              <h3>Add to Meal Plan</h3>
              <button type="button" className="close-picker" onClick={closePicker} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="week-navigator">
              <button type="button" className="week-nav-btn" onClick={(e) => navigatePickerWeek(e, -1)} aria-label="Previous week">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span className="week-label">{formatWeekLabel(pickerWeek)}</span>
              <button type="button" className="week-nav-btn" onClick={(e) => navigatePickerWeek(e, 1)} aria-label="Next week">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      )}
    </div>
  );
}
