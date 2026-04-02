import { Recipe, RecipeSearchRequest, Ingredient, NutritionInfo, User, Measurement } from '../types';

// Test type definitions and data structures used by the API
describe('API Types and Data Structures', () => {
  describe('Recipe type', () => {
    it('should create a complete Recipe object', () => {
      const recipe: Recipe = {
        recipeId: 1,
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake',
        servingCount: 8,
        isPublic: true,
        creationDate: '2024-01-01T12:00:00Z',
        createUsername: 'chef@example.com',
        photoUrl: '/photos/cake.jpg',
        note: 'Best served warm',
        ingredients: [
          {
            recipeIngredientId: 1,
            ingredientName: 'flour',
            quantity: 2,
            measurementName: 'cup',
            preparation: 'sifted',
            ingredientOrder: 1,
          }
        ],
        steps: [
          {
            stepId: 1,
            stepNumber: 1,
            stepText: 'Preheat oven to 350°F',
          }
        ],
      };

      expect(recipe.recipeId).toBe(1);
      expect(recipe.title).toBe('Chocolate Cake');
      expect(recipe.isPublic).toBe(true);
      expect(recipe.ingredients).toHaveLength(1);
      expect(recipe.steps).toHaveLength(1);
    });

    it('should create a minimal Recipe object', () => {
      const recipe: Recipe = {
        recipeId: 2,
        title: 'Simple Recipe',
        servingCount: 4,
        isPublic: false,
        creationDate: '2024-01-01',
        createUsername: 'user@example.com',
        ingredients: [],
        steps: [],
      };

      expect(recipe.recipeId).toBe(2);
      expect(recipe.description).toBeUndefined();
      expect(recipe.photoUrl).toBeUndefined();
    });
  });

  describe('RecipeSearchRequest type', () => {
    it('should create a search request with title filter', () => {
      const request: RecipeSearchRequest = {
        title: 'cake',
      };
      expect(request.title).toBe('cake');
      expect(request.description).toBeUndefined();
    });

    it('should create a search request with multiple filters', () => {
      const request: RecipeSearchRequest = {
        title: 'chocolate',
        description: 'dessert',
        isPublic: true,
        createUsername: 'chef@example.com',
        ingredient: 'flour',
      };
      expect(request.title).toBe('chocolate');
      expect(request.isPublic).toBe(true);
    });

    it('should create a date range search', () => {
      const request: RecipeSearchRequest = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      expect(request.startDate).toBe('2024-01-01');
      expect(request.endDate).toBe('2024-12-31');
    });

    it('should create an empty search request', () => {
      const request: RecipeSearchRequest = {};
      expect(request.title).toBeUndefined();
      expect(request.isPublic).toBeUndefined();
    });
  });

  describe('Ingredient type', () => {
    it('should create a complete Ingredient', () => {
      const ingredient: Ingredient = {
        ingredientId: 1,
        name: 'all-purpose flour',
        density: 0.53,
        calories: 364,
        protein: 10,
        fat: 1,
        carbohydrates: 76,
        dietaryFiber: 3,
        sodium: 2,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(ingredient.ingredientId).toBe(1);
      expect(ingredient.name).toBe('all-purpose flour');
      expect(ingredient.calories).toBe(364);
      expect(ingredient.density).toBe(0.53);
    });

    it('should create Ingredient without density', () => {
      const ingredient: Ingredient = {
        ingredientId: 2,
        name: 'salt',
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        dietaryFiber: 0,
        sodium: 38758,
        createdAt: '2024-01-01',
      };

      expect(ingredient.density).toBeUndefined();
      expect(ingredient.sodium).toBe(38758);
    });
  });

  describe('NutritionInfo type', () => {
    it('should create complete NutritionInfo', () => {
      const nutrition: NutritionInfo = {
        calories: 250,
        protein: 10,
        fat: 8,
        carbohydrates: 35,
        fiber: 3,
        sodium: 150,
      };

      expect(nutrition.calories).toBe(250);
      expect(nutrition.protein).toBe(10);
      expect(nutrition.fat).toBe(8);
      expect(nutrition.carbohydrates).toBe(35);
      expect(nutrition.fiber).toBe(3);
      expect(nutrition.sodium).toBe(150);
    });

    it('should handle zero nutrition values', () => {
      const nutrition: NutritionInfo = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        fiber: 0,
        sodium: 0,
      };

      expect(nutrition.calories).toBe(0);
    });
  });

  describe('User type', () => {
    it('should create User with Imperial preference', () => {
      const user: User = {
        userId: 1,
        username: 'user@example.com',
        measurementPreference: 'Imperial',
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(user.userId).toBe(1);
      expect(user.username).toBe('user@example.com');
      expect(user.measurementPreference).toBe('Imperial');
    });

    it('should create User with Metric preference', () => {
      const user: User = {
        userId: 2,
        username: 'european@example.com',
        measurementPreference: 'Metric',
        createdAt: '2024-01-01',
      };

      expect(user.measurementPreference).toBe('Metric');
    });
  });

  describe('Measurement type', () => {
    it('should create Imperial volume measurement', () => {
      const measurement: Measurement = {
        measurementId: 1,
        system: 'Imperial',
        measurementName: 'cup',
        measurementType: 'volume',
      };

      expect(measurement.measurementId).toBe(1);
      expect(measurement.system).toBe('Imperial');
      expect(measurement.measurementName).toBe('cup');
      expect(measurement.measurementType).toBe('volume');
    });

    it('should create Imperial weight measurement', () => {
      const measurement: Measurement = {
        measurementId: 2,
        system: 'Imperial',
        measurementName: 'pound',
        measurementType: 'weight',
      };

      expect(measurement.measurementType).toBe('weight');
    });

    it('should create Metric volume measurement', () => {
      const measurement: Measurement = {
        measurementId: 3,
        system: 'Metric',
        measurementName: 'liter',
        measurementType: 'volume',
      };

      expect(measurement.system).toBe('Metric');
      expect(measurement.measurementName).toBe('liter');
    });

    it('should create Metric weight measurement', () => {
      const measurement: Measurement = {
        measurementId: 4,
        system: 'Metric',
        measurementName: 'gram',
        measurementType: 'weight',
      };

      expect(measurement.system).toBe('Metric');
      expect(measurement.measurementName).toBe('gram');
    });
  });
});

describe('API URL patterns', () => {
  const API_BASE_URL = 'http://localhost:8080/api';

  it('should construct recipe endpoints correctly', () => {
    expect(`${API_BASE_URL}/recipes`).toBe('http://localhost:8080/api/recipes');
    expect(`${API_BASE_URL}/recipes/123`).toBe('http://localhost:8080/api/recipes/123');
    expect(`${API_BASE_URL}/recipes/my`).toBe('http://localhost:8080/api/recipes/my');
    expect(`${API_BASE_URL}/recipes/favorites`).toBe('http://localhost:8080/api/recipes/favorites');
    expect(`${API_BASE_URL}/recipes/public`).toBe('http://localhost:8080/api/recipes/public');
    expect(`${API_BASE_URL}/recipes/search`).toBe('http://localhost:8080/api/recipes/search');
  });

  it('should construct recipe action endpoints correctly', () => {
    const recipeId = 456;
    expect(`${API_BASE_URL}/recipes/${recipeId}/favorite`).toBe('http://localhost:8080/api/recipes/456/favorite');
    expect(`${API_BASE_URL}/recipes/${recipeId}/nutrition`).toBe('http://localhost:8080/api/recipes/456/nutrition');
    expect(`${API_BASE_URL}/recipes/${recipeId}/is-favorite`).toBe('http://localhost:8080/api/recipes/456/is-favorite');
  });

  it('should construct ingredient endpoints correctly', () => {
    expect(`${API_BASE_URL}/ingredients`).toBe('http://localhost:8080/api/ingredients');
    expect(`${API_BASE_URL}/ingredients/789`).toBe('http://localhost:8080/api/ingredients/789');

    const searchName = 'olive oil';
    expect(`${API_BASE_URL}/ingredients/search?name=${encodeURIComponent(searchName)}`).toBe(
      'http://localhost:8080/api/ingredients/search?name=olive%20oil'
    );
  });

  it('should construct measurement endpoints correctly', () => {
    expect(`${API_BASE_URL}/measurements`).toBe('http://localhost:8080/api/measurements');
    expect(`${API_BASE_URL}/measurements/system/Imperial`).toBe('http://localhost:8080/api/measurements/system/Imperial');
    expect(`${API_BASE_URL}/measurements/system/Metric`).toBe('http://localhost:8080/api/measurements/system/Metric');
    expect(`${API_BASE_URL}/measurements/system/Imperial/type/volume`).toBe(
      'http://localhost:8080/api/measurements/system/Imperial/type/volume'
    );
  });

  it('should construct auth endpoints correctly', () => {
    expect(`${API_BASE_URL}/auth/google`).toBe('http://localhost:8080/api/auth/google');
    expect(`${API_BASE_URL}/auth/me`).toBe('http://localhost:8080/api/auth/me');
  });

  it('should construct file endpoints correctly', () => {
    expect(`${API_BASE_URL}/files/upload`).toBe('http://localhost:8080/api/files/upload');
    expect(`${API_BASE_URL}/files/test-file.jpg`).toBe('http://localhost:8080/api/files/test-file.jpg');
  });

  it('should construct import endpoints correctly', () => {
    expect(`${API_BASE_URL}/import/bigoven`).toBe('http://localhost:8080/api/import/bigoven');
  });
});
