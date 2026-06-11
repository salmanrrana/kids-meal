import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { recipes } from '../data/recipes';
import './RecipeDetailPage.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'steps', label: 'Steps' },
];

export function RecipeDetailPage() {
  const { recipeId } = useParams({ from: '/recipe/$recipeId' });
  const navigate = useNavigate();
  const { likedRecipes, toggleLike, addToMealPlan, currentWeek } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddedToast, setShowAddedToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const recipe = recipes.find(r => r.id === recipeId);
  const isLiked = likedRecipes.some(r => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="recipe-detail-page page-with-nav">
        <div className="page-container">
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h2>Recipe not found</h2>
            <p>It may have been removed from the collection.</p>
            <button className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
              Browse recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleAddToWeek = () => {
    const today = new Date().getDay();
    addToMealPlan(recipe.id, currentWeek, today);
    setShowAddedToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowAddedToast(false), 2200);
  };

  return (
    <div className="recipe-detail-page page-with-nav">
      {/* Hero with floating controls */}
      <div className="hero-image">
        <img src={recipe.image} alt={recipe.title} />
        <div className="hero-scrim" />
        <div className="hero-controls">
          <button className="icon-btn hero-btn" onClick={() => window.history.back()} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            className={`icon-btn hero-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => toggleLike(recipe)}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isLiked}
          >
            <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="page-container recipe-info">
        <div className="recipe-title-row">
          <h1 className="detail-title">{recipe.title}</h1>
          <button className="btn btn-primary btn-sm add-week-btn" onClick={handleAddToWeek}>
            Add to this week
          </button>
        </div>

        <div className="recipe-meta">
          <span className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {totalTime} min
          </span>
          <span className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {recipe.servings} servings
          </span>
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="meta-tag">{tag.replace(/-/g, ' ')}</span>
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

              {recipe.sourceUrl && (
                <p className="source-info">
                  Recipe from{' '}
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {recipe.sourceName}
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
                  <span className="step-number" aria-hidden="true">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {showAddedToast && (
        <div className="toast" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: 'var(--success)' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added to today's plan
        </div>
      )}
    </div>
  );
}
