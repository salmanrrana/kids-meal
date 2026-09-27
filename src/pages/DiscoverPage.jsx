import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { ThemeFilters } from '../components/ThemeFilters';
import './DiscoverPage.css';

// Collections shown as chips. A recipe is in a collection if it has any of its tags.
const THEMES = [
  { id: 'all', name: 'All Recipes' },
  { id: 'quick', name: 'Quick & Easy', tags: ['quick'] },
  {
    id: 'family',
    name: 'Family Favorites',
    tags: ['kid-favorite', 'family-friendly'],
  },
  {
    id: 'healthy',
    name: 'Healthy & Light',
    tags: ['healthy', 'light', 'nutritious'],
  },
  {
    id: 'comfort',
    name: 'Comfort Classics',
    tags: ['comfort-food', 'warming', 'traditional'],
  },
  {
    id: 'one-pan',
    name: 'One-Pan Wonders',
    tags: ['one-pan', 'sheet-pan', 'skillet'],
  },
];

export function DiscoverPage() {
  const { recipes: allRecipes, likedRecipes, toggleLike } = useAppStore();
  const [activeThemeId, setActiveThemeId] = useState('all');
  const activeTheme =
    THEMES.find((theme) => theme.id === activeThemeId) ?? THEMES[0];

  const recipes = useMemo(() => {
    const themeTags = activeTheme.tags;
    if (!themeTags) return allRecipes;
    return allRecipes.filter((recipe) =>
      recipe.tags.some((tag) => themeTags.includes(tag)),
    );
  }, [allRecipes, activeTheme]);

  return (
    <div className="discover-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Tonight's table</h1>
          <p className="page-subtitle">
            {activeTheme.tags
              ? `${recipes.length} ${activeTheme.name.toLowerCase()} ${recipes.length === 1 ? 'recipe' : 'recipes'}`
              : `${recipes.length} family meals, all ready in 30 minutes or less`}
          </p>
        </header>

        <ThemeFilters
          options={THEMES}
          activeId={activeThemeId}
          onChange={setActiveThemeId}
          label="Recipe collections"
        />

        {recipes.length > 0 ? (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isLiked={likedRecipes.some((liked) => liked.id === recipe.id)}
                onLikeToggle={() => toggleLike(recipe)}
              />
            ))}
          </div>
        ) : (
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
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 10.5h.01M15.5 10.5h.01" />
              <path d="M9 15h6" />
            </svg>
            <h2>Nothing in this collection yet</h2>
            <p>Try another collection, or browse all recipes.</p>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveThemeId('all')}
            >
              Show all recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
