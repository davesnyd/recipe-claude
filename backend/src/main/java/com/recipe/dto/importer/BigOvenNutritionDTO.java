package com.recipe.dto.importer;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BigOvenNutritionDTO {

    @JsonProperty("@type")
    private String type;

    private String calories;  // e.g., "999 calories"

    private String fatContent;  // e.g., "92.01542375 g"

    private String carbohydrateContent;

    private String cholesterolContent;

    private String fiberContent;

    private String proteinContent;

    private String saturatedFatContent;

    private String servingSize;

    private String sodiumContent;

    private String sugarContent;

    private String transFatContent;

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCalories() { return calories; }
    public void setCalories(String calories) { this.calories = calories; }

    public String getFatContent() { return fatContent; }
    public void setFatContent(String fatContent) { this.fatContent = fatContent; }

    public String getCarbohydrateContent() { return carbohydrateContent; }
    public void setCarbohydrateContent(String carbohydrateContent) { this.carbohydrateContent = carbohydrateContent; }

    public String getCholesterolContent() { return cholesterolContent; }
    public void setCholesterolContent(String cholesterolContent) { this.cholesterolContent = cholesterolContent; }

    public String getFiberContent() { return fiberContent; }
    public void setFiberContent(String fiberContent) { this.fiberContent = fiberContent; }

    public String getProteinContent() { return proteinContent; }
    public void setProteinContent(String proteinContent) { this.proteinContent = proteinContent; }

    public String getSaturatedFatContent() { return saturatedFatContent; }
    public void setSaturatedFatContent(String saturatedFatContent) { this.saturatedFatContent = saturatedFatContent; }

    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }

    public String getSodiumContent() { return sodiumContent; }
    public void setSodiumContent(String sodiumContent) { this.sodiumContent = sodiumContent; }

    public String getSugarContent() { return sugarContent; }
    public void setSugarContent(String sugarContent) { this.sugarContent = sugarContent; }

    public String getTransFatContent() { return transFatContent; }
    public void setTransFatContent(String transFatContent) { this.transFatContent = transFatContent; }
}
