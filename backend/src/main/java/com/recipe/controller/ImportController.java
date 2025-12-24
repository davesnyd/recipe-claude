package com.recipe.controller;

import com.recipe.model.Recipe;
import com.recipe.service.RecipeImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/import")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ImportController {

    private static final Logger logger = LoggerFactory.getLogger(ImportController.class);

    @Autowired
    private RecipeImportService recipeImportService;

    @PostMapping("/bigoven")
    public ResponseEntity<?> importFromBigOven(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        logger.info("Import request received from user: {}", authentication.getName());

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "File is empty")
                );
            }

            // Check file type
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".html")) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "File must be an HTML file")
                );
            }

            // Read HTML content
            String htmlContent = new String(file.getBytes(), StandardCharsets.UTF_8);

            // Import recipe
            Recipe importedRecipe = recipeImportService.importFromBigOvenHtml(
                    htmlContent,
                    authentication.getName()
            );

            logger.info("Successfully imported recipe: {} (ID: {})",
                    importedRecipe.getTitle(), importedRecipe.getRecipeId());

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Recipe imported successfully");
            response.put("recipeId", importedRecipe.getRecipeId());
            response.put("title", importedRecipe.getTitle());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid import data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        } catch (IOException e) {
            logger.error("Error reading file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error reading file: " + e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Error importing recipe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error importing recipe: " + e.getMessage())
            );
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Import endpoint is working");
    }
}
