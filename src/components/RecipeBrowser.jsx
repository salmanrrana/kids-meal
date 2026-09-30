import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { filterRecipes } from '../lib/browse';
import { Icon } from './Icon';
import { LikeButton } from './LikeButton';
import { RecipeTile } from './RecipeTile';
import { Tabs } from './Tabs';
import './RecipeBrowser.css';

// Tiles rendered per shelf. CSS shows exactly one row of them (two on phones).
const SHELF_SIZE = 5;

/**
 * Browse screen shared by Discover (dinners) and Lunchbox. With no filters it
 * shows one shelf per group; searching, picking a group, or a quick filter
 * switches to one grid of every match. Filters live in the URL
 * (?q=&group=&quick=), so going back from a recipe keeps them.
 *
 * @param {{
 *   title: string,
 *   intro: string,
 *   recipes: import('../store/appStore').Recipe[],
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

  // The search box keeps its own text, so the caret stays put while typing
  // even though the URL catches up a moment later. When `q` changes while
  // the box isn't focused (Clear filters, Back, the nav link), copy it in.
  const [text, setText] = useState(q);
  const searchRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  useEffect(() => {
    if (document.activeElement !== searchRef.current) setText(q);
  }, [q]);

  // Newest additions sit at the end of the data files; show them first.
  const ordered = useMemo(() => [...recipes].reverse(), [recipes]);
  const results = useMemo(
    () => filterRecipes(ordered, config, { q, group, quick }),
    [ordered, config, q, group, quick],
  );
  // Tab counts follow the search and quick filter, not the group itself.
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
      search: (/** @type {Record<string, unknown>} */ prev) => ({
        ...prev,
        ...patch,
      }),
      replace: true,
      resetScroll,
    });

  // Opens a random recipe from whatever is on screen.
  const surpriseMe = () => {
    const pool = results.length > 0 ? results : ordered;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    navigate({ to: '/recipe/$recipeId', params: { recipeId: pick.id } });
  };

  /** @param {import('../store/appStore').Recipe} recipe */
  const renderTile = (recipe) => (
    <RecipeTile
      key={recipe.id}
      recipe={recipe}
      action={<LikeButton recipe={recipe} />}
    />
  );

  return (
    <div className="page browse">
      <header className="page-header">
        <div className="page-heading">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{intro}</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={surpriseMe}
          >
            <Icon name="shuffle" />
            Surprise me
          </button>
        </div>
      </header>

      <div className="search-field">
        <Icon name="search" />
        <input
          ref={searchRef}
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFilters({ q: e.target.value || undefined }, false);
          }}
        />
      </div>

      <Tabs
        className="browse-tabs"
        label="Recipe groups"
        options={[
          {
            id: 'all',
            label: 'All',
            count: [...groupCounts.values()].reduce((a, b) => a + b, 0),
          },
          ...config.groups.map((g) => ({
            id: g.id,
            label: g.name,
            count: groupCounts.get(g.id) ?? 0,
          })),
        ]}
        activeId={group ?? 'all'}
        onChange={(id) => setFilters({ group: id === 'all' ? undefined : id })}
      />

      <div className="browse-status">
        <p className="browse-count" aria-live="polite">
          {isBrowsing
            ? `${ordered.length} recipes`
            : `${results.length} ${results.length === 1 ? 'match' : 'matches'}${groupName ? ` in ${groupName.toLowerCase()}` : ''}`}
        </p>
        <div className="browse-quick" role="group" aria-label="Quick filters">
          {config.quickFilters.map((filter) => (
            <label key={filter.id} className="checkbox">
              <input
                type="checkbox"
                checked={quick === filter.id}
                onChange={(e) =>
                  setFilters({
                    quick: e.target.checked ? filter.id : undefined,
                  })
                }
              />
              {filter.label}
            </label>
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
              <div className="section-header">
                <h2 id={`shelf-${g.id}`} className="section-title">
                  {g.name}
                </h2>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setFilters({ group: g.id })}
                >
                  See all {shelf.length}
                </button>
              </div>
              <div className="tile-grid">
                {shelf.slice(0, SHELF_SIZE).map(renderTile)}
              </div>
            </section>
          );
        })
      ) : results.length > 0 ? (
        <>
          {/* Keeps the outline h1 → h2 → h3 (tile titles) without a shelf. */}
          <h2 className="sr-only">Results</h2>
          <div className="tile-grid">{results.map(renderTile)}</div>
        </>
      ) : (
        <div className="empty-state">
          <h2>No recipes match</h2>
          <p>Try a different word, or clear the filters to see everything.</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              setFilters({ q: undefined, group: undefined, quick: undefined })
            }
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
