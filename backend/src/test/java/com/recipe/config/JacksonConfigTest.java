package com.recipe.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipe.model.Ingredient;
import com.recipe.model.Measurement;
import com.recipe.model.Recipe;
import com.recipe.model.RecipeIngredient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Jackson serialization configuration, specifically verifying that
 * lazy-loaded Hibernate entities (like Measurement) are properly serialized.
 */
public class JacksonConfigTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        JacksonConfig config = new JacksonConfig();
        objectMapper = config.objectMapper();
    }

    @Test
    void testMeasurementSerializationInRecipeIngredient() throws JsonProcessingException {
        // Create a Measurement entity
        Measurement measurement = new Measurement();
        measurement.setMeasurementId(1L);
        measurement.setMeasurementName("cup");
        measurement.setSystem(Measurement.MeasurementSystem.Imperial);
        measurement.setMeasurementType(Measurement.MeasurementType.volume);

        // Create an Ingredient entity
        Ingredient ingredient = new Ingredient();
        ingredient.setIngredientId(1L);
        ingredient.setName("flour");
        ingredient.setCalories(new BigDecimal("364"));
        ingredient.setProtein(new BigDecimal("10"));
        ingredient.setFat(new BigDecimal("1"));
        ingredient.setCarbohydrates(new BigDecimal("76"));
        ingredient.setDietaryFiber(new BigDecimal("3"));
        ingredient.setSodium(new BigDecimal("2"));
        ingredient.setDensity(new BigDecimal("0.53"));

        // Create a RecipeIngredient with the measurement
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipeIngredientId(1L);
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setMeasurement(measurement);
        recipeIngredient.setQuantity(new BigDecimal("2.5"));
        recipeIngredient.setPreparation("sifted");
        recipeIngredient.setIngredientOrder(1);

        // Serialize to JSON
        String json = objectMapper.writeValueAsString(recipeIngredient);

        // Verify the JSON contains the measurement data
        assertNotNull(json);
        assertTrue(json.contains("\"measurementName\":\"cup\""),
            "JSON should contain measurementName field. Actual JSON: " + json);
        assertTrue(json.contains("\"system\":\"Imperial\""),
            "JSON should contain measurement system. Actual JSON: " + json);
        assertTrue(json.contains("\"measurementType\":\"volume\""),
            "JSON should contain measurement type. Actual JSON: " + json);
        assertTrue(json.contains("\"ingredientName\":\"flour\"") || json.contains("\"name\":\"flour\""),
            "JSON should contain ingredient name. Actual JSON: " + json);
        assertTrue(json.contains("\"quantity\":2.5"),
            "JSON should contain quantity. Actual JSON: " + json);
        assertTrue(json.contains("\"preparation\":\"sifted\""),
            "JSON should contain preparation. Actual JSON: " + json);
    }

    @Test
    void testRecipeWithIngredientsSerializationIncludesMeasurement() throws JsonProcessingException {
        // Create a Recipe
        Recipe recipe = new Recipe();
        recipe.setRecipeId(1L);
        recipe.setTitle("Test Recipe");
        recipe.setDescription("A test recipe");
        recipe.setServingCount(4);
        recipe.setIsPublic(true);
        recipe.setCreateUsername("testuser@example.com");

        // Create Measurement
        Measurement measurement = new Measurement();
        measurement.setMeasurementId(1L);
        measurement.setMeasurementName("tablespoon");
        measurement.setSystem(Measurement.MeasurementSystem.Imperial);
        measurement.setMeasurementType(Measurement.MeasurementType.volume);

        // Create Ingredient
        Ingredient ingredient = new Ingredient();
        ingredient.setIngredientId(1L);
        ingredient.setName("olive oil");
        ingredient.setCalories(new BigDecimal("119"));
        ingredient.setProtein(new BigDecimal("0"));
        ingredient.setFat(new BigDecimal("14"));
        ingredient.setCarbohydrates(new BigDecimal("0"));
        ingredient.setDietaryFiber(new BigDecimal("0"));
        ingredient.setSodium(new BigDecimal("0"));
        ingredient.setDensity(new BigDecimal("0.92"));

        // Create RecipeIngredient
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipeIngredientId(1L);
        recipeIngredient.setRecipe(recipe);
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setMeasurement(measurement);
        recipeIngredient.setQuantity(new BigDecimal("2"));
        recipeIngredient.setIngredientOrder(1);

        List<RecipeIngredient> ingredients = new ArrayList<>();
        ingredients.add(recipeIngredient);
        recipe.setRecipeIngredients(ingredients);

        // Serialize to JSON
        String json = objectMapper.writeValueAsString(recipe);

        // Verify recipe fields
        assertNotNull(json);
        assertTrue(json.contains("\"title\":\"Test Recipe\""),
            "JSON should contain recipe title. Actual JSON: " + json);

        // Verify measurement is included in the serialized recipe ingredients
        assertTrue(json.contains("\"measurementName\":\"tablespoon\""),
            "JSON should contain measurementName in recipe ingredients. Actual JSON: " + json);
    }

    @Test
    void testMultipleMeasurementsInRecipe() throws JsonProcessingException {
        // Create a Recipe with multiple ingredients with different measurements
        Recipe recipe = new Recipe();
        recipe.setRecipeId(1L);
        recipe.setTitle("Multi-Ingredient Recipe");
        recipe.setServingCount(2);
        recipe.setIsPublic(false);
        recipe.setCreateUsername("chef@example.com");

        List<RecipeIngredient> ingredients = new ArrayList<>();

        // First ingredient with cup measurement
        Measurement cupMeasurement = new Measurement();
        cupMeasurement.setMeasurementId(1L);
        cupMeasurement.setMeasurementName("cup");
        cupMeasurement.setSystem(Measurement.MeasurementSystem.Imperial);
        cupMeasurement.setMeasurementType(Measurement.MeasurementType.volume);

        Ingredient flour = new Ingredient();
        flour.setIngredientId(1L);
        flour.setName("flour");
        flour.setCalories(new BigDecimal("364"));
        flour.setProtein(new BigDecimal("10"));
        flour.setFat(new BigDecimal("1"));
        flour.setCarbohydrates(new BigDecimal("76"));
        flour.setDietaryFiber(new BigDecimal("3"));
        flour.setSodium(new BigDecimal("2"));
        flour.setDensity(new BigDecimal("0.53"));

        RecipeIngredient ri1 = new RecipeIngredient();
        ri1.setRecipeIngredientId(1L);
        ri1.setRecipe(recipe);
        ri1.setIngredient(flour);
        ri1.setMeasurement(cupMeasurement);
        ri1.setQuantity(new BigDecimal("2"));
        ri1.setIngredientOrder(1);
        ingredients.add(ri1);

        // Second ingredient with gram measurement
        Measurement gramMeasurement = new Measurement();
        gramMeasurement.setMeasurementId(2L);
        gramMeasurement.setMeasurementName("gram");
        gramMeasurement.setSystem(Measurement.MeasurementSystem.Metric);
        gramMeasurement.setMeasurementType(Measurement.MeasurementType.weight);

        Ingredient sugar = new Ingredient();
        sugar.setIngredientId(2L);
        sugar.setName("sugar");
        sugar.setCalories(new BigDecimal("387"));
        sugar.setProtein(new BigDecimal("0"));
        sugar.setFat(new BigDecimal("0"));
        sugar.setCarbohydrates(new BigDecimal("100"));
        sugar.setDietaryFiber(new BigDecimal("0"));
        sugar.setSodium(new BigDecimal("1"));
        sugar.setDensity(new BigDecimal("0.85"));

        RecipeIngredient ri2 = new RecipeIngredient();
        ri2.setRecipeIngredientId(2L);
        ri2.setRecipe(recipe);
        ri2.setIngredient(sugar);
        ri2.setMeasurement(gramMeasurement);
        ri2.setQuantity(new BigDecimal("100"));
        ri2.setIngredientOrder(2);
        ingredients.add(ri2);

        recipe.setRecipeIngredients(ingredients);

        // Serialize to JSON
        String json = objectMapper.writeValueAsString(recipe);

        // Verify both measurements are present
        assertNotNull(json);
        assertTrue(json.contains("\"measurementName\":\"cup\""),
            "JSON should contain 'cup' measurement. Actual JSON: " + json);
        assertTrue(json.contains("\"measurementName\":\"gram\""),
            "JSON should contain 'gram' measurement. Actual JSON: " + json);
        assertTrue(json.contains("\"system\":\"Imperial\""),
            "JSON should contain Imperial system. Actual JSON: " + json);
        assertTrue(json.contains("\"system\":\"Metric\""),
            "JSON should contain Metric system. Actual JSON: " + json);
    }

    @Test
    void testCreationDateSerializedAsIsoString() throws JsonProcessingException {
        Recipe recipe = new Recipe();
        recipe.setRecipeId(1L);
        recipe.setTitle("Date Test Recipe");
        recipe.setServingCount(2);
        recipe.setIsPublic(true);
        recipe.setCreateUsername("chef@example.com");
        recipe.setCreationDate(LocalDateTime.of(2024, 1, 15, 10, 30, 0));

        String json = objectMapper.writeValueAsString(recipe);

        // creationDate must be an ISO-8601 string, not a numeric array like [2024,1,15,10,30,0]
        assertFalse(json.contains("\"creationDate\":["),
            "creationDate must not be serialized as a numeric array. Actual JSON: " + json);
        assertTrue(json.contains("\"creationDate\":\"2024-01-15"),
            "creationDate should be an ISO-8601 string. Actual JSON: " + json);
    }

    @Test
    void testEmptyMeasurementNameHandling() throws JsonProcessingException {
        // Test that measurement with empty name is still serialized
        Measurement measurement = new Measurement();
        measurement.setMeasurementId(1L);
        measurement.setMeasurementName("unit");
        measurement.setSystem(Measurement.MeasurementSystem.Imperial);
        measurement.setMeasurementType(Measurement.MeasurementType.volume);

        Ingredient egg = new Ingredient();
        egg.setIngredientId(1L);
        egg.setName("egg");
        egg.setCalories(new BigDecimal("78"));
        egg.setProtein(new BigDecimal("6"));
        egg.setFat(new BigDecimal("5"));
        egg.setCarbohydrates(new BigDecimal("1"));
        egg.setDietaryFiber(new BigDecimal("0"));
        egg.setSodium(new BigDecimal("62"));
        egg.setDensity(new BigDecimal("1.0"));

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipeIngredientId(1L);
        recipeIngredient.setIngredient(egg);
        recipeIngredient.setMeasurement(measurement);
        recipeIngredient.setQuantity(new BigDecimal("2"));
        recipeIngredient.setIngredientOrder(1);

        String json = objectMapper.writeValueAsString(recipeIngredient);

        assertNotNull(json);
        assertTrue(json.contains("\"measurementName\":\"unit\""),
            "JSON should contain 'unit' measurement for items without specific units. Actual JSON: " + json);
    }
}
