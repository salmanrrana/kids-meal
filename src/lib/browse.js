// Browsing rules for the Discover (dinner) and Lunchbox pages: how recipes are
// grouped into shelves, which quick filters exist, and how search matches.

/**
 * @typedef {import('../store/appStore').Recipe} Recipe
 * @typedef {{ id: string, name: string }} Group
 * @typedef {{ id: string, label: string, test: (recipe: Recipe) => boolean }} QuickFilter
 * @typedef {{
 *   groups: Group[],
 *   groupOf: (recipe: Recipe) => string,
 *   quickFilters: QuickFilter[],
 * }} BrowseConfig
 */

const totalTime = (/** @type {Recipe} */ r) => r.prepTime + r.cookTime;

// Dinner groups by main protein. Each pattern is tried against the title first
// (earliest match wins, so "Chicken Bacon Alfredo" is chicken), then against
// the ingredient list, skipping broth so "chicken broth" doesn't make it chicken.
const PROTEINS = [
  {
    id: 'chicken',
    name: 'Chicken & turkey',
    pattern: /chicken|turkey|wings|pollo/,
  },
  {
    id: 'beef',
    name: 'Beef',
    pattern: /beef|steak|burger|meatball|sloppy jo|stroganoff|picadillo/,
  },
  {
    id: 'pork',
    name: 'Pork & sausage',
    pattern:
      /pork|ham\b|bacon|sausage|salchicha|pepperoni|carnitas|chorizo|salami/,
  },
  {
    id: 'seafood',
    name: 'Seafood',
    pattern: /salmon|shrimp|fish|tuna|\bcod\b|tilapia|halibut/,
  },
];

/** @param {Recipe} recipe */
function dinnerGroupOf(recipe) {
  const title = recipe.title.toLowerCase();
  let best = { id: '', index: Infinity };
  for (const { id, pattern } of PROTEINS) {
    const index = title.search(pattern);
    if (index !== -1 && index < best.index) best = { id, index };
  }
  if (best.id) return best.id;

  for (const line of recipe.ingredients) {
    const text = line.toLowerCase();
    if (/broth|stock|bouillon/.test(text)) continue;
    const match = PROTEINS.find(({ pattern }) => pattern.test(text));
    if (match) return match.id;
  }
  return 'meatless';
}

/** @type {BrowseConfig} */
export const DINNER_BROWSE = {
  groups: [
    ...PROTEINS.map(({ id, name }) => ({ id, name })),
    { id: 'meatless', name: 'Meatless' },
  ],
  groupOf: dinnerGroupOf,
  quickFilters: [
    {
      id: 'under-20',
      label: '20 min or less',
      test: (r) => totalTime(r) <= 20,
    },
    {
      id: 'under-30',
      label: '30 min or less',
      test: (r) => totalTime(r) <= 30,
    },
  ],
};

// Lunch groups by what goes in the box. First matching tag set wins; anything
// untagged lands in "Bites & bento" so every recipe has a shelf.
const LUNCH_KINDS = [
  {
    id: 'sandwiches',
    name: 'Sandwiches & wraps',
    tags: ['sandwich', 'wrap', 'pinwheel'],
  },
  { id: 'pasta', name: 'Pasta salads', tags: ['pasta'] },
  {
    id: 'bakes',
    name: 'Muffins & bakes',
    tags: ['muffin', 'bake', 'fritters'],
  },
  {
    id: 'bites',
    name: 'Bites & bento',
    tags: ['bento', 'finger-food', 'skewers', 'fun'],
  },
  { id: 'sweet', name: 'Sweet & fruity', tags: ['sweet', 'fruit', 'snack'] },
];

/** @type {BrowseConfig} */
export const LUNCH_BROWSE = {
  groups: LUNCH_KINDS.map(({ id, name }) => ({ id, name })),
  groupOf: (recipe) =>
    LUNCH_KINDS.find(({ tags }) => tags.some((t) => recipe.tags.includes(t)))
      ?.id ?? 'bites',
  quickFilters: [
    { id: 'no-cook', label: 'No cooking', test: (r) => r.cookTime === 0 },
    {
      id: 'make-ahead',
      label: 'Make ahead',
      test: (r) => r.tags.includes('make-ahead'),
    },
  ],
};

/** True when every word of the query is in the title, description, or ingredients. */
export function matchesSearch(/** @type {Recipe} */ recipe, query = '') {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [recipe.title, recipe.description, ...recipe.ingredients]
    .join(' ')
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/**
 * Applies the page's search, group, and quick filter. Missing filters match everything.
 * @template {Recipe} R
 * @param {R[]} recipes
 * @param {BrowseConfig} config
 * @param {{ q?: string, group?: string, quick?: string }} filters
 */
export function filterRecipes(recipes, config, { q, group, quick }) {
  const quickFilter = config.quickFilters.find((f) => f.id === quick);
  return recipes.filter(
    (recipe) =>
      (!group || config.groupOf(recipe) === group) &&
      (!quickFilter || quickFilter.test(recipe)) &&
      matchesSearch(recipe, q),
  );
}

/**
 * Builds a route `validateSearch` that keeps only known filter values from the
 * URL, so an old or mistyped link falls back to showing everything.
 * @param {BrowseConfig} config
 */
export function browseSearchValidator(config) {
  /** @param {Record<string, unknown>} search */
  return (search) => {
    const { q, group, quick } = search;
    return {
      q: typeof q === 'string' && q.trim() ? q : undefined,
      group: config.groups.find((g) => g.id === group)?.id,
      quick: config.quickFilters.find((f) => f.id === quick)?.id,
    };
  };
}
