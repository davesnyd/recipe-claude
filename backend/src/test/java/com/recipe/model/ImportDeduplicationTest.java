package com.recipe.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verifies the title-based deduplication logic used during recipe import.
 * Simulates what RecipeRepository.existsByTitleIgnoreCaseAndCreateUsername would check.
 */
public class ImportDeduplicationTest {

    /** Simulates the repository check using an in-memory list. */
    private boolean titleExistsForUser(List<Recipe> existing, String title, String username) {
        return existing.stream().anyMatch(r ->
            r.getTitle().equalsIgnoreCase(title) &&
            r.getCreateUsername().equals(username)
        );
    }

    @Test
    void duplicateTitleSameUserIsDetected() {
        Recipe existing = new Recipe();
        existing.setTitle("Apple Pie");
        existing.setCreateUsername("chef@example.com");

        assertTrue(titleExistsForUser(List.of(existing), "Apple Pie", "chef@example.com"));
    }

    @Test
    void duplicateCheckIsCaseInsensitive() {
        Recipe existing = new Recipe();
        existing.setTitle("Apple Pie");
        existing.setCreateUsername("chef@example.com");

        assertTrue(titleExistsForUser(List.of(existing), "apple pie", "chef@example.com"));
        assertTrue(titleExistsForUser(List.of(existing), "APPLE PIE", "chef@example.com"));
    }

    @Test
    void sameTitleDifferentUserIsNotADuplicate() {
        Recipe existing = new Recipe();
        existing.setTitle("Apple Pie");
        existing.setCreateUsername("chef@example.com");

        assertFalse(titleExistsForUser(List.of(existing), "Apple Pie", "other@example.com"));
    }

    @Test
    void differentTitleSameUserIsNotADuplicate() {
        Recipe existing = new Recipe();
        existing.setTitle("Apple Pie");
        existing.setCreateUsername("chef@example.com");

        assertFalse(titleExistsForUser(List.of(existing), "Banana Bread", "chef@example.com"));
    }

    @Test
    void emptyCollectionIsNeverADuplicate() {
        assertFalse(titleExistsForUser(List.of(), "Apple Pie", "chef@example.com"));
    }
}
