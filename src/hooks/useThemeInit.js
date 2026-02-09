import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

/**
 * Initializes theme on app mount and listens for OS preference changes.
 * Call once in the root layout component.
 *
 * - Applies the persisted theme to <html> on mount
 * - When theme is 'system', reacts to OS dark/light changes in real-time
 */
export function useThemeInit() {
  const theme = useAppStore((state) => state.theme);

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    const effective =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    document.documentElement.setAttribute('data-theme', effective);
    // Keep browser chrome color in sync
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#171717' : '#FFFFFF');
  }, [theme]);

  // Listen for OS preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const effective = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', effective);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', effective === 'dark' ? '#171717' : '#FFFFFF');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);
}
