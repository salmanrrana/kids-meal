// Week helpers. Dates are keyed by a local "YYYY-MM-DD" string. Planner weeks
// start on Sunday (getWeekStart); shiftWeek, getWeekDates, and formatWeekRange
// work from any start day (the plan picker's 7 days start today). Everything
// stays in local time — going through toISOString() or new Date('YYYY-MM-DD')
// (both UTC) shifts the date by a day in many timezones.

/**
 * Formats a Date as a local "YYYY-MM-DD" key.
 * @param {Date} date
 */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a "YYYY-MM-DD" key as local midnight.
 * @param {string} key
 */
export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Key of the Sunday that starts the week containing `date`.
 * @param {Date} [date]
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return toDateKey(d);
}

/**
 * Moves a date key forward/back by whole weeks.
 * @param {string} weekStart
 * @param {number} weeks
 */
export function shiftWeek(weekStart, weeks) {
  const d = fromDateKey(weekStart);
  d.setDate(d.getDate() + weeks * 7);
  return toDateKey(d);
}

/**
 * The 7 dates starting on a date key (Sun–Sat for a planner week).
 * @param {string} weekStart
 */
export function getWeekDates(weekStart) {
  const start = fromDateKey(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * "Sep 20 – Sep 26" style label for the 7 days starting on a date key.
 * @param {string} weekStart
 */
export function formatWeekRange(weekStart) {
  const [start, , , , , , end] = getWeekDates(weekStart);
  const fmt = (/** @type {Date} */ d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}
