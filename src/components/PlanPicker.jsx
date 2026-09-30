import { useState } from 'react';
import { MEAL_KINDS, getMealKind, useAppStore } from '../store/appStore';
import {
  formatWeekRange,
  getWeekDates,
  getWeekStart,
  shiftWeek,
  toDateKey,
} from '../lib/week';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Tabs } from './Tabs';
import './PlanPicker.css';

// "Wed, Sep 30"
const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

/**
 * "Add to plan" sheet for one recipe, shared by the recipe page and Favorites.
 * Lunch / Dinner starts on the recipe's usual slot. It lists 7 days starting
 * today; ‹ › move a week at a time and can't go before today. Picking a day
 * saves the meal, reports a confirmation through `onAdded` (for the page's
 * toast), then closes.
 *
 *   {picking && (
 *     <PlanPicker recipe={picking} onClose={() => setPicking(null)} onAdded={show} />
 *   )}
 *
 * @param {{
 *   recipe: { id: string, title: string },
 *   onClose: () => void,
 *   onAdded: (message: string) => void,
 * }} props
 */
export function PlanPicker({ recipe, onClose, onAdded }) {
  const addToMealPlan = useAppStore((state) => state.addToMealPlan);
  const [kind, setKind] = useState(getMealKind(recipe.id));
  // Whole weeks after today's 7-day window; 0 is the first (and earliest) page.
  const [weekOffset, setWeekOffset] = useState(0);

  // The week.js helpers work from any start day, not only Sundays.
  const startKey = shiftWeek(toDateKey(new Date()), weekOffset);
  const days = getWeekDates(startKey);

  /** @param {Date} date */
  const pick = (date) => {
    addToMealPlan(recipe.id, getWeekStart(date), date.getDay(), kind);
    onAdded(`Added to ${kind} on ${DAY_FORMAT.format(date)}`);
    onClose();
  };

  return (
    <Sheet
      title="Add to plan"
      subline={recipe.title}
      onClose={onClose}
      tools={
        <Tabs
          label="Meal"
          options={MEAL_KINDS}
          activeId={kind}
          onChange={setKind}
        />
      }
    >
      <div className="plan-week">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous week"
          aria-disabled={weekOffset === 0}
          onClick={() => setWeekOffset((n) => Math.max(0, n - 1))}
        >
          <Icon name="chevron-left" />
        </button>
        <p className="plan-week-range" aria-live="polite">
          {formatWeekRange(startKey)}
        </p>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next week"
          onClick={() => setWeekOffset((n) => n + 1)}
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      <ul className="plan-days">
        {days.map((date, i) => {
          const daysFromToday = weekOffset * 7 + i;
          const dateLabel = DAY_FORMAT.format(date);
          const label =
            daysFromToday === 0
              ? 'Today'
              : daysFromToday === 1
                ? 'Tomorrow'
                : dateLabel;
          return (
            <li key={dateLabel}>
              <button
                type="button"
                className="plan-day"
                aria-current={daysFromToday === 0 ? 'date' : undefined}
                onClick={() => pick(date)}
              >
                <span className="plan-day-label">{label}</span>
                {label !== dateLabel && (
                  <span className="plan-day-date">{dateLabel}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
