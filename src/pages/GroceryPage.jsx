import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { mockRecipes } from '../data/mockRecipes';
import './GroceryPage.css';

// Ingredient category labels and order
const CATEGORY_CONFIG = {
  produce: { label: 'PRODUCE', order: 1 },
  meat: { label: 'MEAT & PROTEIN', order: 2 },
  dairy: { label: 'DAIRY', order: 3 },
  pantry: { label: 'PANTRY', order: 4 },
  spices: { label: 'SPICES & SEASONINGS', order: 5 },
};

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
        const recipe = mockRecipes.find(r => r.id === id);
        if (recipe) meals.push(recipe);
      });
    }

    return meals;
  }, [mealPlans, currentWeek]);

  // Aggregate ingredients by category
  const groceryList = useMemo(() => {
    const ingredientMap = {};

    weekMeals.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}-${ing.category}`;
        if (ingredientMap[key]) {
          // Combine quantities (simple concatenation for now)
          ingredientMap[key].count += 1;
          ingredientMap[key].quantities.push(`${ing.quantity} ${ing.unit}`);
        } else {
          ingredientMap[key] = {
            name: ing.name,
            category: ing.category || 'pantry',
            count: 1,
            quantities: [`${ing.quantity} ${ing.unit}`],
          };
        }
      });
    });

    // Group by category
    const grouped = {};
    Object.values(ingredientMap).forEach(ing => {
      const cat = ing.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ing);
    });

    // Sort categories and items
    return Object.entries(grouped)
      .sort(([a], [b]) => (CATEGORY_CONFIG[a]?.order || 99) - (CATEGORY_CONFIG[b]?.order || 99))
      .map(([category, items]) => ({
        category,
        label: CATEGORY_CONFIG[category]?.label || category.toUpperCase(),
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [weekMeals]);

  // Format for copying
  const formatForCopy = () => {
    let text = '';

    groceryList.forEach(group => {
      text += `${group.label}\n`;
      group.items.forEach(item => {
        const qty = item.count > 1
          ? item.quantities.join(' + ')
          : item.quantities[0];
        text += `- ${qty} ${item.name}\n`;
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
      // Fallback for older browsers
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

  const hasItems = groceryList.length > 0;

  return (
    <div className="grocery-page page-with-nav">
      <header className="grocery-header">
        <button className="back-btn" onClick={() => navigate({ to: '/planner' })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="header-info">
          <h1>Grocery List</h1>
          <span className="week-label">{formatWeekRange(currentWeek)}</span>
        </div>
        {hasItems && (
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
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
          <button className="btn btn-primary" onClick={() => navigate({ to: '/planner' })}>
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
            {groceryList.map(group => (
              <div key={group.category} className="grocery-category">
                <h3 className="category-label">{group.label}</h3>
                <ul className="ingredient-list">
                  {group.items.map((item, index) => (
                    <li key={index} className="ingredient-item">
                      <span className="ingredient-qty">
                        {item.count > 1
                          ? item.quantities.join(' + ')
                          : item.quantities[0]}
                      </span>
                      <span className="ingredient-name">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {copied && <div className="toast">Copied to clipboard!</div>}
    </div>
  );
}
