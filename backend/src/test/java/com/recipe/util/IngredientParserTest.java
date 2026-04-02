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

    @Test
    void testParseFraction() {
        ParsedIngredient result = parser.parse("1/2 cup milk");

        assertNotNull(result);
        assertEquals(0.5, result.getQuantity(), 0.01);
        assertEquals("cup", result.getUnit());
        assertEquals("milk", result.getIngredientName());
    }

    @Test
    void testParseCups() {
        ParsedIngredient result = parser.parse("2 cups flour");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("cup", result.getUnit());
        assertEquals("flour", result.getIngredientName());
    }

    @Test
    void testParsePounds() {
        ParsedIngredient result = parser.parse("1 lb ground beef");

        assertNotNull(result);
        assertEquals(1.0, result.getQuantity());
        assertEquals("pound", result.getUnit());
        assertEquals("ground beef", result.getIngredientName());
    }

    @Test
    void testParseGrams() {
        ParsedIngredient result = parser.parse("100 g sugar");

        assertNotNull(result);
        assertEquals(100.0, result.getQuantity());
        assertEquals("gram", result.getUnit());
        assertEquals("sugar", result.getIngredientName());
    }

    @Test
    void testParseNullInput() {
        ParsedIngredient result = parser.parse(null);
        assertNull(result);
    }

    @Test
    void testParseEmptyInput() {
        ParsedIngredient result = parser.parse("");
        assertNull(result);
    }

    @Test
    void testParseWhitespaceOnly() {
        ParsedIngredient result = parser.parse("   ");
        assertNull(result);
    }

    @Test
    void testParseDecimalQuantity() {
        ParsedIngredient result = parser.parse("1.5 cups water");

        assertNotNull(result);
        assertEquals(1.5, result.getQuantity());
        assertEquals("cup", result.getUnit());
        assertEquals("water", result.getIngredientName());
    }

    @Test
    void testParseMultiWordIngredient() {
        ParsedIngredient result = parser.parse("2 cups all-purpose flour");

        assertNotNull(result);
        assertEquals(2.0, result.getQuantity());
        assertEquals("cup", result.getUnit());
        assertEquals("all-purpose flour", result.getIngredientName());
    }

    @Test
    void testParseWithComplexPreparation() {
        ParsedIngredient result = parser.parse("1 cup onion, finely chopped");

        assertNotNull(result);
        assertEquals(1.0, result.getQuantity());
        assertEquals("cup", result.getUnit());
        assertEquals("onion", result.getIngredientName());
        assertEquals("finely chopped", result.getPreparation());
    }

    @Test
    void testParseMilliliters() {
        ParsedIngredient result = parser.parse("250 ml cream");

        assertNotNull(result);
        assertEquals(250.0, result.getQuantity());
        assertEquals("milliliter", result.getUnit());
        assertEquals("cream", result.getIngredientName());
    }

    @Test
    void testOriginalTextPreserved() {
        String originalText = "2 TBSP lemon juice";
        ParsedIngredient result = parser.parse(originalText);

        assertNotNull(result);
        assertEquals(originalText, result.getOriginalText());
    }
}
