package com.recipe.service;

import com.recipe.dto.NutritionInfo;
import com.recipe.dto.RecipeSearchRequest;
import com.recipe.model.*;
import com.recipe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private MeasurementRepository measurementRepository;

    public List<Recipe> searchRecipes(String currentUsername, RecipeSearchRequest searchRequest) {
        if (searchRequest.getIngredient() != null && !searchRequest.getIngredient().trim().isEmpty()) {
            return recipeRepository.findByIngredientName(currentUsername, searchRequest.getIngredient());
        }
        
        return recipeRepository.searchRecipes(
            currentUsername,
            searchRequest.getTitle(),
            searchRequest.getDescription(),
            searchRequest.getNote(),
            searchRequest.getCreateUsername(),
            searchRequest.getIsPublic(),
            searchRequest.getStartDate(),
            searchRequest.getEndDate()
        );
    }

    public List<Recipe> getRecipesByUser(String username) {
        return recipeRepository.findByCreateUsername(username);
    }

    public List<Recipe> getPublicRecipes() {
        return recipeRepository.findByIsPublicTrue();
    }

    public List<Recipe> getFavoriteRecipes(String username) {
        return favoriteRepository.findFavoriteRecipesByUsername(username);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        System.out.println("RecipeService: Loading recipe with ID: " + id);
        Optional<Recipe> recipe = recipeRepository.findById(id);
        
        if (recipe.isPresent()) {
            Recipe r = recipe.get();
            System.out.println("RecipeService: Found recipe: " + r.getTitle());
            System.out.println("RecipeService: RecipeIngredients collection: " + r.getRecipeIngredients());
            System.out.println("RecipeService: RecipeSteps collection: " + r.getRecipeSteps());
            
            if (r.getRecipeIngredients() != null) {
                System.out.println("RecipeService: Ingredients count: " + r.getRecipeIngredients().size());
                for (int i = 0; i < r.getRecipeIngredients().size(); i++) {
                    RecipeIngredient ri = r.getRecipeIngredients().get(i);
                    System.out.println("RecipeService: Ingredient " + i + ": " + ri.getIngredient().getName() + ", quantity: " + ri.getQuantity());
                }
            } else {
                System.out.println("RecipeService: Ingredients collection is NULL");
            }
            
            if (r.getRecipeSteps() != null) {
                System.out.println("RecipeService: Steps count: " + r.getRecipeSteps().size());
                for (int i = 0; i < r.getRecipeSteps().size(); i++) {
                    RecipeStep rs = r.getRecipeSteps().get(i);
                    System.out.println("RecipeService: Step " + i + ": " + rs.getStepText());
                }
            } else {
                System.out.println("RecipeService: Steps collection is NULL");
            }
        }
        
        return recipe;
    }

    public Recipe saveRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public Recipe saveRecipeWithData(Recipe recipe, List<Map<String, Object>> ingredientsData, List<Map<String, Object>> stepsData) {
        System.out.println("RecipeService: saveRecipeWithData called");
        System.out.println("RecipeService: ingredientsData: " + ingredientsData);
        System.out.println("RecipeService: stepsData: " + stepsData);
        
        // Save the recipe first to get an ID
        Recipe savedRecipe = recipeRepository.save(recipe);
        System.out.println("RecipeService: Recipe saved with ID: " + savedRecipe.getRecipeId());
        
        // Process ingredients
        List<RecipeIngredient> recipeIngredients = new ArrayList<>();
        if (ingredientsData != null) {
            for (int i = 0; i < ingredientsData.size(); i++) {
                Map<String, Object> ingredientData = ingredientsData.get(i);
                String ingredientName = (String) ingredientData.get("ingredientName");
                Double quantity = null;
                Object quantityObj = ingredientData.get("quantity");
                if (quantityObj instanceof Integer) {
                    quantity = ((Integer) quantityObj).doubleValue();
                } else if (quantityObj instanceof Double) {
                    quantity = (Double) quantityObj;
                }
                String measurementName = (String) ingredientData.get("measurementName");
                
                System.out.println("RecipeService: Processing ingredient: " + ingredientName + ", qty: " + quantity + ", unit: " + measurementName);
                
                if (ingredientName != null && !ingredientName.trim().isEmpty()) {
                    // Find or create ingredient
                    Optional<Ingredient> existingIngredient = ingredientRepository.findByNameIgnoreCase(ingredientName.trim());
                    Ingredient ingredient;
                    if (existingIngredient.isPresent()) {
                        ingredient = existingIngredient.get();
                    } else {
                        // Create basic ingredient with default nutrition values
                        ingredient = new Ingredient();
                        ingredient.setName(ingredientName.trim());
                        ingredient.setDensity(new BigDecimal("1.0"));
                        ingredient.setCalories(new BigDecimal("0"));
                        ingredient.setProtein(new BigDecimal("0"));
                        ingredient.setFat(new BigDecimal("0"));
                        ingredient.setCarbohydrates(new BigDecimal("0"));
                        ingredient.setDietaryFiber(new BigDecimal("0"));
                        ingredient.setSodium(new BigDecimal("0"));
                        ingredient = ingredientRepository.save(ingredient);
                        System.out.println("RecipeService: Created new ingredient: " + ingredient.getName());
                    }
                    
                    // Find or create measurement
                    // Ensure measurementName is not blank - default to "unit" if it is
                    String effectiveMeasurementName = (measurementName != null && !measurementName.trim().isEmpty())
                        ? measurementName.trim()
                        : "unit";

                    Optional<Measurement> existingMeasurement = measurementRepository.findByMeasurementName(effectiveMeasurementName);
                    Measurement measurement;
                    if (existingMeasurement.isPresent()) {
                        measurement = existingMeasurement.get();
                    } else {
                        // Create basic measurement
                        measurement = new Measurement();
                        measurement.setMeasurementName(effectiveMeasurementName);
                        measurement.setSystem(Measurement.MeasurementSystem.Imperial); // Default
                        measurement.setMeasurementType(Measurement.MeasurementType.volume); // Default
                        measurement = measurementRepository.save(measurement);
                        System.out.println("RecipeService: Created new measurement: " + measurement.getMeasurementName());
                    }
                    
                    // Create recipe ingredient
                    RecipeIngredient recipeIngredient = new RecipeIngredient();
                    recipeIngredient.setRecipe(savedRecipe);
                    recipeIngredient.setIngredient(ingredient);
                    if (quantity != null) {
                        recipeIngredient.setQuantity(new BigDecimal(quantity));
                    }
                    recipeIngredient.setMeasurement(measurement);
                    recipeIngredient.setIngredientOrder(i + 1);
                    
                    recipeIngredients.add(recipeIngredient);
                }
            }
        }
        
        // Process steps
        List<RecipeStep> recipeSteps = new ArrayList<>();
        if (stepsData != null) {
            for (int i = 0; i < stepsData.size(); i++) {
                Map<String, Object> stepData = stepsData.get(i);
                String stepText = (String) stepData.get("stepText");
                String photoUrl = (String) stepData.get("photoUrl");
                
                System.out.println("RecipeService: Processing step: " + stepText);
                
                if (stepText != null && !stepText.trim().isEmpty()) {
                    RecipeStep recipeStep = new RecipeStep();
                    recipeStep.setRecipe(savedRecipe);
                    recipeStep.setStepNumber(i + 1);
                    recipeStep.setStepText(stepText.trim());
                    recipeStep.setPhotoUrl(photoUrl);
                    
                    recipeSteps.add(recipeStep);
                }
            }
        }
        
        // Save ingredients and steps
        savedRecipe.setRecipeIngredients(recipeIngredients);
        savedRecipe.setRecipeSteps(recipeSteps);
        
        System.out.println("RecipeService: Saving " + recipeIngredients.size() + " ingredients and " + recipeSteps.size() + " steps");
        
        return recipeRepository.save(savedRecipe);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    public boolean isRecipeFavorite(String username, Recipe recipe) {
        return favoriteRepository.existsByUsernameAndRecipe(username, recipe);
    }

    public void markAsFavorite(String username, Long recipeId) {
        Optional<Recipe> recipe = recipeRepository.findById(recipeId);
        if (recipe.isPresent() && !favoriteRepository.existsByUsernameAndRecipe(username, recipe.get())) {
            Favorite favorite = new Favorite(username, recipe.get());
            favoriteRepository.save(favorite);
        }
    }

    public void unmarkAsFavorite(String username, Long recipeId) {
        Optional<Recipe> recipe = recipeRepository.findById(recipeId);
        if (recipe.isPresent()) {
            favoriteRepository.deleteByUsernameAndRecipe(username, recipe.get());
        }
    }

    public NutritionInfo calculateNutrition(Recipe recipe) {
        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;
        BigDecimal totalCarbohydrates = BigDecimal.ZERO;
        BigDecimal totalFiber = BigDecimal.ZERO;
        BigDecimal totalSodium = BigDecimal.ZERO;

        if (recipe.getRecipeIngredients() != null) {
            for (RecipeIngredient recipeIngredient : recipe.getRecipeIngredients()) {
                Ingredient ingredient = recipeIngredient.getIngredient();
                BigDecimal quantity = recipeIngredient.getQuantity();
                
                // Calculate nutrition per 100g/100ml and scale by quantity
                BigDecimal factor = quantity.divide(new BigDecimal("100"), 4, BigDecimal.ROUND_HALF_UP);
                
                totalCalories = totalCalories.add(ingredient.getCalories().multiply(factor));
                totalProtein = totalProtein.add(ingredient.getProtein().multiply(factor));
                totalFat = totalFat.add(ingredient.getFat().multiply(factor));
                totalCarbohydrates = totalCarbohydrates.add(ingredient.getCarbohydrates().multiply(factor));
                totalFiber = totalFiber.add(ingredient.getDietaryFiber().multiply(factor));
                totalSodium = totalSodium.add(ingredient.getSodium().multiply(factor));
            }
        }

        return new NutritionInfo(totalCalories, totalProtein, totalFat, 
                               totalCarbohydrates, totalFiber, totalSodium);
    }

    public boolean canUserAccessRecipe(String username, Recipe recipe) {
        return recipe.getCreateUsername().equals(username) || recipe.getIsPublic();
    }

    public boolean canUserEditRecipe(String username, Recipe recipe) {
        return recipe.getCreateUsername().equals(username);
    }

    public Recipe updateRecipeWithData(Recipe recipe, List<Map<String, Object>> ingredientsData, List<Map<String, Object>> stepsData) {
        System.out.println("RecipeService: updateRecipeWithData called for recipe ID: " + recipe.getRecipeId());
        System.out.println("RecipeService: ingredientsData: " + ingredientsData);
        System.out.println("RecipeService: stepsData: " + stepsData);
        
        // Get existing recipe to replace ingredients and steps
        Optional<Recipe> existingRecipe = recipeRepository.findById(recipe.getRecipeId());
        if (existingRecipe.isPresent()) {
            Recipe existing = existingRecipe.get();

            System.out.println("RecipeService: Updating recipe fields - servingCount before: " + existing.getServingCount() + ", after: " + recipe.getServingCount());

            // Update basic recipe fields
            existing.setTitle(recipe.getTitle());
            existing.setDescription(recipe.getDescription());
            existing.setServingCount(recipe.getServingCount());
            existing.setIsPublic(recipe.getIsPublic());
            existing.setNote(recipe.getNote());

            recipe = existing;
        } else {
            // If recipe doesn't exist, save it first
            recipe = recipeRepository.save(recipe);
        }

        System.out.println("RecipeService: Recipe updated with ID: " + recipe.getRecipeId());
        System.out.println("RecipeService: servingCount after assignment: " + recipe.getServingCount());
        
        // Process ingredients
        List<RecipeIngredient> recipeIngredients = new ArrayList<>();
        if (ingredientsData != null) {
            for (int i = 0; i < ingredientsData.size(); i++) {
                Map<String, Object> ingredientData = ingredientsData.get(i);
                String ingredientName = (String) ingredientData.get("ingredientName");
                Double quantity = null;
                Object quantityObj = ingredientData.get("quantity");
                if (quantityObj instanceof Integer) {
                    quantity = ((Integer) quantityObj).doubleValue();
                } else if (quantityObj instanceof Double) {
                    quantity = (Double) quantityObj;
                }
                String measurementName = (String) ingredientData.get("measurementName");
                
                System.out.println("RecipeService: Processing ingredient: " + ingredientName + ", qty: " + quantity + ", unit: " + measurementName);
                
                if (ingredientName != null && !ingredientName.trim().isEmpty()) {
                    // Find or create ingredient
                    Optional<Ingredient> existingIngredient = ingredientRepository.findByNameIgnoreCase(ingredientName.trim());
                    Ingredient ingredient;
                    if (existingIngredient.isPresent()) {
                        ingredient = existingIngredient.get();
                    } else {
                        // Create basic ingredient with default nutrition values
                        ingredient = new Ingredient();
                        ingredient.setName(ingredientName.trim());
                        ingredient.setDensity(new BigDecimal("1.0"));
                        ingredient.setCalories(new BigDecimal("0"));
                        ingredient.setProtein(new BigDecimal("0"));
                        ingredient.setFat(new BigDecimal("0"));
                        ingredient.setCarbohydrates(new BigDecimal("0"));
                        ingredient.setDietaryFiber(new BigDecimal("0"));
                        ingredient.setSodium(new BigDecimal("0"));
                        ingredient = ingredientRepository.save(ingredient);
                        System.out.println("RecipeService: Created new ingredient: " + ingredient.getName());
                    }
                    
                    // Find or create measurement
                    // Ensure measurementName is not blank - default to "unit" if it is
                    String effectiveMeasurementName = (measurementName != null && !measurementName.trim().isEmpty())
                        ? measurementName.trim()
                        : "unit";

                    Optional<Measurement> existingMeasurement = measurementRepository.findByMeasurementName(effectiveMeasurementName);
                    Measurement measurement;
                    if (existingMeasurement.isPresent()) {
                        measurement = existingMeasurement.get();
                    } else {
                        // Create basic measurement
                        measurement = new Measurement();
                        measurement.setMeasurementName(effectiveMeasurementName);
                        measurement.setSystem(Measurement.MeasurementSystem.Imperial); // Default
                        measurement.setMeasurementType(Measurement.MeasurementType.volume); // Default
                        measurement = measurementRepository.save(measurement);
                        System.out.println("RecipeService: Created new measurement: " + measurement.getMeasurementName());
                    }
                    
                    // Create recipe ingredient
                    RecipeIngredient recipeIngredient = new RecipeIngredient();
                    recipeIngredient.setRecipe(recipe);
                    recipeIngredient.setIngredient(ingredient);
                    if (quantity != null) {
                        recipeIngredient.setQuantity(new BigDecimal(quantity));
                    }
                    recipeIngredient.setMeasurement(measurement);
                    recipeIngredient.setIngredientOrder(i + 1);
                    
                    recipeIngredients.add(recipeIngredient);
                }
            }
        }
        
        // Process steps
        List<RecipeStep> recipeSteps = new ArrayList<>();
        if (stepsData != null) {
            for (int i = 0; i < stepsData.size(); i++) {
                Map<String, Object> stepData = stepsData.get(i);
                String stepText = (String) stepData.get("stepText");
                String photoUrl = (String) stepData.get("photoUrl");
                
                System.out.println("RecipeService: Processing step: " + stepText);
                
                if (stepText != null && !stepText.trim().isEmpty()) {
                    RecipeStep recipeStep = new RecipeStep();
                    recipeStep.setRecipe(recipe);
                    recipeStep.setStepNumber(i + 1);
                    recipeStep.setStepText(stepText.trim());
                    recipeStep.setPhotoUrl(photoUrl);
                    
                    recipeSteps.add(recipeStep);
                }
            }
        }
        
        // Replace ingredients and steps collections properly for Hibernate
        if (recipe.getRecipeIngredients() != null) {
            recipe.getRecipeIngredients().clear();
            recipe.getRecipeIngredients().addAll(recipeIngredients);
        } else {
            recipe.setRecipeIngredients(recipeIngredients);
        }
        
        if (recipe.getRecipeSteps() != null) {
            recipe.getRecipeSteps().clear();
            recipe.getRecipeSteps().addAll(recipeSteps);
        } else {
            recipe.setRecipeSteps(recipeSteps);
        }
        
        System.out.println("RecipeService: Saving " + recipeIngredients.size() + " ingredients and " + recipeSteps.size() + " steps");
        System.out.println("RecipeService: servingCount before save: " + recipe.getServingCount());

        Recipe savedRecipe = recipeRepository.save(recipe);
        System.out.println("RecipeService: servingCount after save: " + savedRecipe.getServingCount());

        return savedRecipe;
    }
}