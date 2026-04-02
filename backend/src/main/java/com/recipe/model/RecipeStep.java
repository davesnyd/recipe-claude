package com.recipe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "recipe_steps")
public class RecipeStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "step_id")
    private Long stepId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @NotNull
    @JsonBackReference("recipe-steps")
    private Recipe recipe;

    @Positive
    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @NotBlank
    @Column(name = "step_text", nullable = false, columnDefinition = "TEXT")
    private String stepText;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    // Constructors
    public RecipeStep() {}

    public RecipeStep(Recipe recipe, Integer stepNumber, String stepText) {
        this.recipe = recipe;
        this.stepNumber = stepNumber;
        this.stepText = stepText;
    }

    // Getters and Setters
    public Long getStepId() { return stepId; }
    public void setStepId(Long stepId) { this.stepId = stepId; }

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getStepText() { return stepText; }
    public void setStepText(String stepText) { this.stepText = stepText; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}