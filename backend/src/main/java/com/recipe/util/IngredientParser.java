package com.recipe.util;

import com.recipe.dto.importer.ParsedIngredient;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class IngredientParser {

    // Unit mapping from various forms to database standard
    private static final Map<String, String> UNIT_MAPPINGS = new HashMap<>();

    static {
        // Volume units
        UNIT_MAPPINGS.put("tbsp", "tablespoon");
        UNIT_MAPPINGS.put("tablespoon", "tablespoon");
        UNIT_MAPPINGS.put("tablespoons", "tablespoon");
        UNIT_MAPPINGS.put("tsp", "teaspoon");
        UNIT_MAPPINGS.put("teaspoon", "teaspoon");
        UNIT_MAPPINGS.put("teaspoons", "teaspoon");
        UNIT_MAPPINGS.put("cup", "cup");
        UNIT_MAPPINGS.put("cups", "cup");
        UNIT_MAPPINGS.put("c", "cup");
        UNIT_MAPPINGS.put("pint", "pint");
        UNIT_MAPPINGS.put("pints", "pint");
        UNIT_MAPPINGS.put("quart", "quart");
        UNIT_MAPPINGS.put("quarts", "quart");
        UNIT_MAPPINGS.put("gallon", "gallon");
        UNIT_MAPPINGS.put("gallons", "gallon");
        UNIT_MAPPINGS.put("ml", "milliliter");
        UNIT_MAPPINGS.put("milliliter", "milliliter");
        UNIT_MAPPINGS.put("milliliters", "milliliter");
        UNIT_MAPPINGS.put("l", "liter");
        UNIT_MAPPINGS.put("liter", "liter");
        UNIT_MAPPINGS.put("liters", "liter");

        // Weight units
        UNIT_MAPPINGS.put("oz", "ounce");
        UNIT_MAPPINGS.put("ounce", "ounce");
        UNIT_MAPPINGS.put("ounces", "ounce");
        UNIT_MAPPINGS.put("lb", "pound");
        UNIT_MAPPINGS.put("lbs", "pound");
        UNIT_MAPPINGS.put("pound", "pound");
        UNIT_MAPPINGS.put("pounds", "pound");
        UNIT_MAPPINGS.put("g", "gram");
        UNIT_MAPPINGS.put("gram", "gram");
        UNIT_MAPPINGS.put("grams", "gram");
        UNIT_MAPPINGS.put("kg", "kilogram");
        UNIT_MAPPINGS.put("kilogram", "kilogram");
        UNIT_MAPPINGS.put("kilograms", "kilogram");
        UNIT_MAPPINGS.put("mg", "milligram");
        UNIT_MAPPINGS.put("milligram", "milligram");
        UNIT_MAPPINGS.put("milligrams", "milligram");

        // Special units
        UNIT_MAPPINGS.put("stick", "tablespoon");  // 1 stick butter = 8 TBSP
        UNIT_MAPPINGS.put("sticks", "tablespoon");
    }

    // Regex pattern to parse ingredient strings
    // Matches: [quantity] [fraction] [unit] [ingredient name]
    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(
            "^\\s*" +                                  // Leading whitespace
            "(?:(\\d+/\\d+|\\d+(?:\\.\\d+)?)\\s*)?" +  // Optional quantity (fraction first, then number)
            "(?:(\\d+)/(\\d+)\\s*)?" +                 // Optional separate fraction (for "1 1/2")
            "(?:([a-zA-Z]+)\\s+)?" +                   // Optional unit
            "(?:of\\s+)?" +                            // Optional "of"
            "(.+?)\\s*$"                               // Ingredient name (rest of string)
    );

    // Pattern for preparation terms
    private static final Pattern PREPARATION_PATTERN = Pattern.compile(
            ",\\s*(.+)$"  // Comma followed by preparation like ", chopped"
    );

    public ParsedIngredient parse(String ingredientText) {
        if (ingredientText == null || ingredientText.trim().isEmpty()) {
            return null;
        }

        String original = ingredientText;
        ingredientText = ingredientText.trim();

        ParsedIngredient result = new ParsedIngredient();
        result.setOriginalText(original);

        // Try to match the ingredient pattern
        Matcher matcher = INGREDIENT_PATTERN.matcher(ingredientText);

        if (matcher.matches()) {
            // Extract quantity
            String quantityStr = matcher.group(1);
            String fractionNum = matcher.group(2);
            String fractionDen = matcher.group(3);
            String unitStr = matcher.group(4);
            String ingredientName = matcher.group(5);

            // Parse quantity
            Double quantity = parseQuantity(quantityStr, fractionNum, fractionDen);
            result.setQuantity(quantity);

            // Parse unit - only recognize known units
            if (unitStr != null && !unitStr.isEmpty()) {
                String normalizedUnit = UNIT_MAPPINGS.get(unitStr.toLowerCase());
                if (normalizedUnit != null) {
                    result.setUnit(normalizedUnit);

                    // Handle special case: stick of butter = 8 tablespoons
                    if ("stick".equalsIgnoreCase(unitStr) && quantity != null) {
                        result.setQuantity(quantity * 8);
                    }
                } else {
                    // Not a recognized unit - prepend it to ingredient name
                    ingredientName = unitStr + " " + ingredientName;
                }
            }

            // Parse ingredient name and preparation
            if (ingredientName != null && !ingredientName.isEmpty()) {
                Matcher prepMatcher = PREPARATION_PATTERN.matcher(ingredientName);
                if (prepMatcher.find()) {
                    result.setPreparation(prepMatcher.group(1).trim());
                    ingredientName = ingredientName.substring(0, prepMatcher.start()).trim();
                }

                result.setIngredientName(ingredientName.trim());
            }
        } else {
            // If pattern doesn't match, treat whole string as ingredient name
            result.setIngredientName(ingredientText);
        }

        return result;
    }

    private Double parseQuantity(String quantityStr, String fractionNum, String fractionDen) {
        Double quantity = null;

        // Parse whole number or decimal
        if (quantityStr != null && !quantityStr.isEmpty()) {
            if (quantityStr.contains("/")) {
                // Handle fraction like "1/2"
                String[] parts = quantityStr.split("/");
                if (parts.length == 2) {
                    try {
                        double num = Double.parseDouble(parts[0].trim());
                        double den = Double.parseDouble(parts[1].trim());
                        quantity = num / den;
                    } catch (NumberFormatException e) {
                        // Ignore, quantity will be null
                    }
                }
            } else {
                try {
                    quantity = Double.parseDouble(quantityStr);
                } catch (NumberFormatException e) {
                    // Ignore, quantity will be null
                }
            }
        }

        // Add fraction if present (e.g., "1 1/2" = 1.5)
        if (fractionNum != null && fractionDen != null) {
            try {
                double num = Double.parseDouble(fractionNum.trim());
                double den = Double.parseDouble(fractionDen.trim());
                double fraction = num / den;
                quantity = (quantity != null ? quantity : 0) + fraction;
            } catch (NumberFormatException e) {
                // Ignore
            }
        }

        return quantity;
    }

    private String normalizeUnit(String unit) {
        if (unit == null || unit.isEmpty()) {
            return null;
        }

        String normalized = UNIT_MAPPINGS.get(unit.toLowerCase());
        return normalized != null ? normalized : unit.toLowerCase();
    }
}
