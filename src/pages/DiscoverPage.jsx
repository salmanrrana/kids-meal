import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { ThemeFilters } from '../components/ThemeFilters';
import { useNavigate } from '@tanstack/react-router';
import './DiscoverPage.css';

const THEME_NAMES = {
  all: 'All Recipes',
  quick: 'Quick & Easy',
  family: 'Family Favorites',
  healthy: 'Healthy & Light',
  comfort: 'Comfort Classics',
  'one-pan': 'One-Pan Wonders',
};

export function DiscoverPage() {
  const navigate = useNavigate();
  const { recipes: allRecipes, likedRecipes, toggleLike } = useAppStore();
  const [activeTheme, setActiveTheme] = useState('all');

  // Filter recipes based on active theme
  const recipes = useMemo(() => {
    if (activeTheme === 'all') return allRecipes;

    const themeFilters = {
      quick: ['quick'],
      family: ['kid-favorite', 'family-friendly'],
      healthy: ['healthy', 'light', 'nutritious'],
      comfort: ['comfort-food', 'warming', 'traditional'],
      'one-pan': ['one-pan', 'sheet-pan', 'skillet'],
    };

    const filterTags = themeFilters[activeTheme] || [];
    return allRecipes.filter(recipe =>
      filterTags.some(tag => recipe.tags.includes(tag))
    );
  }, [allRecipes, activeTheme]);

  const handleRecipeClick = (recipe) => {
    navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } });
  };

  return (
    <div className="discover-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Tonight's table</h1>
          <p className="page-subtitle">
            {activeTheme === 'all'
              ? `${recipes.length} family meals, all ready in 30 minutes or less`
              : `${recipes.length} ${THEME_NAMES[activeTheme].toLowerCase()} ${recipes.length === 1 ? 'recipe' : 'recipes'}`}
          </p>
        </header>

        <ThemeFilters activeTheme={activeTheme} onThemeChange={setActiveTheme} />

        {recipes.length > 0 ? (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isLiked={likedRecipes.some(liked => liked.id === recipe.id)}
                onClick={() => handleRecipeClick(recipe)}
                onLikeToggle={() => toggleLike(recipe)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 10.5h.01M15.5 10.5h.01" />
              <path d="M9 15h6" />
            </svg>
            <h2>Nothing in this collection yet</h2>
            <p>Try another collection, or browse all recipes.</p>
            <button className="btn btn-secondary" onClick={() => setActiveTheme('all')}>
              Show all recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
