import { useAppStore } from '../store/appStore';
import './ThemeToggle.css';

const themes = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Auto',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

export function ThemeToggle({ compact = false }) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const activeIndex = themes.findIndex((t) => t.value === theme);

  return (
    <div
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''}`}
      role="radiogroup"
      aria-label="Theme preference"
    >
      <div
        className="theme-toggle__indicator"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {themes.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={theme === t.value}
          aria-label={`${t.label} theme`}
          className={`theme-toggle__btn ${theme === t.value ? 'theme-toggle__btn--active' : ''}`}
          onClick={() => setTheme(t.value)}
        >
          <span className="theme-toggle__icon">{t.icon}</span>
          {!compact && <span className="theme-toggle__label">{t.label}</span>}
        </button>
      ))}
    </div>
  );
}
