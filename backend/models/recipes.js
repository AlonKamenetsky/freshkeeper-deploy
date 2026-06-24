// models/recipes.js - Mock recipe data for FreshKeeper

let recipes = [
  {
    recipeId: 1,
    name: "Scrambled Eggs with Spinach",
    ingredients: ["eggs", "spinach", "milk", "butter", "salt", "pepper"],
    instructions: "1. Beat eggs with milk. 2. Sauté spinach in butter. 3. Add egg mixture and scramble until cooked.",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    tags: ["vegetarian", "gluten-free", "quick"],
    createDate: "2024-01-01T00:00:00.000Z",
    updateDate: "2024-01-01T00:00:00.000Z"
  },
  {
    recipeId: 2,
    name: "Chicken Pasta",
    ingredients: ["chicken breast", "pasta", "tomatoes", "garlic", "olive oil", "salt", "pepper"],
    instructions: "1. Cook pasta. 2. Grill chicken and slice. 3. Sauté garlic and tomatoes. 4. Combine all ingredients.",
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    tags: ["high-protein"],
    createDate: "2024-01-01T00:00:00.000Z",
    updateDate: "2024-01-01T00:00:00.000Z"
  },
  {
    recipeId: 3,
    name: "Tomato Pasta",
    ingredients: ["pasta", "tomatoes", "garlic", "olive oil", "basil", "salt", "pepper"],
    instructions: "1. Cook pasta al dente. 2. Make fresh tomato sauce with garlic and basil. 3. Toss together.",
    prepTime: 5,
    cookTime: 20,
    servings: 3,
    tags: ["vegetarian", "vegan"],
    createDate: "2024-01-01T00:00:00.000Z",
    updateDate: "2024-01-01T00:00:00.000Z"
  },
  {
    recipeId: 4,
    name: "Greek Omelette",
    ingredients: ["eggs", "tomatoes", "spinach", "feta cheese", "olive oil", "salt"],
    instructions: "1. Whisk eggs. 2. Sauté vegetables. 3. Pour eggs over vegetables and cook until set. 4. Add feta.",
    prepTime: 5,
    cookTime: 8,
    servings: 2,
    tags: ["vegetarian", "gluten-free", "quick"],
    createDate: "2024-01-01T00:00:00.000Z",
    updateDate: "2024-01-01T00:00:00.000Z"
  },
  {
    recipeId: 5,
    name: "Chicken Stir-Fry",
    ingredients: ["chicken breast", "spinach", "garlic", "soy sauce", "olive oil", "ginger"],
    instructions: "1. Slice chicken. 2. Heat oil in wok. 3. Stir-fry chicken until golden. 4. Add spinach and sauce.",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    tags: ["high-protein", "gluten-free"],
    createDate: "2024-01-01T00:00:00.000Z",
    updateDate: "2024-01-01T00:00:00.000Z"
  }
];

let nextRecipeId = 6;

// Shelf-life estimates in days by category and storage type
const shelfLifeEstimates = {
  dairy: { fridge: 7, freezer: 60, pantry: 1 },
  meat: { fridge: 3, freezer: 90, pantry: 0 },
  vegetables: { fridge: 5, freezer: 30, pantry: 3 },
  fruits: { fridge: 7, freezer: 30, pantry: 4 },
  grains: { fridge: 180, freezer: 365, pantry: 180 },
  other: { fridge: 5, freezer: 30, pantry: 7 }
};

function getAll(filters = {}) {
  let result = [...recipes];
  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    result = result.filter(r => tagList.some(t => r.tags.includes(t)));
  }
  return result;
}

function getById(id) {
  return recipes.find(r => r.recipeId === id) || null;
}

function create({ name, ingredients, instructions, prepTime, cookTime, servings, tags }) {
  const now = new Date().toISOString();
  const newRecipe = {
    recipeId: nextRecipeId++,
    name,
    ingredients: ingredients || [],
    instructions: instructions || "",
    prepTime: prepTime || 0,
    cookTime: cookTime || 0,
    servings: servings || 1,
    tags: tags || [],
    createDate: now,
    updateDate: now
  };
  recipes.push(newRecipe);
  return newRecipe;
}

function update(id, fields) {
  const recipe = recipes.find(r => r.recipeId === id);
  if (!recipe) return null;
  const allowed = ["name", "ingredients", "instructions", "prepTime", "cookTime", "servings", "tags"];
  allowed.forEach(key => {
    if (fields[key] !== undefined) recipe[key] = fields[key];
  });
  recipe.updateDate = new Date().toISOString();
  return recipe;
}

function remove(id) {
  const index = recipes.findIndex(r => r.recipeId === id);
  if (index === -1) return null;
  const removed = recipes[index];
  recipes.splice(index, 1);
  return removed;
}

// Suggest recipes based on available ingredients
function suggest(availableIngredients, preferences = []) {
  const lowerIngredients = availableIngredients.map(i => i.toLowerCase().trim());

  let candidates = [...recipes];

  // Filter by preferences/tags if provided
  if (preferences.length > 0) {
    candidates = candidates.filter(r =>
      preferences.every(pref => r.tags.includes(pref))
    );
  }

  // Score each recipe
  const scored = candidates.map(recipe => {
    const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase());
    const matched = recipeIngredients.filter(ri =>
      lowerIngredients.some(ai => ai.includes(ri) || ri.includes(ai))
    );
    const missing = recipeIngredients.filter(ri =>
      !lowerIngredients.some(ai => ai.includes(ri) || ri.includes(ai))
    );
    const matchScore = matched.length / recipeIngredients.length;
    return { recipe, matched, missing, matchScore };
  });

  // Only return recipes with at least 50% match
  return scored
    .filter(s => s.matchScore >= 0.5)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(s => ({
      recipeId: s.recipe.recipeId,
      name: s.recipe.name,
      matchScore: Math.round(s.matchScore * 100),
      matchedIngredients: s.matched,
      missingIngredients: s.missing,
      tags: s.recipe.tags,
      prepTime: s.recipe.prepTime,
      cookTime: s.recipe.cookTime,
      servings: s.recipe.servings
    }));
}

// Predict expiration date based on category + storage
function predictExpiration(category, storageType) {
  const cat = (category || "other").toLowerCase();
  const storage = (storageType || "pantry").toLowerCase();
  const estimates = shelfLifeEstimates[cat] || shelfLifeEstimates.other;
  const days = estimates[storage] || estimates.pantry;
  const predicted = new Date();
  predicted.setDate(predicted.getDate() + days);
  return {
    predictedExpirationDate: predicted.toISOString().split("T")[0],
    estimatedDays: days,
    basis: `${cat} stored in ${storage}`
  };
}

module.exports = { getAll, getById, create, update, remove, suggest, predictExpiration };
