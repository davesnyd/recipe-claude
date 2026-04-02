import { sortRecipes, applySort, applyDir } from './sortUtils';
import { Recipe } from '../types';

const makeRecipe = (overrides: Partial<Recipe>): Recipe => ({
  recipeId: 1,
  title: 'Recipe',
  servingCount: 2,
  isPublic: true,
  creationDate: '2024-01-01T00:00:00Z',
  createUsername: 'user@example.com',
  ingredients: [],
  steps: [],
  ...overrides,
});

const apple = makeRecipe({ recipeId: 1, title: 'Apple Pie', creationDate: '2024-01-01T00:00:00Z' });
const banana = makeRecipe({ recipeId: 2, title: 'Banana Bread', creationDate: '2024-02-01T00:00:00Z' });
const cherry = makeRecipe({ recipeId: 3, title: 'Cherry Tart', creationDate: '2024-03-01T00:00:00Z' });

describe('sortRecipes', () => {
  it('returns recipes unchanged when no sortKeys', () => {
    expect(sortRecipes([cherry, apple], [])).toEqual([cherry, apple]);
  });

  it('sorts ascending by default', () => {
    const result = sortRecipes([cherry, apple, banana], ['title']);
    expect(result.map(r => r.title)).toEqual(['Apple Pie', 'Banana Bread', 'Cherry Tart']);
  });

  it('sorts descending when dir is desc', () => {
    const result = sortRecipes([apple, cherry, banana], ['title'], { title: 'desc' });
    expect(result.map(r => r.title)).toEqual(['Cherry Tart', 'Banana Bread', 'Apple Pie']);
  });

  it('does not mutate the original array', () => {
    const input = [cherry, apple];
    sortRecipes(input, ['title']);
    expect(input[0]).toBe(cherry);
  });
});

describe('applySort', () => {
  it('prepends key to front', () => {
    expect(applySort([], 'title')).toEqual(['title']);
  });

  it('moves existing key to front', () => {
    expect(applySort(['creationDate', 'title'], 'title')).toEqual(['title', 'creationDate']);
  });
});

describe('applyDir', () => {
  it('sets new key to asc', () => {
    const dirs = applyDir({}, [], 'title');
    expect(dirs['title']).toBe('asc');
  });

  it('toggles primary key from asc to desc', () => {
    const dirs = applyDir({ title: 'asc' }, ['title'], 'title');
    expect(dirs['title']).toBe('desc');
  });

  it('toggles primary key from desc to asc', () => {
    const dirs = applyDir({ title: 'desc' }, ['title'], 'title');
    expect(dirs['title']).toBe('asc');
  });

  it('resets non-primary key to asc', () => {
    const dirs = applyDir({ title: 'desc', creationDate: 'desc' }, ['creationDate'], 'title');
    expect(dirs['title']).toBe('asc');
  });
});
