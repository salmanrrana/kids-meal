import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { findRecipe, getPlannedMeal, useAppStore } from '../store/appStore';
import { formatWeekRange } from '../lib/week';
import { Icon } from '../components/Icon';
import { Toast, useToast } from '../components/Toast';
import './GroceryPage.css';

/** @typedef {import('../store/appStore').Recipe} Recipe */

// Store aisles in the order the list shows them. An ingredient goes to the
// aisle with its longest matching keyword (see aisleOf); no match is Other.
// prettier-ignore
const AISLES = [
  {
    label: 'Produce',
    keywords: [
      'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower',
      'carrot', 'celery', 'onion', 'garlic', 'ginger', 'potato', 'sweet potato',
      'tomato', 'bell pepper', 'green pepper', 'red pepper', 'yellow pepper', 'jalapeño', 'cucumber', 'zucchini', 'squash',
      'mushroom', 'corn', 'peas', 'green bean', 'asparagus', 'avocado', 'lemon', 'lime',
      'orange', 'apple', 'banana', 'berry', 'strawberry', 'blueberry', 'grape', 'mango',
      'pineapple', 'melon', 'watermelon', 'peach', 'pear', 'cilantro', 'parsley',
      'basil', 'mint', 'dill', 'chives', 'scallion', 'green onion', 'shallot', 'leek',
      'radish', 'beet', 'turnip', 'eggplant', 'artichoke', 'brussels sprout',
      'bok choy', 'fennel', 'jicama', 'plantain', 'snap pea', 'snow pea',
      'berries', 'kiwi', 'clementine'
    ]
  },
  {
    label: 'Meat & Protein',
    keywords: [
      'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'sausage', 'ham',
      'steak', 'ground beef', 'ground turkey', 'ground pork', 'ground chicken',
      'breast', 'thigh', 'drumstick', 'wing', 'tenderloin', 'roast', 'ribs',
      'chop', 'loin', 'brisket', 'shrimp', 'salmon', 'tuna', 'cod', 'tilapia',
      'fish', 'crab', 'lobster', 'scallop', 'clam', 'mussel', 'anchovy',
      'prosciutto', 'pancetta', 'chorizo', 'pepperoni', 'salami', 'deli meat',
      'hot dog', 'meatball', 'egg', 'eggs', 'tofu', 'tempeh', 'seitan'
    ]
  },
  {
    label: 'Dairy',
    keywords: [
      'milk', 'cream', 'half and half', 'butter', 'cheese', 'cheddar', 'mozzarella',
      'parmesan', 'feta', 'goat cheese', 'cream cheese', 'ricotta', 'cottage cheese',
      'sour cream', 'yogurt', 'greek yogurt', 'vanilla yogurt', 'whipped cream', 'heavy cream',
      'buttermilk', 'evaporated milk', 'condensed milk', 'ghee', 'brie', 'gouda',
      'swiss', 'provolone', 'jack cheese', 'colby', 'american cheese', 'queso'
    ]
  },
  {
    label: 'Pantry',
    keywords: [
      'rice', 'pasta', 'noodle', 'bread', 'flour', 'sugar', 'oil', 'olive oil',
      'vegetable oil', 'coconut oil', 'sesame oil', 'vinegar', 'soy sauce',
      'fish sauce', 'worcestershire', 'hot sauce', 'sriracha', 'ketchup', 'mustard',
      'mayonnaise', 'mayo', 'honey', 'maple syrup', 'molasses', 'broth', 'stock',
      'bouillon', 'tomato paste', 'tomato sauce', 'marinara', 'salsa', 'beans',
      'lentils', 'chickpeas', 'black beans', 'kidney beans', 'pinto beans',
      'canned', 'diced tomatoes', 'crushed tomatoes', 'coconut milk', 'almond milk',
      'oat milk', 'peanut butter', 'almond butter', 'jam', 'jelly', 'breadcrumb',
      'panko', 'crouton', 'tortilla', 'wrap', 'pita', 'naan', 'cracker', 'chip',
      'cereal', 'oat', 'oatmeal', 'granola', 'quinoa', 'couscous', 'barley',
      'cornmeal', 'polenta', 'grits', 'baking soda', 'baking powder', 'yeast',
      'cornstarch', 'arrowroot', 'tapioca', 'gelatin', 'cocoa', 'chocolate',
      'vanilla', 'extract', 'almond', 'walnut', 'pecan', 'cashew', 'peanut',
      'pistachio', 'macadamia', 'hazelnut', 'pine nut', 'seed', 'sunflower',
      'pumpkin seed', 'sesame seed', 'chia', 'flax', 'raisin', 'cranberry',
      'date', 'fig', 'apricot', 'prune', 'coconut flake', 'shredded coconut',
      'dressing', 'pickle', 'olive', 'dough', 'rolls'
    ]
  },
  {
    label: 'Spices & Seasonings',
    keywords: [
      'salt', 'pepper', 'black pepper', 'white pepper', 'cayenne', 'paprika',
      'smoked paprika', 'chili powder', 'cumin', 'coriander', 'turmeric',
      'curry', 'garam masala', 'cinnamon', 'nutmeg', 'allspice', 'clove',
      'cardamom', 'ginger powder', 'garlic powder', 'onion powder', 'oregano',
      'thyme', 'rosemary', 'sage', 'bay leaf', 'bay leaves', 'marjoram',
      'tarragon', 'dill weed', 'chive', 'italian seasoning', 'herbs de provence',
      'old bay', 'cajun', 'creole', 'taco seasoning', 'ranch seasoning',
      'everything bagel', 'sesame', 'poppy seed', 'mustard seed', 'celery seed',
      'fennel seed', 'caraway', 'anise', 'star anise', 'saffron', 'sumac',
      'za\'atar', 'chinese five spice', 'red pepper flake', 'crushed red pepper',
      'herbs', 'seasoning'
    ]
  },
  {
    label: 'Frozen',
    keywords: [
      'frozen', 'ice cream', 'popsicle', 'frozen fruit', 'frozen vegetable',
      'frozen pizza', 'frozen dinner', 'frozen waffle', 'frozen yogurt'
    ]
  },
  { label: 'Other', keywords: [] },
];

const COPIED = 'Copied to clipboard';
const COPY_FAILED = "Couldn't copy the list";

/**
 * Aisle label for one ingredient line. The longest (most specific) keyword
 * wins, so "onion powder" lands in spices rather than produce via "onion".
 *
 * @param {string} ingredient
 */
function aisleOf(ingredient) {
  const lower = ingredient.toLowerCase();
  let best = { label: 'Other', length: 0 };

  for (const { label, keywords } of AISLES) {
    for (const keyword of keywords) {
      if (keyword.length > best.length && lower.includes(keyword)) {
        best = { label, length: keyword.length };
      }
    }
  }

  return best.label;
}

/**
 * The week's planned recipes, Sunday to Saturday, each listed once.
 *
 * @param {import('../store/appStore').WeekPlan} weekPlan
 */
function plannedMeals(weekPlan) {
  /** @type {Map<string, Recipe>} */
  const meals = new Map();
  for (let day = 0; day < 7; day++) {
    for (const entry of weekPlan[day] ?? []) {
      const recipe = findRecipe(getPlannedMeal(entry).recipeId);
      if (recipe) meals.set(recipe.id, recipe);
    }
  }
  return [...meals.values()];
}

/**
 * Every distinct ingredient of the meals (ignoring case), alphabetical and
 * grouped by aisle. Aisles with nothing in them are left out.
 *
 * @param {Recipe[]} meals
 */
function groceryAisles(meals) {
  /** @type {Map<string, string>} */
  const unique = new Map();
  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const key = ingredient.toLowerCase().trim();
      if (!unique.has(key)) unique.set(key, ingredient);
    }
  }
  const sorted = [...unique.values()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  /** @type {Map<string, string[]>} */
  const byAisle = new Map(AISLES.map(({ label }) => [label, []]));
  for (const item of sorted) byAisle.get(aisleOf(item))?.push(item);
  return [...byAisle]
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

/**
 * Copies text to the clipboard and says whether it worked. The Clipboard API
 * needs https, so a phone on the plain-http dev server falls back to copying
 * from a hidden textarea. That takes focus, so focus goes back to whatever
 * had it.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const focused = document.activeElement;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // focusing it mustn't scroll the page
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (focused instanceof HTMLElement) focused.focus();
    return copied;
  }
}

/**
 * Grocery list (/grocery) for the week the planner is on: the meals being
 * cooked, then every ingredient by aisle. Items are plain checkboxes, so
 * ticking one off lasts until the page is left or reloaded.
 */
export function GroceryPage() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const weekPlan = useAppStore((state) => state.mealPlans[state.currentWeek]);
  const meals = useMemo(() => plannedMeals(weekPlan ?? {}), [weekPlan]);
  const aisles = useMemo(() => groceryAisles(meals), [meals]);
  const { toast, show } = useToast();

  const weekRange = formatWeekRange(currentWeek);
  const itemCount = aisles.reduce((sum, { items }) => sum + items.length, 0);
  // The button reads "Copied" while the confirmation toast is up.
  const copied = toast?.text === COPIED;

  const copyList = async () => {
    const aisleText = aisles.map(({ label, items }) =>
      [label.toUpperCase(), ...items.map((item) => `- ${item}`)].join('\n'),
    );
    const ok = await copyText(
      [`Grocery list for ${weekRange}`, ...aisleText].join('\n\n'),
    );
    show(ok ? COPIED : COPY_FAILED);
  };

  return (
    <div className="page grocery">
      <header className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Grocery list</h1>
          <p className="page-subtitle">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} for ${weekRange}`
              : weekRange}
          </p>
        </div>
        {itemCount > 0 && (
          <div className="page-actions">
            <button
              type="button"
              className="btn btn-outline grocery-copy"
              onClick={copyList}
            >
              <Icon name={copied ? 'check' : 'copy'} />
              {copied ? 'Copied' : 'Copy list'}
            </button>
          </div>
        )}
      </header>

      {itemCount > 0 ? (
        <>
          <section className="grocery-meals">
            <h2 className="label">Planned meals</h2>
            <ul className="grocery-meal-list">
              {meals.map((meal) => (
                <li key={meal.id}>
                  <Link to="/recipe/$recipeId" params={{ recipeId: meal.id }}>
                    {meal.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="grocery-aisles">
            {aisles.map(({ label, items }) => (
              <section key={label} className="grocery-aisle">
                <div className="section-header">
                  <h2 className="section-title">{label}</h2>
                  <span className="section-count">{items.length}</span>
                </div>
                <ul>
                  {items.map((item) => (
                    <li key={item} className="grocery-item">
                      <label className="checkbox">
                        <input type="checkbox" />
                        <span>{item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>Nothing to shop for yet</h2>
          <p>
            Plan a few meals for the week and the shopping list builds itself.
          </p>
          <Link to="/planner" className="btn btn-primary">
            Plan the week
          </Link>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
