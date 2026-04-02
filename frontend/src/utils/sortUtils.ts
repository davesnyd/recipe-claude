import { Recipe } from '../types';

type SortKey = keyof Pick<Recipe, 'title' | 'creationDate' | 'createUsername' | 'category' | 'cuisine' | 'holiday' | 'course' | 'type'>;

/**
 * Sorts recipes by an ordered list of keys (sortKeys[0] = primary).
 * sortDirs maps each key to 'asc' | 'desc'; defaults to 'asc'.
 */
export function sortRecipes(
  recipes: Recipe[],
  sortKeys: string[],
  sortDirs: Record<string, 'asc' | 'desc'> = {}
): Recipe[] {
  if (sortKeys.length === 0) return recipes;

  return [...recipes].sort((a, b) => {
    for (const key of sortKeys) {
      const valA = String((a as any)[key] ?? '').toLowerCase();
      const valB = String((b as any)[key] ?? '').toLowerCase();
      if (valA < valB) return sortDirs[key] === 'desc' ? 1 : -1;
      if (valA > valB) return sortDirs[key] === 'desc' ? -1 : 1;
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

/**
 * Returns updated sortDirs after clicking a column header.
 * If key is already the primary sort, toggles its direction.
 * Otherwise resets it to 'asc'.
 */
export function applyDir(
  sortDirs: Record<string, 'asc' | 'desc'>,
  sortKeys: string[],
  key: string
): Record<string, 'asc' | 'desc'> {
  if (sortKeys[0] === key) {
    return { ...sortDirs, [key]: sortDirs[key] === 'desc' ? 'asc' : 'desc' };
  }
  return { ...sortDirs, [key]: 'asc' };
}
