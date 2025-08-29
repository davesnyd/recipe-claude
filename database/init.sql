-- Recipe Management Application Database Schema

-- Create database if it doesn't exist
CREATE DATABASE recipe_app;

-- Connect to the database
\c recipe_app;

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    measurement_preference VARCHAR(10) NOT NULL CHECK (measurement_preference IN ('Imperial', 'Metric')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Measurements table (prepopulated units)
CREATE TABLE measurements (
    measurement_id SERIAL PRIMARY KEY,
    system VARCHAR(10) NOT NULL CHECK (system IN ('Imperial', 'Metric')),
    measurement_name VARCHAR(50) NOT NULL,
    measurement_type VARCHAR(10) NOT NULL CHECK (measurement_type IN ('weight', 'volume'))
);

-- Insert predefined measurements
INSERT INTO measurements (system, measurement_name, measurement_type) VALUES
-- Metric weights
('Metric', 'gram', 'weight'),
('Metric', 'milligram', 'weight'),
('Metric', 'kilogram', 'weight'),
-- Metric volumes
('Metric', 'milliliter', 'volume'),
('Metric', 'liter', 'volume'),
-- Imperial weights
('Imperial', 'ounce', 'weight'),
('Imperial', 'pound', 'weight'),
-- Imperial volumes
('Imperial', 'teaspoon', 'volume'),
('Imperial', 'tablespoon', 'volume'),
('Imperial', 'ounce', 'volume'),
('Imperial', 'cup', 'volume'),
('Imperial', 'pint', 'volume'),
('Imperial', 'quart', 'volume'),
('Imperial', 'gallon', 'volume');

-- Ingredients table
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    density DECIMAL(10,4), -- g/ml or oz/fl oz
    calories DECIMAL(8,2) NOT NULL DEFAULT 0, -- per 100g or 100ml
    protein DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbohydrates DECIMAL(8,2) NOT NULL DEFAULT 0,
    dietary_fiber DECIMAL(8,2) NOT NULL DEFAULT 0,
    sodium DECIMAL(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    serving_count INTEGER NOT NULL DEFAULT 1,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_username VARCHAR(255) NOT NULL,
    photo_url VARCHAR(500),
    note TEXT,
    FOREIGN KEY (create_username) REFERENCES users(username) ON DELETE CASCADE
);

-- Recipe ingredients junction table
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    measurement_id INTEGER NOT NULL,
    ingredient_order INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (measurement_id) REFERENCES measurements(measurement_id)
);

-- Recipe steps table
CREATE TABLE recipe_steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_text TEXT NOT NULL,
    photo_url VARCHAR(500),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Favorites table
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    recipe_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    UNIQUE(username, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_create_username ON recipes(create_username);
CREATE INDEX idx_recipes_is_public ON recipes(is_public);
CREATE INDEX idx_recipes_creation_date ON recipes(creation_date);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX idx_favorites_username ON favorites(username);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);