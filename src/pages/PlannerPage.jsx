import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ALL_RECIPES,
  MEAL_KINDS,
  findRecipe,
  getMealKind,
  getPlannedMeal,
  useAppStore,
} from '../store/appStore';
import {
  formatWeekRange,
  fromDateKey,
  getWeekDates,
  getWeekStart,
} from '../lib/week';
import { Icon } from '../components/Icon';
import { RecipePickRow, RecipeRow } from '../components/RecipeRow';
import { RecipeTile } from '../components/RecipeTile';
import { Sheet } from '../components/Sheet';
import { Tabs } from '../components/Tabs';
import './PlannerPage.css';

/** @typedef {import('../store/appStore').Recipe} Recipe */
/** @typedef {import('../store/appStore').MealKind} MealKind */

/**
 * @typedef {{
 *   index: number,
 *   date: Date,
 *   name: string,
 *   isToday: boolean,
 *   isPast: boolean,
 *   lunch: Recipe[],
 *   dinner: Recipe[],
 * }} PlanDay
 */

// Indexed by Date#getDay(); weeks start on Sunday.
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// "Sep 30"
const MONTH_DAY = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Seven columns need about 120px each, so below this width the week is a day
// list. PlannerPage.css styles the grid off the `planner--grid` class set from
// this query, so the breakpoint lives only here.
const GRID_QUERY = '(min-width: 1024px)';

/**
 * Subscribes to GRID_QUERY for useSyncExternalStore.
 * @param {() => void} onChange
 */
function watchGridQuery(onChange) {
  const query = window.matchMedia(GRID_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * "This week", "Next week", "In 3 weeks", "2 weeks ago"…
 * @param {string} weekStart
 * @param {string} thisWeek
 */
function relativeWeekLabel(weekStart, thisWeek) {
  const diff = Math.round(
    (fromDateKey(weekStart).getTime() - fromDateKey(thisWeek).getTime()) /
      WEEK_MS,
  );
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  return diff > 0 ? `In ${diff} weeks` : `${-diff} weeks ago`;
}

/**
 * "1 lunch", "2 lunches"
 * @param {number} n
 * @param {string} one
 * @param {string} many
 */
function countLabel(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * The weekly planner. Below 1024px: a sticky 7-day strip that jumps to a day,
 * then the days stacked, each with Lunch and Dinner rows. From 1024px: a
 * 7-column week grid where meals can be dragged to another day. Each day has a
 * lunch and a dinner slot, and any recipe can go in either; "+ Add" on a slot
 * opens the add sheet.
 */
export function PlannerPage() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const mealPlans = useAppStore((state) => state.mealPlans);
  const navigateWeek = useAppStore((state) => state.navigateWeek);
  const setCurrentWeek = useAppStore((state) => state.setCurrentWeek);
  const addToMealPlan = useAppStore((state) => state.addToMealPlan);
  const removeFromMealPlan = useAppStore((state) => state.removeFromMealPlan);
  const moveMeal = useAppStore((state) => state.moveMeal);

  const isGrid = useSyncExternalStore(
    watchGridQuery,
    () => window.matchMedia(GRID_QUERY).matches,
  );
  // The slot the add sheet is filling, or null while it's closed.
  const [adding, setAdding] = useState(
    /** @type {{ day: number, kind: MealKind } | null} */ (null),
  );
  // Week grid drag and drop: the meal being dragged, and the day under it.
  const [dragged, setDragged] = useState(
    /** @type {{ day: number, kind: MealKind, index: number, recipeId: string } | null} */ (
      null
    ),
  );
  const [dropDay, setDropDay] = useState(/** @type {number | null} */ (null));
  const titleRef = useRef(/** @type {HTMLHeadingElement | null} */ (null));

  const thisWeek = getWeekStart();
  const isThisWeek = currentWeek === thisWeek;
  const todayIndex = new Date().getDay();
  const weekPlan = mealPlans[currentWeek] ?? {};

  /** @type {PlanDay[]} */
  const days = getWeekDates(currentWeek).map((date, index) => {
    const meals = (weekPlan[index] ?? []).map(getPlannedMeal);
    /** @param {MealKind} kind */
    const recipesIn = (kind) =>
      meals
        .filter((meal) => meal.kind === kind)
        .map((meal) => findRecipe(meal.recipeId))
        .filter((recipe) => recipe !== undefined);
    return {
      index,
      date,
      name: DAY_NAMES[index],
      isToday: isThisWeek && index === todayIndex,
      isPast: currentWeek < thisWeek || (isThisWeek && index < todayIndex),
      lunch: recipesIn('lunch'),
      dinner: recipesIn('dinner'),
    };
  });

  const lunches = days.reduce((n, day) => n + day.lunch.length, 0);
  const dinners = days.reduce((n, day) => n + day.dinner.length, 0);
  const summary =
    lunches + dinners === 0
      ? 'Nothing planned yet'
      : [
          dinners > 0 && countLabel(dinners, 'dinner', 'dinners'),
          lunches > 0 && countLabel(lunches, 'lunch', 'lunches'),
        ]
          .filter(Boolean)
          .join(' · ');

  /** @param {number} index */
  const jumpToDay = (index) => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    document.getElementById(`planner-day-${index}`)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const endDrag = () => {
    setDragged(null);
    setDropDay(null);
  };

  // The button disappears once it's used, so focus goes to the title, which
  // now reads "This week".
  const backToThisWeek = !isThisWeek && (
    <button
      type="button"
      className="text-btn"
      onClick={() => {
        setCurrentWeek(thisWeek);
        titleRef.current?.focus();
      }}
    >
      This week
    </button>
  );
  const groceryButton = lunches + dinners > 0 && (
    <Link
      to="/grocery"
      className={`btn btn-primary ${isGrid ? '' : 'btn-block planner-grocery'}`}
    >
      <Icon name="bag" />
      Build grocery list
    </Link>
  );

  return (
    <div className={`page planner ${isGrid ? 'planner--grid' : ''}`}>
      <header className="page-header">
        <div className="page-heading">
          <h1 ref={titleRef} className="page-title" tabIndex={-1}>
            {relativeWeekLabel(currentWeek, thisWeek)}
          </h1>
          <p className="page-subtitle">
            {formatWeekRange(currentWeek)} · {summary}
          </p>
          {!isGrid && backToThisWeek && (
            <p className="planner-back">{backToThisWeek}</p>
          )}
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous week"
            onClick={() => navigateWeek(-1)}
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next week"
            onClick={() => navigateWeek(1)}
          >
            <Icon name="chevron-right" />
          </button>
          {isGrid && backToThisWeek}
          {isGrid && groceryButton}
        </div>
      </header>

      {!isGrid && (
        <nav className="planner-strip" aria-label="Jump to day">
          {days.map((day) => {
            const planned = day.lunch.length + day.dinner.length;
            return (
              <button
                key={day.index}
                type="button"
                className={`planner-strip-day ${day.isPast ? 'planner-strip-day--past' : ''}`}
                aria-current={day.isToday ? 'date' : undefined}
                aria-label={`${day.name} ${day.date.getDate()}, ${countLabel(planned, 'meal', 'meals')}`}
                onClick={() => jumpToDay(day.index)}
              >
                <span className="planner-strip-dow">
                  {day.name.slice(0, 3)}
                </span>
                <span className="planner-strip-date">{day.date.getDate()}</span>
                <span className="planner-strip-dots" aria-hidden="true">
                  {Array.from({ length: Math.min(planned, 3) }, (_, i) => (
                    <span key={i} />
                  ))}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      <div className="planner-week">
        {days.map((day) => (
          <section
            key={day.index}
            id={`planner-day-${day.index}`}
            aria-labelledby={`planner-day-${day.index}-title`}
            className={[
              'planner-day',
              day.isToday && 'planner-day--today',
              day.isPast && 'planner-day--past',
              dropDay === day.index && 'planner-day--drop',
            ]
              .filter(Boolean)
              .join(' ')}
            onDragOver={(e) => {
              // Only meals from another day can land here.
              if (!dragged || dragged.day === day.index) return;
              e.preventDefault();
              setDropDay(day.index);
            }}
            onDragLeave={(e) => {
              const to = e.relatedTarget;
              if (!(to instanceof Node && e.currentTarget.contains(to))) {
                setDropDay(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged) {
                moveMeal(
                  dragged.recipeId,
                  dragged.kind,
                  currentWeek,
                  dragged.day,
                  currentWeek,
                  day.index,
                );
              }
              endDrag();
            }}
          >
            <header className="section-header planner-day-header">
              <h2
                id={`planner-day-${day.index}-title`}
                className="section-title planner-day-title"
              >
                <span className="planner-day-dow">{day.name.slice(0, 3)}</span>{' '}
                <span className="planner-day-date">{day.date.getDate()}</span>
                {day.isToday && (
                  <span className={isGrid ? 'sr-only' : 'planner-day-today'}>
                    {' '}
                    Today
                  </span>
                )}
              </h2>
            </header>

            {MEAL_KINDS.map(({ id: kind, label }) => (
              <div key={kind} className={`planner-slot planner-slot--${kind}`}>
                <div className="planner-slot-head">
                  <h3 className="label">{label}</h3>
                  <button
                    type="button"
                    className="text-btn"
                    aria-label={`Add ${kind} on ${day.name}`}
                    onClick={() => setAdding({ day: day.index, kind })}
                  >
                    + Add
                  </button>
                </div>
                {day[kind].length > 0 && (
                  <ul className="planner-meals">
                    {day[kind].map((recipe, i) => {
                      const key = `${recipe.id}-${i}`;
                      const remove = (
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Remove ${recipe.title} from ${day.name} ${kind}`}
                          onClick={(e) => {
                            // This meal is about to go; keep focus in its
                            // slot, on "+ Add". Only keyboard users need the
                            // page scrolled to it; for a mouse it's a jump.
                            e.currentTarget
                              .closest('.planner-slot')
                              ?.querySelector('button')
                              ?.focus({
                                preventScroll:
                                  !e.currentTarget.matches(':focus-visible'),
                              });
                            removeFromMealPlan(
                              recipe.id,
                              currentWeek,
                              day.index,
                              kind,
                            );
                          }}
                        >
                          <Icon name="close" />
                        </button>
                      );
                      if (!isGrid) {
                        return (
                          <RecipeRow
                            key={key}
                            recipe={recipe}
                            actions={remove}
                          />
                        );
                      }
                      const isDragged =
                        dragged?.day === day.index &&
                        dragged.kind === kind &&
                        dragged.index === i;
                      return (
                        <li key={key}>
                          <RecipeTile
                            compact
                            recipe={recipe}
                            action={remove}
                            className={isDragged ? 'planner-dragged' : ''}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              // Firefox only starts a drag that carries data.
                              e.dataTransfer.setData(
                                'text/plain',
                                recipe.title,
                              );
                              setDragged({
                                day: day.index,
                                kind,
                                index: i,
                                recipeId: recipe.id,
                              });
                            }}
                            onDragEnd={endDrag}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

      {!isGrid && groceryButton}

      {adding && (
        <AddMealSheet
          day={days[adding.day]}
          kind={adding.kind}
          onPick={(recipeId) => {
            addToMealPlan(recipeId, currentWeek, adding.day, adding.kind);
            setAdding(null);
          }}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  );
}

/**
 * "Add lunch" / "Add dinner" sheet for one day's slot. Tabs switch between
 * Favorites and every recipe (the slot's usual kind first); the search filters
 * whichever is showing. Recipes already in the slot are disabled as "Added".
 * Picking one calls `onPick`; the page saves it and closes the sheet.
 *
 * @param {{
 *   day: PlanDay,
 *   kind: MealKind,
 *   onPick: (recipeId: string) => void,
 *   onClose: () => void,
 * }} props
 */
function AddMealSheet({ day, kind, onPick, onClose }) {
  const favorites = useAppStore((state) => state.likedRecipes);
  const allRecipes = useMemo(() => {
    const known = new Set(ALL_RECIPES.map((recipe) => recipe.id));
    // Favorites from a removed collection still count as recipes.
    const everything = [
      ...ALL_RECIPES,
      ...favorites.filter((recipe) => !known.has(recipe.id)),
    ];
    return [
      ...everything.filter((recipe) => getMealKind(recipe.id) === kind),
      ...everything.filter((recipe) => getMealKind(recipe.id) !== kind),
    ];
  }, [favorites, kind]);

  /** @type {import('../components/Tabs').TabOption<'favorites' | 'all'>[]} */
  const tabs = [
    { id: 'favorites', label: 'Favorites', count: favorites.length },
    { id: 'all', label: 'All recipes' },
  ];
  const [tab, setTab] = useState(
    /** @type {'favorites' | 'all'} */ (
      favorites.length > 0 ? 'favorites' : 'all'
    ),
  );
  const [query, setQuery] = useState('');
  const searchRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  const q = query.trim().toLowerCase();
  const source = tab === 'favorites' ? favorites : allRecipes;
  const results = q
    ? source.filter((recipe) => recipe.title.toLowerCase().includes(q))
    : source;

  return (
    <Sheet
      title={`Add ${kind}`}
      subline={`${day.name}, ${MONTH_DAY.format(day.date)}`}
      tall
      onClose={onClose}
      tools={
        <>
          <Tabs
            label="Recipe source"
            options={tabs}
            activeId={tab}
            onChange={setTab}
          />
          <div className="search-field">
            <Icon name="search" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search recipes…"
              aria-label="Search recipes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </>
      }
    >
      {results.length > 0 ? (
        <ul>
          {results.map((recipe) => (
            <RecipePickRow
              key={recipe.id}
              recipe={recipe}
              meta={recipe.sourceName}
              added={day[kind].some((planned) => planned.id === recipe.id)}
              onPick={() => onPick(recipe.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="planner-sheet-empty">
          {q ? (
            <>No recipes match “{query.trim()}”.</>
          ) : (
            <>
              No favorites yet.{' '}
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  // This button disappears with the switch; keep focus in
                  // the sheet so Escape and Tab still work.
                  setTab('all');
                  searchRef.current?.focus();
                }}
              >
                Browse all recipes
              </button>
            </>
          )}
        </p>
      )}
    </Sheet>
  );
}
