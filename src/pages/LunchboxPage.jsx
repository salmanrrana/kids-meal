import { RecipeBrowser } from '../components/RecipeBrowser';
import { LUNCH_BROWSE } from '../lib/browse';
import { lunchRecipes } from '../data/lunchRecipes';

export function LunchboxPage() {
  return (
    <RecipeBrowser
      title="Lunchbox ideas"
      intro="No-reheat lunches from real family food blogs, with photos, ingredients, and steps."
      recipes={lunchRecipes}
      config={LUNCH_BROWSE}
      searchPlaceholder="Search lunches or ingredients"
    />
  );
}
