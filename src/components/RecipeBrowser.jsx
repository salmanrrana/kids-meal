import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { filterRecipes } from '../lib/browse';
import { RecipeCard } from './RecipeCard';
import { ThemeFilters } from './ThemeFilters';
import './RecipeBrowser.css';

const SHELF_SIZE = 10;

/**
 * Browse screen shared by Discover (dinners) and Lunchbox. With no filters it
 * shows one sideways-scrolling shelf per group; searching, picking a group, or
 * a quick filter switches to a results grid. Filters live in the URL
 * (?q=&group=&quick=), so going back from a recipe keeps them.
 *
 * @param {{
 *   title: string,
 *   intro: string,
 *   recipes: import('../lib/browse').Recipe[],
 *   config: import('../lib/browse').BrowseConfig,
 *   searchPlaceholder: string,
 * }} props
 */
export function RecipeBrowser({
  title,
  intro,
  recipes,
  config,
  searchPlaceholder,
}) {
  const navigate = useNavigate();
  /** @type {{ q?: string, group?: string, quick?: string }} */
  const { q = '', group, quick } = useSearch({ strict: false });
  const likedRecipes = useAppStore((state) => state.likedRecipes);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const likedIds = new Set(likedRecipes.map((recipe) => recipe.id));

  // Newest additions sit at the end of the data files; show them first.
  const ordered = useMemo(() => [...recipes].reverse(), [recipes]);
  const results = useMemo(
    () => filterRecipes(ordered, config, { q, group, quick }),
    [ordered, config, q, group, quick],
  );
  // Group chip counts follow the search and quick filter, not the group itself.
  const groupCounts = useMemo(() => {
    const counts = new Map();
    for (const recipe of filterRecipes(ordered, config, { q, quick })) {
      const id = config.groupOf(recipe);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [ordered, config, q, quick]);

  const isBrowsing = !q && !group && !quick;
  const groupName = config.groups.find((g) => g.id === group)?.name;

  /** @param {{ q?: string, group?: string, quick?: string }} patch */
  const setFilters = (patch, resetScroll = true) =>
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll,
    });

  // Opens a random recipe from whatever is on screen.
  const surpriseMe = () => {
    const pool = results.length > 0 ? results : ordered;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    navigate({ to: '/recipe/$recipeId', params: { recipeId: pick.id } });
  };

  const renderCard = (recipe) => (
    <RecipeCard
      key={recipe.id}
      recipe={recipe}
      isLiked={likedIds.has(recipe.id)}
      onLikeToggle={() => toggleLike(recipe)}
    />
  );

  return (
    <div className="browse-page page-with-nav">
      <div className="page-container">
        <header className="page-header browse-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{intro}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm surprise-btn"
            onClick={surpriseMe}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Surprise me
          </button>
        </header>

        <div className="browse-search">
          <svg
            className="browse-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16" y2="16" />
          </svg>
          <input
            type="search"
            className="browse-search-input"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={q}
            onChange={(e) =>
              setFilters({ q: e.target.value || undefined }, false)
            }
          />
        </div>

        <ThemeFilters
          options={[
            {
              id: 'all',
              name: 'All',
              count: [...groupCounts.values()].reduce((a, b) => a + b, 0),
            },
            ...config.groups.map((g) => ({
              ...g,
              count: groupCounts.get(g.id) ?? 0,
            })),
          ]}
          activeId={group ?? 'all'}
          onChange={(id) =>
            setFilters({ group: id === 'all' ? undefined : id })
          }
          label="Recipe groups"
        />

        <div className="browse-bar">
          <p className="browse-count" aria-live="polite">
            {isBrowsing
              ? `${ordered.length} recipes`
              : `${results.length} ${results.length === 1 ? 'match' : 'matches'}${groupName ? ` in ${groupName.toLowerCase()}` : ''}`}
          </p>
          <div
            className="quick-filters"
            role="group"
            aria-label="Quick filters"
          >
            {config.quickFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={`quick-filter ${quick === filter.id ? 'active' : ''}`}
                aria-pressed={quick === filter.id}
                onClick={() =>
                  setFilters({
                    quick: quick === filter.id ? undefined : filter.id,
                  })
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isBrowsing ? (
          config.groups.map((g) => {
            const shelf = ordered.filter((r) => config.groupOf(r) === g.id);
            if (shelf.length === 0) return null;
            return (
              <section
                key={g.id}
                className="shelf"
                aria-labelledby={`shelf-${g.id}`}
              >
                <div className="shelf-head">
                  <h2 id={`shelf-${g.id}`} className="shelf-title">
                    {g.name}
                  </h2>
                  <button
                    type="button"
                    className="shelf-more"
                    onClick={() => setFilters({ group: g.id })}
                  >
                    See all {shelf.length}
                  </button>
                </div>
                <div className="shelf-track">
                  {shelf.slice(0, SHELF_SIZE).map(renderCard)}
                </div>
              </section>
            );
          })
        ) : results.length > 0 ? (
          <div className="recipes-grid">{results.map(renderCard)}</div>
        ) : (
          <div className="empty-state">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16" y2="16" />
            </svg>
            <h2>No recipes match</h2>
            <p>Try a different word, or clear the filters to see everything.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setFilters({ q: undefined, group: undefined, quick: undefined })
              }
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
