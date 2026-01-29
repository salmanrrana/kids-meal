import { Link, useLocation } from '@tanstack/react-router';
import './Navigation.css';

export function Navigation() {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/',
      label: 'Discover',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      path: '/liked',
      label: 'Favorites',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )
    },
    {
      path: '/planner',
      label: 'Plan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14l2 2 4-4"></path>
        </svg>
      )
    },
    {
      path: '/grocery',
      label: 'Grocery',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop navigation - Top nav */}
      <nav className="nav-desktop" aria-label="Main navigation">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/" className="nav-logo-link">
              <span className="nav-logo-text">Kids Meal</span>
            </Link>
          </div>
          <div className="nav-links">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className="nav-link-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile navigation - Bottom nav */}
      <nav className="nav-mobile" aria-label="Mobile navigation">
        <div className="nav-mobile-items">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-mobile-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="nav-mobile-icon">{item.icon}</span>
              <span className="nav-mobile-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
