export interface User {
  userId: number;
  username: string;
  measurementPreference: 'Imperial' | 'Metric';
  createdAt: string;
}

export interface Measurement {
  measurementId: number;
  system: 'Imperial' | 'Metric';
  measurementName: string;
  measurementType: 'weight' | 'volume';
}

export interface Ingredient {
  ingredientId: number;
  name: string;
  density?: number;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  dietaryFiber: number;
  sodium: number;
  createdAt: string;
}

export interface RecipeIngredient {
  recipeIngredientId?: number;
  ingredient?: Ingredient;
  ingredientName?: string;
  quantity?: number;
  measurement?: Measurement;
  measurementName?: string;
  ingredientOrder?: number;
}

export interface CreateRecipeIngredient {
  ingredientName: string;
  quantity?: number;
  measurementName: string;
  ingredientOrder?: number;
}

export interface RecipeStep {
  stepId?: number;
  stepNumber: number;
  stepText: string;
  photoUrl?: string;
}

export interface Recipe {
  recipeId: number;
  title: string;
  description?: string;
  servingCount: number;
  isPublic: boolean;
  creationDate: string;
  createUsername: string;
  photoUrl?: string;
  note?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sodium: number;
}

export interface RecipeSearchRequest {
  title?: string;
  description?: string;
  note?: string;
  createUsername?: string;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
  ingredient?: string;
}