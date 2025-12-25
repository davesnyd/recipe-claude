package com.recipe.dto.importer;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ParsedIngredientTest {

    @Test
    void testDefaultConstructor() {
        ParsedIngredient ingredient = new ParsedIngredient();

        assertNull(ingredient.getQuantity());
        assertNull(ingredient.getUnit());
        assertNull(ingredient.getIngredientName());
        assertNull(ingredient.getPreparation());
        assertNull(ingredient.getOriginalText());
    }

    @Test
    void testParameterizedConstructor() {
        ParsedIngredient ingredient = new ParsedIngredient(
            2.0,
            "cup",
            "flour",
            "sifted",
            "2 cups flour, sifted"
        );

        assertEquals(2.0, ingredient.getQuantity());
        assertEquals("cup", ingredient.getUnit());
        assertEquals("flour", ingredient.getIngredientName());
        assertEquals("sifted", ingredient.getPreparation());
        assertEquals("2 cups flour, sifted", ingredient.getOriginalText());
    }

    @Test
    void testSettersAndGetters() {
        ParsedIngredient ingredient = new ParsedIngredient();

        ingredient.setQuantity(1.5);
        ingredient.setUnit("tablespoon");
        ingredient.setIngredientName("olive oil");
        ingredient.setPreparation(null);
        ingredient.setOriginalText("1 1/2 tablespoons olive oil");

        assertEquals(1.5, ingredient.getQuantity());
        assertEquals("tablespoon", ingredient.getUnit());
        assertEquals("olive oil", ingredient.getIngredientName());
        assertNull(ingredient.getPreparation());
        assertEquals("1 1/2 tablespoons olive oil", ingredient.getOriginalText());
    }

    @Test
    void testToString() {
        ParsedIngredient ingredient = new ParsedIngredient(
            2.0,
            "cup",
            "sugar",
            "packed",
            "2 cups sugar, packed"
        );

        String result = ingredient.toString();

        assertTrue(result.contains("quantity=2.0"));
        assertTrue(result.contains("unit='cup'"));
        assertTrue(result.contains("ingredientName='sugar'"));
        assertTrue(result.contains("preparation='packed'"));
        assertTrue(result.contains("originalText='2 cups sugar, packed'"));
    }

    @Test
    void testNullQuantity() {
        // For "to taste" items
        ParsedIngredient ingredient = new ParsedIngredient();
        ingredient.setIngredientName("salt");
        ingredient.setOriginalText("salt to taste");

        assertNull(ingredient.getQuantity());
        assertNull(ingredient.getUnit());
        assertEquals("salt", ingredient.getIngredientName());
    }

    @Test
    void testDecimalQuantity() {
        ParsedIngredient ingredient = new ParsedIngredient();
        ingredient.setQuantity(0.25);
        ingredient.setUnit("teaspoon");
        ingredient.setIngredientName("vanilla extract");

        assertEquals(0.25, ingredient.getQuantity());
    }
}
