import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { findRecipe, getMealKind, useAppStore } from '../store/appStore';
import { getWeekStart } from '../lib/week';
import './RecipeDetailPage.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'steps', label: 'Steps' },
];

// The next 7 days starting today, as options for the "Add to plan" picker.
// `label` names the day ("Today", "Tomorrow", "Mon, Sep 28"); `date` is local midnight.
function getUpcomingDays() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateLabel = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateLabel;
    return { date, label, dateLabel };
  });
}

export function RecipeDetailPage() {
  const { recipeId } = useParams({ from: '/recipe/$recipeId' });
  const navigate = useNavigate();
  const { likedRecipes, toggleLike, addToMealPlan } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mealKind, setMealKind] = useState(
    /** @type {'lunch' | 'dinner'} */ ('dinner'),
  );
  const [toastMessage, setToastMessage] = useState(
    /** @type {string | null} */ (null),
  );
  const toastTimer = useRef(
    /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined),
  );
  const addButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Closing returns focus to the button that opened the picker
  const closePicker = () => {
    setPickerOpen(false);
    addButtonRef.current?.focus();
  };

  // Escape closes the picker
  useEffect(() => {
    if (!pickerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePicker();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pickerOpen]);

  const recipe = findRecipe(recipeId);
  const isLiked = likedRecipes.some((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="recipe-detail-page page-with-nav">
        <div className="page-container">
          <div className="empty-state">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h2>Recipe not found</h2>
            <p>It may have been removed from the collection.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate({ to: '/' })}
            >
              Browse recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  const handlePickDay = ({ date, label }) => {
    addToMealPlan(recipe.id, getWeekStart(date), date.getDay(), mealKind);
    closePicker();
    setToastMessage(`Added to ${mealKind} on ${label}`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  };

  return (
    <div className="recipe-detail-page page-with-nav">
      {/* Hero with floating controls */}
      <div className="hero-image">
        <img src={recipe.image} alt={recipe.title} />
        <div className="hero-scrim" />
        <div className="hero-controls">
          <button
            className="icon-btn hero-btn"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            className={`icon-btn hero-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => toggleLike(recipe)}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isLiked}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="page-container recipe-info">
        <div className="recipe-title-row">
          <h1 className="detail-title">{recipe.title}</h1>
          <button
            ref={addButtonRef}
            className="btn btn-primary add-plan-btn"
            onClick={() => {
              setMealKind(getMealKind(recipe.id));
              setPickerOpen(true);
            }}
            aria-haspopup="dialog"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add to plan
          </button>
        </div>

        <div className="recipe-meta">
          <span className="meta-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {totalTime} min
          </span>
          <span className="meta-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {recipe.servings} servings
          </span>
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="meta-tag">
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Recipe details">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <p className="description">{recipe.description}</p>

              <div className="time-breakdown">
                <div className="time-item">
                  <span className="time-label">Prep</span>
                  <span className="time-value">{recipe.prepTime} min</span>
                </div>
                <div className="time-item">
                  <span className="time-label">Cook</span>
                  <span className="time-value">{recipe.cookTime} min</span>
                </div>
                <div className="time-item">
                  <span className="time-label">Total</span>
                  <span className="time-value">{totalTime} min</span>
                </div>
              </div>

              {recipe.lunchboxTip && (
                <div className="lunchbox-tip">
                  <strong>Packing tip:</strong> {recipe.lunchboxTip}
                </div>
              )}

              {recipe.sourceUrl && (
                <p className="source-info">
                  Recipe from{' '}
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {recipe.sourceName}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-row">
                  {ingredient}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'steps' && (
            <ol className="steps-list">
              {recipe.steps.map((step, index) => (
                <li key={index} className="step-item">
                  <span className="step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Day picker: bottom sheet on phones, small modal on wider screens */}
      {pickerOpen && (
        <div className="modal-overlay add-plan-overlay" onClick={closePicker}>
          <div
            className="modal add-plan-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-plan-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="add-plan-title">Add to plan</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={closePicker}
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div
              className="meal-kind-options"
              role="group"
              aria-label="Plan for"
            >
              <span>Plan for</span>
              <button
                type="button"
                className={mealKind === 'lunch' ? 'selected' : ''}
                aria-pressed={mealKind === 'lunch'}
                onClick={() => setMealKind('lunch')}
              >
                Lunch
              </button>
              <button
                type="button"
                className={mealKind === 'dinner' ? 'selected' : ''}
                aria-pressed={mealKind === 'dinner'}
                onClick={() => setMealKind('dinner')}
              >
                Dinner
              </button>
            </div>
            <ul className="add-plan-days">
              {getUpcomingDays().map((day, i) => (
                <li key={day.dateLabel}>
                  <button
                    type="button"
                    className="add-plan-day"
                    onClick={() => handlePickDay(day)}
                    autoFocus={i === 0}
                  >
                    <span className="add-plan-day-label">{day.label}</span>
                    {day.label !== day.dateLabel && (
                      <span className="add-plan-day-date">{day.dateLabel}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast" role="status">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
            style={{ color: 'var(--success)' }}
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
