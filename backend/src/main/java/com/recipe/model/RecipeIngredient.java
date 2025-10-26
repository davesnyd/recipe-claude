package com.recipe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredients")
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recipe_ingredient_id")
    private Long recipeIngredientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @NotNull
    @JsonBackReference("recipe-ingredients")
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    @NotNull
    private Ingredient ingredient;

    @Positive
    @Column(nullable = true, precision = 10, scale = 3)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measurement_id", nullable = false)
    @NotNull
    private Measurement measurement;

    @Column(name = "ingredient_order", nullable = false)
    private Integer ingredientOrder = 1;

    // Constructors
    public RecipeIngredient() {}

    public RecipeIngredient(Recipe recipe, Ingredient ingredient, BigDecimal quantity, Measurement measurement) {
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.measurement = measurement;
    }

    // Getters and Setters
    public Long getRecipeIngredientId() { return recipeIngredientId; }
    public void setRecipeIngredientId(Long recipeIngredientId) { this.recipeIngredientId = recipeIngredientId; }

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }

    public Ingredient getIngredient() { return ingredient; }
    public void setIngredient(Ingredient ingredient) { this.ingredient = ingredient; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public Measurement getMeasurement() { return measurement; }
    public void setMeasurement(Measurement measurement) { this.measurement = measurement; }

    public Integer getIngredientOrder() { return ingredientOrder; }
    public void setIngredientOrder(Integer ingredientOrder) { this.ingredientOrder = ingredientOrder; }
}