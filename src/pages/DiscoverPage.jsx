import { useAppStore } from '../store/appStore';
import { RecipeBrowser } from '../components/RecipeBrowser';
import { DINNER_BROWSE } from '../lib/browse';

export function DiscoverPage() {
  const recipes = useAppStore((state) => state.recipes);
  return (
    <RecipeBrowser
      title="Tonight's table"
      intro="Easy family dinners from real food blogs, most ready in about 30 minutes."
      recipes={recipes}
      config={DINNER_BROWSE}
      searchPlaceholder="Search dinners or ingredients"
    />
  );
}
