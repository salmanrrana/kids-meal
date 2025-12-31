import { useAppStore } from '../store/appStore';
import { SwipeCard } from '../components/SwipeCard';
import { useNavigate } from '@tanstack/react-router';
import './DiscoverPage.css';

export function DiscoverPage() {
  const navigate = useNavigate();
  const {
    deck,
    currentIndex,
    swipeRight,
    swipeLeft,
    undoSwipe,
    swipeHistory,
    likedRecipes,
    resetDeck,
  } = useAppStore();

  const currentRecipe = deck[currentIndex];
  const hasMoreCards = currentIndex < deck.length;
  const canUndo = swipeHistory.length > 0;

  const handleSwipeRight = (recipe) => {
    swipeRight(recipe);
  };

  const handleSwipeLeft = (recipe) => {
    swipeLeft(recipe);
  };

  const handleTap = (recipe) => {
    navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id } });
  };

  const handleUndo = () => {
    undoSwipe();
  };

  const handleReset = () => {
    resetDeck();
  };

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1>Discover Meals</h1>
        <div className="header-stats">
          <span className="stat liked">{likedRecipes.length} liked</span>
          <span className="stat remaining">{deck.length - currentIndex} left</span>
        </div>
      </header>

      <div className="card-container">
        {hasMoreCards ? (
          <>
            {/* Show next card underneath for preview */}
            {deck[currentIndex + 1] && (
              <div className="card-preview">
                <div className="preview-image-container">
                  <img
                    src={deck[currentIndex + 1].image}
                    alt=""
                    className="preview-image"
                  />
                </div>
              </div>
            )}
            <SwipeCard
              key={currentRecipe.id}
              recipe={currentRecipe}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onTap={handleTap}
            />
          </>
        ) : (
          <div className="empty-deck">
            <div className="empty-icon">🍽️</div>
            <h2>You've seen all the recipes!</h2>
            <p>You liked {likedRecipes.length} meals. Check them out or start fresh.</p>
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={() => navigate({ to: '/liked' })}>
                View Liked Meals
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {hasMoreCards && (
        <div className="swipe-actions">
          <button
            className="action-btn nope"
            onClick={() => handleSwipeLeft(currentRecipe)}
            aria-label="Pass on this recipe"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button
            className="action-btn undo"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo last swipe"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a5 5 0 015 5v2"></path>
              <polyline points="3,10 8,5 3,10 8,15"></polyline>
            </svg>
          </button>

          <button
            className="action-btn like"
            onClick={() => handleSwipeRight(currentRecipe)}
            aria-label="Like this recipe"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
