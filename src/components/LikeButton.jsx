import { useAppStore } from '../store/appStore';
import { Icon } from './Icon';

/**
 * Heart icon button that saves or unsaves a recipe in Favorites. It reads and
 * writes the store itself, so any page can drop it in: a tile's or row's
 * `action`, or the recipe page's top row. `onToggle` runs right after a press,
 * before the page re-renders (Favorites uses it to move focus off a row that
 * is about to disappear).
 *
 *   <LikeButton recipe={recipe} />
 *
 * @param {{
 *   recipe: import('../store/appStore').Recipe,
 *   onToggle?: () => void,
 * }} props
 */
export function LikeButton({ recipe, onToggle }) {
  const liked = useAppStore((state) =>
    state.likedRecipes.some((saved) => saved.id === recipe.id),
  );
  const toggleLike = useAppStore((state) => state.toggleLike);

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={`Favorite ${recipe.title}`}
      aria-pressed={liked}
      onClick={() => {
        toggleLike(recipe);
        onToggle?.();
      }}
    >
      <Icon name="heart" filled={liked} />
    </button>
  );
}
