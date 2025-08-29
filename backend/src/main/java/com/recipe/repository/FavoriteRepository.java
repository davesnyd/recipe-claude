package com.recipe.repository;

import com.recipe.model.Favorite;
import com.recipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUsername(String username);
    
    @Query("SELECT f.recipe FROM Favorite f WHERE f.username = :username")
    List<Recipe> findFavoriteRecipesByUsername(@Param("username") String username);
    
    Optional<Favorite> findByUsernameAndRecipe(String username, Recipe recipe);
    
    boolean existsByUsernameAndRecipe(String username, Recipe recipe);
    
    void deleteByUsernameAndRecipe(String username, Recipe recipe);
}