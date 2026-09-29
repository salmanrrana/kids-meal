import './ThemeFilters.css';

// Row of group chips. Scrolls sideways on phones, wraps on wider screens.
// `options` is a list of { id, name, count? }; the active chip is picked by `activeId`.
export function ThemeFilters({ options, activeId, onChange, label }) {
  return (
    <nav className="theme-filters" aria-label={label}>
      <div className="theme-filters-container">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`theme-filter ${activeId === option.id ? 'active' : ''}`}
            aria-pressed={activeId === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.name}{' '}
            {option.count !== undefined && (
              <span className="theme-filter-count">{option.count}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
