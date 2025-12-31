import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Link, useNavigate } from '@tanstack/react-router';
import './LikedPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(weekStart) {
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);

  return DAYS.map((dayName, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      dayName,
      dayIndex: index,
      dateNum: date.getDate(),
      isToday: new Date().toDateString() === date.toDateString(),
    };
  });
}

export function LikedPage() {
  const navigate = useNavigate();
  const { likedRecipes, unlikeRecipe, addToMealPlan, currentWeek } = useAppStore();
  const [openPicker, setOpenPicker] = useState(null); // recipe id with open picker

  const weekDates = getWeekDates(currentWeek);

  const handleAddToDay = (recipeId, dayIndex) => {
    addToMealPlan(recipeId, currentWeek, dayIndex);
    setOpenPicker(null);
  };

  const togglePicker = (recipeId) => {
    setOpenPicker(openPicker === recipeId ? null : recipeId);
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
                <span className="meta-item">{recipe.prepTime + recipe.cookTime} min</span>
              </div>

              <div className="card-actions">
                <div className="day-picker-container">
                  <button
                    className={`btn-action add ${openPicker === recipe.id ? 'active' : ''}`}
                    onClick={() => togglePicker(recipe.id)}
                    title="Add to planner"
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

                  {openPicker === recipe.id && (
                    <div className="day-picker-dropdown">
                      <div className="picker-header">Add to which day?</div>
                      <div className="picker-days">
                        {weekDates.map(({ dayName, dayIndex, dateNum, isToday }) => (
                          <button
                            key={dayIndex}
                            className={`picker-day ${isToday ? 'today' : ''}`}
                            onClick={() => handleAddToDay(recipe.id, dayIndex)}
                          >
                            <span className="day-name">{dayName}</span>
                            <span className="day-num">{dateNum}</span>
                            {isToday && <span className="today-dot"></span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn-action remove"
                  onClick={() => unlikeRecipe(recipe.id)}
                  title="Remove from liked"
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

      {/* Click outside to close picker */}
      {openPicker && (
        <div className="picker-backdrop" onClick={() => setOpenPicker(null)} />
      )}
    </div>
  );
}
