import { useEffect, useRef } from 'react';
import './Tabs.css';

/**
 * @template {string} T
 * @typedef {{ id: T, label: string, count?: number }} TabOption
 */

/**
 * The one tab control: a row of text buttons with an accent underline under
 * the active one and a hairline under the row. Used for the browse group
 * filter, the add sheet's Favorites / All, and Lunch / Dinner. Each option is a
 * toggle button (aria-pressed) inside a labelled group. The row scrolls
 * sideways when it doesn't fit and keeps the active option in view.
 *
 *   <Tabs
 *     label="Meal"
 *     options={[{ id: 'lunch', label: 'Lunch' }, { id: 'dinner', label: 'Dinner' }]}
 *     activeId={kind}
 *     onChange={setKind}
 *   />
 *
 * The option ids set `T`; `onChange` doesn't widen it, so a useState setter
 * for those ids can be passed straight in.
 *
 * @template {string} T
 * @param {{
 *   options: TabOption<T>[],
 *   activeId: T,
 *   onChange: (id: NoInfer<T>) => void,
 *   label: string,
 *   className?: string,
 * }} props
 */
export function Tabs({ options, activeId, onChange, label, className = '' }) {
  const rowRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Scroll the row (not the page) so a newly active option isn't cut off.
  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector('[aria-pressed="true"]');
    if (!row || !(active instanceof HTMLElement)) return;
    const start = active.offsetLeft;
    const end = start + active.offsetWidth;
    if (start < row.scrollLeft || end > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = start - (row.clientWidth - active.offsetWidth) / 2;
    }
  }, [activeId]);

  return (
    <div
      ref={rowRef}
      className={`tabs-row ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="tabs-item"
          aria-pressed={option.id === activeId}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="tabs-count">{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
