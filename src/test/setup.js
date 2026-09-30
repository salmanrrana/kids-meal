// Fills gaps in the fake browser (jsdom) that the tests run in.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no media queries. Answer "no" to all of them, so pages render
// their phone layout (the planner's list of days, not the desktop grid).
window.matchMedia = (media) => ({
  media,
  matches: false,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
});

// The router restores scroll on every navigation; jsdom can't scroll.
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
