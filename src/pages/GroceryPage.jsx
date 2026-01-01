import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { recipes } from '../data/recipes';
import './GroceryPage.css';

// Category definitions with keywords for matching
const CATEGORIES = {
  produce: {
    label: 'Produce',
    icon: '🥬',
    keywords: [
      'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower',
      'carrot', 'celery', 'onion', 'garlic', 'ginger', 'potato', 'sweet potato',
      'tomato', 'pepper', 'bell pepper', 'jalapeño', 'cucumber', 'zucchini', 'squash',
      'mushroom', 'corn', 'peas', 'green bean', 'asparagus', 'avocado', 'lemon', 'lime',
      'orange', 'apple', 'banana', 'berry', 'strawberry', 'blueberry', 'grape', 'mango',
      'pineapple', 'melon', 'watermelon', 'peach', 'pear', 'cilantro', 'parsley',
      'basil', 'mint', 'dill', 'chives', 'scallion', 'green onion', 'shallot', 'leek',
      'radish', 'beet', 'turnip', 'eggplant', 'artichoke', 'brussels sprout',
      'bok choy', 'fennel', 'jicama', 'plantain', 'snap pea', 'snow pea'
    ]
  },
  meat: {
    label: 'Meat & Protein',
    icon: '🥩',
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
  dairy: {
    label: 'Dairy',
    icon: '🧀',
    keywords: [
      'milk', 'cream', 'half and half', 'butter', 'cheese', 'cheddar', 'mozzarella',
      'parmesan', 'feta', 'goat cheese', 'cream cheese', 'ricotta', 'cottage cheese',
      'sour cream', 'yogurt', 'greek yogurt', 'whipped cream', 'heavy cream',
      'buttermilk', 'evaporated milk', 'condensed milk', 'ghee', 'brie', 'gouda',
      'swiss', 'provolone', 'jack cheese', 'colby', 'american cheese', 'queso'
    ]
  },
  pantry: {
    label: 'Pantry',
    icon: '🥫',
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
      'date', 'fig', 'apricot', 'prune', 'coconut flake', 'shredded coconut'
    ]
  },
  spices: {
    label: 'Spices & Seasonings',
    icon: '🧂',
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
      'za\'atar', 'chinese five spice', 'red pepper flake', 'crushed red pepper'
    ]
  },
  frozen: {
    label: 'Frozen',
    icon: '🧊',
    keywords: [
      'frozen', 'ice cream', 'popsicle', 'frozen fruit', 'frozen vegetable',
      'frozen pizza', 'frozen dinner', 'frozen waffle', 'frozen yogurt'
    ]
  }
};

// Categorize an ingredient based on keywords
function categorizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase();

  for (const [category, { keywords }] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return 'other';
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function GroceryPage() {
  const navigate = useNavigate();
  const { currentWeek, mealPlans } = useAppStore();
  const [copied, setCopied] = useState(false);

  // Get all meals for the current week
  const weekMeals = useMemo(() => {
    const weekPlan = mealPlans[currentWeek] || {};
    const meals = [];

    for (let day = 0; day < 7; day++) {
      const recipeIds = weekPlan[day] || [];
      recipeIds.forEach(id => {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) meals.push(recipe);
      });
    }

    return meals;
  }, [mealPlans, currentWeek]);

  // Aggregate and categorize ingredients
  const groceryList = useMemo(() => {
    const ingredientMap = new Map();

    weekMeals.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const normalized = ingredient.toLowerCase().trim();
        if (!ingredientMap.has(normalized)) {
          ingredientMap.set(normalized, {
            text: ingredient,
            category: categorizeIngredient(ingredient)
          });
        }
      });
    });

    // Group by category
    const grouped = {};
    for (const { text, category } of ingredientMap.values()) {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(text);
    }

    // Sort items within each category
    for (const category of Object.keys(grouped)) {
      grouped[category].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }

    // Define category order
    const categoryOrder = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other'];

    // Build final list with categories in order
    return categoryOrder
      .filter(cat => grouped[cat] && grouped[cat].length > 0)
      .map(cat => ({
        category: cat,
        label: CATEGORIES[cat]?.label || 'Other',
        icon: CATEGORIES[cat]?.icon || '📦',
        items: grouped[cat]
      }));
  }, [weekMeals]);

  // Total ingredient count
  const totalItems = groceryList.reduce((sum, cat) => sum + cat.items.length, 0);

  // Format for copying
  const formatForCopy = () => {
    let text = 'GROCERY LIST\n';
    text += '='.repeat(40) + '\n\n';

    groceryList.forEach(({ label, items }) => {
      text += `${label.toUpperCase()}\n`;
      items.forEach(item => {
        text += `  - ${item}\n`;
      });
      text += '\n';
    });

    return text.trim();
  };

  const handleCopy = async () => {
    const text = formatForCopy();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasItems = totalItems > 0;

  return (
    <div className="grocery-page page-with-nav">
      <header className="grocery-header">
        <button type="button" className="back-btn" onClick={() => window.history.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="header-info">
          <h1>Grocery List</h1>
          <span className="week-label">{formatWeekRange(currentWeek)}</span>
        </div>
        {hasItems && (
          <button type="button" className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </header>

      {!hasItems ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>No meals planned yet</h2>
          <p>Add some meals to your weekly plan to generate a grocery list.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate({ to: '/planner' })}>
            Go to Planner
          </button>
        </div>
      ) : (
        <>
          {/* Meal summary */}
          <div className="meal-summary">
            <h3>Meals This Week ({weekMeals.length})</h3>
            <div className="meal-chips">
              {weekMeals.map((meal, index) => (
                <span key={`${meal.id}-${index}`} className="meal-chip">
                  {meal.title}
                </span>
              ))}
            </div>
          </div>

          {/* Grocery list by category */}
          <div className="grocery-list">
            {groceryList.map(({ category, label, icon, items }) => (
              <div key={category} className="grocery-category">
                <h3 className="category-label">
                  <span className="category-icon">{icon}</span>
                  {label}
                  <span className="category-count">{items.length}</span>
                </h3>
                <ul className="ingredient-list">
                  {items.map((item, index) => (
                    <li key={index} className="ingredient-item">
                      <span className="ingredient-name">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Total count */}
          <div className="grocery-footer">
            <span className="total-count">{totalItems} items total</span>
          </div>
        </>
      )}

      {copied && <div className="toast">Copied to clipboard!</div>}
    </div>
  );
}
