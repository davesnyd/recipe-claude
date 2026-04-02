package com.recipe.controller;

import com.recipe.dto.NutritionInfo;
import com.recipe.dto.RecipeSearchRequest;
import com.recipe.model.Recipe;
import com.recipe.model.RecipeIngredient;
import com.recipe.model.RecipeStep;
import com.recipe.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/recipes")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @PostMapping("/search")
    public ResponseEntity<List<Recipe>> searchRecipes(
            @RequestBody RecipeSearchRequest searchRequest,
            Authentication authentication) {
        String username = authentication.getName();
        List<Recipe> recipes = recipeService.searchRecipes(username, searchRequest);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyRecipes(Authentication authentication) {
        String username = authentication.getName();
        List<Recipe> recipes = recipeService.getRecipesByUser(username);
        
        System.out.println("RecipeController: getMyRecipes found " + recipes.size() + " recipes");
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Recipe recipe : recipes) {
            System.out.println("RecipeController: Recipe ID: " + recipe.getRecipeId() + ", Title: " + recipe.getTitle());
            System.out.println("RecipeController: Recipe has " + 
                (recipe.getRecipeIngredients() != null ? recipe.getRecipeIngredients().size() : "null") + " ingredients");
            System.out.println("RecipeController: Recipe has " + 
                (recipe.getRecipeSteps() != null ? recipe.getRecipeSteps().size() : "null") + " steps");
            
            Map<String, Object> recipeMap = new HashMap<>();
            recipeMap.put("recipeId", recipe.getRecipeId());
            recipeMap.put("title", recipe.getTitle());
            recipeMap.put("description", recipe.getDescription());
            recipeMap.put("servingCount", recipe.getServingCount());
            recipeMap.put("isPublic", recipe.getIsPublic());
            recipeMap.put("createUsername", recipe.getCreateUsername());
            recipeMap.put("creationDate", recipe.getCreationDate());
            recipeMap.put("photoUrl", recipe.getPhotoUrl());
            recipeMap.put("note", recipe.getNote());
            recipeMap.put("category", recipe.getCategory());
            recipeMap.put("cuisine", recipe.getCuisine());
            recipeMap.put("holiday", recipe.getHoliday());
            recipeMap.put("course", recipe.getCourse());
            recipeMap.put("type", recipe.getType());
            
            // Add ingredients
            List<Map<String, Object>> ingredientsList = new ArrayList<>();
            if (recipe.getRecipeIngredients() != null) {
                for (RecipeIngredient ri : recipe.getRecipeIngredients()) {
                    Map<String, Object> ingredientMap = new HashMap<>();
                    ingredientMap.put("recipeIngredientId", ri.getRecipeIngredientId());
                    ingredientMap.put("quantity", ri.getQuantity());
                    ingredientMap.put("ingredientName", ri.getIngredient().getName());
                    ingredientMap.put("measurementName", ri.getMeasurement().getMeasurementName());
                    ingredientMap.put("ingredientOrder", ri.getIngredientOrder());
                    ingredientsList.add(ingredientMap);
                }
            }
            recipeMap.put("recipeIngredients", ingredientsList);
            
            // Add steps
            List<Map<String, Object>> stepsList = new ArrayList<>();
            if (recipe.getRecipeSteps() != null) {
                for (RecipeStep rs : recipe.getRecipeSteps()) {
                    Map<String, Object> stepMap = new HashMap<>();
                    stepMap.put("recipeStepId", rs.getStepId());
                    stepMap.put("stepNumber", rs.getStepNumber());
                    stepMap.put("stepText", rs.getStepText());
                    stepMap.put("photoUrl", rs.getPhotoUrl());
                    stepsList.add(stepMap);
                }
            }
            recipeMap.put("recipeSteps", stepsList);
            
            response.add(recipeMap);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Recipe>> getFavoriteRecipes(Authentication authentication) {
        String username = authentication.getName();
        List<Recipe> recipes = recipeService.getFavoriteRecipes(username);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/public")
    public ResponseEntity<List<Recipe>> getPublicRecipes() {
        List<Recipe> recipes = recipeService.getPublicRecipes();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipe(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<Recipe> recipe = recipeService.getRecipeById(id);
        
        if (recipe.isEmpty()) {
            System.out.println("RecipeController: Recipe with ID " + id + " not found");
            return ResponseEntity.notFound().build();
        }
        
        if (!recipeService.canUserAccessRecipe(username, recipe.get())) {
            System.out.println("RecipeController: User " + username + " cannot access recipe " + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Recipe r = recipe.get();
        System.out.println("RecipeController: Returning recipe ID: " + r.getRecipeId() + ", Title: " + r.getTitle());
        System.out.println("RecipeController: Recipe has " + 
            (r.getRecipeIngredients() != null ? r.getRecipeIngredients().size() : "null") + " ingredients");
        System.out.println("RecipeController: Recipe has " + 
            (r.getRecipeSteps() != null ? r.getRecipeSteps().size() : "null") + " steps");
        
        return ResponseEntity.ok(r);
    }

    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Map<String, Object> requestBody, Authentication authentication) {
        String username = authentication.getName();
        System.out.println("RecipeController: Received recipe creation request");
        System.out.println("RecipeController: Raw request body: " + requestBody);
        
        // Extract basic recipe data
        Recipe recipe = new Recipe();
        recipe.setTitle((String) requestBody.get("title"));
        recipe.setDescription((String) requestBody.get("description"));
        recipe.setServingCount(requestBody.get("servingCount") != null ? (Integer) requestBody.get("servingCount") : 1);
        recipe.setIsPublic(requestBody.get("isPublic") != null ? (Boolean) requestBody.get("isPublic") : false);
        recipe.setNote((String) requestBody.get("note"));
        recipe.setCategory((String) requestBody.get("category"));
        recipe.setCuisine((String) requestBody.get("cuisine"));
        recipe.setHoliday((String) requestBody.get("holiday"));
        recipe.setCourse((String) requestBody.get("course"));
        recipe.setType((String) requestBody.get("type"));
        recipe.setCreateUsername(username);

        System.out.println("RecipeController: Recipe title: " + recipe.getTitle());
        System.out.println("RecipeController: Recipe description: " + recipe.getDescription());

        // Handle ingredients
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ingredientsData = (List<Map<String, Object>>) requestBody.get("ingredients");
        System.out.println("RecipeController: Ingredients data: " + ingredientsData);

        // Handle steps
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stepsData = (List<Map<String, Object>>) requestBody.get("steps");
        System.out.println("RecipeController: Steps data: " + stepsData);

        Recipe savedRecipe = recipeService.saveRecipeWithData(recipe, ingredientsData, stepsData);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication) {
        String username = authentication.getName();
        Optional<Recipe> existingRecipe = recipeService.getRecipeById(id);
        
        if (existingRecipe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        if (!recipeService.canUserEditRecipe(username, existingRecipe.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        System.out.println("RecipeController: Received recipe update request for ID: " + id);
        System.out.println("RecipeController: Raw request body: " + requestBody);
        
        // Extract basic recipe data
        Recipe recipe = new Recipe();
        recipe.setRecipeId(id);
        recipe.setTitle((String) requestBody.get("title"));
        recipe.setDescription((String) requestBody.get("description"));
        recipe.setServingCount(requestBody.get("servingCount") != null ? (Integer) requestBody.get("servingCount") : 1);
        recipe.setIsPublic(requestBody.get("isPublic") != null ? (Boolean) requestBody.get("isPublic") : false);
        recipe.setNote((String) requestBody.get("note"));
        recipe.setCategory((String) requestBody.get("category"));
        recipe.setCuisine((String) requestBody.get("cuisine"));
        recipe.setHoliday((String) requestBody.get("holiday"));
        recipe.setCourse((String) requestBody.get("course"));
        recipe.setType((String) requestBody.get("type"));
        recipe.setCreateUsername(username);
        
        System.out.println("RecipeController: Recipe title: " + recipe.getTitle());
        System.out.println("RecipeController: Recipe description: " + recipe.getDescription());
        
        // Handle ingredients
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ingredientsData = (List<Map<String, Object>>) requestBody.get("ingredients");
        System.out.println("RecipeController: Ingredients data: " + ingredientsData);
        
        // Handle steps
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stepsData = (List<Map<String, Object>>) requestBody.get("steps");
        System.out.println("RecipeController: Steps data: " + stepsData);
        
        Recipe savedRecipe = recipeService.updateRecipeWithData(recipe, ingredientsData, stepsData);
        return ResponseEntity.ok(savedRecipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<Recipe> recipe = recipeService.getRecipeById(id);
        
        if (recipe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        if (!recipeService.canUserEditRecipe(username, recipe.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> markAsFavorite(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        recipeService.markAsFavorite(username, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<Void> unmarkAsFavorite(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        recipeService.unmarkAsFavorite(username, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/nutrition")
    public ResponseEntity<NutritionInfo> getRecipeNutrition(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<Recipe> recipe = recipeService.getRecipeById(id);
        
        if (recipe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        if (!recipeService.canUserAccessRecipe(username, recipe.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        NutritionInfo nutrition = recipeService.calculateNutrition(recipe.get());
        return ResponseEntity.ok(nutrition);
    }

    @GetMapping("/{id}/is-favorite")
    public ResponseEntity<Boolean> isRecipeFavorite(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<Recipe> recipe = recipeService.getRecipeById(id);
        
        if (recipe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        boolean isFavorite = recipeService.isRecipeFavorite(username, recipe.get());
        return ResponseEntity.ok(isFavorite);
    }
}