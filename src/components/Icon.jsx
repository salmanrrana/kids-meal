// Line icons on a 24px grid, 1.75 stroke, drawn in the current text color.
// `filled` is the "on" look for icons that have one (saved heart, active nav).
// Size comes from the surrounding CSS (.icon-btn 22px, .btn 18px, .search-field 20px);
// 22px is the fallback.
const ICONS =
  /** @satisfies {Record<string, (filled: boolean) => import('react').ReactNode>} */ ({
    heart: (filled) => (
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
    close: () => <path d="M18 6 6 18M6 6l12 12" />,
    'chevron-left': () => <path d="m15 18-6-6 6-6" />,
    'chevron-right': () => <path d="m9 18 6-6-6-6" />,
    'arrow-left': () => <path d="M19 12H5M12 19l-7-7 7-7" />,
    plus: () => <path d="M12 5v14M5 12h14" />,
    check: () => <path d="M20 6 9 17l-5-5" />,
    search: () => (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shuffle: () => (
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    ),
    copy: () => (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    bag: () => (
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    ),
    compass: (filled) => (
      <>
        <circle cx="12" cy="12" r="10" />
        <path
          d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"
          fill={filled ? 'currentColor' : 'none'}
        />
      </>
    ),
    calendar: () => (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18M8 15l2.5 2.5L16 12" />
      </>
    ),
    lunchbox: (filled) => (
      <>
        <rect
          x="3"
          y="8"
          width="18"
          height="13"
          rx="2"
          fill={filled ? 'currentColor' : 'none'}
        />
        <path d="M3 12h18" stroke={filled ? 'var(--paper)' : 'currentColor'} />
        <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </>
    ),
  });

/** @typedef {keyof typeof ICONS} IconName */

/**
 * Decorative icon; the button or link around it carries the label.
 *
 *   <button className="icon-btn" aria-label="Close"><Icon name="close" /></button>
 *
 * @param {{ name: IconName, filled?: boolean }} props
 */
export function Icon({ name, filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name](filled)}
    </svg>
  );
}
