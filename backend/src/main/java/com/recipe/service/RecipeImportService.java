package com.recipe.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipe.dto.importer.BigOvenRecipeDTO;
import com.recipe.dto.importer.ParsedIngredient;
import com.recipe.model.*;
import com.recipe.repository.*;
import com.recipe.util.IngredientParser;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RecipeImportService {

    private static final Logger logger = LoggerFactory.getLogger(RecipeImportService.class);

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private MeasurementRepository measurementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IngredientParser ingredientParser;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Recipe importFromBigOvenHtml(String htmlContent, String username) throws Exception {
        logger.info("Starting BigOven import for user: {}", username);

        // 1. Parse HTML and extract JSON-LD
        BigOvenRecipeDTO bigOvenRecipe = extractJsonLdFromHtml(htmlContent);

        if (bigOvenRecipe == null || bigOvenRecipe.getName() == null) {
            throw new IllegalArgumentException("Could not extract recipe data from HTML");
        }

        logger.info("Extracted recipe: {}", bigOvenRecipe.getName());

        // 1b. Check for duplicate — skip if user already has a recipe with this title
        if (recipeRepository.existsByTitleIgnoreCaseAndCreateUsername(bigOvenRecipe.getName(), username)) {
            throw new IllegalArgumentException(
                "Recipe \"" + bigOvenRecipe.getName() + "\" already exists in your collection");
        }

        // 2. Create Recipe entity
        Recipe recipe = new Recipe();
        recipe.setTitle(bigOvenRecipe.getName());

        // Set description (handle "not set" from BigOven)
        String description = bigOvenRecipe.getDescription();
        if (description != null && !"not set".equalsIgnoreCase(description.trim())) {
            recipe.setDescription(description);
        }

        // Parse serving count
        recipe.setServingCount(parseServingCount(bigOvenRecipe.getRecipeYield()));

        // Set as private by default
        recipe.setIsPublic(false);

        // Build note with additional metadata
        recipe.setNote(buildNoteFromBigOven(bigOvenRecipe));

        // Set user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        recipe.setCreateUsername(user.getUsername());

        // 3. Parse and add ingredients
        List<RecipeIngredient> recipeIngredients = parseIngredients(bigOvenRecipe.getRecipeIngredient());
        recipe.setRecipeIngredients(recipeIngredients);

        // Set recipe reference for ingredients
        for (RecipeIngredient ri : recipeIngredients) {
            ri.setRecipe(recipe);
        }

        // 4. Parse and add instructions
        List<RecipeStep> recipeSteps = parseInstructions(bigOvenRecipe.getRecipeInstructions());
        recipe.setRecipeSteps(recipeSteps);

        // Set recipe reference for steps
        for (RecipeStep rs : recipeSteps) {
            rs.setRecipe(recipe);
        }

        // 5. Save recipe
        Recipe savedRecipe = recipeRepository.save(recipe);
        logger.info("Successfully imported recipe: {} (ID: {})", savedRecipe.getTitle(), savedRecipe.getRecipeId());

        return savedRecipe;
    }

    private BigOvenRecipeDTO extractJsonLdFromHtml(String htmlContent) throws Exception {
        Document doc = Jsoup.parse(htmlContent);

        // Find the JSON-LD script tag
        Element jsonLdElement = doc.selectFirst("script[type=application/ld+json]");

        if (jsonLdElement == null) {
            throw new IllegalArgumentException("No JSON-LD data found in HTML");
        }

        String jsonContent = jsonLdElement.html();
        logger.debug("Found JSON-LD: {}", jsonContent);

        // Parse JSON to DTO
        return objectMapper.readValue(jsonContent, BigOvenRecipeDTO.class);
    }

    private List<RecipeIngredient> parseIngredients(List<String> ingredientStrings) {
        List<RecipeIngredient> result = new ArrayList<>();

        if (ingredientStrings == null || ingredientStrings.isEmpty()) {
            return result;
        }

        int order = 1;
        for (String ingredientText : ingredientStrings) {
            logger.debug("Parsing ingredient: {}", ingredientText);

            // BigOven format is "Name: Quantity Unit" - convert to "Quantity Unit Name"
            String normalizedText = normalizeBigOvenIngredient(ingredientText);
            logger.debug("Normalized ingredient: {}", normalizedText);

            ParsedIngredient parsed = ingredientParser.parse(normalizedText);

            if (parsed != null && parsed.getIngredientName() != null) {
                RecipeIngredient recipeIngredient = new RecipeIngredient();

                // Find or create ingredient
                Ingredient ingredient = findOrCreateIngredient(parsed.getIngredientName());
                recipeIngredient.setIngredient(ingredient);

                // Set quantity - default to 1 if not parsed
                if (parsed.getQuantity() != null) {
                    recipeIngredient.setQuantity(java.math.BigDecimal.valueOf(parsed.getQuantity()));
                } else {
                    recipeIngredient.setQuantity(java.math.BigDecimal.valueOf(1.0));
                    logger.warn("No quantity found for ingredient '{}', defaulting to 1", parsed.getIngredientName());
                }

                // Find measurement by name (use findFirstByMeasurementName to handle duplicates like "ounce")
                if (parsed.getUnit() != null) {
                    Measurement measurement = measurementRepository.findFirstByMeasurementName(parsed.getUnit())
                            .orElse(null);
                    if (measurement != null) {
                        recipeIngredient.setMeasurement(measurement);
                    } else {
                        logger.warn("Measurement not found: {}. Using default.", parsed.getUnit());
                        // Use a default measurement or handle error
                        Measurement defaultMeasurement = measurementRepository.findFirstByMeasurementName("cup")
                                .orElseThrow(() -> new RuntimeException("Default measurement not found"));
                        recipeIngredient.setMeasurement(defaultMeasurement);
                    }
                } else {
                    // No unit specified, use a default
                    Measurement defaultMeasurement = measurementRepository.findFirstByMeasurementName("cup")
                            .orElseThrow(() -> new RuntimeException("Default measurement not found"));
                    recipeIngredient.setMeasurement(defaultMeasurement);
                }

                // Set preparation if present
                if (parsed.getPreparation() != null) {
                    recipeIngredient.setPreparation(parsed.getPreparation());
                }

                // Set order
                recipeIngredient.setIngredientOrder(order++);

                result.add(recipeIngredient);
                logger.debug("Parsed ingredient: {}", parsed);
            }
        }

        return result;
    }

    /**
     * Normalize BigOven ingredient format from "Name: Quantity Unit" to "Quantity Unit Name"
     */
    private String normalizeBigOvenIngredient(String ingredientText) {
        if (ingredientText == null) {
            return null;
        }

        ingredientText = ingredientText.trim();

        // BigOven format: "Sugar: 2 TBSP" or "Wheat Flour: 3 Cups"
        // Check if it matches the BigOven format (contains colon with quantity after)
        int colonIndex = ingredientText.indexOf(':');
        if (colonIndex > 0) {
            String namePart = ingredientText.substring(0, colonIndex).trim();
            String quantityUnitPart = ingredientText.substring(colonIndex + 1).trim();

            // Check if quantityUnitPart starts with a number or fraction
            if (quantityUnitPart.matches("^[\\d/].*")) {
                // Reformat to "Quantity Unit Name"
                return quantityUnitPart + " " + namePart;
            }
        }

        // Return as-is if it doesn't match BigOven format
        return ingredientText;
    }

    private Ingredient findOrCreateIngredient(String name) {
        String normalizedName = name.trim().toLowerCase();

        return ingredientRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> {
                    Ingredient newIngredient = new Ingredient();
                    newIngredient.setName(normalizedName);
                    // Set default nutritional values (all zeros)
                    newIngredient.setCalories(java.math.BigDecimal.valueOf(0.0));
                    newIngredient.setProtein(java.math.BigDecimal.valueOf(0.0));
                    newIngredient.setFat(java.math.BigDecimal.valueOf(0.0));
                    newIngredient.setCarbohydrates(java.math.BigDecimal.valueOf(0.0));
                    newIngredient.setDietaryFiber(java.math.BigDecimal.valueOf(0.0));
                    newIngredient.setSodium(java.math.BigDecimal.valueOf(0.0));

                    logger.info("Creating new ingredient: {}", normalizedName);
                    return ingredientRepository.save(newIngredient);
                });
    }

    private List<RecipeStep> parseInstructions(List<String> instructionStrings) {
        List<RecipeStep> result = new ArrayList<>();

        if (instructionStrings == null || instructionStrings.isEmpty()) {
            return result;
        }

        // BigOven often has instructions as a single concatenated string
        // Split on common sentence terminators
        String fullInstructions = String.join(" ", instructionStrings);

        // Split by periods followed by spaces and capital letters, or double spaces
        String[] sentences = fullInstructions.split("(?<=\\.)\\s+(?=[A-Z])|\\s{2,}");

        int stepNumber = 1;
        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (!trimmed.isEmpty() && trimmed.length() > 5) {  // Filter out very short fragments
                RecipeStep step = new RecipeStep();
                step.setStepNumber(stepNumber++);
                step.setStepText(trimmed);
                result.add(step);
            }
        }

        logger.info("Created {} steps from instructions", result.size());
        return result;
    }

    private int parseServingCount(String servingYield) {
        if (servingYield == null || servingYield.isEmpty()) {
            return 1;
        }

        // Extract first number from string
        Pattern pattern = Pattern.compile("(\\d+)");
        Matcher matcher = pattern.matcher(servingYield);

        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return 1;
            }
        }

        return 1;
    }

    private String buildNoteFromBigOven(BigOvenRecipeDTO bigOvenRecipe) {
        StringBuilder note = new StringBuilder();

        note.append("Imported from BigOven\n\n");

        if (bigOvenRecipe.getRecipeCategory() != null &&
                !"not set".equalsIgnoreCase(bigOvenRecipe.getRecipeCategory())) {
            note.append("Category: ").append(bigOvenRecipe.getRecipeCategory()).append("\n");
        }

        if (bigOvenRecipe.getPrepTime() != null) {
            note.append("Prep Time: ").append(formatDuration(bigOvenRecipe.getPrepTime())).append("\n");
        }

        if (bigOvenRecipe.getCookTime() != null) {
            note.append("Cook Time: ").append(formatDuration(bigOvenRecipe.getCookTime())).append("\n");
        }

        // Add nutrition info if available
        if (bigOvenRecipe.getNutrition() != null) {
            note.append("\nNutritional Information (per serving):\n");
            note.append("Calories: ").append(bigOvenRecipe.getNutrition().getCalories()).append("\n");
            if (bigOvenRecipe.getNutrition().getProteinContent() != null) {
                note.append("Protein: ").append(bigOvenRecipe.getNutrition().getProteinContent()).append("\n");
            }
            if (bigOvenRecipe.getNutrition().getFatContent() != null) {
                note.append("Fat: ").append(bigOvenRecipe.getNutrition().getFatContent()).append("\n");
            }
            if (bigOvenRecipe.getNutrition().getCarbohydrateContent() != null) {
                note.append("Carbohydrates: ").append(bigOvenRecipe.getNutrition().getCarbohydrateContent()).append("\n");
            }
        }

        return note.toString();
    }

    private String formatDuration(String isoDuration) {
        // Convert ISO 8601 duration (e.g., "PT30M") to readable format
        if (isoDuration == null || !isoDuration.startsWith("PT")) {
            return isoDuration;
        }

        String duration = isoDuration.substring(2);  // Remove "PT"
        return duration.replace("H", " hours ")
                .replace("M", " minutes")
                .replace("S", " seconds")
                .trim();
    }
}
