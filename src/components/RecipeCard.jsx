import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import './RecipeCard.css';

// Photo-forward recipe card used on the browse grids. The title is a real link
// stretched over the whole card, so the card works with keyboard, middle-click
// and "open in new tab". The heart sits above that link and never navigates.
export function RecipeCard({ recipe, isLiked, onLikeToggle }) {
  const [imageStatus, setImageStatus] = useState('loading');

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <article className="recipe-card">
      <div className="card-image-container">
        {imageStatus !== 'error' && (
          <img
            src={recipe.image}
            alt=""
            loading="lazy"
            className={`card-image ${imageStatus === 'loaded' ? 'loaded' : ''}`}
            onLoad={() => setImageStatus('loaded')}
            onError={() => setImageStatus('error')}
          />
        )}
        {imageStatus === 'loading' && <div className="image-placeholder" />}
        {imageStatus === 'error' && (
          <div className="image-fallback" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="4.5" />
            </svg>
          </div>
        )}

        <button
          type="button"
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={onLikeToggle}
          aria-label={isLiked ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
          aria-pressed={isLiked}
        >
          <svg viewBox="0 0 24 24" className="heart-icon" aria-hidden="true">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.75"
            />
          </svg>
        </button>

        <span className="time-badge">{totalTime} min</span>
      </div>

      <div className="card-content">
        <h3 className="recipe-title">
          <Link
            to="/recipe/$recipeId"
            params={{ recipeId: recipe.id }}
            className="card-link"
          >
            {recipe.title}
          </Link>
        </h3>
        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-tags">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag">
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
