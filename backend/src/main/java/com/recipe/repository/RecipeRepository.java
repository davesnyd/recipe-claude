package com.recipe.repository;

import com.recipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    List<Recipe> findByCreateUsername(String username);
    
    List<Recipe> findByIsPublicTrue();
    
    @Query("SELECT r FROM Recipe r WHERE " +
           "(r.createUsername = :username OR r.isPublic = true) AND " +
           "(:title IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:description IS NULL OR LOWER(r.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:note IS NULL OR LOWER(r.note) LIKE LOWER(CONCAT('%', :note, '%'))) AND " +
           "(:createUsername IS NULL OR LOWER(r.createUsername) LIKE LOWER(CONCAT('%', :createUsername, '%'))) AND " +
           "(:isPublic IS NULL OR r.isPublic = :isPublic) AND " +
           "(:startDate IS NULL OR r.creationDate >= :startDate) AND " +
           "(:endDate IS NULL OR r.creationDate <= :endDate)")
    List<Recipe> searchRecipes(
        @Param("username") String currentUsername,
        @Param("title") String title,
        @Param("description") String description,
        @Param("note") String note,
        @Param("createUsername") String createUsername,
        @Param("isPublic") Boolean isPublic,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT r FROM Recipe r JOIN r.recipeIngredients ri JOIN ri.ingredient i WHERE " +
           "(r.createUsername = :username OR r.isPublic = true) AND " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :ingredient, '%'))")
    List<Recipe> findByIngredientName(@Param("username") String currentUsername, 
                                    @Param("ingredient") String ingredient);
}