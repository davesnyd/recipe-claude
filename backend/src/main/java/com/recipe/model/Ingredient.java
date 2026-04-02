package com.recipe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredients")
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_id")
    private Long ingredientId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(precision = 10, scale = 4)
    private BigDecimal density;

    @PositiveOrZero
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal calories = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal protein = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal fat = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal carbohydrates = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(name = "dietary_fiber", nullable = false, precision = 8, scale = 2)
    private BigDecimal dietaryFiber = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal sodium = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Ingredient() {}

    public Ingredient(String name) {
        this.name = name;
    }

    // Getters and Setters
    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getDensity() { return density; }
    public void setDensity(BigDecimal density) { this.density = density; }

    public BigDecimal getCalories() { return calories; }
    public void setCalories(BigDecimal calories) { this.calories = calories; }

    public BigDecimal getProtein() { return protein; }
    public void setProtein(BigDecimal protein) { this.protein = protein; }

    public BigDecimal getFat() { return fat; }
    public void setFat(BigDecimal fat) { this.fat = fat; }

    public BigDecimal getCarbohydrates() { return carbohydrates; }
    public void setCarbohydrates(BigDecimal carbohydrates) { this.carbohydrates = carbohydrates; }

    public BigDecimal getDietaryFiber() { return dietaryFiber; }
    public void setDietaryFiber(BigDecimal dietaryFiber) { this.dietaryFiber = dietaryFiber; }

    public BigDecimal getSodium() { return sodium; }
    public void setSodium(BigDecimal sodium) { this.sodium = sodium; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}