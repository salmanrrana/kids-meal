import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { lunchboxRecipes } from '../data/lunchboxRecipes';
import { lunchRecipes } from '../data/lunchRecipes';
import './DiscoverPage.css';
import './LunchboxPage.css';

// Two sources share this page: quick at-home ideas and full recipes pulled
// from real food blogs. Each mode gets its own collections.
const MODES = {
  ideas: {
    label: 'Quick Ideas',
    note: 'Simple mix-and-match lunches you can throw together in minutes.',
    recipes: lunchboxRecipes,
    subtitle: (n) => `${n} daycare-friendly lunches for ages 3–5 — no reheating needed`,
  },
  sourced: {
    label: 'From Real Sites',
    note: 'Full recipes with steps, pulled from our favorite family-food blogs.',
    recipes: lunchRecipes,
    subtitle: (n) => `${n} easy no-reheat lunches from real food blogs — images, ingredients & steps included`,
  },
};

const COLLECTIONS = {
  ideas: [
    { id: 'all', name: 'All Ideas' },
    { id: 'sandwiches', name: 'Sandwiches & Wraps', tags: ['sandwich', 'wrap', 'roll-up', 'pinwheel'] },
    { id: 'finger-foods', name: 'Finger Foods', tags: ['finger-food', 'skewers', 'fun', 'bento'] },
    { id: 'make-ahead', name: 'Make-Ahead Bakes', tags: ['make-ahead', 'muffin', 'leftovers'] },
    { id: 'protein', name: 'Protein Packs', tags: ['protein'] },
    { id: 'sweet', name: 'Sweet & Fruity', tags: ['sweet', 'fruit'] },
  ],
  sourced: [
    { id: 'all', name: 'All Recipes' },
    { id: 'sandwiches', name: 'Sandwiches & Wraps', tags: ['sandwich', 'wrap', 'pinwheel'] },
    { id: 'pasta', name: 'Pasta Salads', tags: ['pasta'] },
    { id: 'bakes', name: 'Muffins & Bakes', tags: ['muffin', 'bake', 'fritters'] },
    { id: 'bento', name: 'Bento & Finger Foods', tags: ['bento', 'finger-food', 'skewers', 'fun'] },
    { id: 'sweet', name: 'Sweet & Fruity', tags: ['sweet', 'fruit', 'snack'] },
  ],
};

export function LunchboxPage() {
  const navigate = useNavigate();
  const { likedRecipes, toggleLike } = useAppStore();
  const [mode, setMode] = useState('ideas');
  const [activeCollectionId, setActiveCollection] = useState('all');

  const activeMode = MODES[mode];
  const collections = COLLECTIONS[mode];

  const recipes = useMemo(() => {
    if (activeCollectionId === 'all') return activeMode.recipes;
    const collection = collections.find((c) => c.id === activeCollectionId);
    if (!collection?.tags) return activeMode.recipes;
    return activeMode.recipes.filter((recipe) =>
      recipe.tags.some((tag) => collection.tags.includes(tag))
    );
  }, [activeMode, activeCollectionId, collections]);

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  const handleRecipeClick = (recipe) => {
    navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } });
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setActiveCollection('all');
  };

  return (
    <div className="discover-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Lunchbox ideas</h1>
          <p className="page-subtitle">
            {activeCollectionId === 'all'
              ? activeMode.subtitle(recipes.length)
              : `${recipes.length} ${activeCollection.name.toLowerCase()}`}
          </p>
        </header>

        {/* Source toggle: quick ideas vs. full recipes from real sites */}
        <div className="mode-toggle" role="tablist" aria-label="Lunchbox source">
          {Object.entries(MODES).map(([id, m]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              className={`mode-toggle-btn ${mode === id ? 'active' : ''}`}
              onClick={() => switchMode(id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mode-note">{activeMode.note}</p>

        <nav className="theme-filters" aria-label="Lunchbox collections">
          <div className="theme-filters-container">
            {collections.map((collection) => (
              <button
                key={collection.id}
                className={`theme-filter ${activeCollectionId === collection.id ? 'active' : ''}`}
                aria-pressed={activeCollectionId === collection.id}
                onClick={() => setActiveCollection(collection.id)}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </nav>

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
            <h2>Nothing in this collection yet</h2>
            <p>Try another collection, or browse all lunchbox ideas.</p>
            <button className="btn btn-secondary" onClick={() => setActiveCollection('all')}>
              Show all ideas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
