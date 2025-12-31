import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { recipes } from '../data/recipes';
import './RecipeDetailPage.css';

export function RecipeDetailPage() {
  const { recipeId } = useParams({ from: '/recipe/$recipeId' });
  const navigate = useNavigate();
  const { likedRecipes, addToMealPlan, currentWeek } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const recipe = recipes.find(r => r.id === recipeId);
  const isLiked = likedRecipes.some(r => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="recipe-detail-page page-with-nav">
        <div className="not-found">
          <h2>Recipe not found</h2>
          <button className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleAddToWeek = () => {
    const today = new Date().getDay();
    addToMealPlan(recipe.id, currentWeek, today);
    alert('Added to this week\'s meal plan!');
  };

  return (
    <div className="recipe-detail-page page-with-nav">
      {/* Header with back button */}
      <header className="detail-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="header-actions">
          {isLiked && (
            <button className="btn btn-primary btn-sm" onClick={handleAddToWeek}>
              Add to Week
            </button>
          )}
        </div>
      </header>

      {/* Hero image */}
      <div className="hero-image">
        <img src={recipe.image} alt={recipe.title} />
      </div>

      {/* Recipe info */}
      <div className="recipe-info">
        <h1 className="recipe-title">{recipe.title}</h1>

        <div className="recipe-meta">
          <div className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{totalTime} min</span>
          </div>
          <div className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{recipe.servings} servings</span>
          </div>
          <div className="meta-item">
            {recipe.tags.slice(0, 2).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={`tab ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            Steps
          </button>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <p className="description">{recipe.description}</p>

              <div className="time-breakdown">
                <h3>Time Breakdown</h3>
                <div className="time-items">
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
              </div>

              {recipe.sourceUrl && (
                <div className="source-info">
                  <span>Recipe from: </span>
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {recipe.sourceName}
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="ingredients-tab">
              <ul className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="steps-tab">
              <ol className="steps-list">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="step-item">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
