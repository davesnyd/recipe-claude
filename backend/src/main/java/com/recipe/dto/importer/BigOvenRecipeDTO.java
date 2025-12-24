package com.recipe.dto.importer;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BigOvenRecipeDTO {

    @JsonProperty("@context")
    private String context;

    @JsonProperty("@type")
    private String type;

    private String name;

    private BigOvenAuthorDTO author;

    private String datePublished;

    private List<String> image;

    private String description;

    private String prepTime;  // ISO 8601 duration format (e.g., "PT30M")

    private String cookTime;

    private String totalTime;

    private String recipeCategory;

    private String recipeCuisine;

    private String recipeYield;  // Can be string like "2" or "2 servings"

    private String keywords;

    private BigOvenNutritionDTO nutrition;

    private List<String> recipeIngredient;

    private List<String> recipeInstructions;

    // Getters and Setters
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigOvenAuthorDTO getAuthor() { return author; }
    public void setAuthor(BigOvenAuthorDTO author) { this.author = author; }

    public String getDatePublished() { return datePublished; }
    public void setDatePublished(String datePublished) { this.datePublished = datePublished; }

    public List<String> getImage() { return image; }
    public void setImage(List<String> image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPrepTime() { return prepTime; }
    public void setPrepTime(String prepTime) { this.prepTime = prepTime; }

    public String getCookTime() { return cookTime; }
    public void setCookTime(String cookTime) { this.cookTime = cookTime; }

    public String getTotalTime() { return totalTime; }
    public void setTotalTime(String totalTime) { this.totalTime = totalTime; }

    public String getRecipeCategory() { return recipeCategory; }
    public void setRecipeCategory(String recipeCategory) { this.recipeCategory = recipeCategory; }

    public String getRecipeCuisine() { return recipeCuisine; }
    public void setRecipeCuisine(String recipeCuisine) { this.recipeCuisine = recipeCuisine; }

    public String getRecipeYield() { return recipeYield; }
    public void setRecipeYield(String recipeYield) { this.recipeYield = recipeYield; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public BigOvenNutritionDTO getNutrition() { return nutrition; }
    public void setNutrition(BigOvenNutritionDTO nutrition) { this.nutrition = nutrition; }

    public List<String> getRecipeIngredient() { return recipeIngredient; }
    public void setRecipeIngredient(List<String> recipeIngredient) { this.recipeIngredient = recipeIngredient; }

    public List<String> getRecipeInstructions() { return recipeInstructions; }
    public void setRecipeInstructions(List<String> recipeInstructions) { this.recipeInstructions = recipeInstructions; }
}
