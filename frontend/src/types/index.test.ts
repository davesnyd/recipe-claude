import {
  User,
  Measurement,
  Ingredient,
  RecipeIngredient,
  CreateRecipeIngredient,
  RecipeStep,
  Recipe,
  NutritionInfo,
  RecipeSearchRequest,
} from './index';

describe('Type definitions', () => {
  describe('User type', () => {
    it('should create a valid User object', () => {
      const user: User = {
        userId: 1,
        username: 'test@example.com',
        measurementPreference: 'Imperial',
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(user.userId).toBe(1);
      expect(user.username).toBe('test@example.com');
      expect(user.measurementPreference).toBe('Imperial');
    });

    it('should allow Metric measurement preference', () => {
      const user: User = {
        userId: 2,
        username: 'metric@example.com',
        measurementPreference: 'Metric',
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(user.measurementPreference).toBe('Metric');
    });
  });

  describe('Measurement type', () => {
    it('should create a valid volume measurement', () => {
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

    it('should create a valid weight measurement', () => {
      const measurement: Measurement = {
        measurementId: 2,
        system: 'Metric',
        measurementName: 'gram',
        measurementType: 'weight',
      };

      expect(measurement.system).toBe('Metric');
      expect(measurement.measurementType).toBe('weight');
    });
  });

  describe('Ingredient type', () => {
    it('should create a valid Ingredient object', () => {
      const ingredient: Ingredient = {
        ingredientId: 1,
        name: 'flour',
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
      expect(ingredient.name).toBe('flour');
      expect(ingredient.calories).toBe(364);
    });

    it('should allow optional density', () => {
      const ingredient: Ingredient = {
        ingredientId: 2,
        name: 'salt',
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        dietaryFiber: 0,
        sodium: 38758,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(ingredient.density).toBeUndefined();
    });
  });

  describe('RecipeIngredient type', () => {
    it('should create a valid RecipeIngredient', () => {
      const recipeIngredient: RecipeIngredient = {
        recipeIngredientId: 1,
        ingredientName: 'flour',
        quantity: 2,
        measurementName: 'cup',
        preparation: 'sifted',
        ingredientOrder: 1,
      };

      expect(recipeIngredient.ingredientName).toBe('flour');
      expect(recipeIngredient.quantity).toBe(2);
      expect(recipeIngredient.measurementName).toBe('cup');
    });

    it('should allow all optional fields', () => {
      const recipeIngredient: RecipeIngredient = {};

      expect(recipeIngredient.recipeIngredientId).toBeUndefined();
      expect(recipeIngredient.quantity).toBeUndefined();
    });
  });

  describe('CreateRecipeIngredient type', () => {
    it('should create a valid CreateRecipeIngredient', () => {
      const createIngredient: CreateRecipeIngredient = {
        ingredientName: 'sugar',
        quantity: '1',
        measurementName: 'cup',
        preparation: 'packed',
        ingredientOrder: 2,
      };

      expect(createIngredient.ingredientName).toBe('sugar');
      expect(createIngredient.measurementName).toBe('cup');
    });

    it('should allow optional quantity', () => {
      const createIngredient: CreateRecipeIngredient = {
        ingredientName: 'salt',
        measurementName: '',
      };

      expect(createIngredient.quantity).toBeUndefined();
    });
  });

  describe('RecipeStep type', () => {
    it('should create a valid RecipeStep', () => {
      const step: RecipeStep = {
        stepId: 1,
        stepNumber: 1,
        stepText: 'Preheat oven to 350°F',
        photoUrl: '/photos/step1.jpg',
      };

      expect(step.stepNumber).toBe(1);
      expect(step.stepText).toBe('Preheat oven to 350°F');
    });

    it('should allow optional photoUrl', () => {
      const step: RecipeStep = {
        stepNumber: 2,
        stepText: 'Mix ingredients',
      };

      expect(step.photoUrl).toBeUndefined();
    });
  });

  describe('Recipe type', () => {
    it('should create a valid Recipe', () => {
      const recipe: Recipe = {
        recipeId: 1,
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake',
        servingCount: 8,
        isPublic: true,
        creationDate: '2024-01-01T00:00:00Z',
        createUsername: 'chef@example.com',
        photoUrl: '/photos/cake.jpg',
        note: 'Best served warm',
        ingredients: [],
        steps: [],
      };

      expect(recipe.recipeId).toBe(1);
      expect(recipe.title).toBe('Chocolate Cake');
      expect(recipe.isPublic).toBe(true);
    });

    it('should allow optional fields', () => {
      const recipe: Recipe = {
        recipeId: 2,
        title: 'Simple Recipe',
        servingCount: 2,
        isPublic: false,
        creationDate: '2024-01-01T00:00:00Z',
        createUsername: 'user@example.com',
        ingredients: [],
        steps: [],
      };

      expect(recipe.description).toBeUndefined();
      expect(recipe.photoUrl).toBeUndefined();
      expect(recipe.note).toBeUndefined();
    });
  });

  describe('NutritionInfo type', () => {
    it('should create a valid NutritionInfo', () => {
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
      expect(nutrition.sodium).toBe(150);
    });
  });

  describe('RecipeSearchRequest type', () => {
    it('should create a valid search request', () => {
      const searchRequest: RecipeSearchRequest = {
        title: 'cake',
        isPublic: true,
        createUsername: 'chef@example.com',
      };

      expect(searchRequest.title).toBe('cake');
      expect(searchRequest.isPublic).toBe(true);
    });

    it('should allow all optional fields', () => {
      const searchRequest: RecipeSearchRequest = {};

      expect(searchRequest.title).toBeUndefined();
      expect(searchRequest.description).toBeUndefined();
      expect(searchRequest.startDate).toBeUndefined();
    });

    it('should create a date range search', () => {
      const searchRequest: RecipeSearchRequest = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      expect(searchRequest.startDate).toBe('2024-01-01');
      expect(searchRequest.endDate).toBe('2024-12-31');
    });
  });
});
