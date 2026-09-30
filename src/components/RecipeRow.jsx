import { Link } from '@tanstack/react-router';
import { Photo } from './Photo';
import './RecipeRow.css';

/** @typedef {import('./RecipeTile').RecipeSummary} RecipeSummary */

/**
 * Recipe row for lists (Favorites, planner meals below desktop): 56px thumb,
 * title, a meta line that starts with the minutes, and action buttons on the
 * right. Always 76px tall. The title link covers the whole row; anything in
 * `meta` or `actions` sits above it and stays clickable. Render rows in a <ul>.
 *
 *   <RecipeRow
 *     recipe={r}
 *     meta={<button type="button" className="text-btn" onClick={…}>Add to plan</button>}
 *     actions={<LikeButton recipe={r} />}
 *   />
 *
 * `meta` is shown after "24 min · " (text or an inline text button).
 * `actions` holds 44px icon buttons. Other props (draggable, drag handlers,
 * className) go on the <li>.
 *
 * @param {{
 *   recipe: RecipeSummary,
 *   meta?: import('react').ReactNode,
 *   actions?: import('react').ReactNode,
 * } & Omit<import('react').ComponentPropsWithoutRef<'li'>, 'children'>} props
 */
export function RecipeRow({ recipe, meta, actions, className = '', ...rest }) {
  return (
    <li className={`row ${className}`} {...rest}>
      <Photo src={recipe.image} className="row-thumb" />
      <div className="row-text">
        <p className="row-title">
          <Link
            to="/recipe/$recipeId"
            params={{ recipeId: recipe.id }}
            className="row-link"
            draggable={rest.draggable ? false : undefined}
          >
            {recipe.title}
          </Link>
        </p>
        <p className="row-meta">
          {recipe.prepTime + recipe.cookTime} min
          {meta ? <> · {meta}</> : null}
        </p>
      </div>
      {actions ? <div className="row-actions">{actions}</div> : null}
    </li>
  );
}

/**
 * Row that is one big button, for choosing a recipe (the planner's add sheet).
 * `added` disables it and shows "Added" on the right. Render in a <ul>.
 *
 *   <RecipePickRow recipe={r} meta={r.sourceName} added={isPlanned} onPick={() => add(r.id)} />
 *
 * @param {{
 *   recipe: RecipeSummary,
 *   meta?: import('react').ReactNode,
 *   onPick: () => void,
 *   added?: boolean,
 * }} props
 */
export function RecipePickRow({ recipe, meta, onPick, added = false }) {
  return (
    <li className="row row--pick">
      <button
        type="button"
        className="row-pick"
        onClick={onPick}
        disabled={added}
      >
        <Photo src={recipe.image} className="row-thumb" />
        <span className="row-text">
          <span className="row-title">{recipe.title}</span>
          <span className="row-meta">
            {recipe.prepTime + recipe.cookTime} min
            {meta ? <> · {meta}</> : null}
          </span>
        </span>
        {added && <span className="row-added">Added</span>}
      </button>
    </li>
  );
}
