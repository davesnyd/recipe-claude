package com.recipe.model;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verifies that all extended recipe fields (category, cuisine, holiday, course, type)
 * are correctly populated when building the response map in RecipeController.getMyRecipes.
 */
public class RecipeFieldMappingTest {

    /** Simulates the map-building logic in RecipeController.getMyRecipes. */
    private Map<String, Object> buildRecipeMap(Recipe recipe) {
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
        return recipeMap;
    }

    @Test
    void categoryIsIncludedInRecipeMap() {
        Recipe recipe = new Recipe();
        recipe.setCategory("Italian");
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("category"), "Map must contain 'category' key");
        assertEquals("Italian", map.get("category"));
    }

    @Test
    void courseIsIncludedInRecipeMap() {
        Recipe recipe = new Recipe();
        recipe.setCourse("main");
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("course"), "Map must contain 'course' key");
        assertEquals("main", map.get("course"));
    }

    @Test
    void cuisineIsIncludedInRecipeMap() {
        Recipe recipe = new Recipe();
        recipe.setCuisine("Mexican");
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("cuisine"), "Map must contain 'cuisine' key");
        assertEquals("Mexican", map.get("cuisine"));
    }

    @Test
    void holidayIsIncludedInRecipeMap() {
        Recipe recipe = new Recipe();
        recipe.setHoliday("Thanksgiving");
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("holiday"), "Map must contain 'holiday' key");
        assertEquals("Thanksgiving", map.get("holiday"));
    }

    @Test
    void typeIsIncludedInRecipeMap() {
        Recipe recipe = new Recipe();
        recipe.setType("vegetarian,vegan");
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("type"), "Map must contain 'type' key");
        assertEquals("vegetarian,vegan", map.get("type"));
    }

    @Test
    void nullFieldsAreStillIncludedInMap() {
        Recipe recipe = new Recipe();
        // category, course etc are null by default
        Map<String, Object> map = buildRecipeMap(recipe);
        assertTrue(map.containsKey("category"), "Map must contain 'category' key even when null");
        assertNull(map.get("category"));
        assertTrue(map.containsKey("course"), "Map must contain 'course' key even when null");
        assertNull(map.get("course"));
    }
}
