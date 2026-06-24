-- migrations/002_seed.sql
-- Initial seed data for FreshKeeper.
-- Passwords stored in plain text for demo purposes only.

USE freshkeeper;

INSERT IGNORE INTO Users (firstName, lastName, email, password, userRole) VALUES
  ('Alice', 'Admin',    'admin@fresh.com',    'admin123', 'admin'),
  ('Bob',   'Employee', 'employee@fresh.com', 'emp123',   'employee'),
  ('Carol', 'Consumer', 'consumer@fresh.com', 'cons123',  'consumer');

INSERT IGNORE INTO Items (name, quantity, unit, expirationDate, storageType, category, userId) VALUES
  ('Milk',           2,   'liters', '2025-05-05', 'fridge',  'dairy',      3),
  ('Eggs',           12,  'units',  '2025-05-15', 'fridge',  'dairy',      3),
  ('Chicken Breast', 500, 'grams',  '2025-05-03', 'freezer', 'meat',       3),
  ('Tomatoes',       6,   'units',  '2025-05-04', 'pantry',  'vegetables', NULL),
  ('Pasta',          400, 'grams',  '2026-01-01', 'pantry',  'grains',     NULL),
  ('Spinach',        200, 'grams',  '2025-05-03', 'fridge',  'vegetables', 3);

INSERT IGNORE INTO Recipes (name, ingredients, instructions, prepTime, cookTime, servings) VALUES
  ('Scrambled Eggs with Spinach',
   '["eggs","spinach","milk","butter","salt","pepper"]',
   '1. Beat eggs with milk. 2. Sauté spinach in butter. 3. Add egg mixture and scramble until cooked.',
   5, 10, 2),
  ('Chicken Pasta',
   '["chicken breast","pasta","tomatoes","garlic","olive oil","salt","pepper"]',
   '1. Cook pasta. 2. Grill chicken and slice. 3. Sauté garlic and tomatoes. 4. Combine all ingredients.',
   10, 25, 4),
  ('Tomato Pasta',
   '["pasta","tomatoes","garlic","olive oil","basil","salt","pepper"]',
   '1. Cook pasta al dente. 2. Make fresh tomato sauce with garlic and basil. 3. Toss together.',
   5, 20, 3);

INSERT IGNORE INTO Tags (name) VALUES
  ('vegetarian'), ('vegan'), ('gluten-free'), ('quick'), ('high-protein');

-- Link Recipe 1 → vegetarian, gluten-free, quick
INSERT IGNORE INTO RecipeTags (recipeId, tagId)
  SELECT r.recipeId, t.tagId FROM Recipes r, Tags t
  WHERE r.name = 'Scrambled Eggs with Spinach' AND t.name IN ('vegetarian','gluten-free','quick');

-- Link Recipe 2 → high-protein
INSERT IGNORE INTO RecipeTags (recipeId, tagId)
  SELECT r.recipeId, t.tagId FROM Recipes r, Tags t
  WHERE r.name = 'Chicken Pasta' AND t.name = 'high-protein';

-- Link Recipe 3 → vegetarian, vegan
INSERT IGNORE INTO RecipeTags (recipeId, tagId)
  SELECT r.recipeId, t.tagId FROM Recipes r, Tags t
  WHERE r.name = 'Tomato Pasta' AND t.name IN ('vegetarian','vegan');
