import './ThemeFilters.css';

const THEMES = [
  { id: 'all', name: 'All Recipes' },
  { id: 'quick', name: 'Quick & Easy' },
  { id: 'family', name: 'Family Favorites' },
  { id: 'healthy', name: 'Healthy & Light' },
  { id: 'comfort', name: 'Comfort Classics' },
  { id: 'one-pan', name: 'One-Pan Wonders' },
];

export function ThemeFilters({ activeTheme, onThemeChange }) {
  return (
    <nav className="theme-filters" aria-label="Recipe collections">
      <div className="theme-filters-container">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            className={`theme-filter ${activeTheme === theme.id ? 'active' : ''}`}
            aria-pressed={activeTheme === theme.id}
            onClick={() => onThemeChange(theme.id)}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
