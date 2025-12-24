package com.recipe.util;

import com.recipe.dto.importer.ParsedIngredient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IngredientParserTest {

    private IngredientParser parser;

    @BeforeEach
    void setUp() {
        parser = new IngredientParser();
    }

    @Test
    void testParseWithQuantityAndUnit() {
        ParsedIngredient result = parser.parse("2 TBSP lemon juice");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("tablespoon", result.getUnit());
        assertEquals("lemon juice", result.getIngredientName());
        assertEquals("2 TBSP lemon juice", result.getOriginalText());
    }

    @Test
    void testParseStickOfButter() {
        ParsedIngredient result = parser.parse("1 stick of butter");

        assertNotNull(result);
        assertEquals(8.0, result.getQuantity()); // 1 stick = 8 TBSP
        assertEquals("tablespoon", result.getUnit());
        assertEquals("butter", result.getIngredientName());
    }

    @Test
    void testParseWithoutQuantity() {
        ParsedIngredient result = parser.parse("Acorn squash");

        assertNotNull(result);
        assertNull(result.getQuantity());
        assertEquals("Acorn squash", result.getIngredientName());
    }

    @Test
    void testParseApples() {
        ParsedIngredient result = parser.parse("2 apples");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("apples", result.getIngredientName());
    }

    @Test
    void testParseTeaspoon() {
        ParsedIngredient result = parser.parse("1 TSP cinnamon");

        assertNotNull(result);
        assertEquals(1.0, result.getQuantity());
        assertEquals("teaspoon", result.getUnit());
        assertEquals("cinnamon", result.getIngredientName());
    }

    @Test
    void testParseOunces() {
        ParsedIngredient result = parser.parse("2 oz honey");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("ounce", result.getUnit());
        assertEquals("honey", result.getIngredientName());
    }

    @Test
    void testParseWithPreparation() {
        ParsedIngredient result = parser.parse("2 apples, chopped");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("apples", result.getIngredientName());
        assertEquals("chopped", result.getPreparation());
    }
}
