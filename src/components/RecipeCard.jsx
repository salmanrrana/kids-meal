import { useState } from 'react';
import './RecipeCard.css';

export function RecipeCard({ recipe, isLiked, onClick, onLikeToggle }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleCardClick = (e) => {
    // Prevent card click when clicking the heart button
    if (e.target.closest('.like-button')) {
      return;
    }
    onClick();
  };

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLikeToggle(e);
  };

  return (
    <article className="recipe-card" onClick={handleCardClick}>
      <div className="card-image-container">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className={`card-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="image-placeholder" />}

        <button
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
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
        <h3 className="recipe-title">{recipe.title}</h3>
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
