import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { ThemeFilters } from '../components/ThemeFilters';
import { useNavigate } from '@tanstack/react-router';
import './DiscoverPage.css';

const THEMES = [
  { id: 'all', name: 'All Recipes', description: 'Complete collection' },
  { id: 'quick', name: 'Quick & Easy', description: 'Under 30 minutes' },
  { id: 'family', name: 'Family Favorites', description: 'Kid-approved classics' },
  { id: 'healthy', name: 'Healthy & Light', description: 'Nutritious options' },
  { id: 'comfort', name: 'Comfort Classics', description: 'Warming traditions' },
  { id: 'one-pan', name: 'One-Pan Wonders', description: 'Easy cleanup' },
];

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

  const handleLikeToggle = (recipe) => {
    toggleLike(recipe);
  };

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
  };

  return (
    <div className="discover-page">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <h1 className="page-title">Discover</h1>
            <p className="page-subtitle">
              {activeTheme === 'all'
                ? 'Curated meals for your family'
                : `${recipes.length} ${THEMES.find(t => t.id === activeTheme)?.name.toLowerCase() || ''} recipes`
              }
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{likedRecipes.length}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{recipes.length}</span>
              <span className="stat-label">Recipes</span>
            </div>
          </div>
        </header>

        {/* Theme Filters */}
        <ThemeFilters
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
        />

        {/* Recipe Grid */}
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isLiked={likedRecipes.some(liked => liked.id === recipe.id)}
              onClick={() => handleRecipeClick(recipe)}
              onLikeToggle={() => handleLikeToggle(recipe)}
            />
          ))}
        </div>

        {/* Empty State */}
        {recipes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h2 className="empty-title">No recipes found</h2>
            <p className="empty-description">
              We're curating the perfect meals for your family. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
