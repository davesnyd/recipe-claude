# Database Schema Documentation

## Overview

The Recipe Management Application uses PostgreSQL as its primary database. The schema is designed to support:
- User management with Google OAuth integration
- Recipe creation, editing, and sharing
- Ingredient management with nutritional information
- Flexible measurement system (Imperial/Metric)
- Recipe favoriting system

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    users    │       │   recipes    │       │ ingredients │
│             │       │              │       │             │
│ user_id (PK)│◄──────┤create_username│       │ingredient_id│
│ username    │       │ recipe_id (PK)│       │    (PK)     │
│measurement_ │       │ title         │       │ name        │
│ preference  │       │ description   │       │ density     │
│ created_at  │       │ serving_count │       │ calories    │
└─────────────┘       │ is_public     │       │ protein     │
                      │ creation_date │       │ fat         │
                      │ photo_url     │       │ carbohydrates│
                      │ note          │       │ dietary_fiber│
                      └───────┬───────┘       │ sodium      │
                              │               │ created_at  │
                              │               └──────┬──────┘
                              │                      │
                  ┌───────────▼──────────┐          │
                  │  recipe_ingredients  │          │
                  │                      │          │
                  │recipe_ingredient_id  │          │
                  │      (PK)           │          │
                  │recipe_id (FK)       │◄─────────┘
                  │ingredient_id (FK)   │
                  │quantity             │
                  │measurement_id (FK)  │
                  │ingredient_order     │
                  └─────────────────────┘
                              │
                              │
                  ┌───────────▼──────────┐
                  │   measurements       │
                  │                      │
                  │measurement_id (PK)   │
                  │system               │
                  │measurement_name     │
                  │measurement_type     │
                  └─────────────────────┘

        ┌─────────────┐       ┌──────────────┐
        │ recipe_steps│       │  favorites   │
        │             │       │              │
        │step_id (PK) │       │favorite_id   │
        │recipe_id(FK)│◄──────┤   (PK)       │
        │step_number  │       │username (FK) │
        │step_text    │       │recipe_id (FK)│
        │photo_url    │       │created_at    │
        └─────────────┘       └──────────────┘
```

## Table Definitions

### users
Stores user information from Google OAuth authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | Auto-incrementing user identifier |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Google email address |
| measurement_preference | VARCHAR(10) | NOT NULL, CHECK | User's preferred unit system ('Imperial', 'Metric') |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### recipes
Core recipe information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| recipe_id | SERIAL | PRIMARY KEY | Auto-incrementing recipe identifier |
| title | VARCHAR(255) | NOT NULL | Recipe name |
| description | TEXT | | Optional recipe description |
| serving_count | INTEGER | NOT NULL, DEFAULT 1 | Number of servings |
| is_public | BOOLEAN | NOT NULL, DEFAULT FALSE | Public visibility flag |
| creation_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Recipe creation timestamp |
| create_username | VARCHAR(255) | NOT NULL, FK → users.username | Recipe author |
| photo_url | VARCHAR(500) | | Optional recipe photo URL |
| note | TEXT | | Optional cooking notes |

### ingredients
Master ingredient list with nutritional information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ingredient_id | SERIAL | PRIMARY KEY | Auto-incrementing ingredient identifier |
| name | VARCHAR(255) | NOT NULL | Ingredient name |
| density | DECIMAL(10,4) | | Ingredient density (g/ml or oz/fl oz) |
| calories | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Calories per 100g/ml |
| protein | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Protein per 100g/ml |
| fat | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Fat per 100g/ml |
| carbohydrates | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Carbohydrates per 100g/ml |
| dietary_fiber | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Dietary fiber per 100g/ml |
| sodium | DECIMAL(8,2) | NOT NULL, DEFAULT 0 | Sodium per 100g/ml |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ingredient creation timestamp |

### measurements
Predefined measurement units for both Imperial and Metric systems.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| measurement_id | SERIAL | PRIMARY KEY | Auto-incrementing measurement identifier |
| system | VARCHAR(10) | NOT NULL, CHECK | Unit system ('Imperial', 'Metric') |
| measurement_name | VARCHAR(50) | NOT NULL | Unit name (e.g., 'cup', 'gram') |
| measurement_type | VARCHAR(10) | NOT NULL, CHECK | Unit type ('weight', 'volume') |

### recipe_ingredients
Junction table linking recipes to ingredients with quantities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| recipe_ingredient_id | SERIAL | PRIMARY KEY | Auto-incrementing identifier |
| recipe_id | INTEGER | NOT NULL, FK → recipes.recipe_id | Associated recipe |
| ingredient_id | INTEGER | NOT NULL, FK → ingredients.ingredient_id | Associated ingredient |
| quantity | DECIMAL(10,3) | | Ingredient quantity (optional) |
| measurement_id | INTEGER | NOT NULL, FK → measurements.measurement_id | Unit of measurement |
| preparation | VARCHAR(255) | | Optional preparation instruction (e.g., "chopped", "sifted") |
| ingredient_order | INTEGER | NOT NULL, DEFAULT 1 | Display order in recipe |

### recipe_steps
Step-by-step cooking instructions for recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| step_id | SERIAL | PRIMARY KEY | Auto-incrementing step identifier |
| recipe_id | INTEGER | NOT NULL, FK → recipes.recipe_id | Associated recipe |
| step_number | INTEGER | NOT NULL | Step sequence number |
| step_text | TEXT | NOT NULL | Step instructions |
| photo_url | VARCHAR(500) | | Optional step photo URL |

### favorites
User's favorite recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| favorite_id | SERIAL | PRIMARY KEY | Auto-incrementing favorite identifier |
| username | VARCHAR(255) | NOT NULL, FK → users.username | User who favorited |
| recipe_id | INTEGER | NOT NULL, FK → recipes.recipe_id | Favorited recipe |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Favorite timestamp |

**Unique Constraint**: (username, recipe_id) - prevents duplicate favorites

## Indexes

Performance-optimized indexes for common queries:

- `idx_recipes_create_username` - Recipe lookup by author
- `idx_recipes_is_public` - Public recipe filtering  
- `idx_recipes_creation_date` - Recipe sorting by date
- `idx_recipe_ingredients_recipe_id` - Ingredient lookup for recipes
- `idx_recipe_steps_recipe_id` - Step lookup for recipes
- `idx_favorites_username` - User's favorite recipes
- `idx_favorites_recipe_id` - Recipes favorited by users

## Predefined Data

### Measurements
The system comes with predefined measurement units:

**Metric System:**
- Weight: gram, milligram, kilogram
- Volume: milliliter, liter

**Imperial System:**
- Weight: ounce, pound
- Volume: teaspoon, tablespoon, ounce, cup, pint, quart, gallon

## Schema Evolution

**Note**: The application uses Hibernate's `ddl-auto: update` setting, which means schema changes may be automatically applied when the application starts. Some fields (like `preparation` in `recipe_ingredients`) may have been added after the initial schema creation via Hibernate auto-updates.

For production deployments, consider:
- Using explicit database migration tools (Flyway or Liquibase)
- Changing `ddl-auto` to `validate` to prevent automatic schema changes
- Maintaining migration scripts for version control

## Business Rules

### Data Integrity
1. Recipes can only be created by authenticated users
2. Recipe ingredients must reference valid ingredients and measurements
3. Recipe steps must belong to a valid recipe
4. Users cannot favorite the same recipe twice
5. Cascade deletes ensure referential integrity
6. Ingredient quantities are now optional to support "to taste" ingredients

### Nutritional Calculations
- All nutritional values are stored per 100g/100ml
- Actual nutrition is calculated by scaling based on ingredient quantities
- Density field allows weight/volume conversions when needed

### Visibility Rules
- Public recipes are visible to all users
- Private recipes are only visible to the author
- Users can only edit/delete their own recipes
- Favorites are user-specific and private