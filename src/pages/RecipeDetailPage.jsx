import { useState } from 'react';
import {
  Link,
  useCanGoBack,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import { findRecipe } from '../store/appStore';
import { Icon } from '../components/Icon';
import { LikeButton } from '../components/LikeButton';
import { Photo } from '../components/Photo';
import { PlanPicker } from '../components/PlanPicker';
import { Toast, useToast } from '../components/Toast';
import './RecipeDetailPage.css';

/**
 * Recipe page, one scroll: photo, title, "Add to plan", times, description,
 * packing tip (lunches only), ingredients, steps, and a link to the source.
 * Below 1024px everything stacks; from 1024px the photo, "Add to plan", and
 * times sit in a sticky left column beside the text.
 */
export function RecipeDetailPage() {
  const { recipeId } = useParams({ from: '/recipe/$recipeId' });
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [picking, setPicking] = useState(false);
  const { toast, show } = useToast();

  const recipe = findRecipe(recipeId);

  if (!recipe) {
    return (
      <div className="page">
        <div className="empty-state">
          <h1>Recipe not found</h1>
          <p>It may have been removed from the collection.</p>
          <Link to="/" className="btn btn-primary">
            Browse recipes
          </Link>
        </div>
      </div>
    );
  }

  // A shared link opened straight onto this page has nowhere in the app to go
  // back to, so Back goes to Discover instead.
  const goBack = () => {
    if (canGoBack) router.history.back();
    else router.navigate({ to: '/' });
  };

  const totalTime = recipe.prepTime + recipe.cookTime;
  // "24 min · 4 servings · Pasta · Chicken"
  const facts = [
    `${totalTime} min`,
    recipe.servings && `${recipe.servings} servings`,
    ...recipe.tags
      .slice(0, 2)
      .map(
        (tag) =>
          tag.charAt(0).toUpperCase() + tag.slice(1).replaceAll('-', ' '),
      ),
  ]
    .filter(Boolean)
    .join(' · ');
  // Same wording as the Lunchbox's "No cooking" filter.
  const times =
    recipe.cookTime > 0
      ? `Prep ${recipe.prepTime} min · Cook ${recipe.cookTime} min · Total ${totalTime} min`
      : `Prep ${recipe.prepTime} min · No cooking`;

  return (
    <div className="page recipe-page">
      <div className="recipe-topbar">
        <button type="button" className="text-btn" onClick={goBack}>
          <Icon name="arrow-left" />
          Back
        </button>
        <LikeButton recipe={recipe} />
      </div>

      {/* Three groups so desktop can lay them out as two columns (head and
          body on the right, aside on the left). Below 1024px the aside and
          body wrappers dissolve into one stack in this same order; only the
          photo (decorative, so skipped by screen readers) moves up to the top. */}
      <article className="recipe-layout">
        <header className="recipe-head">
          <h1 className="page-title">{recipe.title}</h1>
          <p className="recipe-meta">{facts}</p>
        </header>

        <div className="recipe-aside">
          <Photo src={recipe.image} className="recipe-photo" eager />
          <button
            type="button"
            className="btn btn-primary btn-block recipe-add"
            aria-haspopup="dialog"
            onClick={() => setPicking(true)}
          >
            <Icon name="plus" />
            Add to plan
          </button>
          <p className="recipe-times">{times}</p>
        </div>

        <div className="recipe-body">
          {recipe.description && (
            <p className="recipe-intro">{recipe.description}</p>
          )}

          {recipe.lunchboxTip && (
            <div className="recipe-tip">
              <p className="label">Packing tip</p>
              <p>{recipe.lunchboxTip}</p>
            </div>
          )}

          <section className="recipe-ingredients">
            <div className="section-header">
              <h2 className="section-title">Ingredients</h2>
              <span className="section-count">{recipe.ingredients.length}</span>
            </div>
            <ul>
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>
          </section>

          <section className="recipe-steps">
            <div className="section-header">
              <h2 className="section-title">Steps</h2>
            </div>
            <ol>
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="recipe-step-number">{i + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {recipe.sourceUrl && (
            <p className="recipe-source">
              Recipe from{' '}
              <a
                className="text-btn"
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {recipe.sourceName}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          )}
        </div>
      </article>

      {picking && (
        <PlanPicker
          recipe={recipe}
          onClose={() => setPicking(false)}
          onAdded={show}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
