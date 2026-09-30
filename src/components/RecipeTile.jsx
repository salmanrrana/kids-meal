import { Link } from '@tanstack/react-router';
import { Photo } from './Photo';
import './RecipeTile.css';

/**
 * The fields a tile or row reads.
 * @typedef {Pick<
 *   import('../store/appStore').Recipe,
 *   'id' | 'title' | 'image' | 'prepTime' | 'cookTime'
 * >} RecipeSummary
 */

/**
 * Recipe tile: square photo, title (two lines always reserved), and a 44px meta
 * row with the minutes and one icon button. Every tile in a grid is the same
 * size. The title link covers the whole tile; the `action` button sits above it
 * and never navigates. Lay tiles out in a `.tile-grid`.
 *
 *   <RecipeTile recipe={r} action={<LikeButton recipe={r} />} />
 *   <RecipeTile compact recipe={r} action={removeButton} draggable onDragStart={…} />
 *
 * `action` should be an `.icon-btn` (heart, or × in the planner). `compact` is
 * the smaller planner cell. Other props (draggable, drag handlers, className)
 * go on the <article>; a draggable tile drags as a whole, not as a link.
 *
 * @param {{
 *   recipe: RecipeSummary,
 *   action?: import('react').ReactNode,
 *   compact?: boolean,
 * } & Omit<import('react').ComponentPropsWithoutRef<'article'>, 'children'>} props
 */
export function RecipeTile({
  recipe,
  action,
  compact = false,
  className = '',
  ...rest
}) {
  return (
    <article
      className={`tile ${compact ? 'tile--compact' : ''} ${className}`}
      {...rest}
    >
      <Photo src={recipe.image} className="tile-photo" />
      <h3 className="tile-title">
        <Link
          to="/recipe/$recipeId"
          params={{ recipeId: recipe.id }}
          className="tile-link"
          draggable={rest.draggable ? false : undefined}
        >
          {recipe.title}
        </Link>
      </h3>
      <div className="tile-meta">
        <span className="tile-time">
          {recipe.prepTime + recipe.cookTime} min
        </span>
        {action}
      </div>
    </article>
  );
}
