import './ThemeFilters.css';

const THEMES = [
  { id: 'all', name: 'All Recipes', description: 'Complete collection' },
  { id: 'quick', name: 'Quick & Easy', description: 'Under 30 minutes' },
  { id: 'family', name: 'Family Favorites', description: 'Kid-approved classics' },
  { id: 'healthy', name: 'Healthy & Light', description: 'Nutritious options' },
  { id: 'comfort', name: 'Comfort Classics', description: 'Warming traditions' },
  { id: 'one-pan', name: 'One-Pan Wonders', description: 'Easy cleanup' },
];

export function ThemeFilters({ activeTheme, onThemeChange }) {
  return (
    <nav className="theme-filters">
      <div className="theme-filters-container">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            className={`theme-filter ${activeTheme === theme.id ? 'active' : ''}`}
            onClick={() => onThemeChange(theme.id)}
          >
            <span className="theme-name">{theme.name}</span>
            {activeTheme === theme.id && (
              <span className="theme-description">{theme.description}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}