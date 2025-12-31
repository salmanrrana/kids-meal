# Kids Meal Planner - Product Specification

## Overview

A Tinder-style meal discovery and weekly planning app for busy families. Swipe through easy, wholesome recipes that kids will actually eat AND parents will genuinely enjoy. Save favorites, plan your week with a kanban board, and generate aggregated grocery lists. Built with future multi-user (couple) support in mind.

**Key Insight:** These are not "kid meals" - they're **family meals**. Real food with real flavor that happens to be quick, healthy, and appealing to picky eaters.

---

## Core User Flow

1. **Discover** - Swipe through random recipes (right = like, left = pass)
2. **Save** - Liked recipes go to your collection
3. **Plan** - Drag liked recipes into weekly kanban columns
4. **Shop** - Generate categorized grocery list for the week's meals
5. **Cook** - View recipe details with tabbed interface

---

## Technical Stack

### Frontend
- **Framework**: TanStack Start (or TanStack Router)
- **Swipe Gestures**: react-spring + @use-gesture
- **Styling**: CSS (warm/homey aesthetic - earthy tones, cozy feel)
- **Responsive**: Mobile and desktop equal priority

### Backend & Database
- **Database**: Supabase (PostgreSQL, free tier - 500MB)
- **Hosting**: Netlify
- **Auth (Future)**: Clerk with Google OAuth
  - Currently: No auth, single user
  - Future: Couple accounts with shared meal lists

### Recipe Data Pipeline
- **Sources to Scrape**:
  - Budget Bytes (budget-friendly, clear instructions)
  - AllRecipes / Food Network (variety, user ratings)
  - Minimalist Baker (whole foods focus)
  - Cookie & Kate (simple ingredients)
- **AI-Generated Option**: Include 20 AI-generated sample recipes for review (see Appendix A)
- **Attribution**: Store original URL, display source credit on recipe detail page
- **Target**: 500+ recipes minimum

---

## Recipe Criteria

All recipes must meet these requirements:

| Criteria | Requirement |
|----------|-------------|
| Prep + Cook Time | 30 minutes or less total |
| Ingredients | Minimal shopping list (aim for 8 or fewer) |
| Techniques | No advanced skills (no sous vide, tempering, knife expertise) |
| Spice Level | Mild only - no spicy foods |
| Food Type | Whole foods focus with optional bread/rice sides |
| Age Range | Suitable for mixed ages (toddler through school-age) |
| **Adult Appeal** | **Must be delicious enough for parents to enjoy too - real food, not "kid food"** |

### Philosophy: Family Meals, Not Kid Food
The goal is NOT bland chicken nuggets and plain pasta. These should be **legitimate, flavorful meals** that happen to be:
- Quick and easy to make
- Made with whole, simple ingredients
- Not spicy (but can have depth of flavor via herbs, garlic, citrus, umami)
- Appealing textures and presentations

**Examples of what we want:**
- Honey garlic chicken with roasted broccoli and rice
- Homemade meatballs in marinara with crusty bread
- Teriyaki salmon with sesame vegetables
- Lemon herb roasted chicken thighs with potatoes

**Examples of what we DON'T want:**
- Plain boiled hot dogs
- Kraft mac and cheese from a box
- Frozen fish sticks and tater tots
- Anything that adults would find boring

---

## Features Specification

### 1. Swipe Discovery Screen

**Card Display:**
- Large food image (scraped with recipe)
- Recipe title
- Key tags: cuisine type, main protein, prep time

**Interactions:**
- Swipe right or drag right → Like (save to collection)
- Swipe left or drag left → Pass
- Tap card → Preview details
- Undo button → Restore last swiped card

**Behavior:**
- Random order (no filtering/categories)
- When all recipes seen → Loop back to beginning
- Spring physics animations via react-spring

### 2. Liked Recipes Collection

**Display:**
- Grid or list of saved recipes
- Same card info: image, title, tags
- Quick-add to weekly plan button

**Actions:**
- Tap → View full recipe details
- Remove from likes
- Add to specific week/day

### 3. Weekly Meal Planner (Kanban)

**Layout:**
- 7 columns (Mon-Sun or configurable)
- Each column accepts multiple meal cards
- Drag and drop from liked recipes

**Flexibility:**
- User chooses how many meals per day
- Not restricted to breakfast/lunch/dinner categories
- Can plan multiple weeks ahead

### 4. Recipe Detail View

**Structure:** Tabbed interface

| Tab | Content |
|-----|---------|
| Overview | Image, title, description, source link, time, servings (fixed) |
| Ingredients | Bulleted ingredient list with quantities |
| Steps | Numbered cooking instructions |

**Source Attribution:**
- Display "Recipe from: [Source Name]"
- Link to original URL

### 5. Grocery List Generator

**Input:** All meals assigned to selected week

**Processing:**
- Aggregate ingredients across all selected meals
- Combine duplicate ingredients (e.g., "chicken" from 3 recipes)
- Group by food category

**Output Format (Copy to Clipboard):**
```
PRODUCE
- 2 lbs broccoli
- 1 bunch carrots
- 3 apples

MEAT & PROTEIN
- 2 lbs chicken breast
- 1 lb ground beef

DAIRY
- 1 gallon milk
- 8 oz shredded cheese

PANTRY
- 2 cups rice
- 1 can diced tomatoes

SPICES & SEASONINGS
- garlic powder
- paprika
```

---

## Database Schema (Supabase)

```sql
-- Recipes table (populated by scraper)
recipes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  source_name TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT,
  cuisine TEXT,
  protein_type TEXT,
  created_at TIMESTAMP
)

-- Recipe ingredients
ingredients (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  category TEXT -- produce, meat, dairy, pantry, spices
)

-- Recipe steps
steps (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  step_number INT,
  instruction TEXT
)

-- User liked recipes (future: add user_id for multi-user)
liked_recipes (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  liked_at TIMESTAMP
)

-- Weekly meal plans (future: add user_id)
meal_plans (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  week_start DATE,
  day_of_week INT, -- 0=Sunday, 1=Monday, etc.
  meal_slot INT -- allows multiple meals per day
)

-- Swipe history for loop tracking
swipe_history (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  action TEXT, -- 'liked' or 'passed'
  swiped_at TIMESTAMP
)
```

---

## UI/UX Design Guidelines

### Visual Style: Warm & Homey
- **Color Palette**: Earthy tones (warm browns, soft greens, cream backgrounds)
- **Typography**: Friendly, readable fonts (not sterile/corporate)
- **Feel**: Like a kitchen chalkboard or family recipe card
- **Imagery**: Food photos are the hero - let them pop

### Responsive Breakpoints
- Mobile: < 768px (single column, full-width cards)
- Tablet: 768-1024px (2-column where appropriate)
- Desktop: > 1024px (full kanban visible)

### Swipe Card Sizing
- Mobile: Near full-width, ~70% viewport height
- Desktop: Centered card, max-width ~400px

---

## Future Enhancements (Post-MVP)

### Multi-User / Couple Mode (Clerk Auth)
- Google OAuth sign-in
- Link accounts as a "household"
- Shared liked recipes: Either person likes = saved to shared list
- Shared weekly planner
- Separate swipe progress per user

### Additional Features to Consider
- Recipe search/filter by cuisine or protein
- Seasonal ingredient suggestions
- Budget estimation per week
- Nutritional info display
- "Cook mode" - step-by-step with large text and timers
- Integration with grocery delivery APIs
- Kid feedback tracking (did they actually eat it?)

---

## Appendix A: AI-Generated Recipe Samples

Below are 20 AI-generated recipe concepts for review. If approved, full recipes with detailed ingredients and steps will be generated.

### Quick Proteins
1. **Honey Garlic Chicken Bites** - Pan-fried chicken pieces in sweet garlic glaze
2. **Teriyaki Meatballs** - Baked beef meatballs with mild teriyaki sauce
3. **Lemon Butter Fish Sticks** - Baked white fish strips with lemon butter
4. **BBQ Pulled Chicken Sandwiches** - Slow cooker chicken with mild BBQ sauce
5. **Turkey Taco Meat** - Ground turkey with cumin and mild seasonings

### Pasta & Noodles
6. **Creamy Butter Noodles** - Egg noodles with butter parmesan sauce
7. **Hidden Veggie Mac & Cheese** - Classic mac with pureed butternut squash
8. **Chicken Alfredo Bake** - Pasta baked with chicken and white sauce
9. **Pesto Pasta with Peas** - Mild basil pesto with green peas
10. **One-Pot Cheeseburger Pasta** - Ground beef, pasta, cheese in one pot

### Rice & Grains
11. **Chicken Fried Rice** - Simple fried rice with scrambled egg and chicken
12. **Cheesy Rice & Broccoli** - Baked rice casserole with cheese sauce
13. **Mild Chicken Curry over Rice** - Coconut milk based, no heat
14. **Hawaiian Chicken Rice Bowls** - Pineapple, chicken, rice with mild sauce
15. **Burrito Bowls** - Rice, beans, cheese, mild seasoned meat

### Sheet Pan / One-Pan
16. **Sheet Pan Chicken & Potatoes** - Roasted chicken thighs with baby potatoes
17. **Baked Parmesan Chicken Tenders** - Breaded chicken strips, oven baked
18. **Roasted Veggie & Sausage** - Mild Italian sausage with roasted vegetables
19. **Sheet Pan Quesadillas** - Large tortillas baked flat with cheese and chicken
20. **Mini Meatloaf Cups** - Individual meatloaves in muffin tin

---

## Appendix B: Recipe Scraping Strategy

### Target Sites & Selectors (to be refined)

| Site | Recipe URL Pattern | Notes |
|------|-------------------|-------|
| Budget Bytes | budgetbytes.com/recipe/* | Well-structured, good images |
| AllRecipes | allrecipes.com/recipe/* | JSON-LD schema available |
| Minimalist Baker | minimalistbaker.com/* | Focus on simple recipes |

### Scraping Approach
1. Build list of target recipe URLs (manual curation + sitemap parsing)
2. Filter by criteria: time < 30 min, kid-friendly tags
3. Extract via JSON-LD structured data where available
4. Fall back to DOM parsing for sites without schema
5. Download and host images (or reference original URLs)
6. Store in Supabase with full attribution

### Legal Considerations
- Personal use / educational project
- Always link back to original source
- Do not republish full recipe text commercially
- Consider reaching out to bloggers for permission at scale

---

## Development Phases

### Phase 1: Foundation
- Set up TanStack Start project
- Configure Supabase database with schema
- Deploy skeleton to Netlify
- Implement basic routing (home, liked, planner, detail)

### Phase 2: Swipe Experience
- Build swipe card component with react-spring
- Connect to Supabase recipes table
- Implement like/pass logic with swipe history
- Add undo functionality

### Phase 3: Recipe Management
- Create liked recipes grid view
- Build recipe detail page with tabs
- Implement remove from likes

### Phase 4: Weekly Planner
- Build kanban board UI
- Drag and drop from likes to days
- Week navigation (previous/next week)
- Persist plans to database

### Phase 5: Grocery List
- Aggregate ingredients from week's meals
- Categorize by food type
- Format and copy to clipboard

### Phase 6: Recipe Data
- Build scraping scripts for target sites
- Populate database with 500+ recipes
- Generate/refine AI recipes if approved

### Phase 7: Polish
- Responsive design refinement
- Animation polish
- Error handling
- Loading states

### Phase 8 (Future): Multi-User
- Integrate Clerk authentication
- Add user_id to database tables
- Implement household linking
- Shared likes and plans

---

## Success Metrics

- [ ] 500+ recipes loaded and swipeable
- [ ] Swipe gestures feel smooth and responsive
- [ ] Weekly planning is intuitive (< 2 min to plan a week)
- [ ] Grocery list is accurate and well-categorized
- [ ] Works equally well on phone and desktop
- [ ] Page load < 3 seconds on average connection
