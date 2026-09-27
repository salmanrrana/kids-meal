import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAppStore, ALL_RECIPES, findRecipe, getMealKind } from '../store/appStore';
import { formatWeekRange, fromDateKey, getWeekDates, getWeekStart } from '../lib/week';
import './PlannerPage.css';

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Each day has a lunch and a dinner slot. A meal's slot comes from which
// collection its recipe lives in, so the saved plan stays a flat list per day.
const SLOTS = [
  { kind: 'lunch', label: 'Lunch', allLabel: 'All lunches' },
  { kind: 'dinner', label: 'Dinner', allLabel: 'All dinners' },
];

const RECIPES_BY_KIND = {
  lunch: ALL_RECIPES.filter((r) => getMealKind(r.id) === 'lunch'),
  dinner: ALL_RECIPES.filter((r) => getMealKind(r.id) === 'dinner'),
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// "This week", "Next week", "In 3 weeks", "2 weeks ago"…
function relativeWeekLabel(weekStart, thisWeek) {
  const diff = Math.round((fromDateKey(weekStart) - fromDateKey(thisWeek)) / WEEK_MS);
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  return diff > 0 ? `In ${diff} weeks` : `${-diff} weeks ago`;
}

function countLabel(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function totalMinutes(recipe) {
  return recipe.prepTime + recipe.cookTime;
}

export function PlannerPage() {
  const navigate = useNavigate();
  const {
    currentWeek,
    navigateWeek,
    setCurrentWeek,
    mealPlans,
    addToMealPlan,
    removeFromMealPlan,
    moveMeal,
  } = useAppStore();

  // Where the add sheet is pointed: { dayIndex, kind } or null when closed.
  const [adding, setAdding] = useState(null);
  const [dragged, setDragged] = useState(null); // { recipeId, fromDay }
  const [dropDay, setDropDay] = useState(null);

  const thisWeek = getWeekStart();
  const isThisWeek = currentWeek === thisWeek;
  const todayIndex = new Date().getDay();
  const weekDates = getWeekDates(currentWeek);
  const weekPlan = mealPlans[currentWeek] || {};

  // Resolved meals per day, split into slots: days[dayIndex][kind] = recipes
  const days = weekDates.map((_, dayIndex) => {
    const meals = (weekPlan[dayIndex] || []).map(findRecipe).filter(Boolean);
    return {
      lunch: meals.filter((r) => getMealKind(r.id) === 'lunch'),
      dinner: meals.filter((r) => getMealKind(r.id) === 'dinner'),
    };
  });

  const lunchCount = days.reduce((n, d) => n + d.lunch.length, 0);
  const dinnerCount = days.reduce((n, d) => n + d.dinner.length, 0);
  const summary =
    lunchCount + dinnerCount === 0
      ? 'Nothing planned yet'
      : [dinnerCount && countLabel(dinnerCount, 'dinner'), lunchCount && countLabel(lunchCount, 'lunch')]
          .filter(Boolean)
          .join(' · ');

  const dayState = (dayIndex) => ({
    isToday: isThisWeek && dayIndex === todayIndex,
    isPast: currentWeek < thisWeek || (isThisWeek && dayIndex < todayIndex),
  });

  const scrollToDay = (dayIndex) => {
    document.getElementById(`plan-day-${dayIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Desktop drag-and-drop: drop a meal on any day to move it there.
  const handleDrop = (toDay) => {
    if (dragged && dragged.fromDay !== toDay) {
      moveMeal(dragged.recipeId, currentWeek, dragged.fromDay, currentWeek, toDay);
    }
    setDragged(null);
    setDropDay(null);
  };

  return (
    <div className="planner-page page-with-nav">
      <div className="page-container planner-layout">
        {/* Desktop: sticky sidebar. Mobile: its children flow into the page. */}
        <aside className="planner-side">
          <header className="page-header planner-header">
            <h1 className="page-title">{relativeWeekLabel(currentWeek, thisWeek)}</h1>
            <p className="page-subtitle">
              {formatWeekRange(currentWeek)} · {summary}
            </p>
            <div className="week-nav">
              <button className="icon-btn" onClick={() => navigateWeek(-1)} aria-label="Previous week">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              {!isThisWeek && (
                <button className="btn btn-ghost btn-sm week-today-btn" onClick={() => setCurrentWeek(thisWeek)}>
                  This week
                </button>
              )}
              <button className="icon-btn" onClick={() => navigateWeek(1)} aria-label="Next week">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </header>

          <nav className="week-strip" aria-label="Jump to day">
            {weekDates.map((date, dayIndex) => {
              const { isToday, isPast } = dayState(dayIndex);
              const planned = days[dayIndex].lunch.length + days[dayIndex].dinner.length;
              return (
                <button
                  key={dayIndex}
                  className={`strip-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => scrollToDay(dayIndex)}
                  aria-label={`${DAYS_FULL[dayIndex]} ${date.getDate()}, ${countLabel(planned, 'meal')}${isToday ? ', today' : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                >
                  <span className="strip-dow">{DAYS_FULL[dayIndex].slice(0, 3)}</span>
                  <span className="strip-date">{date.getDate()}</span>
                  <span className="strip-dots" aria-hidden="true">
                    {Array.from({ length: Math.min(planned, 3) }, (_, i) => <i key={i} />)}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="planner-cta">
            <button className="btn btn-primary" onClick={() => navigate({ to: '/grocery' })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Build grocery list
            </button>
          </div>
        </aside>

        <div className="planner-days">
          {weekDates.map((date, dayIndex) => {
            const { isToday, isPast } = dayState(dayIndex);
            return (
              <section
                key={dayIndex}
                id={`plan-day-${dayIndex}`}
                className={`day-card ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${dropDay === dayIndex ? 'drop-target' : ''}`}
                aria-label={`${DAYS_FULL[dayIndex]}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                onDragOver={(e) => {
                  if (!dragged) return;
                  e.preventDefault();
                  setDropDay(dayIndex);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDropDay(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(dayIndex);
                }}
              >
                <div className="day-rail">
                  <span className="day-dow">{DAYS_FULL[dayIndex].slice(0, 3)}</span>
                  <span className="day-num">{date.getDate()}</span>
                  {isToday && <span className="today-badge">Today</span>}
                </div>

                <div className="day-slots">
                  {SLOTS.map((slot) => (
                    <MealSlot
                      key={slot.kind}
                      label={slot.label}
                      dayName={DAYS_FULL[dayIndex]}
                      meals={days[dayIndex][slot.kind]}
                      onAdd={() => setAdding({ dayIndex, kind: slot.kind })}
                      onRemove={(recipeId) => removeFromMealPlan(recipeId, currentWeek, dayIndex)}
                      onDragStart={(recipeId) => setDragged({ recipeId, fromDay: dayIndex })}
                      onDragEnd={() => {
                        setDragged(null);
                        setDropDay(null);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {adding && (
        <AddMealSheet
          kind={adding.kind}
          date={weekDates[adding.dayIndex]}
          plannedIds={weekPlan[adding.dayIndex] || []}
          onAdd={(recipeId) => {
            addToMealPlan(recipeId, currentWeek, adding.dayIndex);
            setAdding(null);
          }}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  );
}

// One lunch or dinner slot inside a day card.
function MealSlot({ label, dayName, meals, onAdd, onRemove, onDragStart, onDragEnd }) {
  return (
    <div className="meal-slot">
      <div className="slot-head">
        <span className="slot-label">{label}</span>
        <button className="slot-add" onClick={onAdd} aria-label={`Add ${label.toLowerCase()} on ${dayName}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add
        </button>
      </div>

      {meals.length > 0 && (
        <ul className="slot-meals">
          {meals.map((meal, i) => (
            <li
              key={`${meal.id}-${i}`}
              className="meal-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', meal.id);
                onDragStart(meal.id);
              }}
              onDragEnd={onDragEnd}
            >
              <Link to="/recipe/$recipeId" params={{ recipeId: meal.id }} className="meal-link">
                <img src={meal.image} alt="" className="meal-thumb" loading="lazy" />
                <span className="meal-text">
                  <span className="meal-title">{meal.title}</span>
                  <span className="meal-meta">{totalMinutes(meal)} min</span>
                </span>
              </Link>
              <button className="meal-remove" onClick={() => onRemove(meal.id)} aria-label={`Remove ${meal.title}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Picker for adding a lunch or dinner to a day. Starts on favorites of that
// kind when there are any, otherwise the full collection; search narrows both.
function AddMealSheet({ kind, date, plannedIds, onAdd, onClose }) {
  const likedRecipes = useAppStore((s) => s.likedRecipes);
  const slot = SLOTS.find((s) => s.kind === kind);

  // Liked entries are saved snapshots, so re-resolve them to current data.
  const favorites = useMemo(
    () => likedRecipes.map((r) => findRecipe(r.id)).filter((r) => r && getMealKind(r.id) === kind),
    [likedRecipes, kind],
  );
  const [tab, setTab] = useState(favorites.length > 0 ? 'favorites' : 'all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const source = tab === 'favorites' ? favorites : RECIPES_BY_KIND[kind];
  const results = q ? source.filter((r) => r.title.toLowerCase().includes(q)) : source;

  // Close on Escape and keep the page behind from scrolling.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="modal-overlay planner-sheet-overlay" onClick={onClose}>
      <div
        className="modal planner-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Add ${slot.label.toLowerCase()} to ${dayLabel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Add {slot.label.toLowerCase()}</h2>
            <p className="sheet-day">{dayLabel}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sheet-tools">
          <div className="sheet-tabs" role="tablist" aria-label="Recipe source">
            {[
              { id: 'favorites', label: `Favorites (${favorites.length})` },
              { id: 'all', label: slot.allLabel },
            ].map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`sheet-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="sheet-search"
            placeholder={`Search ${slot.allLabel.toLowerCase()}…`}
            aria-label="Search recipes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="modal-content">
          {results.length === 0 ? (
            <div className="sheet-empty">
              {q ? (
                <p>No {slot.label.toLowerCase()}s match “{query.trim()}”.</p>
              ) : (
                <>
                  <p>No favorite {slot.label.toLowerCase()}s yet.</p>
                  <button className="btn btn-secondary btn-sm" onClick={() => setTab('all')}>
                    Browse {slot.allLabel.toLowerCase()}
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="pick-list">
              {results.map((recipe) => {
                const added = plannedIds.includes(recipe.id);
                return (
                  <li key={recipe.id}>
                    <button className="pick-item" onClick={() => onAdd(recipe.id)} disabled={added}>
                      <img src={recipe.image} alt="" className="pick-thumb" loading="lazy" />
                      <span className="pick-text">
                        <span className="pick-title">{recipe.title}</span>
                        <span className="pick-meta">
                          {totalMinutes(recipe)} min
                          {recipe.sourceName && ` · ${recipe.sourceName}`}
                        </span>
                      </span>
                      {added && <span className="pick-added">Added</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
