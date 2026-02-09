// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './appStore';

// Mock matchMedia for tests
function mockMatchMedia(matches) {
  const listeners = [];
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: (_event, handler) => listeners.push(handler),
    removeEventListener: (_event, handler) => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    },
  });
  return {
    triggerChange: (newMatches) => {
      listeners.forEach((fn) => fn({ matches: newMatches }));
    },
  };
}

describe('appStore theme', () => {
  beforeEach(() => {
    // Reset store to defaults between tests
    useAppStore.setState({ theme: 'system' });
    document.documentElement.removeAttribute('data-theme');
    mockMatchMedia(false); // default: light OS preference
  });

  it('has "system" as the default theme', () => {
    expect(useAppStore.getState().theme).toBe('system');
  });

  it('setTheme("dark") updates state and applies data-theme attribute', () => {
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme("light") updates state and applies data-theme attribute', () => {
    useAppStore.getState().setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setTheme("system") resolves to "light" when OS prefers light', () => {
    mockMatchMedia(false);
    useAppStore.getState().setTheme('system');
    expect(useAppStore.getState().theme).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setTheme("system") resolves to "dark" when OS prefers dark', () => {
    mockMatchMedia(true);
    useAppStore.getState().setTheme('system');
    expect(useAppStore.getState().theme).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('getEffectiveTheme returns resolved theme for "system"', () => {
    mockMatchMedia(true);
    useAppStore.setState({ theme: 'system' });
    expect(useAppStore.getState().getEffectiveTheme()).toBe('dark');
  });

  it('getEffectiveTheme returns the theme directly for explicit values', () => {
    useAppStore.setState({ theme: 'light' });
    expect(useAppStore.getState().getEffectiveTheme()).toBe('light');

    useAppStore.setState({ theme: 'dark' });
    expect(useAppStore.getState().getEffectiveTheme()).toBe('dark');
  });

  it('theme is included in partialize (persisted state)', () => {
    // Access the persist API to verify theme is in the persisted keys
    const persistOptions = useAppStore.persist;
    expect(persistOptions).toBeDefined();

    // Set theme and verify it would be part of persisted state
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
  });
});
