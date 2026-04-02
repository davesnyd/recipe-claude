package com.recipe.dto.importer;

public class ParsedIngredient {
    private Double quantity;  // Can be null for "to taste" items
    private String unit;      // e.g., "tablespoon", "cup", "ounce"
    private String ingredientName;
    private String preparation;  // e.g., "chopped", "sifted"
    private String originalText;  // Keep original for reference

    public ParsedIngredient() {}

    public ParsedIngredient(Double quantity, String unit, String ingredientName, String preparation, String originalText) {
        this.quantity = quantity;
        this.unit = unit;
        this.ingredientName = ingredientName;
        this.preparation = preparation;
        this.originalText = originalText;
    }

    // Getters and Setters
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getIngredientName() { return ingredientName; }
    public void setIngredientName(String ingredientName) { this.ingredientName = ingredientName; }

    public String getPreparation() { return preparation; }
    public void setPreparation(String preparation) { this.preparation = preparation; }

    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }

    @Override
    public String toString() {
        return "ParsedIngredient{" +
                "quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", ingredientName='" + ingredientName + '\'' +
                ", preparation='" + preparation + '\'' +
                ", originalText='" + originalText + '\'' +
                '}';
    }
}
