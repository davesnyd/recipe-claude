package com.recipe.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RecipeFieldsTest {

    @Test
    void recipeHasCategoryField() {
        Recipe recipe = new Recipe();
        recipe.setCategory("Italian");
        assertEquals("Italian", recipe.getCategory());
    }

    @Test
    void recipeHasCuisineField() {
        Recipe recipe = new Recipe();
        recipe.setCuisine("Mediterranean");
        assertEquals("Mediterranean", recipe.getCuisine());
    }

    @Test
    void recipeHasHolidayField() {
        Recipe recipe = new Recipe();
        recipe.setHoliday("Thanksgiving");
        assertEquals("Thanksgiving", recipe.getHoliday());
    }

    @Test
    void recipeHasCourseField() {
        Recipe recipe = new Recipe();
        recipe.setCourse("main");
        assertEquals("main", recipe.getCourse());
    }

    @Test
    void recipeHasTypeField() {
        Recipe recipe = new Recipe();
        recipe.setType("vegetarian,gluten free");
        assertEquals("vegetarian,gluten free", recipe.getType());
    }

    @Test
    void newRecipeFieldsDefaultToNull() {
        Recipe recipe = new Recipe();
        assertNull(recipe.getCategory());
        assertNull(recipe.getCuisine());
        assertNull(recipe.getHoliday());
        assertNull(recipe.getCourse());
        assertNull(recipe.getType());
    }
}
