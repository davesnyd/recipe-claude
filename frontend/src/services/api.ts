import axios from 'axios';
import { Recipe, RecipeSearchRequest, Ingredient, NutritionInfo, User, Measurement } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API: Making request to', config.url);
  console.log('API: Token from localStorage:', token ? `exists (${token.substring(0, 20)}...)` : 'not found');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API: Added Authorization header');
  } else {
    console.log('API: No token found, request will be unauthorized');
  }
  return config;
});

// Authentication
export const authApi = {
  googleLogin: (idToken: string) => 
    api.post('/auth/google', { idToken }),
  
  getCurrentUser: () => 
    api.get<User>('/auth/me'),
  
  updateCurrentUser: (user: Partial<User>) => 
    api.put<User>('/auth/me', user),
};

// Recipes
export const recipeApi = {
  search: (searchRequest: RecipeSearchRequest) => 
    api.post<Recipe[]>('/recipes/search', searchRequest),
  
  getMyRecipes: () => 
    api.get<Recipe[]>('/recipes/my'),
  
  getFavoriteRecipes: () => 
    api.get<Recipe[]>('/recipes/favorites'),
  
  getPublicRecipes: () => 
    api.get<Recipe[]>('/recipes/public'),
  
  getRecipe: (id: number) => 
    api.get<Recipe>(`/recipes/${id}`),
  
  getRecipeById: (id: number) => 
    api.get<Recipe>(`/recipes/${id}`),
  
  createRecipe: (recipe: Partial<Recipe>) => 
    api.post<Recipe>('/recipes', recipe),
  
  updateRecipe: (id: number, recipe: Partial<Recipe>) => 
    api.put<Recipe>(`/recipes/${id}`, recipe),
  
  deleteRecipe: (id: number) => 
    api.delete(`/recipes/${id}`),
  
  markAsFavorite: (id: number) => 
    api.post(`/recipes/${id}/favorite`),
  
  unmarkAsFavorite: (id: number) => 
    api.delete(`/recipes/${id}/favorite`),
  
  getNutrition: (id: number) => 
    api.get<NutritionInfo>(`/recipes/${id}/nutrition`),
  
  isRecipeFavorite: (id: number) => 
    api.get<boolean>(`/recipes/${id}/is-favorite`),
};

// Ingredients
export const ingredientApi = {
  getAll: () => 
    api.get<Ingredient[]>('/ingredients'),
  
  getById: (id: number) => 
    api.get<Ingredient>(`/ingredients/${id}`),
  
  search: (name: string) => 
    api.get<Ingredient[]>(`/ingredients/search?name=${encodeURIComponent(name)}`),
  
  create: (ingredient: Partial<Ingredient>) => 
    api.post<Ingredient>('/ingredients', ingredient),
  
  update: (id: number, ingredient: Partial<Ingredient>) => 
    api.put<Ingredient>(`/ingredients/${id}`, ingredient),
  
  delete: (id: number) => 
    api.delete(`/ingredients/${id}`),
};

// Measurements
export const measurementApi = {
  getAll: () => 
    api.get<Measurement[]>('/measurements'),
  
  getBySystem: (system: 'Imperial' | 'Metric') => 
    api.get<Measurement[]>(`/measurements/system/${system}`),
  
  getBySystemAndType: (system: 'Imperial' | 'Metric', type: 'weight' | 'volume') => 
    api.get<Measurement[]>(`/measurements/system/${system}/type/${type}`),
};

// File upload
export const fileApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{url: string, filename: string}>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (filename: string) => 
    api.delete(`/files/${filename}`),
};

export default api;