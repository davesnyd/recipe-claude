# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Task Workflow

**CRITICAL**: For every task, follow these steps in order without exception:

1. **Write failing tests** — Add test cases that confirm the desired behavior. Run them and confirm they fail (red).
2. **Plan** — Design the implementation with emphasis on readable, secure code that meets the intent. Add any additional tests that make sense. Confirm the new tests also fail.
3. **Implement** — Write the code to make the tests pass.
4. **Add more tests** — Add any additional tests that became apparent during implementation.
5. **Ralph loop (feature)** — Run all tests for this task. If any fail: fix the code, run again. Repeat until all pass (green).
6. **Ralph loop (full suite)** — Run the complete test suite. If any fail: fix, run again. Repeat until fully green.
7. **Move to the next task.**

> **Ralph loop** = run tests → fix failures → run tests → repeat until all green. Never skip to the next task while tests are red.

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
# Backend tests — run locally with Maven (Docker exec also works if containers are up)
cd /home/dms/claude-dev/recipe002/backend
mvn test
mvn test -Dtest=SpecificTestClass

# Frontend tests — run locally (cd into frontend dir first)
cd /home/dms/claude-dev/recipe002/frontend
npx react-scripts test --watchAll=false --forceExit
npx react-scripts test --watchAll=false --forceExit --testPathPattern=SpecificTest
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
- Recipe search by date, user, visibility, title, description, ingredients, category, cuisine, holiday, course, type
- Nutritional calculation based on ingredient quantities
- Photo upload for recipes and steps
- Drag-and-drop reordering for ingredients and steps
- Multi-column sortable recipe table (click column headers; most-recent click = primary sort)
- Export recipes as RecipeML (XML), JSON-LD, or PDF; user can rename the file before downloading
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

### Measurement "unit" Sentinel

The `measurement_id` column on recipe ingredients has a NOT NULL constraint (no DB migration framework to drop it). When the user selects no unit, the backend stores the measurement row named `"unit"` as a sentinel value. **Never expose "unit" in the UI.** All ingredient display locations (list view, PDF, XML, JSON-LD) must call `getMeasurementDisplay()` from `src/utils/ingredientUtils.ts`, which returns an empty string for the sentinel.

### Client-Side Sorting

`src/utils/sortUtils.ts` provides two functions:
- `sortRecipes(recipes, sortKeys)` — stable multi-column sort; `sortKeys[0]` is the primary key
- `applySort(sortKeys, key)` — moves `key` to front (new click = primary), preserving previous keys as tiebreakers

Sort state lives in component state and is not persisted across page refreshes (intentional).

### Backend Quantity Parsing

`QuantityParser.java` converts frontend quantity strings to `BigDecimal` for storage. Supports whole numbers, decimals, fractions (`"1/2"`), and mixed numbers (`"1 1/2"`). The original string is not round-tripped — what the user sees on load is the parsed decimal.

### Java 21 / Maven Compiler

Ubuntu 24.04's OpenJDK 21 ships without `ct.sym` (cross-compilation tables), so `--release N` flags fail. The `pom.xml` overrides the compiler plugin with `<source>21</source><target>21</target>` and `<release combine.self="override"/>` to work around this.

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

### Data Conventions

**Quantity fields** store user-entered strings as-is. This supports:
- Whole numbers: `"2"`
- Decimals: `"1.5"`
- Fractions: `"1/2"`, `"3/4"` (common fractions up to sixteenths)
- Mixed numbers: `"1 1/2"`, `"2 3/4"`

Never coerce quantity strings to floats — preserve the original entry.

**Serving count** is an integer only (no decimals).

**Export filenames** default to `recipe.pdf`, `recipe.json`, or `recipe.xml` depending on the chosen format. Users can rename before downloading.

### Extended Recipe Fields (added 2026-04-01)

The following fields were added to the Recipe schema:
- **category** — free text (e.g. "Italian", "Quick Meals")
- **cuisine** — free text (e.g. "Mexican", "Thai")
- **holiday** — free text (e.g. "Thanksgiving", "Christmas")
- **course** — dropdown: breakfast, soup, salad, appetizer, dessert, side dish, vegetable, main
- **type** — multi-select checkboxes: vegetarian, vegan, low carb, gluten free, dairy free, nut free

All fields are searchable/filterable in the recipe table.

### Common Pitfalls to Avoid
1. **Field name mismatch**: Always check if frontend expects `ingredients/steps` vs backend returns `recipeIngredients/recipeSteps`
2. **JSON parsing errors**: Backend controllers use `Map<String, Object>` for complex requests, not direct entity binding
3. **Hibernate cascading**: Use `clear()` and `addAll()` when replacing collections in JPA entities
4. **Container rebuilds**: Code changes require rebuilding the specific Docker service
5. **Database persistence**: `docker compose down` removes containers but preserves data in volumes
6. **Security exposure**: Never commit `.env` file - use `.env.example` template instead
7. **Skipping tests**: Never skip the testing requirements - all changes must have tests and all tests must pass
8. **`jest.mock()` factory — no `mockResolvedValue`**: Calling `jest.fn().mockResolvedValue()` inside a `jest.mock()` factory does not reliably set up the resolved value. Always use plain `jest.fn()` in the factory and configure return values in `beforeEach` (e.g. `(recipeApi.getRecipe as jest.Mock).mockResolvedValue(...)`).
9. **Invalid Date**: `new Date(undefined).toLocaleDateString()` returns `"Invalid Date"`. Always guard date formatting: check that the value exists and `!isNaN(date.getTime())` before displaying or including in exports.
10. **"unit" sentinel in display**: Never render the string `"unit"` as a unit label. Always pass measurement names through `getMeasurementDisplay()` before displaying.
