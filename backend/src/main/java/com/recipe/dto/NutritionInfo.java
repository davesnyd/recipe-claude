package com.recipe.dto;

import java.math.BigDecimal;

public class NutritionInfo {
    private BigDecimal calories;
    private BigDecimal protein;
    private BigDecimal fat;
    private BigDecimal carbohydrates;
    private BigDecimal fiber;
    private BigDecimal sodium;

    public NutritionInfo() {}

    public NutritionInfo(BigDecimal calories, BigDecimal protein, BigDecimal fat, 
                        BigDecimal carbohydrates, BigDecimal fiber, BigDecimal sodium) {
        this.calories = calories;
        this.protein = protein;
        this.fat = fat;
        this.carbohydrates = carbohydrates;
        this.fiber = fiber;
        this.sodium = sodium;
    }

    // Getters and Setters
    public BigDecimal getCalories() { return calories; }
    public void setCalories(BigDecimal calories) { this.calories = calories; }

    public BigDecimal getProtein() { return protein; }
    public void setProtein(BigDecimal protein) { this.protein = protein; }

    public BigDecimal getFat() { return fat; }
    public void setFat(BigDecimal fat) { this.fat = fat; }

    public BigDecimal getCarbohydrates() { return carbohydrates; }
    public void setCarbohydrates(BigDecimal carbohydrates) { this.carbohydrates = carbohydrates; }

    public BigDecimal getFiber() { return fiber; }
    public void setFiber(BigDecimal fiber) { this.fiber = fiber; }

    public BigDecimal getSodium() { return sodium; }
    public void setSodium(BigDecimal sodium) { this.sodium = sodium; }
}