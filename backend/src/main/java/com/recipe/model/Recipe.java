package com.recipe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recipes")
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recipe_id")
    private Long recipeId;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Positive
    @Column(name = "serving_count", nullable = false)
    private Integer servingCount = 1;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "creation_date")
    private LocalDateTime creationDate;

    @NotBlank
    @Column(name = "create_username", nullable = false)
    private String createUsername;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @OrderBy("ingredientOrder ASC")
    @JsonManagedReference("recipe-ingredients")
    private List<RecipeIngredient> recipeIngredients;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    @JsonManagedReference("recipe-steps")
    private List<RecipeStep> recipeSteps;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Favorite> favorites;

    @PrePersist
    protected void onCreate() {
        creationDate = LocalDateTime.now();
    }

    // Constructors
    public Recipe() {}

    public Recipe(String title, String createUsername) {
        this.title = title;
        this.createUsername = createUsername;
    }

    // Getters and Setters
    public Long getRecipeId() { return recipeId; }
    public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getServingCount() { return servingCount; }
    public void setServingCount(Integer servingCount) { this.servingCount = servingCount; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public String getCreateUsername() { return createUsername; }
    public void setCreateUsername(String createUsername) { this.createUsername = createUsername; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public List<RecipeIngredient> getRecipeIngredients() { return recipeIngredients; }
    public void setRecipeIngredients(List<RecipeIngredient> recipeIngredients) { this.recipeIngredients = recipeIngredients; }

    public List<RecipeStep> getRecipeSteps() { return recipeSteps; }
    public void setRecipeSteps(List<RecipeStep> recipeSteps) { this.recipeSteps = recipeSteps; }

    public List<Favorite> getFavorites() { return favorites; }
    public void setFavorites(List<Favorite> favorites) { this.favorites = favorites; }
}