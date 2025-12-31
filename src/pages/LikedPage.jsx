import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Link, useNavigate } from '@tanstack/react-router';
import './LikedPage.css';

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

  const weekDates = getWeekDates(pickerWeek);

  const handleAddToDay = (recipeId, dayIndex) => {
    addToMealPlan(recipeId, pickerWeek, dayIndex);
    setOpenPicker(null);
    setPickerWeek(currentWeek);
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
          <div key={recipe.id} className="recipe-card">
            <div
              className="card-image-wrapper"
              onClick={() => navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } })}
            >
              <img src={recipe.image} alt={recipe.title} className="card-img" />
              <div className="card-overlay">
                <span className="view-label">View Recipe</span>
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-title">{recipe.title}</h3>
              <div className="card-meta">
                <span className="meta-item">{recipe.tags?.[0]}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className={`btn-action add ${openPicker === recipe.id ? 'active' : ''}`}
                  onClick={() => openPickerFor(recipe.id)}
                  aria-label="Add to planner"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <line x1="12" y1="14" x2="12" y2="18"></line>
                    <line x1="10" y1="16" x2="14" y2="16"></line>
                  </svg>
                </button>

                <button
                  type="button"
                  className="btn-action remove"
                  onClick={() => unlikeRecipe(recipe.id)}
                  aria-label="Remove from liked"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
