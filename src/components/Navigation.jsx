import { Link, useNavigate } from '@tanstack/react-router';
import { Icon } from './Icon';
import './Navigation.css';

/** @type {{ to: string, label: string, icon: import('./Icon').IconName }[]} */
const NAV_ITEMS = [
  { to: '/', label: 'Discover', icon: 'compass' },
  { to: '/liked', label: 'Favorites', icon: 'heart' },
  { to: '/planner', label: 'Plan', icon: 'calendar' },
  { to: '/lunchbox', label: 'Lunchbox', icon: 'lunchbox' },
  { to: '/grocery', label: 'Grocery', icon: 'bag' },
];

/**
 * Primary navigation, rendered once by the root layout. Below 1024px it's a
 * fixed bottom tab bar (icon over label); from 1024px up it's a sticky top bar
 * with the wordmark on the left and text links on the right. The router marks
 * the current link with aria-current="page"; filters in the URL don't matter.
 */
export function Navigation() {
  const navigate = useNavigate();
  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-inner">
        {/* A plain link: the router's <Link> would mark it as the current page
            on Discover, next to the Discover link. */}
        <a
          href="/"
          className="nav-wordmark"
          onClick={(e) => {
            // Let modified clicks open a new tab or window as usual.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            navigate({ to: '/' });
          }}
        >
          Family Meal Planner
        </a>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              activeOptions={{ exact: item.to === '/', includeSearch: false }}
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} filled={isActive} />
                  <span className="nav-label" data-label={item.label}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
