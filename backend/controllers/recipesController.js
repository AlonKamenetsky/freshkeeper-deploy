// controllers/recipesController.js — Sequelize version
const { Recipe, Tag } = require('../models');
const { successResponse, errorResponse } = require('../middleware/response');

const shelfLife = {
  dairy:      { fridge: 7,   freezer: 60,  pantry: 1   },
  meat:       { fridge: 3,   freezer: 90,  pantry: 0   },
  vegetables: { fridge: 5,   freezer: 30,  pantry: 3   },
  fruits:     { fridge: 7,   freezer: 30,  pantry: 4   },
  grains:     { fridge: 180, freezer: 365, pantry: 180 },
  other:      { fridge: 5,   freezer: 30,  pantry: 7   },
};

// GET /recipes
async function getAllRecipes(req, res) {
  try {
    const include = [{ association: 'tags', through: { attributes: [] } }];
    const where = {};
    let recipes = await Recipe.findAll({ include, where, order: [['createdAt', 'DESC']] });

    // filter by tags (query: ?tags=vegetarian,quick)
    if (req.query.tags) {
      const wanted = req.query.tags.split(',').map(t => t.trim().toLowerCase());
      recipes = recipes.filter(r =>
        wanted.some(w => r.tags.map(t => t.name).includes(w))
      );
    }

    const result = recipes.map(r => ({
      recipeId:     r.recipeId,
      name:         r.name,
      ingredients:  r.ingredients,
      instructions: r.instructions,
      prepTime:     r.prepTime,
      cookTime:     r.cookTime,
      servings:     r.servings,
      tags:         r.tags.map(t => t.name),
      createdAt:    r.createdAt,
      updatedAt:    r.updatedAt,
    }));
    return successResponse(res, result);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// GET /recipes/:id
async function getRecipeById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid recipe ID.', {});
  try {
    const recipe = await Recipe.findByPk(id, {
      include: [{ association: 'tags', through: { attributes: [] } }]
    });
    if (!recipe) return errorResponse(res, 404, 'NOT_FOUND', `Recipe ${id} not found.`, {});
    return successResponse(res, {
      ...recipe.toJSON(),
      tags: recipe.tags.map(t => t.name),
    });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// POST /recipes
async function createRecipe(req, res) {
  const { name, ingredients, instructions, prepTime, cookTime, servings, tags } = req.body;
  if (!name || !ingredients || !instructions)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'name, ingredients, and instructions are required.', {});
  if (!Array.isArray(ingredients) || ingredients.length === 0)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'ingredients must be a non-empty array.', {});
  try {
    const recipe = await Recipe.create({ name, ingredients, instructions, prepTime, cookTime, servings });
    if (tags && Array.isArray(tags)) {
      const tagRecords = await Promise.all(
        tags.map(t => Tag.findOrCreate({ where: { name: t.toLowerCase() } }))
      );
      await recipe.setTags(tagRecords.map(([tag]) => tag));
    }
    return successResponse(res, { recipeId: recipe.recipeId }, 201);
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// PUT /recipes/:id
async function updateRecipe(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid recipe ID.', {});
  const { name, ingredients, instructions, prepTime, cookTime, servings, tags } = req.body;
  if (ingredients !== undefined && (!Array.isArray(ingredients) || ingredients.length === 0))
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'ingredients must be a non-empty array.', {});
  try {
    const recipe = await Recipe.findByPk(id, {
      include: [{ association: 'tags', through: { attributes: [] } }]
    });
    if (!recipe) return errorResponse(res, 404, 'NOT_FOUND', `Recipe ${id} not found.`, {});
    await recipe.update({ name, ingredients, instructions, prepTime, cookTime, servings });
    if (tags && Array.isArray(tags)) {
      const tagRecords = await Promise.all(
        tags.map(t => Tag.findOrCreate({ where: { name: t.toLowerCase() } }))
      );
      await recipe.setTags(tagRecords.map(([tag]) => tag));
    }
    return successResponse(res, { recipeId: recipe.recipeId });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// DELETE /recipes/:id
async function deleteRecipe(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid recipe ID.', {});
  try {
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return errorResponse(res, 404, 'NOT_FOUND', `Recipe ${id} not found.`, {});
    await recipe.destroy();
    return successResponse(res, { recipeId: id });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// POST /recipes/suggest  (logic-based, not AI — AI is at /ai/suggest)
async function suggestRecipes(req, res) {
  const { ingredients, preferences } = req.body;
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'ingredients must be a non-empty array.', {});
  try {
    const recipes = await Recipe.findAll({
      include: [{ association: 'tags', through: { attributes: [] } }]
    });
    const lower = ingredients.map(i => i.toLowerCase().trim());
    const prefs = Array.isArray(preferences) ? preferences : [];

    let candidates = recipes;
    if (prefs.length) {
      candidates = candidates.filter(r =>
        prefs.every(p => r.tags.map(t => t.name).includes(p))
      );
    }

    const scored = candidates.map(r => {
      const ri = r.ingredients.map(i => i.toLowerCase());
      const matched = ri.filter(x => lower.some(a => a.includes(x) || x.includes(a)));
      const missing = ri.filter(x => !lower.some(a => a.includes(x) || x.includes(a)));
      const score = matched.length / ri.length;
      return { r, matched, missing, score };
    });

    const suggestions = scored
      .filter(s => s.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        recipeId:           s.r.recipeId,
        name:               s.r.name,
        matchScore:         Math.round(s.score * 100),
        matchedIngredients: s.matched,
        missingIngredients: s.missing,
        tags:               s.r.tags.map(t => t.name),
        prepTime:           s.r.prepTime,
        cookTime:           s.r.cookTime,
        servings:           s.r.servings,
      }));

    return successResponse(res, { suggestions, total: suggestions.length });
  } catch (err) {
    return errorResponse(res, 500, 'DB_ERROR', err.message, {});
  }
}

// POST /recipes/predict-expiration
async function predictExpiration(req, res) {
  const { category, storageType } = req.body;
  if (!category || !storageType)
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'category and storageType are required.', {});
  const estimates = shelfLife[category] || shelfLife.other;
  const days      = estimates[storageType] || estimates.pantry;
  const predicted = new Date();
  predicted.setDate(predicted.getDate() + days);
  return successResponse(res, {
    predictedExpirationDate: predicted.toISOString().split('T')[0],
    estimatedDays: days,
    basis: `${category} stored in ${storageType}`,
  });
}

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, suggestRecipes, predictExpiration };
