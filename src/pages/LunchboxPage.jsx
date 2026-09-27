import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { ThemeFilters } from '../components/ThemeFilters';
import { lunchRecipes } from '../data/lunchRecipes';
import './DiscoverPage.css';

// No-reheat lunch recipes pulled from real food blogs, grouped into collections.
const COLLECTIONS = [
  { id: 'all', name: 'All Recipes' },
  {
    id: 'sandwiches',
    name: 'Sandwiches & Wraps',
    tags: ['sandwich', 'wrap', 'pinwheel'],
  },
  { id: 'pasta', name: 'Pasta Salads', tags: ['pasta'] },
  {
    id: 'bakes',
    name: 'Muffins & Bakes',
    tags: ['muffin', 'bake', 'fritters'],
  },
  {
    id: 'bento',
    name: 'Bento & Finger Foods',
    tags: ['bento', 'finger-food', 'skewers', 'fun'],
  },
  { id: 'sweet', name: 'Sweet & Fruity', tags: ['sweet', 'fruit', 'snack'] },
];

export function LunchboxPage() {
  const { likedRecipes, toggleLike } = useAppStore();
  const [activeCollectionId, setActiveCollection] = useState('all');
  const activeCollection = COLLECTIONS.find((c) => c.id === activeCollectionId);

  const recipes = useMemo(() => {
    if (!activeCollection?.tags) return lunchRecipes;
    return lunchRecipes.filter((recipe) =>
      recipe.tags.some((tag) => activeCollection.tags.includes(tag)),
    );
  }, [activeCollection]);

  return (
    <div className="discover-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Lunchbox ideas</h1>
          <p className="page-subtitle">
            {activeCollection?.tags
              ? `${recipes.length} ${activeCollection.name.toLowerCase()}`
              : `${recipes.length} easy no-reheat lunches from real food blogs — images, ingredients & steps included`}
          </p>
        </header>

        <ThemeFilters
          options={COLLECTIONS}
          activeId={activeCollectionId}
          onChange={setActiveCollection}
          label="Lunchbox collections"
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
            <h2>Nothing in this collection yet</h2>
            <p>Try another collection, or browse all lunchbox recipes.</p>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveCollection('all')}
            >
              Show all recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
