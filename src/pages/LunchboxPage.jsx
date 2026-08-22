import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { RecipeCard } from '../components/RecipeCard';
import { lunchboxRecipes } from '../data/lunchboxRecipes';
import './DiscoverPage.css';

const COLLECTION_NAMES = {
  all: 'All Ideas',
  sandwiches: 'Sandwiches & Wraps',
  'finger-foods': 'Finger Foods & Skewers',
  'make-ahead': 'Make-Ahead Bakes',
  protein: 'Protein Packs',
  sweet: 'Sweet & Fruity',
};

const COLLECTIONS = [
  { id: 'all', name: 'All Ideas' },
  { id: 'sandwiches', name: 'Sandwiches & Wraps' },
  { id: 'finger-foods', name: 'Finger Foods' },
  { id: 'make-ahead', name: 'Make-Ahead Bakes' },
  { id: 'protein', name: 'Protein Packs' },
  { id: 'sweet', name: 'Sweet & Fruity' },
];

const COLLECTION_TAGS = {
  sandwiches: ['sandwich', 'wrap', 'roll-up', 'pinwheel'],
  'finger-foods': ['finger-food', 'skewers', 'fun', 'bento'],
  'make-ahead': ['make-ahead', 'muffin', 'leftovers'],
  protein: ['protein'],
  sweet: ['sweet', 'fruit'],
};

export function LunchboxPage() {
  const navigate = useNavigate();
  const { likedRecipes, toggleLike } = useAppStore();
  const [activeCollection, setActiveCollection] = useState('all');

  const recipes = useMemo(() => {
    if (activeCollection === 'all') return lunchboxRecipes;
    const tags = COLLECTION_TAGS[activeCollection] || [];
    return lunchboxRecipes.filter(recipe =>
      recipe.tags.some(tag => tags.includes(tag))
    );
  }, [activeCollection]);

  const handleRecipeClick = (recipe) => {
    navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } });
  };

  return (
    <div className="discover-page page-with-nav">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Lunchbox ideas</h1>
          <p className="page-subtitle">
            {activeCollection === 'all'
              ? `${recipes.length} daycare-friendly lunches for ages 3–5 — no reheating needed`
              : `${recipes.length} ${COLLECTION_NAMES[activeCollection].toLowerCase()} ${recipes.length === 1 ? 'idea' : 'ideas'}`}
          </p>
        </header>

        <nav className="theme-filters" aria-label="Lunchbox collections">
          <div className="theme-filters-container">
            {COLLECTIONS.map((collection) => (
              <button
                key={collection.id}
                className={`theme-filter ${activeCollection === collection.id ? 'active' : ''}`}
                aria-pressed={activeCollection === collection.id}
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
