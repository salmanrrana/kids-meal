import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { LikeButton } from '../components/LikeButton';
import { PlanPicker } from '../components/PlanPicker';
import { RecipeRow } from '../components/RecipeRow';
import { Toast, useToast } from '../components/Toast';
import './LikedPage.css';

/**
 * Favorites (/liked): every saved recipe as a row. "Add to plan" opens the
 * shared plan picker and the toast confirms the day; the heart unfavorites,
 * which removes the row.
 */
export function LikedPage() {
  const likedRecipes = useAppStore((state) => state.likedRecipes);
  const [picking, setPicking] = useState(
    /** @type {import('../store/appStore').Recipe | null} */ (null),
  );
  const { toast, show } = useToast();
  const titleRef = useRef(/** @type {HTMLHeadingElement | null} */ (null));
  const listRef = useRef(/** @type {HTMLUListElement | null} */ (null));
  const count = likedRecipes.length;

  /**
   * Unfavoriting row `index` removes it, focused heart and all. Runs before
   * the row goes: focus moves to the next row's heart, else the previous
   * row's, else the title once the list is empty.
   * @param {number} index
   */
  const keepFocusAfterRemoving = (index) => {
    const hearts = listRef.current?.querySelectorAll('.row-actions button');
    const next = hearts?.[index + 1] ?? hearts?.[index - 1] ?? titleRef.current;
    if (next instanceof HTMLElement) next.focus();
  };

  return (
    <div className="page liked">
      <header className="page-header">
        <div className="page-heading">
          <h1 ref={titleRef} className="page-title" tabIndex={-1}>
            Favorites
          </h1>
          {count > 0 && (
            <p className="page-subtitle">
              {count} {count === 1 ? 'recipe' : 'recipes'} your family loves
            </p>
          )}
        </div>
      </header>

      {count > 0 ? (
        <ul ref={listRef} className="liked-list">
          {likedRecipes.map((recipe, i) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              meta={
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setPicking(recipe)}
                >
                  Add to plan
                  <span className="sr-only">: {recipe.title}</span>
                </button>
              }
              actions={
                <LikeButton
                  recipe={recipe}
                  onToggle={() => keepFocusAfterRemoving(i)}
                />
              }
            />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>
            Tap the heart on any recipe you'd cook again, and it will wait for
            you here.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse recipes
          </Link>
        </div>
      )}

      {picking && (
        <PlanPicker
          recipe={picking}
          onClose={() => setPicking(null)}
          onAdded={show}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
