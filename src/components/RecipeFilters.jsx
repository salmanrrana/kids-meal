import { useState, useMemo } from 'react';
import './RecipeFilters.css';

export function RecipeFilters({ recipes, selectedTags, onTagToggle, onClearFilters }) {
  const [showAllTags, setShowAllTags] = useState(false);

  // Get all unique tags from recipes
  const allTags = useMemo(() => {
    const tagSet = new Set();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [recipes]);

  // Featured tags that are most common/useful
  const featuredTags = [
    'quick', 'healthy', 'kid-favorite', 'one-pan', 'breakfast',
    'chicken', 'beef', 'comfort-food', 'meal-prep', 'vegetarian'
  ];

  const displayedTags = showAllTags ? allTags : featuredTags.filter(tag => allTags.includes(tag));
  const hasMoreTags = allTags.length > displayedTags.length;

  return (
    <div className="recipe-filters">
      <div className="filters-header">
        <div className="filters-info">
          <h3 className="filters-title">Filter by Tags</h3>
          {selectedTags.length > 0 && (
            <span className="filters-count">
              {selectedTags.length} selected
            </span>
          )}
        </div>
        {selectedTags.length > 0 && (
          <button
            className="clear-filters-btn"
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="tags-grid">
        {displayedTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          const count = recipes.filter(recipe => recipe.tags.includes(tag)).length;

          return (
            <button
              key={tag}
              className={`tag-filter ${isSelected ? 'selected' : ''}`}
              onClick={() => onTagToggle(tag)}
              aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag} filter (${count} recipes)`}
            >
              <span className="tag-name">
                {tag.replace('-', ' ')}
              </span>
              <span className="tag-count">({count})</span>
            </button>
          );
        })}
      </div>

      {hasMoreTags && (
        <button
          className="show-more-btn"
          onClick={() => setShowAllTags(!showAllTags)}
        >
          {showAllTags ? 'Show Less' : `Show ${allTags.length - displayedTags.length} More Tags`}
        </button>
      )}
    </div>
  );
}