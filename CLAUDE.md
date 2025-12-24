# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Testing Requirements

**CRITICAL**: All code changes must include comprehensive automated testing. Follow these requirements without exception:

### 1. New Functionality
When creating new functionality:
- Create all appropriate automated tests for both backend (JUnit) and frontend (Jest/React Testing Library)
- Tests must cover the happy path, edge cases, and error conditions
- Run the new tests and fix any failures before considering the work complete

### 2. Bug Fixes
When fixing a bug:
- Create tests that reproduce the bug and confirm the fix works
- Create tests for related functionality to ensure nothing else broke
- Tests must be written for both backend and frontend as applicable

### 3. Test Execution - Immediate
After creating or modifying code:
- Run all automated tests for the affected functionality
- Keep working to fix issues until all related tests pass
- Do not consider work complete until tests are green

### 4. Test Execution - Full Suite
After getting immediate tests working:
- Run the complete test suite for the entire application
- Fix any failures that appear in other tests
- Keep running and fixing until the full test suite passes

### Test Commands
```bash
# Backend tests (run inside Docker or locally with Maven)
docker exec recipe-backend bash -c "cd /app && mvn test"
docker exec recipe-backend bash -c "cd /app && mvn test -Dtest=SpecificTestClass"

# Frontend tests
docker exec recipe-frontend npm test
docker exec recipe-frontend npm test -- --testPathPattern=SpecificTest
```

## Project Overview

This is a recipe management application with three main components:
- **Frontend**: React-based web application with OAuth Google authentication
- **Backend**: Spring Boot Java application with REST API endpoints
- **Database**: PostgreSQL with recipe, user, ingredient, and measurement tables

The application allows users to create, edit, and share recipes with nutritional information and step-by-step instructions.

## Architecture

### Database Schema
- **Users**: username (Google OAuth), user_id, measurement preference (Imperial/Metric)
- **Recipes**: recipe_id, title, description, serving_count, is_public, creation_date, create_username, photo, note
- **Ingredients**: density, calories, protein, fat, carbohydrates, fiber, sodium
- **Recipe-Ingredients**: links recipes to ingredients with quantity and unit
- **Steps**: text and optional photos for each recipe step
- **Favorites**: user-recipe relationship table
- **Measurements**: predefined units for Imperial/Metric systems

### Key Features
- Three main views: "My Recipes", "Favorites", "All Recipes"
- Recipe search by date, user, visibility, title, description, ingredients
- Nutritional calculation based on ingredient quantities
- Photo upload for recipes and steps
- Drag-and-drop reordering for ingredients and steps
- Maroon and cream color scheme

### API Endpoints
The Spring backend should expose:
- Recipe search with filtering
- Recipe CRUD operations
- Photo retrieval (recipes and steps)
- Favorite marking/unmarking
- Ingredient management with nutrition data

## Development Notes

### Current Implementation Status
The application is fully implemented and running via Docker Compose with:
- Frontend: React TypeScript application on port 3000
- Backend: Spring Boot Java application on port 8080
- Database: PostgreSQL on port 5433

### Critical Data Structure Mappings

**IMPORTANT**: The backend and frontend use different field names for recipe relationships:

**Backend (Spring Boot/JPA) returns:**
- `recipeIngredients` (List of RecipeIngredient objects)
- `recipeSteps` (List of RecipeStep objects)

**Frontend TypeScript types expect:**
- `ingredients` (Recipe interface)
- `steps` (Recipe interface)

**When working with recipe data display/editing, always use:**
- `(recipe as any).recipeIngredients` for ingredients
- `(recipe as any).recipeSteps` for steps

### Key Technical Details

**JPA Entity Relationships:**
- Recipe has `@OneToMany` with `FetchType.EAGER` for both ingredients and steps
- Uses `@JsonManagedReference`/`@JsonBackReference` to prevent circular JSON serialization
- Cascade operations handle creation/deletion of child entities

**Jackson Serialization:**
- Hibernate6Module is configured with `FORCE_LAZY_LOADING = true` to properly serialize lazy-loaded entities
- This ensures related entities (like Measurement) are fully serialized in API responses

**API Request/Response Format:**
- POST/PUT endpoints accept `Map<String, Object>` with separate `ingredients` and `steps` arrays
- GET endpoints return Recipe entities with `recipeIngredients` and `recipeSteps` fields
- Service layer handles conversion between frontend format and JPA entities

**Docker Environment:**
- Run `docker compose up -d` to start all services
- Run `docker compose down` to stop (preserves data in volumes)
- Run `docker compose build [service]` to rebuild after code changes
- Database data persists in `postgres_data` Docker volume

### Development Commands
- **Start application**: `docker compose up -d`
- **Rebuild frontend**: `docker compose build frontend`
- **Rebuild backend**: `docker compose build backend`
- **View logs**: `docker compose logs [service]`
- **Stop application**: `docker compose down`

### Security Configuration

**Environment Variables:**
- Sensitive data (OAuth secrets, JWT secrets) stored in `.env` file (gitignored)
- Use `.env.example` as template with placeholder values
- Never commit actual credentials to version control

**Google OAuth Setup:**
- Client ID/Secret obtained from Google Cloud Console
- Configured in Spring Boot via environment variables
- Frontend uses same Client ID for authentication

**JWT Configuration:**
- JWT secret should be 64+ character secure random string
- Default fallback in application.yml is for development only

### Common Pitfalls to Avoid
1. **Field name mismatch**: Always check if frontend expects `ingredients/steps` vs backend returns `recipeIngredients/recipeSteps`
2. **JSON parsing errors**: Backend controllers use `Map<String, Object>` for complex requests, not direct entity binding
3. **Hibernate cascading**: Use `clear()` and `addAll()` when replacing collections in JPA entities
4. **Container rebuilds**: Code changes require rebuilding the specific Docker service
5. **Database persistence**: `docker compose down` removes containers but preserves data in volumes
6. **Security exposure**: Never commit `.env` file - use `.env.example` template instead
7. **Skipping tests**: Never skip the testing requirements - all changes must have tests and all tests must pass
