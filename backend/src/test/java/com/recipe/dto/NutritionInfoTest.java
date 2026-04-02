package com.recipe.dto;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class NutritionInfoTest {

    @Test
    void testDefaultConstructor() {
        NutritionInfo nutritionInfo = new NutritionInfo();

        assertNull(nutritionInfo.getCalories());
        assertNull(nutritionInfo.getProtein());
        assertNull(nutritionInfo.getFat());
        assertNull(nutritionInfo.getCarbohydrates());
        assertNull(nutritionInfo.getFiber());
        assertNull(nutritionInfo.getSodium());
    }

    @Test
    void testParameterizedConstructor() {
        BigDecimal calories = new BigDecimal("200");
        BigDecimal protein = new BigDecimal("10");
        BigDecimal fat = new BigDecimal("8");
        BigDecimal carbs = new BigDecimal("25");
        BigDecimal fiber = new BigDecimal("3");
        BigDecimal sodium = new BigDecimal("150");

        NutritionInfo nutritionInfo = new NutritionInfo(calories, protein, fat, carbs, fiber, sodium);

        assertEquals(calories, nutritionInfo.getCalories());
        assertEquals(protein, nutritionInfo.getProtein());
        assertEquals(fat, nutritionInfo.getFat());
        assertEquals(carbs, nutritionInfo.getCarbohydrates());
        assertEquals(fiber, nutritionInfo.getFiber());
        assertEquals(sodium, nutritionInfo.getSodium());
    }

    @Test
    void testSettersAndGetters() {
        NutritionInfo nutritionInfo = new NutritionInfo();

        BigDecimal calories = new BigDecimal("350");
        BigDecimal protein = new BigDecimal("20");
        BigDecimal fat = new BigDecimal("15");
        BigDecimal carbs = new BigDecimal("40");
        BigDecimal fiber = new BigDecimal("5");
        BigDecimal sodium = new BigDecimal("200");

        nutritionInfo.setCalories(calories);
        nutritionInfo.setProtein(protein);
        nutritionInfo.setFat(fat);
        nutritionInfo.setCarbohydrates(carbs);
        nutritionInfo.setFiber(fiber);
        nutritionInfo.setSodium(sodium);

        assertEquals(calories, nutritionInfo.getCalories());
        assertEquals(protein, nutritionInfo.getProtein());
        assertEquals(fat, nutritionInfo.getFat());
        assertEquals(carbs, nutritionInfo.getCarbohydrates());
        assertEquals(fiber, nutritionInfo.getFiber());
        assertEquals(sodium, nutritionInfo.getSodium());
    }

    @Test
    void testNullValues() {
        NutritionInfo nutritionInfo = new NutritionInfo(null, null, null, null, null, null);

        assertNull(nutritionInfo.getCalories());
        assertNull(nutritionInfo.getProtein());
        assertNull(nutritionInfo.getFat());
        assertNull(nutritionInfo.getCarbohydrates());
        assertNull(nutritionInfo.getFiber());
        assertNull(nutritionInfo.getSodium());
    }

    @Test
    void testDecimalPrecision() {
        BigDecimal calories = new BigDecimal("123.456");
        BigDecimal protein = new BigDecimal("10.123");

        NutritionInfo nutritionInfo = new NutritionInfo();
        nutritionInfo.setCalories(calories);
        nutritionInfo.setProtein(protein);

        assertEquals(new BigDecimal("123.456"), nutritionInfo.getCalories());
        assertEquals(new BigDecimal("10.123"), nutritionInfo.getProtein());
    }
}
