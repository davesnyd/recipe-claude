import { Recipe } from '../types';

type SortKey = keyof Pick<Recipe, 'title' | 'creationDate' | 'createUsername' | 'category' | 'cuisine' | 'holiday' | 'course' | 'type'>;

/**
 * Sorts recipes by an ordered list of keys (most recent key = primary sort).
 * sortKeys[0] is the primary sort, sortKeys[1] is the tiebreaker, etc.
 */
export function sortRecipes(recipes: Recipe[], sortKeys: string[]): Recipe[] {
  if (sortKeys.length === 0) return recipes;

  return [...recipes].sort((a, b) => {
    for (const key of sortKeys) {
      const valA = String((a as any)[key] ?? '').toLowerCase();
      const valB = String((b as any)[key] ?? '').toLowerCase();
      if (valA < valB) return -1;
      if (valA > valB) return 1;
    }
    return 0;
  });
}

/**
 * Returns a new sort key list with the given key prepended (making it primary).
 * Removes the key from any previous position to avoid duplicates.
 */
export function applySort(sortKeys: string[], key: string): string[] {
  return [key, ...sortKeys.filter(k => k !== key)];
}
